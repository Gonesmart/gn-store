import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/^﻿/, "").trim() || "https://gonesmartsolutions.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/shop`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/track-order`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/returns`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.2 },
    { url: `${BASE}/register`, lastModified: now, changeFrequency: "monthly", priority: 0.2 },
  ];

  let products: { slug: string; updatedAt: Date }[] = [];
  let categories: { slug: string; updatedAt: Date }[] = [];

  try {
    [products, categories] = await Promise.all([
      db.product.findMany({
        where: { status: "ACTIVE" },
        select: { slug: true, updatedAt: true },
      }),
      db.category.findMany({
        select: { slug: true, updatedAt: true },
      }),
    ]);
  } catch {
    // DB unavailable during build — return static routes only
  }

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE}/products/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${BASE}/shop?category=${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}
