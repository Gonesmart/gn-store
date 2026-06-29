"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { toggleWishlist } from "@/actions/wishlist";

interface WishlistItemCardProps {
  productId: string;
  name: string;
  slug: string;
  price: string;
  image: string | null;
}

export function WishlistItemCard({
  productId,
  name,
  slug,
  price,
  image,
}: WishlistItemCardProps) {
  const [removed, setRemoved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRemove(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    await toggleWishlist(productId);
    setRemoved(true);
  }

  if (removed) return null;

  return (
    <Link
      href={`/products/${slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white transition-shadow hover:shadow-md dark:border-[#2A2A2A] dark:bg-[#1A1A1A]"
    >
      {/* Remove button */}
      <button
        onClick={handleRemove}
        disabled={loading}
        aria-label="Remove from wishlist"
        className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow-[0_2px_8px_rgba(239,68,68,0.4)] transition-all duration-200 hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600] disabled:opacity-60"
      >
        {loading ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <Heart size={12} className="fill-white" />
        )}
      </button>

      {/* Image */}
      <div className="relative aspect-square bg-gray-100 dark:bg-[#111]">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ShoppingBag size={32} className="text-gray-200 dark:text-[#2A2A2A]" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="line-clamp-2 text-sm font-semibold text-gray-900 group-hover:text-[#5DC600] dark:text-white">
          {name}
        </p>
        <p className="mt-auto pt-2 font-bold text-[#5DC600]">
          {formatPrice(parseFloat(price))}
        </p>
      </div>
    </Link>
  );
}
