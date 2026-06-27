"use client";

import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";

export function CartIcon() {
  const { items, openCart } = useCartStore();
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <button
      onClick={openCart}
      aria-label={`Cart${count > 0 ? `, ${count} items` : ""}`}
      className="relative rounded-lg p-2.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600] dark:text-[#A3A3A3] dark:hover:bg-[#1A1A1A] dark:hover:text-white"
    >
      <ShoppingBag size={18} />
      {count > 0 && (
        <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#5DC600] text-[10px] font-bold leading-none text-black">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
