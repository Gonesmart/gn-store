import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { ProductForm } from "@/components/admin/product-form";
import type { Metadata } from "next";
import type { ProductFormValues } from "@/lib/validations/product";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await db.product.findUnique({ where: { id }, select: { name: true } });
  return { title: product ? `Edit — ${product.name}` : "Edit Product" };
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: {
        variants: { orderBy: { createdAt: "asc" } },
        images: { orderBy: { position: "asc" } },
      },
    }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  const initialData: ProductFormValues & { id: string } = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    categoryId: product.categoryId,
    status: product.status,
    featured: product.featured,
    variants: product.variants.map((v) => ({
      id: v.id,
      size: v.size ?? "",
      color: v.color ?? "",
      price: parseFloat(String(v.price)),
      compareAtPrice: v.compareAtPrice ? parseFloat(String(v.compareAtPrice)) : null,
      stock: v.stock,
      sku: v.sku ?? "",
    })),
    images: product.images.map((img, i) => ({
      id: img.id,
      url: img.url,
      publicId: img.publicId ?? undefined,
      altText: img.altText ?? undefined,
      position: img.position ?? i,
    })),
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/products"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#2A2A2A] text-[#A3A3A3] transition-colors hover:bg-[#2A2A2A] hover:text-white"
          aria-label="Back to products"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Edit Product
          </h1>
          <p className="mt-0.5 text-sm text-[#A3A3A3]">{product.name}</p>
        </div>
      </div>

      <ProductForm
        categories={categories}
        initialData={initialData}
        mode="edit"
      />
    </div>
  );
}
