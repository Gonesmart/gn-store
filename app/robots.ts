import type { MetadataRoute } from "next";

const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/^﻿/, "").trim() || "https://gonesmartsolutions.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/account/", "/checkout/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
