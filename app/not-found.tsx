import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

export const metadata = {
  title: "Page Not Found | GN Store",
};

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white px-4 dark:bg-[#0D0D0D]">

      {/* Giant ambient 404 — purely decorative, screen-reader hidden */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute select-none font-black leading-none text-[clamp(180px,40vw,380px)] text-[#5DC600]/[0.06] dark:text-[#5DC600]/[0.08]"
        style={{ letterSpacing: "-0.06em" }}
      >
        404
      </span>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center">

        {/* Icon */}
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#EBF5E9] dark:bg-[#5DC600]/10">
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M20 4L36 34H4L20 4Z"
              stroke="#5DC600"
              strokeWidth="2.5"
              strokeLinejoin="round"
              fill="none"
            />
            <line x1="20" y1="16" x2="20" y2="24" stroke="#5DC600" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="20" cy="29" r="1.25" fill="#5DC600" />
          </svg>
        </div>

        {/* Eyebrow */}
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#5DC600]">
          Error 404
        </p>

        {/* Headline */}
        <h1 className="max-w-sm text-3xl font-black tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          This page doesn&apos;t exist
        </h1>

        {/* Body */}
        <p className="mt-4 max-w-xs text-base leading-relaxed text-gray-500 dark:text-[#A3A3A3]">
          The link may be broken or the page may have been removed. Check the
          URL or head back to the store.
        </p>

        {/* Actions */}
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/"
            className="group flex items-center gap-2 rounded-xl bg-[#5DC600] px-7 py-3.5 text-sm font-bold text-black transition-colors duration-150 hover:bg-[#4DAF00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5DC600] active:bg-[#3D9600]"
          >
            <Home size={16} />
            Go to Homepage
          </Link>

          <Link
            href="/shop"
            className="flex items-center gap-2 rounded-xl border border-gray-200 px-7 py-3.5 text-sm font-semibold text-gray-600 transition-colors duration-150 hover:border-gray-400 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5DC600] dark:border-[#2A2A2A] dark:text-[#A3A3A3] dark:hover:border-[#4A4A4A] dark:hover:text-white"
          >
            <ArrowLeft size={16} />
            Browse the shop
          </Link>
        </div>
      </div>

      {/* Subtle radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(93,198,0,0.04) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
