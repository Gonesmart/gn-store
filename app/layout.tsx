import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const FALLBACK_URL = "https://gonesmartsolutions.com";

// Strip BOM and whitespace that shell/env injection can add, then fall back if invalid
function safeUrl(raw: string | undefined): URL {
  const cleaned = (raw ?? "").replace(/^﻿/, "").trim();
  try {
    return new URL(cleaned || FALLBACK_URL);
  } catch {
    return new URL(FALLBACK_URL);
  }
}

const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/^﻿/, "").trim() || FALLBACK_URL;

export const metadata: Metadata = {
  metadataBase: safeUrl(process.env.NEXT_PUBLIC_APP_URL),
  title: {
    default: "GN Store — Smart Gadgets, Fashion & Cosmetics",
    template: "%s | GN Store",
  },
  description:
    "Shop the latest gadgets, cosmetics, and fashion at GN Store. Premium quality, fast delivery across Nigeria.",
  keywords: [
    "gadgets Nigeria",
    "online shopping Nigeria",
    "cosmetics Nigeria",
    "fashion Nigeria",
    "GN Store",
    "Gonesmart Solutions",
    "electronics Nigeria",
  ],
  authors: [{ name: "Gonesmart Solutions" }],
  creator: "Gonesmart Solutions",
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: "GN Store",
    title: "GN Store — Smart Gadgets, Fashion & Cosmetics",
    description:
      "Shop the latest gadgets, cosmetics, and fashion at GN Store. Premium quality, fast delivery across Nigeria.",
    url: BASE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "GN Store — Smart Gadgets, Fashion & Cosmetics",
    description:
      "Shop the latest gadgets, cosmetics, and fashion at GN Store. Premium quality, fast delivery across Nigeria.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/brand/site_favicon.jpg",
    apple: "/brand/site_favicon.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
