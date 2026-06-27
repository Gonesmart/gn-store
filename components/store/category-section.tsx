import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Cpu, Sparkles, Shirt } from "lucide-react";

export type CategoryCardData = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
};

type GradientConfig = {
  darkFrom: string;
  darkTo: string;
  lightFrom: string;
  lightTo: string;
  accent: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
};

const SLUG_STYLES: Record<string, GradientConfig> = {
  gadgets: {
    darkFrom: "#0D1A2A", darkTo: "#0A1520",
    lightFrom: "#EBF5FF", lightTo: "#D6EEFF",
    accent: "#00B4D8",
    Icon: Cpu,
  },
  cosmetics: {
    darkFrom: "#1A0D1A", darkTo: "#150A15",
    lightFrom: "#FFF0FB", lightTo: "#FFE0F7",
    accent: "#D4A5C9",
    Icon: Sparkles,
  },
  fashion: {
    darkFrom: "#1A120D", darkTo: "#150E08",
    lightFrom: "#FFF8EE", lightTo: "#FFEFD6",
    accent: "#D4A574",
    Icon: Shirt,
  },
};

const FALLBACK_CATEGORIES: CategoryCardData[] = [
  { id: "g", name: "Gadgets", slug: "gadgets", image: null },
  { id: "c", name: "Cosmetics", slug: "cosmetics", image: null },
  { id: "f", name: "Fashion", slug: "fashion", image: null },
];

function getStyle(slug: string): GradientConfig {
  const key = Object.keys(SLUG_STYLES).find((k) =>
    slug.toLowerCase().includes(k)
  );
  return key
    ? SLUG_STYLES[key]
    : {
        darkFrom: "#1A1A1A", darkTo: "#0D0D0D",
        lightFrom: "#F5F5F5", lightTo: "#EBEBEB",
        accent: "#5DC600",
        Icon: ArrowRight,
      };
}

export function CategorySection({
  categories,
}: {
  categories: CategoryCardData[];
}) {
  const display = categories.length > 0 ? categories.slice(0, 3) : FALLBACK_CATEGORIES;

  return (
    <section className="bg-white py-20 dark:bg-[#0D0D0D]">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Section header */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#5DC600]">
              Browse by
            </p>
            <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white lg:text-4xl">
              Categories
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-[#5DC600] dark:text-[#A3A3A3] dark:hover:text-[#5DC600] sm:inline-flex"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {display.map((cat, i) => {
            const style = getStyle(cat.slug);
            const { Icon } = style;
            return (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="group relative block h-64 overflow-hidden rounded-2xl lg:h-72"
              >
                {/* Background - different in dark/light */}
                <div
                  className="absolute inset-0 dark:hidden"
                  style={{
                    background: `linear-gradient(145deg, ${style.lightFrom}, ${style.lightTo})`,
                  }}
                />
                <div
                  className="absolute inset-0 hidden dark:block"
                  style={{
                    background: `linear-gradient(145deg, ${style.darkFrom}, ${style.darkTo})`,
                  }}
                />

                {/* Category image */}
                {cat.image && (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover opacity-35 transition-opacity duration-500 group-hover:opacity-45"
                  />
                )}

                {/* Icon (shown when no image) */}
                {!cat.image && (
                  <div
                    className="absolute right-6 top-6 flex h-16 w-16 items-center justify-center rounded-2xl opacity-20 transition-opacity duration-300 group-hover:opacity-30"
                    style={{ background: style.accent }}
                  >
                    <Icon size={28} className="text-white" />
                  </div>
                )}

                {/* Accent glow */}
                <div
                  className="absolute right-4 top-4 h-24 w-24 rounded-full blur-2xl"
                  style={{
                    background: style.accent,
                    opacity: 0.18,
                  }}
                />

                {/* Border overlay */}
                <div className="absolute inset-0 rounded-2xl border border-gray-200 transition-colors duration-300 group-hover:border-[#5DC600]/35 dark:border-[#2A2A2A]" />

                {/* Index tag */}
                <div className="absolute left-4 top-4 flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white/70 text-xs font-semibold text-gray-500 dark:border-[#2A2A2A] dark:bg-[#0D0D0D]/60 dark:text-[#A3A3A3]">
                  {String(i + 1).padStart(2, "0")}
                </div>

                {/* Bottom content */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div
                    className="mb-4 h-px opacity-20"
                    style={{ background: style.accent }}
                  />
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                        {cat.name}
                      </h3>
                      <p className="mt-0.5 text-sm text-gray-500 dark:text-[#A3A3A3]">
                        Explore collection
                      </p>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 transition-colors duration-300 group-hover:border-[#5DC600] group-hover:bg-[#5DC600]/10 dark:border-[#2A2A2A]">
                      <ArrowRight
                        size={15}
                        className="text-gray-400 transition-colors duration-300 group-hover:text-[#5DC600] dark:text-[#A3A3A3]"
                      />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
