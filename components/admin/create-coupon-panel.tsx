"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CouponForm } from "@/components/admin/coupon-form";

export function CreateCouponPanel() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        className="bg-[#5DC600] font-semibold text-black hover:bg-[#4DAF00] focus-visible:ring-[#5DC600]"
      >
        <Plus className="mr-2 h-4 w-4" />
        New coupon
      </Button>
    );
  }

  return (
    <div
      className="rounded-xl border border-[#5DC600]/30 bg-[#1A1A1A] p-5"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.2)" }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">New coupon</h2>
        <button
          onClick={() => setOpen(false)}
          className="text-[#A3A3A3] transition-colors hover:text-white"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <CouponForm mode="create" onSuccess={() => setOpen(false)} onCancel={() => setOpen(false)} />
    </div>
  );
}
