"use client";

import { useRouter } from "next/navigation";
import { buildShopUrl, type ShopFilterParams } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "price-asc", label: "Price: Low - High" },
  { value: "price-desc", label: "Price: High - Low" },
];

export function ShopFilters({
  activeFilters,
}: {
  activeFilters: ShopFilterParams;
}) {
  const router = useRouter();

  function handleSort(sort: string) {
    router.push(buildShopUrl({ ...activeFilters, sort, page: undefined }));
  }

  return (
    <div className="relative">
      <select
        value={activeFilters.sort ?? "newest"}
        onChange={(e) => handleSort(e.target.value)}
        className="h-10 appearance-none rounded-xl border border-gray-200 bg-white py-2 pl-3 pr-9 text-sm font-medium text-gray-700 focus:border-[#5DC600] focus:outline-none dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#A3A3A3]"
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
      >
        <path
          d="M2 4L6 8L10 4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
