import { Suspense } from "react";
import { Star, MessageSquare } from "lucide-react";
import { db } from "@/lib/db";
import { ReviewActions } from "@/components/admin/review-actions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Reviews" };

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

async function ReviewList({ filter }: { filter: string }) {
  const reviews = await db.review.findMany({
    where:
      filter === "pending"
        ? { approved: false }
        : filter === "approved"
        ? { approved: true }
        : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { name: true, slug: true } },
      user: { select: { name: true, email: true } },
    },
  });

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#2A2A2A] bg-[#1A1A1A] py-20 text-center">
        <MessageSquare className="mb-4 h-10 w-10 text-[#2A2A2A]" />
        <p className="text-sm font-medium text-[#A3A3A3]">
          {filter === "pending"
            ? "No reviews awaiting approval"
            : filter === "approved"
            ? "No approved reviews yet"
            : "No reviews yet"}
        </p>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-xl border border-[#2A2A2A] bg-[#1A1A1A]"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.3)" }}
    >
      <div className="divide-y divide-[#2A2A2A]">
        {reviews.map((review) => (
          <div key={review.id} className="flex items-start gap-4 px-5 py-4">
            {/* Status dot */}
            <div className="mt-1 shrink-0">
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  review.approved ? "bg-[#5DC600]" : "bg-yellow-400"
                }`}
                title={review.approved ? "Approved" : "Pending"}
              />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                {/* Stars */}
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={12}
                      className={
                        s <= review.rating
                          ? "fill-[#5DC600] text-[#5DC600]"
                          : "fill-[#2A2A2A] text-[#2A2A2A]"
                      }
                    />
                  ))}
                </div>
                {review.title && (
                  <p className="text-sm font-semibold text-white">{review.title}</p>
                )}
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    review.approved
                      ? "bg-[#5DC600]/15 text-[#5DC600]"
                      : "bg-yellow-400/15 text-yellow-400"
                  }`}
                >
                  {review.approved ? "Approved" : "Pending"}
                </span>
              </div>

              <p className="mt-1 text-sm leading-relaxed text-[#A3A3A3] line-clamp-2">
                {review.body}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[#555]">
                <span className="font-medium text-[#A3A3A3]">
                  {review.user.name ?? review.user.email}
                </span>
                <span>on</span>
                <span className="font-medium text-white">{review.product.name}</span>
                <span>·</span>
                <span>
                  {new Date(review.createdAt).toLocaleDateString("en-NG", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="shrink-0">
              <ReviewActions
                reviewId={review.id}
                approved={review.approved}
                productName={review.product.name}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function ReviewsPage({ searchParams }: PageProps) {
  const { status = "pending" } = await searchParams;

  const [pendingCount, approvedCount, totalCount] = await Promise.all([
    db.review.count({ where: { approved: false } }),
    db.review.count({ where: { approved: true } }),
    db.review.count(),
  ]);

  const tabs = [
    { key: "pending", label: "Pending", count: pendingCount },
    { key: "approved", label: "Approved", count: approvedCount },
    { key: "all", label: "All", count: totalCount },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Reviews</h1>
        <p className="mt-1 text-sm text-[#A3A3A3]">
          Approve or remove customer reviews before they appear on product pages
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] p-1 w-fit">
        {tabs.map((tab) => {
          const active = status === tab.key;
          return (
            <a
              key={tab.key}
              href={`/admin/reviews${tab.key !== "pending" ? `?status=${tab.key}` : ""}`}
              className={`flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-[#2A2A2A] text-white"
                  : "text-[#A3A3A3] hover:text-white"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  active
                    ? tab.key === "pending"
                      ? "bg-yellow-400/20 text-yellow-400"
                      : "bg-[#5DC600]/20 text-[#5DC600]"
                    : "bg-[#2A2A2A] text-[#555]"
                }`}
              >
                {tab.count}
              </span>
            </a>
          );
        })}
      </div>

      {/* Review list */}
      <Suspense
        fallback={
          <div className="rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] p-8 text-center text-sm text-[#A3A3A3]">
            Loading reviews…
          </div>
        }
      >
        <ReviewList filter={status} />
      </Suspense>
    </div>
  );
}
