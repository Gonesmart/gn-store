"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { productSchema } from "@/lib/validations/product";
import { getCloudinaryUploadSignature } from "@/lib/cloudinary";
import type { ProductStatus } from "@prisma/client";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role: string }).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function getUploadSignature() {
  try {
    await requireAdmin();
    const sig = getCloudinaryUploadSignature("gn-store/products");
    return { success: true as const, data: sig };
  } catch {
    return { success: false as const, error: "Unauthorized" };
  }
}

export async function getProducts(opts?: {
  search?: string;
  status?: ProductStatus | "";
  categoryId?: string;
}) {
  return db.product.findMany({
    where: {
      ...(opts?.search
        ? {
            OR: [
              { name: { contains: opts.search, mode: "insensitive" } },
              { slug: { contains: opts.search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(opts?.status ? { status: opts.status } : {}),
      ...(opts?.categoryId ? { categoryId: opts.categoryId } : {}),
    },
    include: {
      category: { select: { name: true } },
      images: { orderBy: { position: "asc" as const }, take: 1 },
      variants: { select: { price: true, stock: true } },
      _count: { select: { variants: true, reviews: true } },
    },
    orderBy: { createdAt: "desc" as const },
  });
}

export async function getProductById(id: string) {
  return db.product.findUnique({
    where: { id },
    include: {
      variants: { orderBy: { createdAt: "asc" as const } },
      images: { orderBy: { position: "asc" as const } },
      category: true,
    },
  });
}

export async function createProduct(rawData: unknown) {
  try {
    await requireAdmin();
  } catch {
    return { success: false as const, error: "Unauthorized" };
  }

  const result = productSchema.safeParse(rawData);
  if (!result.success) {
    return {
      success: false as const,
      error: result.error.issues[0]?.message ?? "Invalid data",
    };
  }

  const { variants, images, ...productData } = result.data;

  try {
    const product = await db.product.create({
      data: {
        ...productData,
        variants: {
          create: variants.map((v) => ({
            size: v.size || null,
            color: v.color || null,
            price: v.price,
            compareAtPrice:
              v.compareAtPrice != null ? Number(v.compareAtPrice) : null,
            stock: v.stock,
            sku: v.sku || null,
          })),
        },
        images: {
          create: images.map((img, i) => ({
            url: img.url,
            publicId: img.publicId ?? null,
            altText: img.altText ?? null,
            position: img.position ?? i,
          })),
        },
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath("/", "layout");
    return { success: true as const, data: product };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create product";
    if (msg.includes("slug")) {
      return {
        success: false as const,
        error: "A product with this slug already exists",
      };
    }
    return { success: false as const, error: msg };
  }
}

export async function updateProduct(id: string, rawData: unknown) {
  try {
    await requireAdmin();
  } catch {
    return { success: false as const, error: "Unauthorized" };
  }

  const result = productSchema.safeParse(rawData);
  if (!result.success) {
    return {
      success: false as const,
      error: result.error.issues[0]?.message ?? "Invalid data",
    };
  }

  const { variants, images, ...productData } = result.data;

  try {
    await db.$transaction(async (tx) => {
      // Get current variant IDs for this product
      const existingVariants = await tx.productVariant.findMany({
        where: { productId: id },
        select: { id: true },
      });
      const existingIds = existingVariants.map((v) => v.id);

      // Split submitted variants into updates (have DB id) and creates (new)
      const toUpdate = variants.filter((v) => v.id && existingIds.includes(v.id));
      const toCreate = variants.filter((v) => !v.id || !existingIds.includes(v.id));
      const submittedIds = new Set(toUpdate.map((v) => v.id!));

      // Variants in DB but not submitted - only delete if not referenced by orders
      const toDeleteCandidates = existingIds.filter((eid) => !submittedIds.has(eid));
      if (toDeleteCandidates.length > 0) {
        const orderedVariants = await tx.orderItem.findMany({
          where: { variantId: { in: toDeleteCandidates } },
          select: { variantId: true },
        });
        const orderedIds = new Set(orderedVariants.map((oi) => oi.variantId));
        const safeToDelete = toDeleteCandidates.filter((vid) => !orderedIds.has(vid));
        if (safeToDelete.length > 0) {
          await tx.productVariant.deleteMany({ where: { id: { in: safeToDelete } } });
        }
      }

      // Update existing variants in-place
      for (const v of toUpdate) {
        await tx.productVariant.update({
          where: { id: v.id },
          data: {
            size: v.size || null,
            color: v.color || null,
            price: v.price,
            compareAtPrice: v.compareAtPrice != null ? Number(v.compareAtPrice) : null,
            stock: v.stock,
            sku: v.sku || null,
          },
        });
      }

      // Recreate images (no order FK constraint on images)
      await tx.productImage.deleteMany({ where: { productId: id } });

      // Update product fields + create any new variants
      await tx.product.update({
        where: { id },
        data: {
          ...productData,
          variants: {
            create: toCreate.map((v) => ({
              size: v.size || null,
              color: v.color || null,
              price: v.price,
              compareAtPrice: v.compareAtPrice != null ? Number(v.compareAtPrice) : null,
              stock: v.stock,
              sku: v.sku || null,
            })),
          },
          images: {
            create: images.map((img, i) => ({
              url: img.url,
              publicId: img.publicId ?? null,
              altText: img.altText ?? null,
              position: img.position ?? i,
            })),
          },
        },
      });
    });

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/products", "layout");
    return { success: true as const };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to update product";
    if (msg.includes("slug")) {
      return {
        success: false as const,
        error: "A product with this slug already exists",
      };
    }
    return { success: false as const, error: msg };
  }
}

export async function deleteProduct(id: string) {
  try {
    await requireAdmin();
  } catch {
    return { success: false as const, error: "Unauthorized" };
  }

  try {
    await db.product.delete({ where: { id } });
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath("/", "layout");
    return { success: true as const };
  } catch {
    return { success: false as const, error: "Failed to delete product" };
  }
}

export async function duplicateProduct(id: string) {
  try {
    await requireAdmin();
  } catch {
    return { success: false as const, error: "Unauthorized" };
  }

  try {
    const product = await db.product.findUnique({
      where: { id },
      include: { variants: true, images: true },
    });

    if (!product) return { success: false as const, error: "Product not found" };

    const newSlug = `${product.slug}-copy-${Date.now()}`;

    const newProduct = await db.product.create({
      data: {
        name: `${product.name} (Copy)`,
        slug: newSlug,
        description: product.description,
        categoryId: product.categoryId,
        status: "DRAFT",
        featured: false,
        variants: {
          create: product.variants.map((v) => ({
            size: v.size,
            color: v.color,
            price: v.price,
            compareAtPrice: v.compareAtPrice,
            stock: v.stock,
            sku: v.sku ? `${v.sku}-copy` : null,
          })),
        },
        images: {
          create: product.images.map((img) => ({
            url: img.url,
            publicId: img.publicId,
            altText: img.altText,
            position: img.position,
          })),
        },
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/shop");
    return { success: true as const, data: newProduct };
  } catch {
    return { success: false as const, error: "Failed to duplicate product" };
  }
}

export async function updateProductStatus(id: string, status: ProductStatus) {
  try {
    await requireAdmin();
  } catch {
    return { success: false as const, error: "Unauthorized" };
  }

  try {
    await db.product.update({ where: { id }, data: { status } });
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath("/", "layout");
    return { success: true as const };
  } catch {
    return { success: false as const, error: "Failed to update status" };
  }
}
