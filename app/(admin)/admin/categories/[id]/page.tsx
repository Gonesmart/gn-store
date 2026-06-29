import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { CategoryForm } from "@/components/admin/category-form";
import type { Metadata } from "next";
import type { CategoryFormValues } from "@/lib/validations/category";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const category = await db.category.findUnique({ where: { id }, select: { name: true } });
  return { title: category ? `Edit - ${category.name}` : "Edit Category" };
}

export default async function EditCategoryPage({ params }: PageProps) {
  const { id } = await params;

  const [category, topLevelCategories] = await Promise.all([
    db.category.findUnique({ where: { id } }),
    db.category.findMany({
      where: { parentId: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!category) notFound();

  const initialData: CategoryFormValues & { id: string } = {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description ?? "",
    parentId: category.parentId ?? "",
    image: category.image ?? "",
    imagePublicId: category.imagePublicId ?? "",
  };

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
          <h1 className="text-2xl font-bold tracking-tight text-white">Edit Category</h1>
          <p className="mt-0.5 text-sm text-[#A3A3A3]">{category.name}</p>
        </div>
      </div>

      <CategoryForm
        topLevelCategories={topLevelCategories}
        initialData={initialData}
        mode="edit"
      />
    </div>
  );
}
