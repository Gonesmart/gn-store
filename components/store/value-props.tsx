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
    <section className="border-t border-gray-200 bg-white py-12 dark:border-[#2A2A2A] dark:bg-[#0D0D0D]">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid grid-cols-2 gap-x-8 gap-y-8 lg:grid-cols-4">
          {PROPS.map(({ icon: Icon, title, description }, i) => (
            <div key={title} className="flex flex-col gap-3">
              {i > 0 && (
                <div className="absolute left-0 top-1/2 hidden h-8 w-px -translate-y-1/2 bg-gray-200 dark:bg-[#2A2A2A] lg:block" />
              )}
              <Icon size={20} className="text-[#5DC600]" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {title}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-500 dark:text-[#A3A3A3]">
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
