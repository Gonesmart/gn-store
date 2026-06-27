"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, User, MapPin, Heart, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth-client";

const NAV_ITEMS = [
  { href: "/account", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/account/orders", label: "Orders", icon: Package, exact: false },
  { href: "/account/profile", label: "Profile", icon: User, exact: false },
  { href: "/account/addresses", label: "Addresses", icon: MapPin, exact: false },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart, exact: false },
];

type User = { name: string; email: string; image?: string | null };

export function AccountSidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="w-full lg:w-56 lg:shrink-0">
      {/* Avatar card */}
      <div className="mb-3 flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 dark:border-[#2A2A2A] dark:bg-[#1A1A1A]">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#5DC600]/15 text-sm font-bold text-[#5DC600]">
          {user.name?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
            {user.name}
          </p>
          <p className="truncate text-xs text-gray-400 dark:text-[#A3A3A3]">{user.email}</p>
        </div>
      </div>

      {/* Nav — horizontal scroll on mobile, vertical stack on desktop */}
      <nav className="flex flex-row gap-1 overflow-x-auto pb-1 lg:flex-col lg:pb-0">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600] ${
                active
                  ? "bg-[#5DC600]/10 text-[#5DC600]"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-[#A3A3A3] dark:hover:bg-[#1A1A1A] dark:hover:text-white"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}

        <button
          onClick={handleSignOut}
          className="mt-0 flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400 dark:hover:bg-red-950/20 lg:mt-1"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </nav>
    </aside>
  );
}
