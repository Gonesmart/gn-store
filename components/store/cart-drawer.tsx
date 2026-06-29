"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { removeFromCart, updateCartQty } from "@/actions/cart";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const { items, isOpen, closeCart, setItems, setLoading, isLoading } =
    useCartStore();
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeCart();
    }
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, closeCart]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  async function handleRemove(variantId: string) {
    setLoading(true);
    const res = await removeFromCart(variantId);
    if (res.success) setItems(res.cart);
    setLoading(false);
  }

  async function handleQty(variantId: string, qty: number) {
    setLoading(true);
    const res = await updateCartQty(variantId, qty);
    if (res.success) setItems(res.cart);
    setLoading(false);
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={closeCart}
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 dark:bg-[#0D0D0D] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-[#1E1E1E]">
          <div className="flex items-center gap-2.5">
            <ShoppingBag size={18} className="text-[#5DC600]" />
            <h2 className="text-base font-black text-gray-900 dark:text-white">
              Your Cart
            </h2>
            {totalItems > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#5DC600]/15 px-1.5 text-xs font-bold text-[#5DC600]">
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600] dark:bg-[#2A2A2A] dark:text-[#A3A3A3] dark:hover:bg-[#3A3A3A]"
            aria-label="Close cart"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 px-8 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-[#1A1A1A]">
                <ShoppingBag size={28} className="text-gray-300 dark:text-[#3A3A3A]" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  Your cart is empty
                </p>
                <p className="mt-1 text-sm text-gray-400 dark:text-[#A3A3A3]">
                  Add some products to get started
                </p>
              </div>
              <Link
                href="/shop"
                onClick={closeCart}
                className="mt-2 rounded-xl bg-[#5DC600] px-6 py-2.5 text-sm font-bold text-black transition-colors hover:bg-[#4DAF00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600] active:bg-[#3D9600]"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50 dark:divide-[#1A1A1A]">
              {items.map((item) => (
                <li
                  key={item.variantId}
                  className={`flex gap-3.5 px-5 py-4 transition-opacity ${isLoading ? "opacity-50" : ""}`}
                >
                  {/* Thumbnail */}
                  <Link
                    href={`/products/${item.slug}`}
                    onClick={closeCart}
                    className="shrink-0"
                    tabIndex={-1}
                  >
                    <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-gray-100 dark:bg-[#1A1A1A]">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.productName}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ShoppingBag size={20} className="text-gray-300 dark:text-[#3A3A3A]" />
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={closeCart}
                          className="line-clamp-2 text-sm font-semibold text-gray-900 hover:text-[#5DC600] dark:text-white dark:hover:text-[#5DC600]"
                        >
                          {item.productName}
                        </Link>
                        <p className="mt-0.5 text-xs text-gray-400 dark:text-[#A3A3A3]">
                          {item.variantLabel}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemove(item.variantId)}
                        disabled={isLoading}
                        aria-label="Remove item"
                        className="shrink-0 text-gray-300 transition-colors hover:text-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600] disabled:opacity-40 dark:text-[#3A3A3A] dark:hover:text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Price + Qty */}
                    <div className="mt-2.5 flex items-center justify-between">
                      <div className="flex h-8 items-center rounded-lg border border-gray-200 dark:border-[#2A2A2A]">
                        <button
                          onClick={() =>
                            handleQty(item.variantId, item.quantity - 1)
                          }
                          disabled={isLoading || item.quantity <= 1}
                          aria-label="Decrease quantity"
                          className="flex h-full w-8 items-center justify-center text-gray-500 transition-colors hover:text-gray-900 disabled:opacity-30 dark:text-[#A3A3A3] dark:hover:text-white"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-7 text-center text-xs font-semibold text-gray-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleQty(item.variantId, item.quantity + 1)
                          }
                          disabled={isLoading || (item.stock !== null && item.quantity >= item.stock)}
                          aria-label="Increase quantity"
                          className="flex h-full w-8 items-center justify-center text-gray-500 transition-colors hover:text-gray-900 disabled:opacity-30 dark:text-[#A3A3A3] dark:hover:text-white"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 bg-white px-5 py-5 dark:border-[#1E1E1E] dark:bg-[#0D0D0D]">
            {/* Subtotal */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-[#A3A3A3]">
                Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"})
              </p>
              <p className="text-lg font-black text-gray-900 dark:text-white">
                {formatPrice(subtotal)}
              </p>
            </div>

            {/* Checkout CTA */}
            <Link
              href="/checkout"
              onClick={closeCart}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5DC600] py-3.5 font-bold text-black transition-colors hover:bg-[#4DAF00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600] active:bg-[#3D9600]"
            >
              Proceed to Checkout
              <ArrowRight size={16} />
            </Link>

            {/* Continue shopping */}
            <button
              onClick={closeCart}
              className="mt-3 w-full text-center text-sm text-gray-400 transition-colors hover:text-gray-600 dark:text-[#555] dark:hover:text-[#A3A3A3]"
            >
              Continue shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
