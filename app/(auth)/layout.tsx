import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    default: "Account",
    template: "%s | GN Store",
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">
      {/* Subtle radial gradient backdrop */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(93,198,0,0.08) 0%, transparent 70%), #0D0D0D",
        }}
      />

      {/* Logo */}
      <Link href="/" className="mb-8 block">
        <Image
          src="/brand/logo.jpg"
          alt="GN Store"
          width={120}
          height={40}
          className="h-10 w-auto object-contain"
          priority
        />
      </Link>

      {children}

      <p className="mt-8 text-xs text-[#A3A3A3]">
        © {new Date().getFullYear()} GN Store. All rights reserved.
      </p>
    </div>
  );
}
