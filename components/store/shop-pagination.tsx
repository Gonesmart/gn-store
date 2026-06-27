"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildShopUrl, type ShopFilterParams } from "@/lib/utils";

export function ShopPagination({
  currentPage,
  totalPages,
  activeFilters,
}: {
  currentPage: number;
  totalPages: number;
  activeFilters: ShopFilterParams;
}) {
  function pageUrl(page: number) {
    return buildShopUrl({ ...activeFilters, page });
  }

  const pages: (number | "ellipsis")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("ellipsis");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("ellipsis");
    pages.push(totalPages);
  }

  const base =
    "flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600]";
  const inactive =
    "border-gray-200 text-gray-600 hover:border-[#5DC600]/40 hover:text-[#5DC600] dark:border-[#2A2A2A] dark:text-[#A3A3A3] dark:hover:border-[#5DC600]/40 dark:hover:text-[#5DC600]";
  const disabled =
    "pointer-events-none border-gray-100 text-gray-300 dark:border-[#1E1E1E] dark:text-[#3A3A3A]";

  return (
    <div className="flex items-center justify-center gap-1">
      {currentPage > 1 ? (
        <Link href={pageUrl(currentPage - 1)} className={`${base} ${inactive}`}>
          <ChevronLeft size={16} />
        </Link>
      ) : (
        <span className={`${base} ${disabled}`}>
          <ChevronLeft size={16} />
        </span>
      )}

      {pages.map((p, i) =>
        p === "ellipsis" ? (
          <span
            key={`ellipsis-${i}`}
            className="flex h-9 w-9 items-center justify-center text-sm text-gray-400 dark:text-[#A3A3A3]"
          >
            &hellip;
          </span>
        ) : (
          <Link
            key={p}
            href={pageUrl(p as number)}
            className={`${base} ${
              p === currentPage
                ? "border-transparent bg-[#5DC600] text-black"
                : inactive
            }`}
          >
            {p}
          </Link>
        )
      )}

      {currentPage < totalPages ? (
        <Link href={pageUrl(currentPage + 1)} className={`${base} ${inactive}`}>
          <ChevronRight size={16} />
        </Link>
      ) : (
        <span className={`${base} ${disabled}`}>
          <ChevronRight size={16} />
        </span>
      )}
    </div>
  );
}
