"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { categorySchema } from "@/lib/validations/category";
import { cloudinary, getCloudinaryUploadSignature } from "@/lib/cloudinary";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role: string }).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function getCategoryUploadSignature() {
  try {
    await requireAdmin();
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder: "gn-store/categories" },
      process.env.CLOUDINARY_API_SECRET!
    );
    return {
      success: true as const,
      data: {
        timestamp,
        signature,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
        apiKey: process.env.CLOUDINARY_API_KEY!,
      },
    };
  } catch (err) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : "Failed to get upload signature",
    };
  }
}

export async function getCategories() {
  return db.category.findMany({
    include: {
      parent: { select: { id: true, name: true } },
      _count: { select: { children: true, products: true } },
    },
    orderBy: [{ parentId: "asc" }, { name: "asc" }],
  });
}

export async function getCategoryById(id: string) {
  return db.category.findUnique({ where: { id } });
}

export async function getTopLevelCategories() {
  return db.category.findMany({
    where: { parentId: null },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export async function createCategory(rawData: unknown) {
  try {
    await requireAdmin();
    const data = categorySchema.parse(rawData);

    const existing = await db.category.findUnique({ where: { slug: data.slug } });
    if (existing) {
      return { success: false as const, error: "A category with this slug already exists" };
    }

    const category = await db.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        parentId: data.parentId || null,
        image: data.image || null,
        imagePublicId: data.imagePublicId || null,
      },
    });

    revalidatePath("/admin/categories");
    return { success: true as const, data: category };
  } catch (err) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : "Failed to create category",
    };
  }
}

export async function updateCategory(id: string, rawData: unknown) {
  try {
    await requireAdmin();
    const data = categorySchema.parse(rawData);

    if (data.parentId === id) {
      return { success: false as const, error: "A category cannot be its own parent" };
    }

    const slugConflict = await db.category.findFirst({
      where: { slug: data.slug, NOT: { id } },
    });
    if (slugConflict) {
      return { success: false as const, error: "A category with this slug already exists" };
    }

    const category = await db.category.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        parentId: data.parentId || null,
        image: data.image || null,
        imagePublicId: data.imagePublicId || null,
      },
    });

    revalidatePath("/admin/categories");
    return { success: true as const, data: category };
  } catch (err) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : "Failed to update category",
    };
  }
}

export async function deleteCategory(id: string) {
  try {
    await requireAdmin();

    const category = await db.category.findUnique({
      where: { id },
      include: { _count: { select: { children: true, products: true } } },
    });

    if (!category) {
      return { success: false as const, error: "Category not found" };
    }

    if (category._count.products > 0) {
      return {
        success: false as const,
        error: `Cannot delete - ${category._count.products} product(s) are assigned to this category. Reassign them first.`,
      };
    }

    if (category._count.children > 0) {
      return {
        success: false as const,
        error: `Cannot delete - this category has ${category._count.children} subcategory/subcategories. Delete them first.`,
      };
    }

    if (category.imagePublicId) {
      await cloudinary.uploader.destroy(category.imagePublicId).catch(() => null);
    }

    await db.category.delete({ where: { id } });
    revalidatePath("/admin/categories");
    return { success: true as const };
  } catch (err) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : "Failed to delete category",
    };
  }
}
