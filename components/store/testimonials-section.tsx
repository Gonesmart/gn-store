const REVIEWS = [
  {
    stars: 5,
    text: "Ordered a Samsung tablet and it arrived the next morning. Packaging was perfect and the product is 100% genuine. GN Store is now my go-to for tech.",
    name: "Chukwuemeka O.",
    role: "Entrepreneur, Lagos",
    initials: "CO",
  },
  {
    stars: 5,
    text: "The skincare products I ordered were exactly as described. Fast delivery, great prices, and the customer service team responded in under an hour. Very impressed.",
    name: "Fatima A.",
    role: "Nurse, Abuja",
    initials: "FA",
  },
  {
    stars: 5,
    text: "Bought a pair of wireless earbuds for my son's birthday. Arrived same day, sealed box, original product. Will definitely keep shopping here.",
    name: "Biodun T.",
    role: "Teacher, Ibadan",
    initials: "BT",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 14 14" fill="#5DC600">
          <path d="M7 1l1.545 3.13 3.455.502-2.5 2.436.59 3.44L7 8.885l-3.09 1.623.59-3.44L2 4.632l3.455-.502z" />
        </svg>
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="bg-[#111111] py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Header */}
        <div className="mb-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#5DC600]/30 bg-[#5DC600]/10 px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#5DC600]" />
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#5DC600]">
                Customer Reviews
              </span>
            </div>
            <h2 className="text-[clamp(26px,3.2vw,42px)] font-bold leading-[1.05] tracking-[-0.02em] text-white">
              What Our Customers Say
            </h2>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg key={i} width="16" height="16" viewBox="0 0 14 14" fill="#5DC600">
                  <path d="M7 1l1.545 3.13 3.455.502-2.5 2.436.59 3.44L7 8.885l-3.09 1.623.59-3.44L2 4.632l3.455-.502z" />
                </svg>
              ))}
            </div>
            <span className="text-sm font-semibold text-white">4.9</span>
            <span className="text-sm text-[#A3A3A3]">from 1,200+ reviews</span>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {REVIEWS.map((r) => (
            <div
              key={r.name}
              className="flex flex-col justify-between rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-7"
            >
              <div>
                <Stars count={r.stars} />
                <p className="mt-5 text-[14px] leading-[1.75] text-[#A3A3A3]">
                  &ldquo;{r.text}&rdquo;
                </p>
              </div>
              <div className="mt-7 flex items-center gap-3 border-t border-[#2A2A2A] pt-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#5DC600]/15 text-xs font-bold text-[#5DC600]">
                  {r.initials}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-white">{r.name}</p>
                  <p className="text-[11px] text-[#A3A3A3]">{r.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
