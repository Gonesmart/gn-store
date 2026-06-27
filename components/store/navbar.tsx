"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Heart, User, Menu, X, ChevronRight } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/store/theme-toggle";
import { CartIcon } from "@/components/store/cart-icon";

const NAV_LINKS = [
  { label: "Shop All", href: "/shop" },
  { label: "Gadgets", href: "/shop?category=gadgets" },
  { label: "Cosmetics", href: "/shop?category=cosmetics" },
  { label: "Fashion", href: "/shop?category=fashion" },
];

export function StoreNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-md dark:border-[#2A2A2A] dark:bg-[#0D0D0D]/95">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Left: mobile toggle + logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600] dark:text-[#A3A3A3] dark:hover:bg-[#1A1A1A] dark:hover:text-white lg:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link href="/" className="shrink-0">
              <Image
                src="/brand/whitelogo.png"
                alt="GN Store"
                width={110}
                height={36}
                className="hidden h-8 w-auto object-contain dark:block"
                priority
              />
              <Image
                src="/brand/darklogo.png"
                alt="GN Store"
                width={110}
                height={36}
                className="block h-8 w-auto object-contain dark:hidden"
                priority
              />
            </Link>
          </div>

          {/* Center: desktop nav */}
          <nav className="hidden items-center gap-7 lg:flex">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 dark:text-[#A3A3A3] dark:hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right: action icons */}
          <div className="flex items-center gap-0.5">
            <ThemeToggle />

            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="rounded-lg p-2.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600] dark:text-[#A3A3A3] dark:hover:bg-[#1A1A1A] dark:hover:text-white"
              aria-label="Search"
            >
              <Search size={18} />
            </button>

            <Link
              href={session ? "/account/wishlist" : "/login"}
              className="hidden rounded-lg p-2.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600] dark:text-[#A3A3A3] dark:hover:bg-[#1A1A1A] dark:hover:text-white sm:block"
              aria-label="Wishlist"
            >
              <Heart size={18} />
            </Link>

            <CartIcon />

            {session ? (
              <Link
                href="/account"
                className="ml-2 hidden items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-[#A3A3A3] dark:hover:bg-[#1A1A1A] dark:hover:text-white sm:flex"
              >
                <User size={16} />
                <span>{session.user.name?.split(" ")[0]}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="ml-2 hidden rounded-lg bg-[#5DC600] px-4 py-1.5 text-sm font-semibold text-black transition-colors hover:bg-[#4DAF00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600] sm:block"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Expandable search bar */}
        {searchOpen && (
          <div className="border-t border-gray-200 pb-4 pt-3 dark:border-[#2A2A2A]">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#A3A3A3]"
              />
              <input
                type="search"
                placeholder="Search products..."
                autoFocus
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#5DC600] focus:outline-none dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white dark:placeholder:text-[#A3A3A3]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-gray-200 bg-white dark:border-[#2A2A2A] dark:bg-[#0D0D0D] lg:hidden">
          <nav className="mx-auto max-w-7xl flex flex-col gap-0 px-4 py-3">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between border-b border-gray-100 py-3.5 text-sm font-medium text-gray-600 last:border-0 hover:text-gray-900 dark:border-[#2A2A2A] dark:text-[#A3A3A3] dark:hover:text-white"
              >
                <span>{item.label}</span>
                <ChevronRight size={15} />
              </Link>
            ))}
            {!session && (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="mt-3 flex items-center justify-center rounded-xl bg-[#5DC600] py-3 text-sm font-bold text-black hover:bg-[#4DAF00] transition-colors"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
