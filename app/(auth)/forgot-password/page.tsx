"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validations/auth";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordInput) {
    setServerError("");
    const res = await fetch("/api/auth/forget-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.email,
        redirectTo: `${window.location.origin}/forgot-password/reset`,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setServerError(
        (body as { message?: string }).message ??
          "Something went wrong. Please try again."
      );
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="w-full max-w-md">
        <div
          className="rounded-2xl border border-[#2A2A2A] p-8 text-center"
          style={{
            background: "#1A1A1A",
            boxShadow:
              "0 4px 6px -1px rgba(0,0,0,0.4), 0 24px 48px -12px rgba(0,0,0,0.6)",
          }}
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#5DC600]/10">
            <MailCheck className="h-7 w-7 text-[#5DC600]" />
          </div>
          <h2 className="text-xl font-bold text-white">Check your inbox</h2>
          <p className="mt-2 text-sm text-[#A3A3A3]">
            We sent a password reset link to{" "}
            <span className="font-medium text-white">{getValues("email")}</span>
            . It expires in 1 hour.
          </p>
          <p className="mt-4 text-xs text-[#A3A3A3]">
            Didn&apos;t receive it? Check your spam folder, or{" "}
            <button
              type="button"
              onClick={() => setSent(false)}
              className="text-[#5DC600] hover:text-[#7DE620] transition-colors duration-150"
            >
              try again
            </button>
            .
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center gap-1 text-sm text-[#A3A3A3] hover:text-white transition-colors duration-150"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div
        className="rounded-2xl border border-[#2A2A2A] p-8"
        style={{
          background: "#1A1A1A",
          boxShadow:
            "0 4px 6px -1px rgba(0,0,0,0.4), 0 24px 48px -12px rgba(0,0,0,0.6)",
        }}
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Forgot your password?
          </h1>
          <p className="mt-1 text-sm text-[#A3A3A3]">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {serverError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {serverError}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium text-white">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register("email")}
              className="h-11 bg-[#0D0D0D] border-[#2A2A2A] text-white placeholder:text-[#4A4A4A] focus-visible:ring-[#5DC600] focus-visible:border-[#5DC600]"
            />
            {errors.email && (
              <p className="text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 bg-[#5DC600] hover:bg-[#4DAD00] active:bg-[#3D9600] text-black font-semibold transition-colors duration-150 focus-visible:ring-[#5DC600]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending reset link…
              </>
            ) : (
              "Send reset link"
            )}
          </Button>
        </form>

        <Link
          href="/login"
          className="mt-6 flex items-center justify-center gap-1 text-sm text-[#A3A3A3] hover:text-white transition-colors duration-150"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
