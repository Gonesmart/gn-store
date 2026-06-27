"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  ShoppingCart,
  Users,
  Tag,
  ImageIcon,
  BarChart3,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { authClient } from "@/lib/auth-client";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: FolderOpen },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Coupons", href: "/admin/coupons", icon: Tag },
  { label: "Media", href: "/admin/media", icon: ImageIcon },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
];

interface AdminSidebarProps {
  collapsed?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ collapsed = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  function isActive(item: (typeof navItems)[number]) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-[#2A2A2A] bg-[#111111]",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-[#2A2A2A]",
          collapsed ? "justify-center px-0" : "px-5"
        )}
      >
        <Link href="/admin" onClick={onClose}>
          {collapsed ? (
            <Image
              src="/brand/whitelogo.png"
              alt="GN"
              width={32}
              height={32}
              className="h-8 w-8 rounded object-contain"
            />
          ) : (
            <Image
              src="/brand/whitelogo.png"
              alt="GN Store"
              width={100}
              height={32}
              className="h-8 w-auto object-contain"
            />
          )}
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className={cn("flex flex-col gap-1", collapsed ? "px-2" : "px-3")}>
          {navItems.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  {/* Base UI render prop: renders the trigger as a Link (avoids button-inside-anchor) */}
                  <TooltipTrigger
                    render={
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-150",
                          active
                            ? "bg-[#5DC600]/15 text-[#5DC600]"
                            : "text-[#A3A3A3] hover:bg-[#2A2A2A] hover:text-white"
                        )}
                      />
                    }
                  >
                    <Icon className="h-5 w-5" />
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-150",
                  active
                    ? "bg-[#5DC600]/15 text-[#5DC600]"
                    : "text-[#A3A3A3] hover:bg-[#2A2A2A] hover:text-white"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", active && "text-[#5DC600]")} />
                {item.label}
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#5DC600]" />
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Bottom — sign out */}
      <div className={cn("shrink-0 border-t border-[#2A2A2A] py-3", collapsed ? "px-2" : "px-3")}>
        <Separator className="mb-3 bg-[#2A2A2A]" />
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  onClick={handleSignOut}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-[#A3A3A3] transition-colors duration-150 hover:bg-red-500/10 hover:text-red-400 active:bg-red-500/20"
                />
              }
            >
              <LogOut className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent side="right">Sign out</TooltipContent>
          </Tooltip>
        ) : (
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#A3A3A3] transition-colors duration-150 hover:bg-red-500/10 hover:text-red-400 active:bg-red-500/20"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        )}
      </div>
    </aside>
  );
}
