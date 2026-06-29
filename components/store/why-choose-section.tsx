import Image from "next/image";
import { Truck, ShieldCheck, RefreshCw, Lock } from "lucide-react";

const STATS = [
  { value: "98%", label: "Satisfaction Rate" },
  { value: "500+", label: "Products Available" },
];

const FEATURES = [
  { icon: Truck, title: "Same-Day Dispatch", body: "Orders placed before 2 PM ship the same day - anywhere in Nigeria." },
  { icon: ShieldCheck, title: "100% Authentic Products", body: "Every item is sourced directly from verified suppliers and quality-checked." },
  { icon: RefreshCw, title: "7-Day Easy Returns", body: "Not satisfied? Return it hassle-free within 7 days, no questions asked." },
  { icon: Lock, title: "Secure Payments", body: "Checkout is encrypted and powered by Paystack - Nigeria's most trusted gateway." },
];

export function WhyChooseSection() {
  return (
    <section className="bg-white py-24 dark:bg-[#0D0D0D] lg:py-32">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-2 lg:gap-20 lg:items-center">

          {/* Left: image with color accent */}
          <div className="relative overflow-hidden rounded-2xl">
            <Image
              src="/images/fashion3.jpg"
              alt="Why shop with GN Store"
              width={680}
              height={560}
              className="w-full object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-y-0 left-0 w-1.5 bg-[#5DC600]" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-7">
              <p className="text-2xl font-black text-white">Shop Smarter,</p>
              <p className="text-2xl font-black text-[#5DC600]">Live Better.</p>
            </div>
          </div>

          {/* Right: content */}
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#5DC600]/30 bg-[#5DC600]/8 px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#5DC600]" />
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#5DC600]">
                Why GN Store
              </span>
            </div>

            <h2 className="mb-8 text-[clamp(26px,3.2vw,42px)] font-bold leading-[1.08] tracking-[-0.02em] text-gray-900 dark:text-white">
              Every Order, Backed by Our Promise
            </h2>

            {/* Stats */}
            <div className="mb-10 flex gap-10 border-b border-gray-100 pb-10 dark:border-[#2A2A2A]">
              {STATS.map(({ value, label }) => (
                <div key={label}>
                  <p className="text-4xl font-black text-[#5DC600]">{value}</p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-[#A3A3A3]">{label}</p>
                </div>
              ))}
            </div>

            {/* Feature list */}
            <ul className="space-y-6">
              {FEATURES.map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#5DC600]/10">
                    <Icon size={17} className="text-[#5DC600]" />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-gray-900 dark:text-white">{title}</p>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-gray-500 dark:text-[#A3A3A3]">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
