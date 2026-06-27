import { db } from "@/lib/db";
import { withTimeout } from "@/lib/utils";
import { StoreNavbar } from "@/components/store/navbar";
import { StoreFooter } from "@/components/store/footer";
import { HeroSection } from "@/components/store/hero-section";
import { CategorySection, type CategoryCardData } from "@/components/store/category-section";
import { FeaturedProducts } from "@/components/store/featured-products";
import { ValueProps } from "@/components/store/value-props";
import type { ProductCardData } from "@/components/store/product-card";
import { CartDrawer } from "@/components/store/cart-drawer";
import { CartProvider } from "@/components/providers/cart-provider";

export const revalidate = 3600;

export default async function HomePage() {
  let products: ProductCardData[] = [];
  let categoryCards: CategoryCardData[] = [];

  try {
    const [rawProducts, categories] = await withTimeout(
      Promise.all([
        db.product.findMany({
          where: { status: "ACTIVE", featured: true },
          include: {
            images: { orderBy: { position: "asc" }, take: 1 },
            variants: { orderBy: { price: "asc" }, take: 1 },
            category: { select: { name: true } },
          },
          take: 8,
          orderBy: { createdAt: "desc" },
        }),
        db.category.findMany({
          where: { parentId: null },
          orderBy: { createdAt: "asc" },
        }),
      ]),
      6000
    );

    products = rawProducts.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      image: p.images[0]?.url ?? null,
      imageAlt: p.images[0]?.altText ?? p.name,
      price: p.variants[0]?.price.toString() ?? "0",
      compareAtPrice: p.variants[0]?.compareAtPrice?.toString() ?? null,
      categoryName: p.category.name,
    }));

    categoryCards = categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      image: c.image,
    }));
  } catch {
    // DB unavailable or timed out — render with fallback data
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://gonesmartsolutions.com";

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "GN Store",
    alternateName: "Gonesmart Solutions",
    url: baseUrl,
    logo: `${baseUrl}/brand/whitelogo.png`,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "hello@gonesmartsolutions.com",
    },
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "GN Store",
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${baseUrl}/shop?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <CartProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <StoreNavbar />
      <main className="flex-1">
        <HeroSection />
        <CategorySection categories={categoryCards} />
        <FeaturedProducts products={products} />
        <ValueProps />
      </main>
      <StoreFooter />
      <CartDrawer />
    </CartProvider>
  );
}
