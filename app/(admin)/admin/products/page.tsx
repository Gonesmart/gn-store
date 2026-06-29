import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Package } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductActions } from "@/components/admin/product-actions";
import { ProductsFilter } from "@/components/admin/products-filter";
import type { Metadata } from "next";
import type { ProductStatus } from "@prisma/client";

export const metadata: Metadata = { title: "Products" };

const STATUS_STYLES: Record<ProductStatus, string> = {
  DRAFT: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  ACTIVE: "bg-[#5DC600]/15 text-[#5DC600] border-[#5DC600]/30",
  ARCHIVED: "bg-[#2A2A2A] text-[#A3A3A3] border-[#2A2A2A]",
};

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; category?: string }>;
}

async function ProductList({
  search,
  status,
  categoryId,
}: {
  search: string;
  status: string;
  categoryId: string;
}) {
  const products = await db.product.findMany({
    where: {
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { slug: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(status ? { status: status as ProductStatus } : {}),
      ...(categoryId ? { categoryId } : {}),
    },
    include: {
      category: { select: { name: true } },
      images: { orderBy: { position: "asc" }, take: 1 },
      variants: { select: { price: true, stock: true } },
      _count: { select: { variants: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#2A2A2A] bg-[#1A1A1A] py-20 text-center">
        <Package className="mb-4 h-10 w-10 text-[#2A2A2A]" />
        <p className="text-sm font-medium text-[#A3A3A3]">
          {search || status || categoryId ? "No products match your filters" : "No products yet"}
        </p>
        {!search && !status && !categoryId && (
          <p className="mt-1 text-xs text-[#4A4A4A]">
            Create your first product to get started.
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-xl border border-[#2A2A2A] bg-[#1A1A1A]"
      style={{
        boxShadow: "0 1px 3px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.3)",
      }}
    >
      <Table>
        <TableHeader>
          <TableRow className="border-[#2A2A2A] hover:bg-transparent">
            <TableHead className="text-[#A3A3A3]">Product</TableHead>
            <TableHead className="text-[#A3A3A3]">Status</TableHead>
            <TableHead className="text-[#A3A3A3]">Category</TableHead>
            <TableHead className="text-[#A3A3A3]">Variants</TableHead>
            <TableHead className="text-[#A3A3A3]">Stock</TableHead>
            <TableHead className="text-right text-[#A3A3A3]">Price</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const totalStock = product.variants.reduce((s, v) => s + (v.stock ?? 0), 0);
            const prices = product.variants.map((v) => parseFloat(String(v.price)));
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            const priceLabel =
              prices.length === 0
                ? "-"
                : minPrice === maxPrice
                ? `₦${minPrice.toLocaleString("en-NG")}`
                : `₦${minPrice.toLocaleString("en-NG")} – ₦${maxPrice.toLocaleString("en-NG")}`;

            return (
              <TableRow key={product.id} className="border-[#2A2A2A] hover:bg-[#242424]">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[#2A2A2A] bg-[#0D0D0D]">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0].url}
                          alt={product.images[0].altText ?? product.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-4 w-4 text-[#2A2A2A]" />
                        </div>
                      )}
                    </div>
                    <div>
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-sm font-medium text-white hover:text-[#5DC600] transition-colors duration-150"
                      >
                        {product.name}
                      </Link>
                      <p className="text-xs text-[#4A4A4A]">{product.slug}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[product.status]}`}
                  >
                    {product.status.charAt(0) + product.status.slice(1).toLowerCase()}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-[#A3A3A3]">
                  {product.category.name}
                </TableCell>
                <TableCell className="text-sm text-[#A3A3A3]">
                  {product._count.variants}
                </TableCell>
                <TableCell>
                  <span
                    className={`text-sm font-medium ${
                      totalStock === 0
                        ? "text-red-400"
                        : totalStock <= 5
                        ? "text-yellow-400"
                        : "text-[#A3A3A3]"
                    }`}
                  >
                    {totalStock}
                  </span>
                </TableCell>
                <TableCell className="text-right text-sm font-medium text-white">
                  {priceLabel}
                </TableCell>
                <TableCell>
                  <ProductActions product={{ id: product.id, name: product.name, status: product.status }} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] p-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-3">
          <Skeleton className="h-10 w-10 rounded-lg bg-[#2A2A2A]" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-48 bg-[#2A2A2A]" />
            <Skeleton className="h-3 w-32 bg-[#2A2A2A]" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full bg-[#2A2A2A]" />
        </div>
      ))}
    </div>
  );
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.q ?? "";
  const status = params.status ?? "";
  const categoryId = params.category ?? "";

  const categories = await db.category.findMany({
    where: { parentId: null },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Products</h1>
          <p className="mt-1 text-sm text-[#A3A3A3]">Manage your product catalogue</p>
        </div>
        <Button
          render={<Link href="/admin/products/new" />}
          className="bg-[#5DC600] font-semibold text-black hover:bg-[#4DAF00]"
          style={{ boxShadow: "0 0 12px rgba(93,198,0,0.2)" }}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Product
        </Button>
      </div>

      {/* Filters — client component for instant navigation */}
      <Suspense>
        <ProductsFilter
          categories={categories}
          search={search}
          status={status}
          categoryId={categoryId}
        />
      </Suspense>

      {/* Table */}
      <Suspense fallback={<ListSkeleton />}>
        <ProductList search={search} status={status} categoryId={categoryId} />
      </Suspense>
    </div>
  );
}
