"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Star, Loader2, CheckCircle2 } from "lucide-react";
import { submitReview } from "@/actions/reviews";

type ExistingReview = {
  rating: number;
  title: string | null;
  body: string;
};

export function ReviewForm({
  productId,
  userId,
  existingReview,
}: {
  productId: string;
  userId: string | null;
  existingReview: ExistingReview | null;
}) {
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [hovered, setHovered] = useState(0);
  const [title, setTitle] = useState(existingReview?.title ?? "");
  const [body, setBody] = useState(existingReview?.body ?? "");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!userId) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 text-center dark:border-[#2A2A2A] dark:bg-[#1A1A1A]">
        <p className="mb-3 text-sm text-gray-500 dark:text-[#A3A3A3]">
          Sign in to leave a review
        </p>
        <Link
          href="/login"
          className="inline-flex items-center rounded-lg bg-[#5DC600] px-5 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#4DAF00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600]"
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#5DC600]/20 bg-[#5DC600]/5 p-8 text-center">
        <CheckCircle2 size={32} className="text-[#5DC600]" />
        <p className="font-semibold text-gray-900 dark:text-white">
          {existingReview ? "Review updated" : "Review submitted"}
        </p>
        <p className="text-sm text-gray-500 dark:text-[#A3A3A3]">
          Thank you for sharing your experience.
        </p>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }

    startTransition(async () => {
      const result = await submitReview({
        productId,
        rating,
        title: title.trim() || undefined,
        body: body.trim(),
      });

      if (result.success) {
        setDone(true);
      } else {
        setError(result.error);
      }
    });
  }

  const displayRating = hovered || rating;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h3 className="text-base font-bold text-gray-900 dark:text-white">
        {existingReview ? "Update your review" : "Write a review"}
      </h3>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500 dark:text-red-400">
          {error}
        </p>
      )}

      {/* Star rating */}
      <div>
        <p className="mb-2 text-sm font-medium text-gray-700 dark:text-[#A3A3A3]">
          Rating
        </p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
              className="transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600]"
            >
              <Star
                size={28}
                className={
                  star <= displayRating
                    ? "fill-[#5DC600] text-[#5DC600]"
                    : "fill-gray-200 text-gray-200 dark:fill-[#2A2A2A] dark:text-[#2A2A2A]"
                }
              />
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label
          htmlFor="review-title"
          className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-[#A3A3A3]"
        >
          Title{" "}
          <span className="font-normal text-gray-400 dark:text-[#4A4A4A]">
            (optional)
          </span>
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          placeholder="Sum it up in a few words"
          className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#5DC600] focus:outline-none dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white dark:placeholder:text-[#4A4A4A]"
        />
      </div>

      {/* Body */}
      <div>
        <label
          htmlFor="review-body"
          className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-[#A3A3A3]"
        >
          Review
        </label>
        <textarea
          id="review-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={1000}
          rows={4}
          placeholder="What did you like or dislike? How does it fit or perform?"
          className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#5DC600] focus:outline-none dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white dark:placeholder:text-[#4A4A4A]"
        />
        <p className="mt-1 text-right text-xs text-gray-400 dark:text-[#4A4A4A]">
          {body.length}/1000
        </p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#5DC600] font-semibold text-black transition-colors hover:bg-[#4DAF00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600] disabled:opacity-60"
      >
        {isPending && <Loader2 size={16} className="animate-spin" />}
        {existingReview ? "Update review" : "Submit review"}
      </button>
    </form>
  );
}
