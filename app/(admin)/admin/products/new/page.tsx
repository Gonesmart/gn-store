import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { ProductForm } from "@/components/admin/product-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "New Product" };

export default async function NewProductPage() {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
  });

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
          <h1 className="text-2xl font-bold tracking-tight text-white">New Product</h1>
          <p className="mt-0.5 text-sm text-[#A3A3A3]">
            Fill in the details to create a new product
          </p>
        </div>
      </div>

      <ProductForm categories={categories} mode="create" />
    </div>
  );
}
