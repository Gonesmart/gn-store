"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function StoreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30">
        <AlertTriangle size={36} className="text-red-500" />
      </div>
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-[#A3A3A3]">
          An unexpected error occurred. Please try again.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          onClick={reset}
          className="flex items-center justify-center rounded-xl bg-[#5DC600] px-6 py-3 font-bold text-black transition-colors hover:bg-[#4DAF00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600]"
        >
          Try again
        </button>
        <Link
          href="/shop"
          className="flex items-center justify-center rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600] dark:border-[#2A2A2A] dark:text-[#A3A3A3] dark:hover:border-[#4A4A4A] dark:hover:text-white"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
