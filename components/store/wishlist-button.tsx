"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toggleWishlist } from "@/actions/wishlist";

interface WishlistButtonProps {
  productId: string;
  initialWishlisted?: boolean;
  size?: "sm" | "md";
}

export function WishlistButton({
  productId,
  initialWishlisted = false,
  size = "sm",
}: WishlistButtonProps) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    const res = await toggleWishlist(productId);
    if (res.error === "Not logged in") {
      router.push("/login");
      return;
    }
    if (res.success && res.wishlisted !== undefined) {
      setWishlisted(res.wishlisted);
    }
    setLoading(false);
  }

  const iconSize = size === "md" ? 16 : 13;
  const btnSize = size === "md" ? "h-9 w-9" : "h-7 w-7";

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      className={`flex ${btnSize} items-center justify-center rounded-full transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600] disabled:opacity-60 ${
        wishlisted
          ? "bg-red-500 text-white shadow-[0_2px_8px_rgba(239,68,68,0.4)]"
          : "bg-black/50 text-white backdrop-blur-sm hover:bg-black/70"
      }`}
    >
      <Heart
        size={iconSize}
        className={wishlisted ? "fill-white" : ""}
      />
    </button>
  );
}
