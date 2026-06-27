import { Tag } from "lucide-react";
import { db } from "@/lib/db";
import { CouponActions } from "@/components/admin/coupon-actions";
import { CreateCouponPanel } from "@/components/admin/create-coupon-panel";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Coupons" };

function formatCurrency(amount: { toNumber(): number } | number): string {
  const n = typeof amount === "number" ? amount : amount.toNumber();
  return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isExpired(date: Date | null): boolean {
  if (!date) return false;
  return date < new Date();
}

export default async function CouponsPage() {
  const coupons = await db.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { orders: true } },
    },
  });

  const activeCoupons = coupons.filter((c) => c.active && !isExpired(c.expiresAt));
  const totalDiscountsGiven = await db.order
    .aggregate({ _sum: { discountAmount: true } })
    .then((r) => r._sum.discountAmount?.toNumber() ?? 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Coupons</h1>
          <p className="mt-1 text-sm text-[#A3A3A3]">
            {coupons.length} coupon{coupons.length !== 1 ? "s" : ""} · {activeCoupons.length} active
          </p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#2A2A2A] bg-[#1A1A1A]">
          <Tag className="h-4 w-4 text-[#5DC600]" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          { label: "Total coupons", value: String(coupons.length) },
          { label: "Active", value: String(activeCoupons.length) },
          { label: "Total discount given", value: formatCurrency(totalDiscountsGiven) },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] p-4"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.2)" }}
          >
            <p className="text-xs text-[#A3A3A3]">{stat.label}</p>
            <p className="mt-1 text-xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Create panel */}
      <CreateCouponPanel />

      {/* Table */}
      <div
        className="overflow-hidden rounded-xl border border-[#2A2A2A] bg-[#1A1A1A]"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.2)" }}
      >
        {coupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Tag className="mb-4 h-10 w-10 text-[#A3A3A3] opacity-40" />
            <p className="text-sm font-medium text-[#A3A3A3]">No coupons yet</p>
            <p className="mt-1 text-xs text-[#4A4A4A]">
              Create your first coupon using the button above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2A2A2A]">
                  {["Code", "Type", "Value", "Min. order", "Used / Max", "Expires", "Status", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-[#A3A3A3]"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon, idx) => {
                  const expired = isExpired(coupon.expiresAt);
                  const exhausted =
                    coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses;
                  const effectivelyActive = coupon.active && !expired && !exhausted;

                  return (
                    <tr
                      key={coupon.id}
                      className={`border-b border-[#2A2A2A] transition-colors hover:bg-[#0D0D0D] ${
                        idx === coupons.length - 1 ? "border-b-0" : ""
                      }`}
                    >
                      {/* Code */}
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="font-mono text-sm font-semibold text-white">
                          {coupon.code}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="whitespace-nowrap px-4 py-3 text-[#A3A3A3]">
                        {coupon.type === "PERCENTAGE" ? "Percentage" : "Fixed"}
                      </td>

                      {/* Value */}
                      <td className="whitespace-nowrap px-4 py-3 font-semibold text-[#5DC600]">
                        {coupon.type === "PERCENTAGE"
                          ? `${coupon.value.toNumber()}%`
                          : formatCurrency(coupon.value)}
                      </td>

                      {/* Min order */}
                      <td className="whitespace-nowrap px-4 py-3 text-[#A3A3A3]">
                        {coupon.minOrderAmount
                          ? formatCurrency(coupon.minOrderAmount)
                          : <span className="text-[#4A4A4A]">None</span>}
                      </td>

                      {/* Used / Max */}
                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className={
                            exhausted ? "text-red-400" : "text-[#A3A3A3]"
                          }
                        >
                          {coupon.usedCount}
                          {coupon.maxUses !== null ? ` / ${coupon.maxUses}` : " / ∞"}
                        </span>
                      </td>

                      {/* Expires */}
                      <td className="whitespace-nowrap px-4 py-3">
                        {coupon.expiresAt ? (
                          <span className={expired ? "text-red-400" : "text-[#A3A3A3]"}>
                            {formatDate(coupon.expiresAt)}
                            {expired && (
                              <span className="ml-1.5 rounded-full bg-red-500/15 px-1.5 py-0.5 text-[10px] text-red-400">
                                expired
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-[#4A4A4A]">Never</span>
                        )}
                      </td>

                      {/* Status badge */}
                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                            effectivelyActive
                              ? "border-[#5DC600]/30 bg-[#5DC600]/15 text-[#5DC600]"
                              : "border-[#2A2A2A] bg-[#2A2A2A]/50 text-[#A3A3A3]"
                          }`}
                        >
                          {effectivelyActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <CouponActions coupon={coupon} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
