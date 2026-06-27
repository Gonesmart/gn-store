import type { Metadata } from "next";
import { Construction } from "lucide-react";

export const metadata: Metadata = { title: "Coupons" };

export default function CouponsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Coupons</h1>
        <p className="mt-1 text-sm text-[#A3A3A3]">Create and manage discount coupons</p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#2A2A2A] bg-[#1A1A1A] py-20 text-center">
        <Construction className="h-10 w-10 text-[#5DC600] mb-4 opacity-60" />
        <p className="text-sm font-medium text-[#A3A3A3]">Coming in a future milestone</p>
        <p className="mt-1 text-xs text-[#4A4A4A]">This section is being built step by step.</p>
      </div>
    </div>
  );
}
