"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Heart, User, Menu, X, ChevronRight, ArrowUpRight } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { CartIcon } from "@/components/store/cart-icon";

const NAV_LINKS = [
  { label: "Shop All", href: "/shop" },
  { label: "Gadgets", href: "/shop?category=gadgets" },
  { label: "Cosmetics", href: "/shop?category=cosmetics" },
  { label: "Fashion", href: "/shop?category=fashion" },
];

interface StoreNavbarProps {
  overlayHero?: boolean;
}

export function StoreNavbar({ overlayHero = false }: StoreNavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { data: session } = useSession();

  function submitSearch() {
    const q = searchInputRef.current?.value.trim();
    if (!q) return;
    setSearchOpen(false);
    router.push(`/shop?q=${encodeURIComponent(q)}`);
  }

  useEffect(() => {
    if (!overlayHero) return;
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [overlayHero]);

  const transparent = overlayHero && !scrolled;

  return (
    <header
      className={`${overlayHero ? "fixed" : "sticky"} top-0 z-50 w-full transition-all duration-300 ${
        transparent
          ? "border-b border-white/10 bg-black/20 backdrop-blur-md"
          : "border-b border-gray-200 bg-white/95 backdrop-blur-md dark:border-[#2A2A2A] dark:bg-[#0D0D0D]/95"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Left: mobile toggle + logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`rounded-lg p-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600] lg:hidden ${
                transparent
                  ? "text-white hover:bg-white/10"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-[#A3A3A3] dark:hover:bg-[#1A1A1A] dark:hover:text-white"
              }`}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link href="/" className="shrink-0">
              {transparent ? (
                <Image src="/brand/whitelogo.png" alt="GN Store" width={110} height={36} className="h-8 w-auto object-contain" priority />
              ) : (
                <>
                  <Image src="/brand/whitelogo.png" alt="GN Store" width={110} height={36} className="hidden h-8 w-auto object-contain dark:block" priority />
                  <Image src="/brand/darklogo.png" alt="GN Store" width={110} height={36} className="block h-8 w-auto object-contain dark:hidden" priority />
                </>
              )}
            </Link>
          </div>

          {/* Center: desktop nav — pill container */}
          <nav
            className={`hidden items-center lg:flex ${
              transparent
                ? "gap-1 rounded-full bg-black/30 px-3 py-2 backdrop-blur-sm"
                : "gap-7"
            }`}
          >
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  transparent
                    ? "rounded-full px-4 py-1.5 text-white/80 hover:bg-white/10 hover:text-white"
                    : "text-gray-500 hover:text-gray-900 dark:text-[#A3A3A3] dark:hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right: icons + CTA */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`rounded-lg p-2.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600] ${
                transparent
                  ? "text-white hover:bg-white/10"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-[#A3A3A3] dark:hover:bg-[#1A1A1A] dark:hover:text-white"
              }`}
              aria-label="Search"
            >
              <Search size={18} />
            </button>

            <Link
              href={session ? "/account/wishlist" : "/login"}
              className={`rounded-lg p-2.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600] ${
                transparent
                  ? "text-white hover:bg-white/10"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-[#A3A3A3] dark:hover:bg-[#1A1A1A] dark:hover:text-white"
              }`}
              aria-label="Wishlist"
            >
              <Heart size={18} />
            </Link>

            <CartIcon />

            {session ? (
              <Link
                href="/account"
                className={`ml-2 hidden items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors sm:flex ${
                  transparent
                    ? "text-white hover:bg-white/10"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-[#A3A3A3] dark:hover:bg-[#1A1A1A] dark:hover:text-white"
                }`}
              >
                <User size={16} />
                <span>{session.user.name?.split(" ")[0]}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="ml-3 hidden items-center gap-2 rounded-xl bg-[#5DC600] px-4 py-2 text-sm font-bold text-black transition-colors hover:bg-[#4DAF00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600] sm:inline-flex"
              >
                Log In
                <ArrowUpRight size={14} />
              </Link>
            )}
          </div>
        </div>

        {/* Expandable search bar */}
        {searchOpen && (
          <div className={`border-t pb-4 pt-3 ${transparent ? "border-white/10" : "border-gray-200 dark:border-[#2A2A2A]"}`}>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#A3A3A3]" />
              <input
                ref={searchInputRef}
                type="search"
                placeholder="Search products..."
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && submitSearch()}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-20 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#5DC600] focus:outline-none dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white dark:placeholder:text-[#A3A3A3]"
              />
              <button
                onClick={submitSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-[#5DC600] px-3 py-1 text-xs font-bold text-black hover:bg-[#4DAF00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600]"
              >
                Search
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className={`border-t lg:hidden ${transparent ? "border-white/10 bg-black/80 backdrop-blur-md" : "border-gray-200 bg-white dark:border-[#2A2A2A] dark:bg-[#0D0D0D]"}`}>
          <nav className="mx-auto flex max-w-7xl flex-col gap-0 px-4 py-3">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between border-b py-3.5 text-sm font-medium last:border-0 ${
                  transparent
                    ? "border-white/10 text-white/80 hover:text-white"
                    : "border-gray-100 text-gray-600 hover:text-gray-900 dark:border-[#2A2A2A] dark:text-[#A3A3A3] dark:hover:text-white"
                }`}
              >
                <span>{item.label}</span>
                <ChevronRight size={15} />
              </Link>
            ))}
            {!session && (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="mt-3 flex items-center justify-center rounded-xl bg-[#5DC600] py-3 text-sm font-bold text-black transition-colors hover:bg-[#4DAF00]"
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
