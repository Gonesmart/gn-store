"use client";

import { useState, useEffect, useCallback } from "react";
import { ShoppingBag, Minus, Plus } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/lib/cart-store";

export type SerializedVariant = {
  id: string;
  size: string | null;
  color: string | null;
  price: string;
  compareAtPrice: string | null;
  stock: number | null;
};

function getUniqueValues<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

export function ProductPurchaseArea({
  variants,
  productName,
}: {
  variants: SerializedVariant[];
  productName: string;
}) {
  const hasColors = variants.some((v) => v.color);
  const hasSizes = variants.some((v) => v.size);

  const uniqueColors = hasColors
    ? getUniqueValues(variants.map((v) => v.color).filter(Boolean) as string[])
    : [];
  const uniqueSizes = hasSizes
    ? getUniqueValues(variants.map((v) => v.size).filter(Boolean) as string[])
    : [];

  const [selectedColor, setSelectedColor] = useState<string | null>(
    uniqueColors.length === 1 ? uniqueColors[0] : null
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(
    uniqueSizes.length === 1 ? uniqueSizes[0] : null
  );
  const [qty, setQty] = useState(1);
  const [selectedVariant, setSelectedVariant] =
    useState<SerializedVariant | null>(null);

  const resolveVariant = useCallback(() => {
    if (variants.length === 1 && !hasColors && !hasSizes) {
      return variants[0];
    }
    return (
      variants.find((v) => {
        const colorOk = !hasColors || v.color === selectedColor;
        const sizeOk = !hasSizes || v.size === selectedSize;
        return colorOk && sizeOk;
      }) ?? null
    );
  }, [variants, hasColors, hasSizes, selectedColor, selectedSize]);

  useEffect(() => {
    setSelectedVariant(resolveVariant());
    setQty(1);
  }, [resolveVariant]);

  // Sizes available for selected color (to grey-out unavailable combos)
  const availableSizesForColor = selectedColor
    ? variants
        .filter((v) => v.color === selectedColor)
        .map((v) => v.size)
        .filter(Boolean) as string[]
    : uniqueSizes;

  const price = selectedVariant
    ? parseFloat(selectedVariant.price)
    : parseFloat(variants[0]?.price ?? "0");

  const comparePrice = selectedVariant?.compareAtPrice
    ? parseFloat(selectedVariant.compareAtPrice)
    : variants[0]?.compareAtPrice
    ? parseFloat(variants[0].compareAtPrice)
    : null;

  const hasDiscount = comparePrice !== null && comparePrice > price;
  const discountPct = hasDiscount
    ? Math.round((1 - price / comparePrice!) * 100)
    : 0;
  const savings = hasDiscount ? comparePrice! - price : 0;

  const inStock = selectedVariant
    ? selectedVariant.stock === null || selectedVariant.stock > 0
    : false;
  const stockCount = selectedVariant?.stock ?? null;
  const needsSelection =
    (hasColors && !selectedColor) || (hasSizes && !selectedSize);

  const { openCart, setItems, setLoading } = useCartStore();

  async function handleAddToCart() {
    if (!selectedVariant || !inStock) return;
    setLoading(true);
    const { addToCart } = await import("@/actions/cart");
    const res = await addToCart(selectedVariant.id, qty);
    setLoading(false);
    if (res.success) {
      setItems(res.cart);
      openCart();
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Price */}
      <div>
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-black text-[#5DC600] lg:text-4xl">
            {formatPrice(price)}
          </span>
          {hasDiscount && (
            <span className="text-lg text-gray-400 line-through dark:text-[#A3A3A3]">
              {formatPrice(comparePrice!)}
            </span>
          )}
        </div>
        {hasDiscount && (
          <p className="mt-1 text-sm font-medium text-[#5DC600]">
            You save {formatPrice(savings)} ({discountPct}% off)
          </p>
        )}
      </div>

      {/* Color picker */}
      {hasColors && (
        <div>
          <p className="mb-2.5 text-sm font-semibold text-gray-900 dark:text-white">
            Color:{" "}
            <span className="font-normal text-gray-500 dark:text-[#A3A3A3]">
              {selectedColor ?? "Select a color"}
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            {uniqueColors.map((color) => (
              <button
                key={color}
                onClick={() => {
                  setSelectedColor(color);
                  // Reset size if current size not available for new color
                  const sizesForNewColor = variants
                    .filter((v) => v.color === color)
                    .map((v) => v.size)
                    .filter(Boolean) as string[];
                  if (selectedSize && !sizesForNewColor.includes(selectedSize)) {
                    setSelectedSize(null);
                  }
                }}
                className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600] ${
                  selectedColor === color
                    ? "border-[#5DC600] bg-[#5DC600]/10 text-gray-900 dark:text-white"
                    : "border-gray-200 text-gray-600 hover:border-gray-400 dark:border-[#2A2A2A] dark:text-[#A3A3A3] dark:hover:border-[#4A4A4A]"
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Size picker */}
      {hasSizes && (
        <div>
          <p className="mb-2.5 text-sm font-semibold text-gray-900 dark:text-white">
            Size:{" "}
            <span className="font-normal text-gray-500 dark:text-[#A3A3A3]">
              {selectedSize ?? "Select a size"}
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            {uniqueSizes.map((size) => {
              const available = availableSizesForColor.includes(size);
              const variantForSize = variants.find(
                (v) =>
                  v.size === size &&
                  (!hasColors || v.color === selectedColor)
              );
              const outOfStock = variantForSize
                ? variantForSize.stock !== null && variantForSize.stock === 0
                : !available;

              return (
                <button
                  key={size}
                  onClick={() => available && !outOfStock && setSelectedSize(size)}
                  disabled={!available || outOfStock}
                  className={`relative min-w-[48px] rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600] ${
                    selectedSize === size
                      ? "border-[#5DC600] bg-[#5DC600]/10 text-gray-900 dark:text-white"
                      : !available || outOfStock
                      ? "cursor-not-allowed border-gray-100 text-gray-300 line-through dark:border-[#1E1E1E] dark:text-[#3A3A3A]"
                      : "border-gray-200 text-gray-600 hover:border-gray-400 dark:border-[#2A2A2A] dark:text-[#A3A3A3] dark:hover:border-[#4A4A4A]"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stock status */}
      {selectedVariant && (
        <p
          className={`text-sm font-medium ${
            inStock
              ? stockCount !== null && stockCount <= 5
                ? "text-amber-500"
                : "text-[#5DC600]"
              : "text-red-500"
          }`}
        >
          {inStock
            ? stockCount !== null && stockCount <= 5
              ? `Only ${stockCount} left in stock`
              : "In stock"
            : "Out of stock"}
        </p>
      )}

      {/* Qty + Add to Cart */}
      <div className="flex gap-3">
        {/* Quantity */}
        <div className="flex h-12 items-center rounded-xl border border-gray-200 dark:border-[#2A2A2A]">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            aria-label="Decrease quantity"
            className="flex h-full w-11 items-center justify-center text-gray-500 transition-colors hover:text-gray-900 disabled:opacity-30 dark:text-[#A3A3A3] dark:hover:text-white"
          >
            <Minus size={16} />
          </button>
          <span className="w-10 text-center text-sm font-semibold text-gray-900 dark:text-white">
            {qty}
          </span>
          <button
            onClick={() =>
              setQty((q) => Math.min(q + 1, selectedVariant?.stock ?? 9999))
            }
            disabled={selectedVariant?.stock !== null && selectedVariant?.stock !== undefined && qty >= selectedVariant.stock}
            aria-label="Increase quantity"
            className="flex h-full w-11 items-center justify-center text-gray-500 transition-colors hover:text-gray-900 disabled:opacity-30 dark:text-[#A3A3A3] dark:hover:text-white"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={needsSelection || !inStock}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#5DC600] font-bold text-black transition-colors hover:bg-[#4DAF00] active:bg-[#3D9600] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ShoppingBag size={18} />
          {needsSelection
            ? "Select options"
            : !inStock && selectedVariant
            ? "Out of stock"
            : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
