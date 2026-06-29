import type { Metadata } from "next";

export const metadata: Metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Analytics</h1>
        <p className="mt-1 text-sm text-[#A3A3A3]">
          Revenue and order insights.
        </p>
      </div>
    </div>
  );
}
