"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, ChevronDown, SlidersHorizontal, Star } from "lucide-react";
import { buildShopUrl, formatPrice, type ShopFilterParams } from "@/lib/utils";

export type CategoryWithChildren = {
  id: string;
  name: string;
  slug: string;
  children: { id: string; name: string; slug: string }[];
};

export type ShopSidebarProps = {
  mode: "sidebar" | "mobile";
  categories: CategoryWithChildren[];
  sizes: string[];
  colors: string[];
  activeFilters: ShopFilterParams;
  activeFilterCount: number;
};

export function ShopSidebar({
  mode,
  categories,
  sizes,
  colors,
  activeFilters,
  activeFilterCount,
}: ShopSidebarProps) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(
    activeFilters.category ?? null
  );
  const [localMin, setLocalMin] = useState(activeFilters.minPrice ?? "");
  const [localMax, setLocalMax] = useState(activeFilters.maxPrice ?? "");

  useEffect(() => {
    setLocalMin(activeFilters.minPrice ?? "");
    setLocalMax(activeFilters.maxPrice ?? "");
  }, [activeFilters.minPrice, activeFilters.maxPrice]);

  function navigate(overrides: Partial<ShopFilterParams>) {
    router.push(
      buildShopUrl({
        ...activeFilters,
        page: undefined,
        ...overrides,
      })
    );
  }

  function toggleSize(size: string) {
    const current = activeFilters.sizes ?? [];
    navigate({
      sizes: current.includes(size)
        ? current.filter((s) => s !== size)
        : [...current, size],
    });
  }

  function toggleColor(color: string) {
    const current = activeFilters.colors ?? [];
    navigate({
      colors: current.includes(color)
        ? current.filter((c) => c !== color)
        : [...current, color],
    });
  }

  function selectCategory(slug: string) {
    if (activeFilters.category === slug) {
      navigate({ category: undefined, subcategory: undefined });
    } else {
      navigate({ category: slug, subcategory: undefined });
      setExpandedCategory(slug);
    }
  }

  function selectSubcategory(slug: string) {
    navigate({
      subcategory: activeFilters.subcategory === slug ? undefined : slug,
    });
  }

  function selectRating(r: number) {
    navigate({ minRating: activeFilters.minRating === r ? undefined : r });
  }

  function applyPrice() {
    navigate({
      minPrice: localMin.trim() || undefined,
      maxPrice: localMax.trim() || undefined,
    });
  }

  function clearAll() {
    router.push(
      buildShopUrl({ sort: activeFilters.sort, q: activeFilters.q })
    );
  }

  const activeSizes = activeFilters.sizes ?? [];
  const activeColors = activeFilters.colors ?? [];

  const content = (
    <div className="flex flex-col divide-y divide-gray-100 dark:divide-[#2A2A2A]">
      {/* Clear all */}
      {activeFilterCount > 0 && (
        <div className="pb-4">
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 text-sm font-medium text-red-500 transition-colors hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600]"
          >
            <X size={13} />
            Clear all filters
          </button>
        </div>
      )}

      {/* Category */}
      {categories.length > 0 && (
        <FilterSection title="Category">
          <ul className="flex flex-col gap-0.5">
            <li>
              <button
                onClick={() =>
                  navigate({ category: undefined, subcategory: undefined })
                }
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600] ${
                  !activeFilters.category
                    ? "bg-[#5DC600]/10 font-semibold text-[#5DC600]"
                    : "text-gray-700 hover:bg-gray-50 dark:text-[#A3A3A3] dark:hover:bg-[#222]"
                }`}
              >
                All Categories
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => selectCategory(cat.slug)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600] ${
                    activeFilters.category === cat.slug
                      ? "bg-[#5DC600]/10 font-semibold text-[#5DC600]"
                      : "text-gray-700 hover:bg-gray-50 dark:text-[#A3A3A3] dark:hover:bg-[#222]"
                  }`}
                >
                  <span>{cat.name}</span>
                  {cat.children.length > 0 && (
                    <ChevronDown
                      size={13}
                      className={`shrink-0 text-gray-400 transition-transform ${
                        expandedCategory === cat.slug ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>

                {/* Subcategories */}
                {cat.children.length > 0 &&
                  (activeFilters.category === cat.slug ||
                    expandedCategory === cat.slug) && (
                    <ul className="ml-3 mt-1 flex flex-col gap-0.5 border-l border-gray-100 pl-3 dark:border-[#2A2A2A]">
                      {cat.children.map((sub) => (
                        <li key={sub.id}>
                          <button
                            onClick={() => selectSubcategory(sub.slug)}
                            className={`w-full rounded-lg px-2 py-1.5 text-left text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600] ${
                              activeFilters.subcategory === sub.slug
                                ? "font-semibold text-[#5DC600]"
                                : "text-gray-500 hover:text-gray-900 dark:text-[#777] dark:hover:text-white"
                            }`}
                          >
                            {sub.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
              </li>
            ))}
          </ul>
        </FilterSection>
      )}

      {/* Price Range */}
      <FilterSection title="Price Range">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="mb-1 block text-xs text-gray-400 dark:text-[#555]">
              Min (&#8358;)
            </label>
            <input
              type="number"
              min="0"
              value={localMin}
              onChange={(e) => setLocalMin(e.target.value)}
              placeholder="0"
              className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 placeholder:text-gray-300 focus:border-[#5DC600] focus:outline-none dark:border-[#2A2A2A] dark:bg-[#111] dark:text-white dark:placeholder:text-[#3A3A3A]"
            />
          </div>
          <span className="mb-2 text-xs text-gray-300 dark:text-[#3A3A3A]">
            to
          </span>
          <div className="flex-1">
            <label className="mb-1 block text-xs text-gray-400 dark:text-[#555]">
              Max (&#8358;)
            </label>
            <input
              type="number"
              min="0"
              value={localMax}
              onChange={(e) => setLocalMax(e.target.value)}
              placeholder="Any"
              className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 placeholder:text-gray-300 focus:border-[#5DC600] focus:outline-none dark:border-[#2A2A2A] dark:bg-[#111] dark:text-white dark:placeholder:text-[#3A3A3A]"
            />
          </div>
        </div>
        {(localMin !== (activeFilters.minPrice ?? "") ||
          localMax !== (activeFilters.maxPrice ?? "")) && (
          <button
            onClick={applyPrice}
            className="mt-2.5 w-full rounded-lg border border-[#5DC600] py-2 text-sm font-semibold text-[#5DC600] transition-colors hover:bg-[#5DC600]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600]"
          >
            Apply
          </button>
        )}
        {(activeFilters.minPrice || activeFilters.maxPrice) && (
          <p className="mt-1.5 text-xs text-gray-400 dark:text-[#555]">
            {activeFilters.minPrice
              ? formatPrice(activeFilters.minPrice)
              : "Any"}{" "}
            {" to "}
            {activeFilters.maxPrice
              ? formatPrice(activeFilters.maxPrice)
              : "Any"}
          </p>
        )}
      </FilterSection>

      {/* Sizes */}
      {sizes.length > 0 && (
        <FilterSection title="Size">
          <div className="flex flex-wrap gap-1.5">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className={`rounded-lg border-2 px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600] ${
                  activeSizes.includes(size)
                    ? "border-[#5DC600] bg-[#5DC600]/10 text-[#5DC600]"
                    : "border-gray-200 text-gray-600 hover:border-gray-400 dark:border-[#2A2A2A] dark:text-[#A3A3A3] dark:hover:border-[#4A4A4A]"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Colors */}
      {colors.length > 0 && (
        <FilterSection title="Color">
          <div className="flex flex-wrap gap-1.5">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => toggleColor(color)}
                className={`rounded-lg border-2 px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600] ${
                  activeColors.includes(color)
                    ? "border-[#5DC600] bg-[#5DC600]/10 text-[#5DC600]"
                    : "border-gray-200 text-gray-600 hover:border-gray-400 dark:border-[#2A2A2A] dark:text-[#A3A3A3] dark:hover:border-[#4A4A4A]"
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Rating */}
      <FilterSection title="Customer Rating">
        <div className="flex flex-col gap-1">
          {[4, 3, 2].map((r) => (
            <button
              key={r}
              onClick={() => selectRating(r)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600] ${
                activeFilters.minRating === r
                  ? "bg-[#5DC600]/10 font-semibold text-[#5DC600]"
                  : "text-gray-700 hover:bg-gray-50 dark:text-[#A3A3A3] dark:hover:bg-[#222]"
              }`}
            >
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={12}
                    className={
                      s <= r
                        ? "fill-[#5DC600] text-[#5DC600]"
                        : "fill-gray-200 text-gray-200 dark:fill-[#2A2A2A] dark:text-[#2A2A2A]"
                    }
                  />
                ))}
              </div>
              <span className="text-xs">& up</span>
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  );

  if (mode === "sidebar") {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-[#2A2A2A] dark:bg-[#1A1A1A]">
        <p className="mb-5 text-xs font-bold uppercase tracking-[0.15em] text-gray-400 dark:text-[#555]">
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-2 rounded-full bg-[#5DC600]/10 px-2 py-0.5 text-[10px] text-[#5DC600]">
              {activeFilterCount} active
            </span>
          )}
        </p>
        {content}
      </div>
    );
  }

  // Mobile: trigger button + bottom drawer
  return (
    <>
      <button
        onClick={() => setDrawerOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600] dark:border-[#2A2A2A] dark:text-white dark:hover:border-[#4A4A4A]"
      >
        <SlidersHorizontal size={15} />
        Filters
        {activeFilterCount > 0 && (
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#5DC600] px-1 text-xs font-bold text-black">
            {activeFilterCount}
          </span>
        )}
      </button>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative max-h-[88vh] overflow-y-auto rounded-t-2xl bg-white dark:bg-[#0D0D0D]">
            {/* Drawer header */}
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4 dark:border-[#1E1E1E] dark:bg-[#0D0D0D]">
              <h3 className="text-base font-black text-gray-900 dark:text-white">
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-2 text-sm font-normal text-[#5DC600]">
                    ({activeFilterCount} active)
                  </span>
                )}
              </h3>
              <button
                onClick={() => setDrawerOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 dark:bg-[#2A2A2A] dark:text-[#A3A3A3] dark:hover:bg-[#3A3A3A]"
              >
                <X size={15} />
              </button>
            </div>

            {/* Drawer content */}
            <div className="p-5">{content}</div>

            {/* Drawer footer */}
            <div className="sticky bottom-0 border-t border-gray-100 bg-white px-5 py-4 dark:border-[#1E1E1E] dark:bg-[#0D0D0D]">
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-full rounded-xl bg-[#5DC600] py-3 font-bold text-black transition-colors hover:bg-[#4DAF00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600] active:bg-[#3D9600]"
              >
                Show results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="py-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="mb-3 flex w-full items-center justify-between text-sm font-bold text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600] dark:text-white"
      >
        {title}
        <ChevronDown
          size={13}
          className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && children}
    </div>
  );
}
