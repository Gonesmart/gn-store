"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";

const CYCLING_WORDS = ["GADGETS", "COSMETICS", "FASHION"] as const;

export function HeroSection() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIdx((i) => (i + 1) % CYCLING_WORDS.length);
    }, 2600);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative flex min-h-[calc(100vh-64px)] items-center overflow-hidden bg-white dark:bg-[#0D0D0D]">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute right-[5%] top-1/2 h-[520px] w-[520px] -translate-y-1/2 rounded-full opacity-[0.06] dark:opacity-[0.06]"
          style={{
            background: "radial-gradient(circle, #5DC600 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-[8%] left-[8%] h-[280px] w-[280px] rounded-full opacity-[0.04]"
          style={{
            background: "radial-gradient(circle, #5DC600 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-4 py-20 lg:grid-cols-[1fr_420px] lg:px-8 xl:gap-20">
        {/* LEFT: Copy */}
        <div>
          {/* Eyebrow badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#5DC600]/20 bg-[#5DC600]/10 px-3 py-1 sm:px-4 sm:py-1.5">
            <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-[#5DC600]" />
            <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#5DC600] sm:text-[10px] sm:tracking-[0.18em]">
              Free delivery on orders over ₦50,000
            </span>
          </div>

          {/* Headline */}
          <div className="mb-8 leading-[0.88]">
            <div className="text-[clamp(52px,7.5vw,108px)] font-black uppercase tracking-[-0.03em] text-gray-900 dark:text-white">
              SHOP
            </div>

            {/* Cycling word */}
            <div className="relative my-1 text-[clamp(52px,7.5vw,108px)] font-black uppercase tracking-[-0.03em] text-[#5DC600]">
              <AnimatePresence mode="wait">
                <motion.span
                  key={CYCLING_WORDS[idx]}
                  initial={{ y: 32, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="block"
                >
                  {CYCLING_WORDS[idx]}
                </motion.span>
              </AnimatePresence>
            </div>

            <div className="text-[clamp(52px,7.5vw,108px)] font-black uppercase tracking-[-0.03em] text-gray-900 dark:text-white">
              SMARTER.
            </div>
          </div>

          {/* Sub-text */}
          <p className="mb-10 max-w-sm text-base font-light leading-relaxed text-gray-500 dark:text-[#A3A3A3] lg:max-w-md lg:text-lg">
            Premium gadgets, curated cosmetics &amp; fashion - all in one
            place. Built for the modern Nigerian lifestyle.
          </p>

          {/* CTAs */}
          <div className="mb-12 flex flex-wrap gap-4">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-xl bg-[#5DC600] px-7 py-3.5 text-sm font-bold text-black transition-colors hover:bg-[#4DAF00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600] active:scale-[0.98]"
            >
              Shop Now
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-7 py-3.5 text-sm font-semibold text-gray-700 transition-colors hover:border-[#5DC600]/40 hover:bg-[#5DC600]/5 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600] active:scale-[0.98] dark:border-[#2A2A2A] dark:text-white dark:hover:border-[#5DC600]/40 dark:hover:bg-[#5DC600]/5"
            >
              Browse Collections
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-8 border-t border-gray-200 pt-6 dark:border-[#2A2A2A]">
            {[
              { number: "500+", label: "Products" },
              { number: "24hr", label: "Dispatch" },
              { number: "100%", label: "Authentic" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-500 dark:text-[#A3A3A3]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Decorative brand visual */}
        <div className="relative hidden items-center justify-center lg:flex">
          {/* Outer ambient glow */}
          <div
            className="absolute inset-0 rounded-full opacity-15"
            style={{
              background:
                "radial-gradient(circle, #5DC600 0%, transparent 65%)",
            }}
          />

          {/* Main display card */}
          <div className="relative flex h-[440px] w-[380px] items-center justify-center overflow-hidden rounded-[2rem] border border-gray-200 bg-gray-50 dark:border-[#2A2A2A] dark:bg-[#1A1A1A]">
            {/* Dot-grid texture */}
            <svg
              className="absolute inset-0 h-full w-full opacity-[0.05] dark:opacity-[0.035]"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  id="dots"
                  width="24"
                  height="24"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="1" cy="1" r="1" fill="#5DC600" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dots)" />
            </svg>

            {/* Corner decorations */}
            <div className="absolute right-5 top-5 h-14 w-14 rounded-full border border-[#5DC600]/25" />
            <div className="absolute bottom-5 left-5 h-7 w-7 rounded-full bg-[#5DC600]/15" />
            <div className="absolute left-6 top-1/3 h-20 w-px rounded-full bg-[#5DC600]/15" />
            <div className="absolute right-6 top-[40%] h-14 w-px rounded-full bg-[#5DC600]/10" />

            {/* Brand mark */}
            <span
              className="select-none text-[160px] font-black leading-none text-[#5DC600]"
              style={{ opacity: 0.1, letterSpacing: "-0.06em" }}
            >
              GN
            </span>

            {/* Bottom fade */}
            <div
              className="absolute bottom-0 left-0 right-0 h-28"
              style={{
                background:
                  "linear-gradient(to top, rgba(93,198,0,0.06), transparent)",
              }}
            />
          </div>

          {/* Floating chip - top right */}
          <motion.div
            className="absolute -right-5 top-10 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-2xl dark:border-[#2A2A2A] dark:bg-[#1A1A1A]"
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="mb-0.5 text-[10px] uppercase tracking-wider text-gray-400 dark:text-[#A3A3A3]">
              New Arrival
            </div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">Smart Gadgets</div>
            <div className="mt-0.5 text-xs font-bold text-[#5DC600]">
              From ₦15,000
            </div>
          </motion.div>

          {/* Floating chip - bottom left */}
          <motion.div
            className="absolute -left-5 bottom-16 rounded-xl bg-[#5DC600] px-4 py-3 shadow-2xl"
            animate={{ y: [0, 7, 0] }}
            transition={{
              duration: 3.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.6,
            }}
          >
            <div className="mb-0.5 flex items-center gap-1.5">
              <Zap size={11} className="text-black" />
              <span className="text-[10px] font-black uppercase tracking-wider text-black">
                Fast Delivery
              </span>
            </div>
            <div className="text-xs font-medium text-black/70">
              Lagos &amp; beyond
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
