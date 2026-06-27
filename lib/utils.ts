import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("DB timeout")), ms)
    ),
  ])
}

export type ShopFilterParams = {
  category?: string;
  subcategory?: string;
  sort?: string;
  sizes?: string[];
  colors?: string[];
  minRating?: number;
  minPrice?: string;
  maxPrice?: string;
  q?: string;
  page?: number;
};

export function buildShopUrl(params: ShopFilterParams): string {
  const p = new URLSearchParams();
  if (params.category) p.set("category", params.category);
  if (params.subcategory) p.set("subcategory", params.subcategory);
  if (params.sort && params.sort !== "newest") p.set("sort", params.sort);
  if (params.sizes?.length) p.set("sizes", params.sizes.join(","));
  if (params.colors?.length) p.set("colors", params.colors.join(","));
  if (params.minRating) p.set("minRating", String(params.minRating));
  if (params.minPrice) p.set("minPrice", params.minPrice);
  if (params.maxPrice) p.set("maxPrice", params.maxPrice);
  if (params.q) p.set("q", params.q);
  if (params.page && params.page > 1) p.set("page", String(params.page));
  const str = p.toString();
  return `/shop${str ? "?" + str : ""}`;
}
