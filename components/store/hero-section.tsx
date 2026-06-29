"use client";

import Link from "next/link";
import { ArrowUpRight, Zap, ShieldCheck } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background photo */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/fashion2.jpg')",
        }}
      />
      {/* Gradient overlay — heavier on left so text stays readable */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D0D]/92 via-[#0D0D0D]/75 to-[#0D0D0D]/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/60 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col justify-center px-4 pb-28 pt-32 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          {/* Eyebrow pill */}
          <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/8 px-4 py-2 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-[#5DC600]" />
            <span className="text-sm font-medium text-white/90">
              Nigeria&apos;s #1 Smart Shopping Destination
            </span>
          </div>

          {/* Headline */}
          <h1 className="mb-6 max-w-[720px] text-[clamp(40px,5.5vw,76px)] font-bold leading-[0.94] tracking-[-0.025em] text-white">
            Shop the Tech &amp; Style You Actually Want
          </h1>

          {/* Body */}
          <p className="mb-10 max-w-[480px] text-[17px] leading-[1.65] text-white/65">
            Premium gadgets, curated cosmetics, and fashion - sourced for the modern Nigerian lifestyle. Fast delivery, authentic products, secure checkout.
          </p>

          {/* Feature callouts */}
          <div className="mb-11 flex flex-wrap gap-x-10 gap-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/10">
                <Zap size={16} className="text-[#5DC600]" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-white">Same-Day Dispatch</p>
                <p className="text-[12px] text-white/50">Orders placed before 2 PM</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/10">
                <ShieldCheck size={16} className="text-[#5DC600]" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-white">100% Authentic</p>
                <p className="text-[12px] text-white/50">Every item quality-checked</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/shop"
            className="inline-flex items-center gap-2.5 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-[#0D0D0D] transition-all duration-200 hover:bg-[#5DC600] hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600] active:scale-[0.98]"
          >
            Shop Now
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
