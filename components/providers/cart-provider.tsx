"use client";

import { useEffect } from "react";
import { getCart } from "@/actions/cart";
import { useCartStore } from "@/lib/cart-store";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const setItems = useCartStore((s) => s.setItems);

  useEffect(() => {
    getCart().then(setItems);
  }, [setItems]);

  return <>{children}</>;
}
