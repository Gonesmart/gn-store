import Link from "next/link";
import Image from "next/image";
import { Plus, FolderOpen } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CategoryActions } from "@/components/admin/category-actions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const categories = await db.category.findMany({
    include: {
      parent: { select: { id: true, name: true } },
      _count: { select: { children: true, products: true } },
    },
    orderBy: [{ parentId: "asc" }, { name: "asc" }],
  });

  const topLevel = categories.filter((c) => !c.parentId);
  const subcategories = categories.filter((c) => c.parentId);

  const grouped = topLevel.map((parent) => ({
    ...parent,
    subcategories: subcategories.filter((s) => s.parentId === parent.id),
  }));

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Categories</h1>
          <p className="mt-1 text-sm text-[#A3A3A3]">
            {topLevel.length} top-level · {subcategories.length} subcategories
          </p>
        </div>
        <Button
          render={<Link href="/admin/categories/new" />}
          className="bg-[#5DC600] font-semibold text-black hover:bg-[#4DAF00]"
          style={{ boxShadow: "0 0 12px rgba(93,198,0,0.2)" }}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Category
        </Button>
      </div>

      {/* Table */}
      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#2A2A2A] bg-[#1A1A1A] py-20 text-center">
          <FolderOpen className="mb-4 h-10 w-10 text-[#2A2A2A]" />
          <p className="text-sm font-medium text-[#A3A3A3]">No categories yet</p>
          <p className="mt-1 text-xs text-[#4A4A4A]">
            Create your first category to start organising products.
          </p>
        </div>
      ) : (
        <div
          className="overflow-hidden rounded-xl border border-[#2A2A2A] bg-[#1A1A1A]"
          style={{
            boxShadow: "0 1px 3px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.3)",
          }}
        >
          <Table>
            <TableHeader>
              <TableRow className="border-[#2A2A2A] hover:bg-transparent">
                <TableHead className="text-[#A3A3A3]">Category</TableHead>
                <TableHead className="text-[#A3A3A3]">Type</TableHead>
                <TableHead className="text-[#A3A3A3]">Subcategories</TableHead>
                <TableHead className="text-[#A3A3A3]">Products</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {grouped.map((parent) => (
                <>
                  {/* Parent row */}
                  <TableRow
                    key={parent.id}
                    className="border-[#2A2A2A] hover:bg-[#242424]"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-[#2A2A2A] bg-[#0D0D0D]">
                          {parent.image ? (
                            <Image
                              src={parent.image}
                              alt={parent.name}
                              fill
                              className="object-cover"
                              sizes="36px"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <FolderOpen className="h-4 w-4 text-[#2A2A2A]" />
                            </div>
                          )}
                        </div>
                        <div>
                          <Link
                            href={`/admin/categories/${parent.id}`}
                            className="text-sm font-medium text-white transition-colors hover:text-[#5DC600]"
                          >
                            {parent.name}
                          </Link>
                          <p className="text-xs text-[#4A4A4A]">{parent.slug}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="border-[#5DC600]/30 bg-[#5DC600]/10 text-[#5DC600] text-xs"
                      >
                        Top-level
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-[#A3A3A3]">
                      {parent._count.children}
                    </TableCell>
                    <TableCell className="text-sm text-[#A3A3A3]">
                      {parent._count.products}
                    </TableCell>
                    <TableCell>
                      <CategoryActions
                        category={{
                          id: parent.id,
                          name: parent.name,
                          productCount: parent._count.products,
                          childrenCount: parent._count.children,
                        }}
                      />
                    </TableCell>
                  </TableRow>

                  {/* Subcategory rows */}
                  {parent.subcategories.map((sub) => (
                    <TableRow
                      key={sub.id}
                      className="border-[#2A2A2A] bg-[#0D0D0D]/40 hover:bg-[#1E1E1E]"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3 pl-6">
                          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md border border-[#2A2A2A] bg-[#0D0D0D]">
                            {sub.image ? (
                              <Image
                                src={sub.image}
                                alt={sub.name}
                                fill
                                className="object-cover"
                                sizes="32px"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <FolderOpen className="h-3.5 w-3.5 text-[#2A2A2A]" />
                              </div>
                            )}
                          </div>
                          <div>
                            <Link
                              href={`/admin/categories/${sub.id}`}
                              className="text-sm text-[#A3A3A3] transition-colors hover:text-[#5DC600]"
                            >
                              {sub.name}
                            </Link>
                            <p className="text-xs text-[#4A4A4A]">{sub.slug}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-[#2A2A2A] bg-[#2A2A2A]/40 text-[#A3A3A3] text-xs"
                        >
                          Subcategory
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-[#A3A3A3]">—</TableCell>
                      <TableCell className="text-sm text-[#A3A3A3]">
                        {sub._count.products}
                      </TableCell>
                      <TableCell>
                        <CategoryActions
                          category={{
                            id: sub.id,
                            name: sub.name,
                            productCount: sub._count.products,
                            childrenCount: sub._count.children,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ))}

              {/* Orphaned subcategories whose parent isn't in this list */}
              {subcategories
                .filter((s) => !topLevel.find((p) => p.id === s.parentId))
                .map((sub) => (
                  <TableRow
                    key={sub.id}
                    className="border-[#2A2A2A] hover:bg-[#242424]"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-[#2A2A2A] bg-[#0D0D0D]">
                          <div className="flex h-full w-full items-center justify-center">
                            <FolderOpen className="h-4 w-4 text-[#2A2A2A]" />
                          </div>
                        </div>
                        <div>
                          <Link
                            href={`/admin/categories/${sub.id}`}
                            className="text-sm font-medium text-white transition-colors hover:text-[#5DC600]"
                          >
                            {sub.name}
                          </Link>
                          <p className="text-xs text-[#4A4A4A]">{sub.slug}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="border-[#2A2A2A] bg-[#2A2A2A]/40 text-[#A3A3A3] text-xs"
                      >
                        Subcategory
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-[#A3A3A3]">—</TableCell>
                    <TableCell className="text-sm text-[#A3A3A3]">
                      {sub._count.products}
                    </TableCell>
                    <TableCell>
                      <CategoryActions
                        category={{
                          id: sub.id,
                          name: sub.name,
                          productCount: sub._count.products,
                          childrenCount: sub._count.children,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
