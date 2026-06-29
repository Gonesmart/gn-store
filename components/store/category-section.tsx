import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Cpu, Sparkles, Shirt } from "lucide-react";

export type CategoryCardData = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
};

type IconComponent = React.ComponentType<{ size?: number; className?: string }>;

type SlugStyle = {
  bg: string;
  darkBg: string;
  accent: string;
  Icon: IconComponent;
};

const SLUG_STYLES: Record<string, SlugStyle> = {
  gadgets: {
    bg: "from-slate-900 to-slate-800",
    darkBg: "from-slate-950 to-slate-900",
    accent: "#00B4D8",
    Icon: Cpu,
  },
  cosmetics: {
    bg: "from-rose-950 to-rose-900",
    darkBg: "from-rose-950 to-black",
    accent: "#F9A8D4",
    Icon: Sparkles,
  },
  fashion: {
    bg: "from-stone-900 to-stone-800",
    darkBg: "from-stone-950 to-stone-900",
    accent: "#D4A574",
    Icon: Shirt,
  },
};

const FALLBACK_CATEGORIES: CategoryCardData[] = [
  { id: "g", name: "Gadgets", slug: "gadgets", image: null },
  { id: "c", name: "Cosmetics", slug: "cosmetics", image: null },
  { id: "f", name: "Fashion", slug: "fashion", image: null },
];

function getStyle(slug: string): SlugStyle {
  const key = Object.keys(SLUG_STYLES).find((k) => slug.toLowerCase().includes(k));
  return key
    ? SLUG_STYLES[key]!
    : {
        bg: "from-gray-900 to-gray-800",
        darkBg: "from-gray-950 to-gray-900",
        accent: "#5DC600",
        Icon: ArrowRight,
      };
}

function CategoryCard({
  cat,
  large = false,
}: {
  cat: CategoryCardData;
  large?: boolean;
}) {
  const style = getStyle(cat.slug);
  const { Icon } = style;

  return (
    <Link
      href={`/shop?category=${cat.slug}`}
      className={`group relative block overflow-hidden rounded-2xl bg-gradient-to-br ${style.bg} dark:bg-gradient-to-br dark:${style.darkBg} ${large ? "h-full min-h-[360px]" : "h-44"}`}
    >
      {/* Category image */}
      {cat.image && (
        <Image
          src={cat.image}
          alt={cat.name}
          fill
          className="object-cover opacity-30 transition-opacity duration-500 group-hover:opacity-45"
        />
      )}

      {/* Accent glow top-right */}
      <div
        className="absolute -right-8 -top-8 h-40 w-40 rounded-full blur-3xl"
        style={{ background: style.accent, opacity: 0.18 }}
      />

      {/* Background icon — decorative, no meaning encoded */}
      {!cat.image && (
        <div
          className="absolute right-5 top-5 opacity-10 transition-opacity duration-300 group-hover:opacity-20"
          style={{ color: style.accent }}
        >
          <Icon size={large ? 72 : 48} />
        </div>
      )}

      {/* Bottom content */}
      <div className="absolute inset-x-0 bottom-0 p-5">
        {/* Green tag line */}
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5DC600]">
          Shop now
        </p>
        <div className="flex items-end justify-between gap-3">
          <h3
            className={`font-black leading-none tracking-tight text-white ${
              large ? "text-4xl lg:text-5xl" : "text-2xl"
            }`}
          >
            {cat.name}
          </h3>
          {/* Arrow pill */}
          <div
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-colors duration-300 group-hover:border-[#5DC600]/60 group-hover:bg-[#5DC600]/20 group-hover:text-[#5DC600]"
          >
            Explore <ArrowRight size={11} />
          </div>
        </div>
      </div>

      {/* Hover border */}
      <div className="absolute inset-0 rounded-2xl border border-transparent transition-colors duration-300 group-hover:border-[#5DC600]/25" />
    </Link>
  );
}

export function CategorySection({ categories }: { categories: CategoryCardData[] }) {
  const display = categories.length > 0 ? categories.slice(0, 3) : FALLBACK_CATEGORIES;
  const [first, ...rest] = display;

  return (
    <section className="bg-white py-24 dark:bg-[#0D0D0D] lg:py-32">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Header */}
        <div className="mb-12 flex items-end justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#5DC600]/30 bg-[#5DC600]/8 px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#5DC600]" />
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#5DC600]">
                Collections
              </span>
            </div>
            <h2 className="text-[clamp(26px,3.2vw,42px)] font-extrabold leading-[1.05] tracking-[-0.02em] text-gray-900 dark:text-white">
              Shop by Category
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-[#5DC600] dark:text-[#A3A3A3] dark:hover:text-[#5DC600] sm:inline-flex"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {/* Layout: large card left + 2 stacked right on desktop */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:grid-rows-[1fr_1fr]" style={{ minHeight: "420px" }}>
          {/* Feature card — spans both rows */}
          {first && (
            <div className="lg:row-span-2">
              <CategoryCard cat={first} large />
            </div>
          )}

          {/* Two stacked cards */}
          {rest.map((cat) => (
            <CategoryCard key={cat.id} cat={cat} />
          ))}
        </div>
      </div>
    </section>
  );
}
