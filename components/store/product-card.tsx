"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  imageAlt: string;
  price: string;
  compareAtPrice: string | null;
  categoryName: string;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const price = parseFloat(product.price);
  const comparePrice = product.compareAtPrice
    ? parseFloat(product.compareAtPrice)
    : null;
  const hasDiscount = comparePrice !== null && comparePrice > price;
  const discountPct = hasDiscount
    ? Math.round((1 - price / comparePrice!) * 100)
    : 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:border-[#5DC600]/30 hover:shadow-[0_0_28px_-6px_rgba(93,198,0,0.14)] dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:hover:border-[#5DC600]/30"
    >
      {/* Product image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 dark:bg-[#242424]">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.imageAlt}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="select-none text-[64px] font-black leading-none text-[#5DC600]"
              style={{ opacity: 0.08 }}
            >
              GN
            </span>
          </div>
        )}

        {/* Discount badge */}
        {hasDiscount && (
          <div className="absolute left-3 top-3 rounded-md bg-[#5DC600] px-2 py-0.5 text-[11px] font-bold text-black">
            -{discountPct}%
          </div>
        )}

        {/* Add to Cart hover panel */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
          <button
            className="flex w-full items-center justify-center gap-2 bg-[#5DC600] py-3 text-sm font-bold text-black transition-colors hover:bg-[#4DAF00]"
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            <ShoppingBag size={15} />
            Add to Cart
          </button>
        </div>
      </div>

      {/* Product info */}
      <div className="p-4">
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-widest text-gray-400 dark:text-[#A3A3A3]">
          {product.categoryName}
        </p>
        <h3 className="mb-3 line-clamp-2 text-sm font-semibold leading-snug text-gray-900 dark:text-white">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-[#5DC600]">
            {formatPrice(price)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through dark:text-[#A3A3A3]">
              {formatPrice(comparePrice!)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
