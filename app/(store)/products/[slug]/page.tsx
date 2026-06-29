import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import {
  ChevronRight,
  Star,
  Truck,
  RotateCcw,
  Shield,
  CheckCircle2,
} from "lucide-react";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { withTimeout } from "@/lib/utils";
import { ProductStatus } from "@prisma/client";
import { ProductGallery } from "@/components/store/product-gallery";
import { ProductPurchaseArea, type SerializedVariant } from "@/components/store/product-purchase-area";
import { ReviewForm } from "@/components/store/review-form";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.product
    .findFirst({
      where: { slug },
      select: {
        name: true,
        description: true,
        images: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
        category: { select: { name: true } },
        variants: { orderBy: { price: "asc" }, take: 1, select: { price: true } },
      },
    })
    .catch(() => null);

  if (!product) return { title: "Product not found" };

  const description = product.description.slice(0, 160);
  const imageUrl = product.images[0]?.url ?? null;
  const price = product.variants[0]?.price.toString() ?? null;

  return {
    title: product.name,
    description,
    keywords: [product.name, product.category.name, "buy online Nigeria", "GN Store"],
    openGraph: {
      title: `${product.name} | GN Store`,
      description,
      type: "website",
      ...(imageUrl ? { images: [{ url: imageUrl, alt: product.name }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | GN Store`,
      description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
    other: price ? { "product:price:amount": price, "product:price:currency": "NGN" } : {},
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  let product: Awaited<ReturnType<typeof fetchProduct>> | null = null;
  let session: { user: { id: string; name: string } } | null = null;

  try {
    [product, session] = await withTimeout(
      Promise.all([
        fetchProduct(slug),
        auth.api
          .getSession({ headers: await headers() })
          .then((s) => s ?? null)
          .catch(() => null),
      ]),
      8000
    );
  } catch {
    // DB timeout — show 404 rather than error page for bad slugs,
    // or let the DB reconnect on retry for valid ones
  }

  if (!product) notFound();

  const {
    id,
    name,
    description,
    category,
    images,
    variants,
    reviews,
  } = product;

  // Serialise Decimal fields for Client Components
  const serializedVariants: SerializedVariant[] = variants.map((v) => ({
    id: v.id,
    size: v.size,
    color: v.color,
    price: v.price.toString(),
    compareAtPrice: v.compareAtPrice?.toString() ?? null,
    stock: v.stock,
  }));

  // Rating stats
  const reviewCount = reviews.length;
  const avgRating =
    reviewCount > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviewCount
      : 0;

  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    return { star, count, pct: reviewCount > 0 ? (count / reviewCount) * 100 : 0 };
  });

  const userId = session?.user?.id ?? null;
  const existingReview = userId
    ? reviews.find((r) => r.userId === userId) ?? null
    : null;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://gonesmartsolutions.com";
  const lowestPrice = variants[0]?.price.toString() ?? "0";
  const inStock = variants.some((v) => v.stock === null || v.stock > 0);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image: images.map((img) => img.url),
    brand: { "@type": "Brand", name: "GN Store" },
    category: category.name,
    offers: {
      "@type": "Offer",
      priceCurrency: "NGN",
      price: lowestPrice,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${baseUrl}/products/${id}`,
      seller: { "@type": "Organization", name: "GN Store" },
    },
    ...(reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: avgRating.toFixed(1),
            reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "Shop", item: `${baseUrl}/shop` },
      {
        "@type": "ListItem",
        position: 3,
        name: category.name,
        item: `${baseUrl}/shop?category=${category.slug}`,
      },
      { "@type": "ListItem", position: 4, name },
    ],
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0D0D0D]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* Breadcrumb */}
      <div className="border-b border-gray-100 dark:border-[#1E1E1E]">
        <div className="mx-auto max-w-7xl px-4 py-3 lg:px-8">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-[#A3A3A3]">
            <Link href="/" className="transition-colors hover:text-gray-700 dark:hover:text-white">
              Home
            </Link>
            <ChevronRight size={12} />
            <Link href="/shop" className="transition-colors hover:text-gray-700 dark:hover:text-white">
              Shop
            </Link>
            <ChevronRight size={12} />
            <Link
              href={`/shop?category=${category.slug}`}
              className="transition-colors hover:text-gray-700 dark:hover:text-white"
            >
              {category.name}
            </Link>
            <ChevronRight size={12} />
            <span className="max-w-[180px] truncate text-gray-700 dark:text-white">
              {name}
            </span>
          </nav>
        </div>
      </div>

      {/* Product layout */}
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Left: Gallery */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <ProductGallery images={images} productName={name} />
          </div>

          {/* Right: Info */}
          <div className="flex flex-col gap-6">
            {/* Category + name */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#5DC600]">
                {category.name}
              </p>
              <h1 className="text-2xl font-black leading-tight tracking-tight text-gray-900 dark:text-white lg:text-3xl">
                {name}
              </h1>

              {/* Rating summary */}
              {reviewCount > 0 && (
                <a
                  href="#reviews"
                  className="mt-3 flex items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600]"
                >
                  <StarDisplay rating={avgRating} size={14} />
                  <span className="text-sm text-gray-500 underline-offset-2 hover:underline dark:text-[#A3A3A3]">
                    {avgRating.toFixed(1)} ({reviewCount}{" "}
                    {reviewCount === 1 ? "review" : "reviews"})
                  </span>
                </a>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-100 dark:bg-[#1E1E1E]" />

            {/* Purchase area: price + variant picker + qty + add to cart */}
            {serializedVariants.length > 0 ? (
              <ProductPurchaseArea
                variants={serializedVariants}
                productName={name}
              />
            ) : (
              <p className="text-sm text-gray-400 dark:text-[#A3A3A3]">
                This product is currently unavailable.
              </p>
            )}

            {/* Divider */}
            <div className="h-px bg-gray-100 dark:bg-[#1E1E1E]" />

            {/* Description */}
            {description && (
              <div>
                <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-[#A3A3A3]">
                  About this product
                </h2>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-[#A3A3A3]">
                  {description}
                </p>
              </div>
            )}

            {/* Delivery + trust badges */}
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-[#2A2A2A] dark:bg-[#1A1A1A]">
              <ul className="flex flex-col gap-3">
                <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-[#A3A3A3]">
                  <Truck size={16} className="shrink-0 text-[#5DC600]" />
                  Free delivery on orders over &#8358;50,000
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-[#A3A3A3]">
                  <RotateCcw size={16} className="shrink-0 text-[#5DC600]" />
                  7-day hassle-free returns
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-[#A3A3A3]">
                  <Shield size={16} className="shrink-0 text-[#5DC600]" />
                  Secure payment via Paystack
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews section */}
      <div
        id="reviews"
        className="border-t border-gray-100 bg-gray-50 dark:border-[#1E1E1E] dark:bg-[#0A0A0A]"
      >
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
          <h2 className="mb-8 text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            Customer Reviews
          </h2>

          {reviewCount > 0 ? (
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
              {/* Rating summary sidebar */}
              <div className="lg:col-span-1">
                <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 dark:border-[#2A2A2A] dark:bg-[#1A1A1A]">
                  <div className="text-center">
                    <p className="text-5xl font-black text-gray-900 dark:text-white">
                      {avgRating.toFixed(1)}
                    </p>
                    <div className="mt-2 flex justify-center">
                      <StarDisplay rating={avgRating} size={18} />
                    </div>
                    <p className="mt-1 text-sm text-gray-400 dark:text-[#A3A3A3]">
                      {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    {ratingBreakdown.map(({ star, count, pct }) => (
                      <div key={star} className="flex items-center gap-2">
                        <span className="w-4 text-right text-xs text-gray-500 dark:text-[#A3A3A3]">
                          {star}
                        </span>
                        <Star
                          size={11}
                          className="shrink-0 fill-[#5DC600] text-[#5DC600]"
                        />
                        <div className="flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-[#2A2A2A]">
                          <div
                            className="h-1.5 rounded-full bg-[#5DC600] transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-4 text-xs text-gray-400 dark:text-[#A3A3A3]">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Review form */}
                <div className="mt-6">
                  <ReviewForm
                    productId={id}
                    userId={userId}
                    existingReview={
                      existingReview
                        ? {
                            rating: existingReview.rating,
                            title: existingReview.title,
                            body: existingReview.body,
                          }
                        : null
                    }
                  />
                </div>
              </div>

              {/* Review cards */}
              <div className="flex flex-col gap-5 lg:col-span-2">
                {reviews.map((review) => {
                  const firstName = review.user.name?.split(" ")[0] ?? "Customer";
                  const lastInitial = review.user.name?.split(" ")[1]?.[0];
                  const displayName = lastInitial
                    ? `${firstName} ${lastInitial}.`
                    : firstName;

                  return (
                    <div
                      key={review.id}
                      className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-[#2A2A2A] dark:bg-[#1A1A1A]"
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <StarDisplay rating={review.rating} size={13} />
                            {review.verified && (
                              <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[#5DC600]">
                                <CheckCircle2 size={11} />
                                Verified
                              </span>
                            )}
                          </div>
                          {review.title && (
                            <p className="mt-1.5 font-semibold text-gray-900 dark:text-white">
                              {review.title}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-medium text-gray-700 dark:text-white">
                            {displayName}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-[#A3A3A3]">
                            {new Date(review.createdAt).toLocaleDateString(
                              "en-NG",
                              { year: "numeric", month: "short", day: "numeric" }
                            )}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-gray-600 dark:text-[#A3A3A3]">
                        {review.body}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* No reviews yet */
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-12 text-center dark:border-[#2A2A2A] lg:col-span-2">
                <StarDisplay rating={0} size={22} />
                <p className="mt-3 font-semibold text-gray-900 dark:text-white">
                  No reviews yet
                </p>
                <p className="mt-1 text-sm text-gray-400 dark:text-[#A3A3A3]">
                  Be the first to share your experience.
                </p>
              </div>
              <div>
                <ReviewForm
                  productId={id}
                  userId={userId}
                  existingReview={null}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StarDisplay({ rating, size }: { rating: number; size: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={
            s <= Math.round(rating)
              ? "fill-[#5DC600] text-[#5DC600]"
              : "fill-gray-200 text-gray-200 dark:fill-[#2A2A2A] dark:text-[#2A2A2A]"
          }
        />
      ))}
    </div>
  );
}

async function fetchProduct(slug: string) {
  return db.product.findFirst({
    where: { slug, status: ProductStatus.ACTIVE },
    include: {
      category: { select: { name: true, slug: true } },
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: { price: "asc" } },
      reviews: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      },
    },
  });
}
