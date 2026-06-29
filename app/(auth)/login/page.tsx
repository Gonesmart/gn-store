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
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const raw = searchParams.get("callbackUrl") ?? "/account";
  // Only allow relative paths — block open redirects to external URLs
  const callbackUrl = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/account";
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    setServerError("");
    const { error } = await authClient.signIn.email({
      email: data.email,
      password: data.password,
      callbackURL: callbackUrl,
    });

    if (error) {
      setServerError(
        error.message ?? "Invalid email or password. Please try again."
      );
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.07),0_24px_48px_-12px_rgba(0,0,0,0.10)] dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.4),0_24px_48px_-12px_rgba(0,0,0,0.6)]">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-[#A3A3A3]">
            Sign in to your GN Store account
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Server error */}
          {serverError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500 dark:text-red-400">
              {serverError}
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium text-gray-900 dark:text-white">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register("email")}
              className="h-11 border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus-visible:border-[#5DC600] focus-visible:ring-[#5DC600] dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white dark:placeholder:text-[#4A4A4A]"
            />
            {errors.email && (
              <p className="text-xs text-red-500 dark:text-red-400">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium text-gray-900 dark:text-white">
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="text-xs text-[#5DC600] transition-colors duration-150 hover:text-[#7DE620]"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                {...register("password")}
                className="h-11 border-gray-200 bg-gray-50 pr-10 text-gray-900 placeholder:text-gray-400 focus-visible:border-[#5DC600] focus-visible:ring-[#5DC600] dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white dark:placeholder:text-[#4A4A4A]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors duration-150 hover:text-gray-700 dark:text-[#A3A3A3] dark:hover:text-white"
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
              <p className="text-xs text-red-500 dark:text-red-400">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full bg-[#5DC600] font-semibold text-black transition-colors duration-150 hover:bg-[#4DAD00] active:bg-[#3D9600] focus-visible:ring-[#5DC600]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-[#A3A3A3]">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-[#5DC600] transition-colors duration-150 hover:text-[#7DE620]"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
