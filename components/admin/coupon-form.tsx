"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createCoupon, updateCoupon } from "@/actions/coupons";
import type { CouponFormValues } from "@/lib/validations/coupon";
import type { Coupon } from "@prisma/client";

interface CouponFormProps {
  mode: "create" | "edit";
  initialData?: Coupon;
  onSuccess?: () => void;
  onCancel?: () => void;
}

function toDateInputValue(date: Date | null): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export function CouponForm({ mode, initialData, onSuccess, onCancel }: CouponFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CouponFormValues>({
    defaultValues: {
      code: initialData?.code ?? "",
      type: (initialData?.type as "PERCENTAGE" | "FIXED") ?? "PERCENTAGE",
      value: initialData?.value.toNumber() ?? 0,
      minOrderAmount: initialData?.minOrderAmount?.toNumber() ?? undefined,
      maxUses: initialData?.maxUses ?? undefined,
      expiresAt: toDateInputValue(initialData?.expiresAt ?? null),
      active: initialData?.active ?? true,
    },
  });

  const couponType = watch("type");

  function onSubmit(data: CouponFormValues) {
    setServerError(null);
    startTransition(async () => {
      const result =
        mode === "edit" && initialData
          ? await updateCoupon(initialData.id, data)
          : await createCoupon(data);

      if (!result.success) {
        setServerError(result.error);
      } else {
        router.refresh();
        onSuccess?.();
      }
    });
  }

  const inputClass =
    "w-full rounded-lg border border-[#2A2A2A] bg-[#0D0D0D] px-3 py-2 text-sm text-white placeholder:text-[#4A4A4A] focus:border-[#5DC600] focus:outline-none disabled:opacity-50";
  const labelClass = "text-xs font-medium text-[#A3A3A3]";
  const errorClass = "mt-1 text-xs text-red-400";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {serverError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {serverError}
        </div>
      )}

      {/* Code */}
      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Coupon code *</label>
        <div className="flex gap-2">
          <input
            {...register("code", { required: "Code is required" })}
            placeholder="e.g. WELCOME10"
            className={`${inputClass} flex-1 font-mono uppercase`}
            onChange={(e) => {
              const upper = e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "");
              setValue("code", upper);
            }}
          />
          <button
            type="button"
            onClick={() => setValue("code", generateCode())}
            title="Generate random code"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] text-[#A3A3A3] transition-colors hover:bg-[#2A2A2A] hover:text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
        {errors.code && <p className={errorClass}>{errors.code.message}</p>}
      </div>

      {/* Type + Value */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Discount type *</label>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className={inputClass}
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed amount (₦)</option>
              </select>
            )}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>
            Value * {couponType === "PERCENTAGE" ? "(1–100%)" : "(₦)"}
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            max={couponType === "PERCENTAGE" ? "100" : undefined}
            {...register("value", {
              required: "Value is required",
              valueAsNumber: true,
              min: { value: 0.01, message: "Must be greater than 0" },
              max:
                couponType === "PERCENTAGE"
                  ? { value: 100, message: "Max 100%" }
                  : undefined,
            })}
            placeholder={couponType === "PERCENTAGE" ? "10" : "500"}
            className={inputClass}
          />
          {errors.value && <p className={errorClass}>{errors.value.message}</p>}
        </div>
      </div>

      {/* Min order + Max uses */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Min. order amount (₦)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            {...register("minOrderAmount", { valueAsNumber: true })}
            placeholder="e.g. 5000"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Max uses</label>
          <input
            type="number"
            min="1"
            step="1"
            {...register("maxUses", { valueAsNumber: true })}
            placeholder="Unlimited"
            className={inputClass}
          />
        </div>
      </div>

      {/* Expires at */}
      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Expiry date</label>
        <input
          type="date"
          {...register("expiresAt")}
          className={`${inputClass} [color-scheme:dark]`}
        />
      </div>

      {/* Active toggle */}
      <Controller
        name="active"
        control={control}
        render={({ field }) => (
          <label className="flex cursor-pointer items-center gap-3">
            <div
              role="switch"
              aria-checked={field.value}
              onClick={() => field.onChange(!field.value)}
              className={`relative h-5 w-9 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5DC600] ${
                field.value ? "bg-[#5DC600]" : "bg-[#2A2A2A]"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  field.value ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </div>
            <span className="text-sm text-[#A3A3A3]">
              {field.value ? "Active — coupon can be used at checkout" : "Inactive — coupon is disabled"}
            </span>
          </label>
        )}
      />

      {/* Actions */}
      <div className="flex justify-end gap-2 border-t border-[#2A2A2A] pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
            className="border-[#2A2A2A] bg-transparent text-[#A3A3A3] hover:bg-[#2A2A2A] hover:text-white"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isPending}
          className="bg-[#5DC600] font-semibold text-black hover:bg-[#4DAF00] focus-visible:ring-[#5DC600]"
        >
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {mode === "edit" ? "Save changes" : "Create coupon"}
        </Button>
      </div>
    </form>
  );
}
