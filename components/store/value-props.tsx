import { Truck, ShieldCheck, RefreshCw, Lock } from "lucide-react";

const PROPS = [
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Same-day dispatch on orders placed before 2 PM",
  },
  {
    icon: ShieldCheck,
    title: "100% Authentic",
    description: "Every product verified and quality-checked",
  },
  {
    icon: RefreshCw,
    title: "Easy Returns",
    description: "7-day hassle-free return policy",
  },
  {
    icon: Lock,
    title: "Secure Payments",
    description: "Encrypted checkout powered by Paystack",
  },
] as const;

export function ValueProps() {
  return (
    <section className="border-t border-gray-200 bg-white py-16 dark:border-[#2A2A2A] dark:bg-[#0D0D0D]">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8">
          {PROPS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#5DC600]/20 bg-[#5DC600]/10">
                <Icon size={18} className="text-[#5DC600]" />
              </div>
              <div>
                <h3 className="mb-0.5 text-sm font-semibold text-gray-900 dark:text-white">
                  {title}
                </h3>
                <p className="text-xs leading-relaxed text-gray-500 dark:text-[#A3A3A3]">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
