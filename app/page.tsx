import { db } from "@/lib/db";
import { withTimeout } from "@/lib/utils";
import { StoreNavbar } from "@/components/store/navbar";
import { StoreFooter } from "@/components/store/footer";
import { HeroSection } from "@/components/store/hero-section";
import { CategoryTicker } from "@/components/store/category-ticker";
import { AboutSection } from "@/components/store/about-section";
import { WhyChooseSection } from "@/components/store/why-choose-section";
import { HowItWorksSection } from "@/components/store/how-it-works-section";
import { FeaturedProducts } from "@/components/store/featured-products";
import { StatsSection } from "@/components/store/stats-section";
import { TestimonialsSection } from "@/components/store/testimonials-section";
import { FaqSection } from "@/components/store/faq-section";
import { CartDrawer } from "@/components/store/cart-drawer";
import { CartProvider } from "@/components/providers/cart-provider";
import { getWishlistProductIds } from "@/actions/wishlist";
import type { ProductCardData } from "@/components/store/product-card";

export default async function HomePage() {
  let products: ProductCardData[] = [];
  let wishlistedIds: string[] = [];

  try {
    const [rawProducts, wids] = await Promise.all([
      withTimeout(
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
        6000
      ),
      getWishlistProductIds().catch(() => [] as string[]),
    ]);

    products = rawProducts.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      image: p.images[0]?.url ?? null,
      imageAlt: p.images[0]?.altText ?? p.name,
      price: p.variants[0]?.price.toString() ?? "0",
      compareAtPrice: p.variants[0]?.compareAtPrice?.toString() ?? null,
      categoryName: p.category.name,
      variantId: p.variants[0]?.id ?? "",
    }));

    wishlistedIds = wids;
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

      {/* Navbar floats over hero */}
      <StoreNavbar overlayHero />

      <main>
        {/* 1. Hero — full-bleed background photo */}
        <HeroSection />

        {/* 2. Category ticker strip */}
        <CategoryTicker />

        {/* 3. About GN Store — dark section */}
        <AboutSection />

        {/* 4. Why Choose Us — split layout */}
        <WhyChooseSection />

        {/* 6. How It Works — 3 steps, dark */}
        <HowItWorksSection />

        {/* 7. Featured Products — light/gray */}
        <FeaturedProducts products={products} wishlistedIds={wishlistedIds} />

        {/* 8. Stats + Benefits — dark */}
        <StatsSection />

        {/* 9. Customer Reviews — dark */}
        <TestimonialsSection />

        {/* 10. FAQ — light */}
        <FaqSection />
      </main>

      <StoreFooter />
      <CartDrawer />
    </CartProvider>
  );
}
