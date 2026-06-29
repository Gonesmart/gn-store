const STEPS = [
  {
    num: "01",
    title: "Browse & Discover",
    body: "Explore 500+ products across gadgets, fashion, and cosmetics. Filter by category, price, or brand to find exactly what you need.",
    points: ["Smart search & filters", "Detailed product pages", "Real customer reviews"],
  },
  {
    num: "02",
    title: "Order & Pay Securely",
    body: "Add items to your cart and check out in minutes. We accept all major payment methods through Paystack - Nigeria's most trusted gateway.",
    points: ["Bank card & transfer", "Encrypted checkout", "Instant order confirmation"],
  },
  {
    num: "03",
    title: "Delivered to Your Door",
    body: "Orders placed before 2 PM ship the same day. Track your delivery in real time and receive your items anywhere in Nigeria.",
    points: ["Same-day dispatch", "Nationwide delivery", "7-day return window"],
  },
];

export function HowItWorksSection() {
  return (
    <section className="bg-[#0F0F0F] py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#5DC600]/30 bg-[#5DC600]/10 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#5DC600]" />
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#5DC600]">
              How It Works
            </span>
          </div>
          <h2 className="text-[clamp(28px,3.5vw,46px)] font-bold leading-[1.05] tracking-[-0.02em] text-white">
            Simple Shopping, Every Time
          </h2>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className="relative rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-8"
            >
              {/* Step number */}
              <p className="mb-5 text-sm font-bold text-[#5DC600]">Step {step.num}</p>

              <h3 className="mb-3 text-[20px] font-bold leading-tight text-white">
                {step.title}
              </h3>

              <p className="mb-6 text-[13px] leading-[1.7] text-[#A3A3A3]">{step.body}</p>

              <ul className="space-y-2.5">
                {step.points.map((pt) => (
                  <li key={pt} className="flex items-center gap-2.5 text-[12px] text-[#A3A3A3]">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#5DC600]" />
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
