import type { Metadata } from "next";

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
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
      {/* Radial gradient backdrop */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 dark:hidden"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(93,198,0,0.06) 0%, transparent 70%), #F8FAFB",
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 hidden dark:block"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(93,198,0,0.08) 0%, transparent 70%), #0D0D0D",
        }}
      />

      {children}

      <p className="mt-8 text-xs text-gray-400 dark:text-[#A3A3A3]">
        &copy; {new Date().getFullYear()} GN Store. All rights reserved.
      </p>
    </div>
  );
}
