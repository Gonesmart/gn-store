"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ProductsFilterProps {
  categories: { id: string; name: string }[];
  search: string;
  status: string;
  categoryId: string;
}

export function ProductsFilter({ categories, search, status, categoryId }: ProductsFilterProps) {
  const router = useRouter();
  useSearchParams();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const q = (data.get("q") as string) ?? "";
    const s = (data.get("status") as string) ?? "";
    const c = (data.get("category") as string) ?? "";
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (s) params.set("status", s);
    if (c) params.set("category", c);
    router.push(`/admin/products${params.toString() ? `?${params.toString()}` : ""}`);
  }

  const hasFilters = !!(search || status || categoryId);

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A3A3A3]" />
        <Input
          name="q"
          defaultValue={search}
          placeholder="Search products…"
          className="pl-9 border-[#2A2A2A] bg-[#1A1A1A] text-white placeholder:text-[#4A4A4A] focus-visible:border-[#5DC600]"
        />
      </div>
      <select
        name="status"
        defaultValue={status}
        className="h-9 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#5DC600]"
      >
        <option value="">All statuses</option>
        <option value="ACTIVE">Active</option>
        <option value="DRAFT">Draft</option>
        <option value="ARCHIVED">Archived</option>
      </select>
      <select
        name="category"
        defaultValue={categoryId}
        className="h-9 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#5DC600]"
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <Button
        type="submit"
        variant="outline"
        className="border-[#2A2A2A] bg-transparent text-[#A3A3A3] hover:bg-[#2A2A2A] hover:text-white"
      >
        Filter
      </Button>
      {hasFilters && (
        <Button
          render={<Link href="/admin/products" />}
          variant="outline"
          className="border-[#2A2A2A] bg-transparent text-[#A3A3A3] hover:bg-[#2A2A2A] hover:text-white"
        >
          Clear
        </Button>
      )}
    </form>
  );
}
