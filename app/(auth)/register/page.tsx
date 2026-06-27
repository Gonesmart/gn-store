"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterInput) {
    setServerError("");
    const { error } = await authClient.signUp.email({
      name: data.name,
      email: data.email,
      password: data.password,
      callbackURL: "/account",
    });

    if (error) {
      setServerError(
        error.message ?? "Something went wrong. Please try again."
      );
    } else {
      router.push("/account");
      router.refresh();
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
            Create your account
          </h1>
          <p className="mt-1 text-sm text-[#A3A3A3]">
            Join GN Store and start shopping
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {serverError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {serverError}
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-medium text-white">
              Full name
            </Label>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="John Doe"
              {...register("name")}
              className="h-11 bg-[#0D0D0D] border-[#2A2A2A] text-white placeholder:text-[#4A4A4A] focus-visible:ring-[#5DC600] focus-visible:border-[#5DC600]"
            />
            {errors.name && (
              <p className="text-xs text-red-400">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
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

          {/* Password */}
          <div className="space-y-1.5">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-white"
            >
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Min. 8 chars, 1 uppercase, 1 number"
                {...register("password")}
                className="h-11 pr-10 bg-[#0D0D0D] border-[#2A2A2A] text-white placeholder:text-[#4A4A4A] focus-visible:ring-[#5DC600] focus-visible:border-[#5DC600]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A3A3A3] hover:text-white transition-colors duration-150"
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

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-white"
            >
              Confirm password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                {...register("confirmPassword")}
                className="h-11 pr-10 bg-[#0D0D0D] border-[#2A2A2A] text-white placeholder:text-[#4A4A4A] focus-visible:ring-[#5DC600] focus-visible:border-[#5DC600]"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A3A3A3] hover:text-white transition-colors duration-150"
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
            className="w-full h-11 bg-[#5DC600] hover:bg-[#4DAD00] active:bg-[#3D9600] text-black font-semibold transition-colors duration-150 focus-visible:ring-[#5DC600]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account…
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[#A3A3A3]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-[#5DC600] hover:text-[#7DE620] transition-colors duration-150"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
