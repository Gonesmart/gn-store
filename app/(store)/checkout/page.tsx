"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ShoppingBag, ChevronRight, ArrowLeft,
  Tag, X, Check, Loader2, Lock,
} from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { shippingSchema, type ShippingFormData } from "@/lib/validations/checkout";
import { validateCoupon, initializePayment } from "@/actions/checkout";
import { formatPrice } from "@/lib/utils";
import type { CouponResult } from "@/actions/checkout";

type ActiveCoupon = CouponResult & { valid: true };

const NIGERIAN_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT - Abuja","Gombe",
  "Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos",
  "Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto",
  "Taraba","Yobe","Zamfara",
];

// ─── Shared input styles ─────────────────────────────────────────────────────

const inputBase =
  "w-full rounded-xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none dark:bg-[#111] dark:text-white dark:placeholder:text-[#3A3A3A] dark:focus:bg-[#0D0D0D]";
const inputNormal = "border-gray-200 focus:border-[#5DC600] dark:border-[#2A2A2A]";
const inputError  = "border-red-400 focus:border-red-400 dark:border-red-600";
const selectBase  =
  "w-full rounded-xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:bg-white focus:outline-none dark:bg-[#111] dark:text-white dark:focus:bg-[#0D0D0D]";

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-[#A3A3A3]">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── Step indicator ──────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-3">
      {([1, 2] as const).map((s) => (
        <div key={s} className="flex items-center gap-2">
          {s > 1 && (
            <div className={`h-px w-8 ${step >= s ? "bg-[#5DC600]" : "bg-gray-200 dark:bg-[#2A2A2A]"}`} />
          )}
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
              step > s
                ? "bg-[#5DC600] text-black"
                : step === s
                ? "bg-[#5DC600] text-black"
                : "bg-gray-100 text-gray-400 dark:bg-[#2A2A2A] dark:text-[#555]"
            }`}
          >
            {step > s ? <Check size={13} /> : s}
          </div>
          <span
            className={`hidden text-sm font-medium sm:block ${
              step >= s ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-[#555]"
            }`}
          >
            {s === 1 ? "Shipping" : "Review & Pay"}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Order summary sidebar ───────────────────────────────────────────────────

function OrderSummary({ coupon }: { coupon: ActiveCoupon | null }) {
  const items = useCartStore((s) => s.items);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = coupon?.discountAmount ?? 0;
  const total = Math.max(0, subtotal - discount);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-[#2A2A2A] dark:bg-[#1A1A1A]">
      <p className="mb-4 text-xs font-bold uppercase tracking-[0.15em] text-gray-400 dark:text-[#555]">
        Order Summary
      </p>
      <ul className="mb-4 flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.variantId} className="flex items-center gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-[#111]">
              {item.image ? (
                <Image src={item.image} alt={item.productName} fill className="object-cover" sizes="48px" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ShoppingBag size={16} className="text-gray-300 dark:text-[#3A3A3A]" />
                </div>
              )}
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#5DC600] text-[9px] font-bold leading-none text-black">
                {item.quantity}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-sm font-medium text-gray-900 dark:text-white">
                {item.productName}
              </p>
              <p className="text-xs text-gray-400 dark:text-[#A3A3A3]">{item.variantLabel}</p>
            </div>
            <p className="shrink-0 text-sm font-semibold text-gray-900 dark:text-white">
              {formatPrice(item.price * item.quantity)}
            </p>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-2 border-t border-gray-100 pt-4 text-sm dark:border-[#2A2A2A]">
        <div className="flex justify-between text-gray-500 dark:text-[#A3A3A3]">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-[#5DC600]">
            <span>Discount ({coupon!.code})</span>
            <span>- {formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-gray-500 dark:text-[#A3A3A3]">
          <span>Shipping</span>
          <span className="text-[#5DC600]">Free</span>
        </div>
        <div className="mt-1 flex justify-between border-t border-gray-100 pt-3 font-bold dark:border-[#2A2A2A]">
          <span className="text-gray-900 dark:text-white">Total</span>
          <span className="text-lg text-[#5DC600]">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Step 1: Shipping form ───────────────────────────────────────────────────

function ShippingStep({
  onNext,
  defaultValues,
}: {
  onNext: (data: ShippingFormData) => void;
  defaultValues?: Partial<ShippingFormData>;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: { country: "Nigeria", ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-black text-gray-900 dark:text-white">Contact &amp; Shipping</h2>
        <p className="mt-0.5 text-sm text-gray-400 dark:text-[#A3A3A3]">
          Where should we deliver your order?
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-[#555]">Contact</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" error={errors.fullName?.message} required>
            <input
              {...register("fullName")}
              placeholder="Jane Doe"
              className={`${inputBase} ${errors.fullName ? inputError : inputNormal}`}
            />
          </Field>
          <Field label="Email address" error={errors.email?.message} required>
            <input
              {...register("email")}
              type="email"
              placeholder="jane@example.com"
              className={`${inputBase} ${errors.email ? inputError : inputNormal}`}
            />
          </Field>
        </div>
        <Field label="Phone number" error={errors.phone?.message} required>
          <input
            {...register("phone")}
            type="tel"
            placeholder="+234 800 000 0000"
            className={`${inputBase} ${errors.phone ? inputError : inputNormal}`}
          />
        </Field>
      </div>

      <div className="flex flex-col gap-4">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-[#555]">Delivery Address</p>
        <Field label="Street address" error={errors.addressLine1?.message} required>
          <input
            {...register("addressLine1")}
            placeholder="123 Allen Avenue"
            className={`${inputBase} ${errors.addressLine1 ? inputError : inputNormal}`}
          />
        </Field>
        <Field label="Apartment, suite, etc." error={errors.addressLine2?.message}>
          <input
            {...register("addressLine2")}
            placeholder="Flat 2B (optional)"
            className={`${inputBase} ${inputNormal}`}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="City" error={errors.city?.message} required>
            <input
              {...register("city")}
              placeholder="Lagos"
              className={`${inputBase} ${errors.city ? inputError : inputNormal}`}
            />
          </Field>
          <Field label="State" error={errors.state?.message} required>
            <select
              {...register("state")}
              className={`${selectBase} ${errors.state ? inputError : inputNormal}`}
            >
              <option value="">Select state</option>
              {NIGERIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Country" error={errors.country?.message} required>
          <input
            {...register("country")}
            readOnly
            className={`${inputBase} ${inputNormal} cursor-default opacity-60`}
          />
        </Field>
      </div>

      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5DC600] py-3.5 font-bold text-black transition-colors hover:bg-[#4DAF00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600] active:bg-[#3D9600]"
      >
        Continue to Review
        <ChevronRight size={17} />
      </button>
    </form>
  );
}

// ─── Step 2: Review & Pay ────────────────────────────────────────────────────

function ReviewStep({
  shipping,
  coupon,
  onBack,
  onCouponChange,
  onPlaceOrder,
}: {
  shipping: ShippingFormData;
  coupon: ActiveCoupon | null;
  onBack: () => void;
  onCouponChange: (c: ActiveCoupon | null) => void;
  onPlaceOrder: () => Promise<string | null>;
}) {
  const [couponInput, setCouponInput] = useState(coupon?.code ?? "");
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState("");
  const items = useCartStore((s) => s.items);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  async function applyCode() {
    setCouponError("");
    setCouponLoading(true);
    const res = await validateCoupon(couponInput, subtotal);
    if (res.valid) {
      onCouponChange(res as ActiveCoupon);
    } else {
      setCouponError(res.error);
      onCouponChange(null);
    }
    setCouponLoading(false);
  }

  function removeCoupon() {
    onCouponChange(null);
    setCouponInput("");
    setCouponError("");
  }

  async function handlePlace() {
    setPlaceError("");
    setPlacing(true);
    const error = await onPlaceOrder();
    if (error) setPlaceError(error);
    setPlacing(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-black text-gray-900 dark:text-white">Review Your Order</h2>
        <p className="mt-0.5 text-sm text-gray-400 dark:text-[#A3A3A3]">
          Check everything looks right before paying.
        </p>
      </div>

      {/* Shipping summary */}
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-[#2A2A2A] dark:bg-[#111]">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-[#555]">
            Delivering to
          </p>
          <button
            onClick={onBack}
            className="text-xs font-semibold text-[#5DC600] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600]"
          >
            Change
          </button>
        </div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{shipping.fullName}</p>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-[#A3A3A3]">
          {shipping.addressLine1}{shipping.addressLine2 ? `, ${shipping.addressLine2}` : ""},{" "}
          {shipping.city}, {shipping.state}
        </p>
        <p className="text-sm text-gray-500 dark:text-[#A3A3A3]">
          {shipping.phone} &middot; {shipping.email}
        </p>
      </div>

      {/* Coupon */}
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-[#555]">
          Coupon Code
        </p>
        {coupon ? (
          <div className="flex items-center justify-between rounded-xl border border-[#5DC600]/30 bg-[#5DC600]/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <Tag size={14} className="text-[#5DC600]" />
              <span className="text-sm font-semibold text-[#5DC600]">{coupon.code}</span>
              <span className="text-sm text-gray-500 dark:text-[#A3A3A3]">
                — {formatPrice(coupon.discountAmount)} off
              </span>
            </div>
            <button
              onClick={removeCoupon}
              className="text-gray-400 transition-colors hover:text-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600]"
              aria-label="Remove coupon"
            >
              <X size={15} />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={couponInput}
              onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(""); }}
              onKeyDown={(e) => e.key === "Enter" && applyCode()}
              placeholder="Enter coupon code"
              className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm uppercase tracking-widest text-gray-900 placeholder:normal-case placeholder:tracking-normal placeholder:text-gray-400 focus:border-[#5DC600] focus:bg-white focus:outline-none dark:border-[#2A2A2A] dark:bg-[#111] dark:text-white dark:placeholder:text-[#3A3A3A] dark:focus:bg-[#0D0D0D]"
            />
            <button
              onClick={applyCode}
              disabled={couponLoading || !couponInput.trim()}
              className="rounded-xl border border-[#5DC600] px-5 py-3 text-sm font-semibold text-[#5DC600] transition-colors hover:bg-[#5DC600]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600] disabled:opacity-40"
            >
              {couponLoading ? <Loader2 size={15} className="animate-spin" /> : "Apply"}
            </button>
          </div>
        )}
        {couponError && <p className="mt-1.5 text-xs text-red-500">{couponError}</p>}
      </div>

      {/* Place order error */}
      {placeError && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
          {placeError}
        </p>
      )}

      {/* CTA */}
      <button
        onClick={handlePlace}
        disabled={placing}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5DC600] py-3.5 font-bold text-black transition-colors hover:bg-[#4DAF00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600] active:bg-[#3D9600] disabled:opacity-60"
      >
        {placing ? (
          <><Loader2 size={18} className="animate-spin" />Redirecting to Paystack...</>
        ) : (
          <><Lock size={15} />Pay with Paystack</>
        )}
      </button>

      <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 dark:text-[#555]">
        <Lock size={11} />
        <span>Secured by Paystack &middot; 256-bit SSL</span>
      </div>

      <button
        onClick={onBack}
        className="flex items-center justify-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-gray-700 dark:text-[#555] dark:hover:text-[#A3A3A3]"
      >
        <ArrowLeft size={14} />
        Back to shipping
      </button>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();
  const { items, setItems } = useCartStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [shipping, setShipping] = useState<ShippingFormData | null>(null);
  const [coupon, setCoupon] = useState<ActiveCoupon | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => { setHydrated(true); }, []);

  function handleShippingNext(data: ShippingFormData) {
    setShipping(data);
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Returns error string on failure, null on success (redirects to Paystack on success)
  async function handlePlaceOrder(): Promise<string | null> {
    if (!shipping) return "Shipping info is missing.";
    const res = await initializePayment({ shipping, couponCode: coupon?.code });
    if (res.success) {
      window.location.href = res.authorizationUrl;
      return null;
    }
    return res.error;
  }

  if (hydrated && items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-[#1A1A1A]">
          <ShoppingBag size={28} className="text-gray-300 dark:text-[#3A3A3A]" />
        </div>
        <div>
          <p className="font-bold text-gray-900 dark:text-white">Your cart is empty</p>
          <p className="mt-1 text-sm text-gray-400 dark:text-[#A3A3A3]">
            Add products to your cart before checking out.
          </p>
        </div>
        <Link
          href="/shop"
          className="rounded-xl bg-[#5DC600] px-6 py-2.5 text-sm font-bold text-black transition-colors hover:bg-[#4DAF00]"
        >
          Browse Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/shop"
          className="flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-gray-700 dark:text-[#555] dark:hover:text-[#A3A3A3]"
        >
          <ArrowLeft size={14} />
          Back to shop
        </Link>
        <StepIndicator step={step} />
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
        {/* Steps */}
        <div className="flex-1">
          {step === 1 && (
            <ShippingStep
              onNext={handleShippingNext}
              defaultValues={shipping ?? undefined}
            />
          )}
          {step === 2 && shipping && (
            <ReviewStep
              shipping={shipping}
              coupon={coupon}
              onBack={() => setStep(1)}
              onCouponChange={setCoupon}
              onPlaceOrder={handlePlaceOrder}
            />
          )}
        </div>

        {/* Order summary */}
        <div className="w-full lg:sticky lg:top-24 lg:w-80 lg:shrink-0">
          <OrderSummary coupon={coupon} />
        </div>
      </div>
    </div>
  );
}
