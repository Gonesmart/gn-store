import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin } from "lucide-react";

const SHOP_LINKS = [
  { label: "All Products", href: "/shop" },
  { label: "Gadgets", href: "/shop?category=gadgets" },
  { label: "Cosmetics", href: "/shop?category=cosmetics" },
  { label: "Fashion", href: "/shop?category=fashion" },
  { label: "New Arrivals", href: "/shop?sort=newest" },
];

const SUPPORT_LINKS = [
  { label: "My Account", href: "/account" },
  { label: "Track Order", href: "/track-order" },
  { label: "Return Policy", href: "/returns" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact Us", href: "/contact" },
];

const SOCIALS = [
  {
    label: "Instagram",
    href: "#",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    label: "X (Twitter)",
    href: "#",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "#",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
];

export function StoreFooter() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-white dark:border-[#2A2A2A] dark:bg-[#0D0D0D]">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div>
            <Link href="/" className="mb-5 block">
              <Image
                src="/brand/whitelogo.png"
                alt="GN Store"
                width={120}
                height={40}
                className="hidden h-9 w-auto object-contain dark:block"
              />
              <Image
                src="/brand/darklogo.png"
                alt="GN Store"
                width={120}
                height={40}
                className="block h-9 w-auto object-contain dark:hidden"
              />
            </Link>
            <p className="mb-6 text-sm leading-relaxed text-gray-500 dark:text-[#A3A3A3]">
              Your one-stop destination for premium gadgets, cosmetics, and
              fashion. Smart shopping, delivered to your door.
            </p>
            <div className="flex gap-2.5">
              {SOCIALS.map(({ svg, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-500 transition-colors hover:border-[#5DC600]/40 hover:text-[#5DC600] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600] dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-[#A3A3A3]"
                >
                  {svg}
                </a>
              ))}
            </div>
          </div>

          {/* Shop links */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-900 dark:text-white">
              Shop
            </h3>
            <ul className="space-y-3">
              {SHOP_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-500 transition-colors hover:text-[#5DC600] dark:text-[#A3A3A3] dark:hover:text-[#5DC600]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-900 dark:text-white">
              Support
            </h3>
            <ul className="space-y-3">
              {SUPPORT_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-500 transition-colors hover:text-[#5DC600] dark:text-[#A3A3A3] dark:hover:text-[#5DC600]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + newsletter */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-900 dark:text-white">
              Contact
            </h3>
            <ul className="mb-6 space-y-3.5">
              <li className="flex gap-3 text-sm text-gray-500 dark:text-[#A3A3A3]">
                <MapPin size={15} className="mt-0.5 shrink-0 text-[#5DC600]" />
                <span>Lagos, Nigeria</span>
              </li>
              <li className="flex gap-3 text-sm text-gray-500 dark:text-[#A3A3A3]">
                <Phone size={15} className="mt-0.5 shrink-0 text-[#5DC600]" />
                <span>+234 800 000 0000</span>
              </li>
              <li className="flex gap-3 text-sm text-gray-500 dark:text-[#A3A3A3]">
                <Mail size={15} className="mt-0.5 shrink-0 text-[#5DC600]" />
                <span>hello@gnstore.ng</span>
              </li>
            </ul>

            <p className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Get the latest deals
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#5DC600] focus:outline-none dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white dark:placeholder:text-[#A3A3A3]"
              />
              <button
                type="submit"
                className="shrink-0 rounded-lg bg-[#5DC600] px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#4DAF00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600]"
              >
                Join
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-200 dark:border-[#2A2A2A]">
        <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-3 px-4 py-4 sm:flex-row lg:px-8">
          <p className="text-xs text-gray-400 dark:text-[#A3A3A3]">
            &copy; {new Date().getFullYear()} GN Store (Gonesmart Solutions). All
            rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-xs text-gray-400 transition-colors hover:text-gray-700 dark:text-[#A3A3A3] dark:hover:text-white"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-gray-400 transition-colors hover:text-gray-700 dark:text-[#A3A3A3] dark:hover:text-white"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
