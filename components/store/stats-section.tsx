const METRICS = [
  { value: "500+", label: "Products", sub: "Across gadgets, fashion & cosmetics" },
  { value: "98%", label: "Satisfaction", sub: "From 1,200+ verified customers" },
];

const TAGS = [
  "Fast Delivery", "Secure Payment", "Easy Returns", "100% Authentic",
  "Quality Brands", "Customer Support", "Free Shipping (₦50k+)", "Nationwide Coverage",
];

export function StatsSection() {
  return (
    <section className="bg-[#0D0D0D] py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-20 lg:items-center">

          {/* Left: metrics */}
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#5DC600]/30 bg-[#5DC600]/10 px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#5DC600]" />
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#5DC600]">
                By the Numbers
              </span>
            </div>

            <h2 className="mb-12 text-[clamp(28px,3.5vw,46px)] font-bold leading-[1.05] tracking-[-0.02em] text-white">
              Trusted by Thousands of Smart Shoppers
            </h2>

            <div className="flex flex-col gap-10 sm:flex-row sm:gap-16">
              {METRICS.map(({ value, label, sub }) => (
                <div key={label}>
                  <p className="text-[clamp(48px,6vw,72px)] font-black leading-none text-[#5DC600]">
                    {value}
                  </p>
                  <p className="mt-2 text-base font-bold text-white">{label}</p>
                  <p className="mt-1 text-sm text-[#A3A3A3]">{sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: benefit tags */}
          <div>
            <p className="mb-6 text-sm font-semibold uppercase tracking-[0.12em] text-[#A3A3A3]">
              What you get with every order
            </p>
            <div className="flex flex-wrap gap-3">
              {TAGS.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-2 rounded-full border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-2 text-sm font-medium text-white transition-colors hover:border-[#5DC600]/40 hover:bg-[#5DC600]/8"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#5DC600]" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
