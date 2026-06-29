import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";

const FEATURES = [
  "Curated selection of 500+ premium products",
  "Authentic brands, quality guaranteed",
  "Fast delivery across Nigeria",
  "Dedicated customer support, 7 days a week",
];

export function AboutSection() {
  return (
    <section className="bg-[#0F0F0F] py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-2 lg:gap-20 lg:items-center">

          {/* Left: stacked images */}
          <div className="relative h-[480px] lg:h-[560px]">
            {/* Main tall image */}
            <div className="absolute left-0 top-0 h-[420px] w-[62%] overflow-hidden rounded-2xl">
              <Image
                src="/images/fashion1.jpg"
                alt="GN Store fashion collection"
                fill
                className="object-cover object-top"
                sizes="(max-width: 1024px) 60vw, 26vw"
              />
            </div>
            {/* Smaller overlapping image bottom-right */}
            <div className="absolute bottom-0 right-0 h-[300px] w-[52%] overflow-hidden rounded-2xl ring-4 ring-[#0F0F0F]">
              <Image
                src="/images/cosmetics.jpg"
                alt="GN Store cosmetics collection"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 50vw, 22vw"
              />
            </div>
            {/* Stats badge */}
            <div className="absolute bottom-[168px] left-[55%] -translate-x-1/2 z-10 flex flex-col items-center rounded-2xl bg-[#5DC600] px-5 py-4 shadow-lg shadow-[#5DC600]/20">
              <span className="text-3xl font-black text-black leading-none">500+</span>
              <span className="mt-1 text-[11px] font-semibold text-black/70 uppercase tracking-wider">Products</span>
            </div>
          </div>

          {/* Right: content */}
          <div>
            {/* Eyebrow */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#5DC600]/30 bg-[#5DC600]/10 px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#5DC600]" />
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#5DC600]">
                About GN Store
              </span>
            </div>

            <h2 className="mb-5 text-[clamp(28px,3.5vw,46px)] font-bold leading-[1.05] tracking-[-0.02em] text-white">
              We Bring the World&apos;s Best Tech &amp; Style to Your Doorstep
            </h2>

            <p className="mb-8 text-[15px] leading-[1.75] text-[#A3A3A3]">
              Since 2023, GN Store has been Nigeria&apos;s go-to destination for premium gadgets, fashion, and cosmetics. We partner with trusted brands and verified suppliers so every product you receive is exactly what was promised - authentic, quality-checked, and delivered fast.
            </p>

            {/* Feature list */}
            <ul className="mb-10 space-y-3.5">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#5DC600]/15">
                    <Check size={11} className="text-[#5DC600]" strokeWidth={3} />
                  </span>
                  <span className="text-[14px] leading-relaxed text-[#A3A3A3]">{f}</span>
                </li>
              ))}
            </ul>

            {/* CTA + social proof */}
            <div className="flex flex-wrap items-center gap-6">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-xl bg-[#5DC600] px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-[#4DAF00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600] active:scale-[0.98]"
              >
                Browse Shop
                <ArrowUpRight size={15} />
              </Link>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {["A", "B", "C"].map((l) => (
                    <div key={l} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2A2A2A] ring-2 ring-[#0F0F0F] text-xs font-bold text-white">
                      {l}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-white">4.9 ★</p>
                  <p className="text-[11px] text-[#A3A3A3]">1,200+ customers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
