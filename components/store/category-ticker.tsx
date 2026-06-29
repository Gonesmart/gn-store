const ITEMS = [
  "Smartphones",
  "Laptops",
  "Headphones",
  "Fashion",
  "Cosmetics",
  "Accessories",
  "Tablets",
  "Smart Home",
  "Cameras",
  "Gaming",
];

const TRIPLE = [...ITEMS, ...ITEMS, ...ITEMS];

export function CategoryTicker() {
  return (
    <div className="overflow-hidden border-t border-white/10 bg-black/50 py-4 backdrop-blur-sm">
      <style>{`
        @keyframes gn-ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .gn-ticker-track {
          animation: gn-ticker 28s linear infinite;
          will-change: transform;
        }
      `}</style>
      <div className="gn-ticker-track flex w-max">
        {TRIPLE.map((item, i) => (
          <span key={i} className="flex items-center">
            <span className="px-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
              {item}
            </span>
            <span className="text-[#5DC600] opacity-70">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
