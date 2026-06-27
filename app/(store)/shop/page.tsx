import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Package, RefreshCw, X } from "lucide-react";
import { db } from "@/lib/db";
import { withTimeout, buildShopUrl, formatPrice } from "@/lib/utils";
import { ProductStatus, type Prisma } from "@prisma/client";
import { ProductCard, type ProductCardData } from "@/components/store/product-card";
import { ShopFilters } from "@/components/store/shop-filters";
import { ShopSidebar, type CategoryWithChildren } from "@/components/store/shop-sidebar";
import { ShopPagination } from "@/components/store/shop-pagination";

const PER_PAGE = 12;

type SearchParams = Promise<{
  category?: string;
  subcategory?: string;
  sort?: string;
  page?: string;
  q?: string;
  sizes?: string;
  colors?: string;
  minRating?: string;
  minPrice?: string;
  maxPrice?: string;
}>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const params = await searchParams;
  const slug = params.subcategory ?? params.category;
  if (slug) {
    const cat = await db.category
      .findUnique({ where: { slug }, select: { name: true } })
      .catch(() => null);
    if (cat) return { title: `${cat.name} | Shop | GN Store` };
  }
  return { title: "Shop | GN Store" };
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const categorySlug =
    typeof params.category === "string" ? params.category : undefined;
  const subcategorySlug =
    typeof params.subcategory === "string" ? params.subcategory : undefined;
  const sort = typeof params.sort === "string" ? params.sort : "newest";
  const page = Math.max(
    1,
    parseInt(typeof params.page === "string" ? params.page : "1", 10)
  );
  const q =
    typeof params.q === "string" && params.q.trim()
      ? params.q.trim()
      : undefined;
  const activeSizes =
    typeof params.sizes === "string" && params.sizes
      ? params.sizes.split(",").filter(Boolean)
      : [];
  const activeColors =
    typeof params.colors === "string" && params.colors
      ? params.colors.split(",").filter(Boolean)
      : [];
  const activeRating =
    typeof params.minRating === "string" ? parseInt(params.minRating, 10) : undefined;
  const minPrice =
    typeof params.minPrice === "string" && params.minPrice ? params.minPrice : undefined;
  const maxPrice =
    typeof params.maxPrice === "string" && params.maxPrice ? params.maxPrice : undefined;
  const minPriceNum = minPrice ? parseFloat(minPrice) : undefined;
  const maxPriceNum = maxPrice ? parseFloat(maxPrice) : undefined;

  // Active filter state object shared across all components
  const activeFilters = {
    category: categorySlug,
    subcategory: subcategorySlug,
    sort,
    sizes: activeSizes,
    colors: activeColors,
    minRating: activeRating,
    minPrice,
    maxPrice,
    q,
  };

  const activeFilterCount = [
    categorySlug || subcategorySlug ? 1 : 0,
    activeSizes.length > 0 ? 1 : 0,
    activeColors.length > 0 ? 1 : 0,
    activeRating ? 1 : 0,
    minPrice || maxPrice ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  // Build Prisma where clause
  const categoryFilter: Prisma.ProductWhereInput = subcategorySlug
    ? { category: { slug: subcategorySlug } }
    : categorySlug
    ? {
        OR: [
          { category: { slug: categorySlug } },
          { category: { parent: { slug: categorySlug } } },
        ],
      }
    : {};

  const variantConditions: Prisma.ProductVariantWhereInput[] = [];
  if (activeSizes.length > 0) variantConditions.push({ size: { in: activeSizes } });
  if (activeColors.length > 0) variantConditions.push({ color: { in: activeColors } });
  if (minPriceNum !== undefined)
    variantConditions.push({ price: { gte: minPriceNum } });
  if (maxPriceNum !== undefined)
    variantConditions.push({ price: { lte: maxPriceNum } });

  const where: Prisma.ProductWhereInput = {
    status: ProductStatus.ACTIVE,
    ...categoryFilter,
    ...(q && { name: { contains: q, mode: "insensitive" } }),
    ...(activeRating && {
      reviews: { some: { rating: { gte: activeRating } } },
    }),
    ...(variantConditions.length > 0 && {
      variants: { some: { AND: variantConditions } },
    }),
  };

  const productInclude = {
    category: { select: { name: true } },
    images: { orderBy: { position: "asc" as const }, take: 1 },
    variants: { orderBy: { price: "asc" as const }, take: 1 },
  } satisfies Prisma.ProductInclude;

  let categories: CategoryWithChildren[] = [];
  let allSizes: string[] = [];
  let allColors: string[] = [];
  let productCards: ProductCardData[] = [];
  let total = 0;
  let dbError = false;

  try {
    const isPriceSort = sort === "price-asc" || sort === "price-desc";

    if (isPriceSort) {
      const [cats, sizes, colors, allProducts] = await withTimeout(
        Promise.all([
          db.category.findMany({
            where: { parentId: null },
            include: {
              children: { select: { id: true, name: true, slug: true } },
            },
            orderBy: { name: "asc" },
          }),
          db.productVariant.findMany({
            where: { product: { status: ProductStatus.ACTIVE }, size: { not: null } },
            distinct: ["size"],
            select: { size: true },
            orderBy: { size: "asc" },
          }),
          db.productVariant.findMany({
            where: { product: { status: ProductStatus.ACTIVE }, color: { not: null } },
            distinct: ["color"],
            select: { color: true },
            orderBy: { color: "asc" },
          }),
          db.product.findMany({ where, include: productInclude }),
        ]),
        10000
      );

      allProducts.sort((a, b) => {
        const pa = parseFloat(a.variants[0]?.price?.toString() ?? "0");
        const pb = parseFloat(b.variants[0]?.price?.toString() ?? "0");
        return sort === "price-asc" ? pa - pb : pb - pa;
      });

      categories = cats;
      allSizes = sizes.map((v) => v.size as string);
      allColors = colors.map((v) => v.color as string);
      total = allProducts.length;
      productCards = allProducts
        .slice((page - 1) * PER_PAGE, page * PER_PAGE)
        .map(toProductCard);
    } else {
      const orderBy: Prisma.ProductOrderByWithRelationInput =
        sort === "oldest" ? { createdAt: "asc" } : { createdAt: "desc" };

      const [cats, sizes, colors, products, count] = await withTimeout(
        Promise.all([
          db.category.findMany({
            where: { parentId: null },
            include: {
              children: { select: { id: true, name: true, slug: true } },
            },
            orderBy: { name: "asc" },
          }),
          db.productVariant.findMany({
            where: { product: { status: ProductStatus.ACTIVE }, size: { not: null } },
            distinct: ["size"],
            select: { size: true },
            orderBy: { size: "asc" },
          }),
          db.productVariant.findMany({
            where: { product: { status: ProductStatus.ACTIVE }, color: { not: null } },
            distinct: ["color"],
            select: { color: true },
            orderBy: { color: "asc" },
          }),
          db.product.findMany({
            where,
            orderBy,
            skip: (page - 1) * PER_PAGE,
            take: PER_PAGE,
            include: productInclude,
          }),
          db.product.count({ where }),
        ]),
        10000
      );

      categories = cats;
      allSizes = sizes.map((v) => v.size as string);
      allColors = colors.map((v) => v.color as string);
      total = count;
      productCards = products.map(toProductCard);
    }
  } catch {
    dbError = true;
  }

  const totalPages = Math.ceil(total / PER_PAGE);

  // Find active category/subcategory names for display
  const activeCat = categories.find((c) => c.slug === categorySlug);
  const activeSub = activeCat?.children.find((c) => c.slug === subcategorySlug);
  const pageTitle = activeSub?.name ?? activeCat?.name ?? "All Products";

  // Active filter chip definitions (for quick removal links)
  type Chip = { label: string; removeUrl: string };
  const chips: Chip[] = [];
  if (subcategorySlug && activeSub) {
    chips.push({
      label: activeSub.name,
      removeUrl: buildShopUrl({
        ...activeFilters,
        subcategory: undefined,
        page: undefined,
      }),
    });
  } else if (categorySlug && activeCat) {
    chips.push({
      label: activeCat.name,
      removeUrl: buildShopUrl({
        ...activeFilters,
        category: undefined,
        subcategory: undefined,
        page: undefined,
      }),
    });
  }
  if (activeSizes.length > 0) {
    chips.push({
      label: `Size: ${activeSizes.join(", ")}`,
      removeUrl: buildShopUrl({
        ...activeFilters,
        sizes: [],
        page: undefined,
      }),
    });
  }
  if (activeColors.length > 0) {
    chips.push({
      label: `Color: ${activeColors.join(", ")}`,
      removeUrl: buildShopUrl({
        ...activeFilters,
        colors: [],
        page: undefined,
      }),
    });
  }
  if (activeRating) {
    chips.push({
      label: `${activeRating}+ stars`,
      removeUrl: buildShopUrl({
        ...activeFilters,
        minRating: undefined,
        page: undefined,
      }),
    });
  }
  if (minPrice || maxPrice) {
    chips.push({
      label: `${minPrice ? formatPrice(minPrice) : "Any"} - ${
        maxPrice ? formatPrice(maxPrice) : "Any"
      }`,
      removeUrl: buildShopUrl({
        ...activeFilters,
        minPrice: undefined,
        maxPrice: undefined,
        page: undefined,
      }),
    });
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0D0D0D]">
      {/* Page header */}
      <div className="border-b border-gray-100 dark:border-[#1E1E1E]">
        <div className="mx-auto max-w-7xl px-4 pb-6 pt-8 lg:px-8">
          <nav className="mb-4 flex items-center gap-1.5 text-xs text-gray-400 dark:text-[#A3A3A3]">
            <Link
              href="/"
              className="transition-colors hover:text-gray-700 dark:hover:text-white"
            >
              Home
            </Link>
            <ChevronRight size={12} />
            {activeSub ? (
              <>
                <Link
                  href="/shop"
                  className="transition-colors hover:text-gray-700 dark:hover:text-white"
                >
                  Shop
                </Link>
                <ChevronRight size={12} />
                <Link
                  href={buildShopUrl({ category: categorySlug, sort })}
                  className="transition-colors hover:text-gray-700 dark:hover:text-white"
                >
                  {activeCat?.name}
                </Link>
                <ChevronRight size={12} />
                <span className="text-gray-700 dark:text-white">{activeSub.name}</span>
              </>
            ) : activeCat ? (
              <>
                <Link
                  href="/shop"
                  className="transition-colors hover:text-gray-700 dark:hover:text-white"
                >
                  Shop
                </Link>
                <ChevronRight size={12} />
                <span className="text-gray-700 dark:text-white">{activeCat.name}</span>
              </>
            ) : (
              <span className="text-gray-700 dark:text-white">Shop</span>
            )}
          </nav>

          <div className="flex items-baseline gap-3">
            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white lg:text-4xl">
              {pageTitle}
            </h1>
            {!dbError && (
              <span className="text-sm font-medium text-gray-400 dark:text-[#A3A3A3]">
                {total.toLocaleString()}{" "}
                {total === 1 ? "product" : "products"}
              </span>
            )}
          </div>

          {q && !dbError && (
            <p className="mt-2 text-sm text-gray-500 dark:text-[#A3A3A3]">
              Results for &ldquo;{q}&rdquo;
            </p>
          )}
        </div>
      </div>

      {/* Main layout: sidebar + content */}
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <div className="hidden w-60 shrink-0 lg:block">
            <div className="sticky top-24">
              <ShopSidebar
                mode="sidebar"
                categories={categories}
                sizes={allSizes}
                colors={allColors}
                activeFilters={activeFilters}
                activeFilterCount={activeFilterCount}
              />
            </div>
          </div>

          {/* Content column */}
          <div className="min-w-0 flex-1">
            {/* Top bar: mobile filter trigger + sort */}
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="lg:hidden">
                <ShopSidebar
                  mode="mobile"
                  categories={categories}
                  sizes={allSizes}
                  colors={allColors}
                  activeFilters={activeFilters}
                  activeFilterCount={activeFilterCount}
                />
              </div>
              <div className="flex flex-1 items-center justify-end">
                <ShopFilters activeFilters={activeFilters} />
              </div>
            </div>

            {/* Active filter chips */}
            {chips.length > 0 && (
              <div className="mb-5 flex flex-wrap items-center gap-2">
                {chips.map((chip) => (
                  <Link
                    key={chip.label}
                    href={chip.removeUrl}
                    className="flex items-center gap-1.5 rounded-full border border-[#5DC600]/30 bg-[#5DC600]/10 px-3 py-1 text-xs font-semibold text-[#5DC600] transition-colors hover:bg-[#5DC600]/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600]"
                  >
                    {chip.label}
                    <X size={11} />
                  </Link>
                ))}
                {chips.length > 1 && (
                  <Link
                    href={buildShopUrl({ sort, q })}
                    className="text-xs font-medium text-gray-400 underline underline-offset-2 hover:text-gray-700 dark:text-[#555] dark:hover:text-[#A3A3A3]"
                  >
                    Clear all
                  </Link>
                )}
              </div>
            )}

            {/* Results */}
            {dbError ? (
              <DbErrorState />
            ) : productCards.length === 0 ? (
              <EmptyState q={q} hasFilters={activeFilterCount > 0} sort={sort} />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 lg:gap-5">
                  {productCards.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="mt-12">
                    <ShopPagination
                      currentPage={page}
                      totalPages={totalPages}
                      activeFilters={activeFilters}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function toProductCard(
  p: {
    id: string;
    name: string;
    slug: string;
    category: { name: string };
    images: { url: string; altText: string | null }[];
    variants: { price: { toString(): string }; compareAtPrice: { toString(): string } | null }[];
  }
): ProductCardData {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    image: p.images[0]?.url ?? null,
    imageAlt: p.images[0]?.altText ?? p.name,
    price: p.variants[0]?.price.toString() ?? "0",
    compareAtPrice: p.variants[0]?.compareAtPrice?.toString() ?? null,
    categoryName: p.category.name,
  };
}

function DbErrorState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-[#1A1A1A]">
        <RefreshCw size={28} className="text-gray-300 dark:text-[#3A3A3A]" />
      </div>
      <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
        Could not load products
      </h3>
      <p className="mb-6 max-w-xs text-sm text-gray-500 dark:text-[#A3A3A3]">
        The store is waking up - this usually takes a few seconds. Refresh to
        try again.
      </p>
      <Link
        href="/shop"
        className="rounded-xl bg-[#5DC600] px-6 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-[#4DAF00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600]"
      >
        Refresh
      </Link>
    </div>
  );
}

function EmptyState({
  q,
  hasFilters,
  sort,
}: {
  q?: string;
  hasFilters: boolean;
  sort: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-[#1A1A1A]">
        <Package size={28} className="text-gray-300 dark:text-[#3A3A3A]" />
      </div>
      <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
        No products found
      </h3>
      <p className="mb-6 max-w-xs text-sm text-gray-500 dark:text-[#A3A3A3]">
        {q
          ? `No results for "${q}". Try a different search term or clear your filters.`
          : hasFilters
          ? "No products match the selected filters. Try adjusting your selection."
          : "No products available right now. Check back soon."}
      </p>
      <Link
        href={buildShopUrl({ sort })}
        className="rounded-xl bg-[#5DC600] px-6 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-[#4DAF00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600]"
      >
        {hasFilters || q ? "Clear filters" : "View all products"}
      </Link>
    </div>
  );
}
