"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validations/auth";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  if (!token) {
    return (
      <div className="w-full max-w-md">
        <div
          className="rounded-2xl border border-[#2A2A2A] p-8 text-center"
          style={{ background: "#1A1A1A" }}
        >
          <h2 className="text-xl font-bold text-white">Invalid link</h2>
          <p className="mt-2 text-sm text-[#A3A3A3]">
            This reset link is missing or invalid. Please request a new one.
          </p>
          <Link
            href="/forgot-password"
            className="mt-4 inline-block text-sm font-medium text-[#5DC600] transition-colors duration-150 hover:text-[#7DE620]"
          >
            Request new reset link
          </Link>
        </div>
      </div>
    );
  }

  async function onSubmit(data: ResetPasswordInput) {
    setServerError("");
    const { error } = await authClient.resetPassword({
      newPassword: data.password,
      token,
    });

    if (error) {
      setServerError(
        error.message ??
          "Unable to reset password. Your link may have expired."
      );
    } else {
      router.push("/login?reset=success");
    }
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
            Set new password
          </h1>
          <p className="mt-1 text-sm text-[#A3A3A3]">
            Choose a strong password for your account.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {serverError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {serverError}
            </div>
          )}

          <div className="space-y-1.5">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-white"
            >
              New password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Min. 8 chars, 1 uppercase, 1 number"
                {...register("password")}
                className="h-11 border-[#2A2A2A] bg-[#0D0D0D] pr-10 text-white placeholder:text-[#4A4A4A] focus-visible:border-[#5DC600] focus-visible:ring-[#5DC600]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A3A3A3] transition-colors duration-150 hover:text-white"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-white"
            >
              Confirm new password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                {...register("confirmPassword")}
                className="h-11 border-[#2A2A2A] bg-[#0D0D0D] pr-10 text-white placeholder:text-[#4A4A4A] focus-visible:border-[#5DC600] focus-visible:ring-[#5DC600]"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A3A3A3] transition-colors duration-150 hover:text-white"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-400">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full bg-[#5DC600] font-semibold text-black transition-colors duration-150 hover:bg-[#4DAD00] focus-visible:ring-[#5DC600] active:bg-[#3D9600]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving password…
              </>
            ) : (
              "Save new password"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
