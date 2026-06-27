import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { CategoryForm } from "@/components/admin/category-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "New Category" };

export default async function NewCategoryPage() {
  const topLevelCategories = await db.category.findMany({
    where: { parentId: null },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/categories"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#2A2A2A] text-[#A3A3A3] transition-colors hover:bg-[#2A2A2A] hover:text-white"
          aria-label="Back to categories"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">New Category</h1>
          <p className="mt-0.5 text-sm text-[#A3A3A3]">
            Create a top-level category or a subcategory
          </p>
        </div>
      </div>

      <CategoryForm topLevelCategories={topLevelCategories} mode="create" />
    </div>
  );
}
