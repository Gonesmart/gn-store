import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard, type ProductCardData } from "@/components/store/product-card";

export function FeaturedProducts({
  products,
  wishlistedIds = [],
}: {
  products: ProductCardData[];
  wishlistedIds?: string[];
}) {
  if (products.length === 0) return null;

  const wishlistedSet = new Set(wishlistedIds);

  return (
    <section className="bg-gray-50 py-24 dark:bg-[#0A0A0A] lg:py-32">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Section header */}
        <div className="mb-12 flex items-end justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#5DC600]/30 bg-[#5DC600]/8 px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#5DC600]" />
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#5DC600]">
                Featured
              </span>
            </div>
            <h2 className="text-[clamp(26px,3.2vw,42px)] font-bold leading-[1.05] tracking-[-0.02em] text-gray-900 dark:text-white">
              Top Picks This Week
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-[#5DC600] dark:text-[#A3A3A3] dark:hover:text-[#5DC600]"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              initialWishlisted={wishlistedSet.has(product.id)}
            />
          ))}
        </div>

        {/* Mobile view-all */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-[#5DC600]/40 hover:bg-[#5DC600]/5 dark:border-[#2A2A2A] dark:text-white"
          >
            View All Products <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
