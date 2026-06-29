"use client";

import { Menu, Bell, Store, LogOut, ShoppingBag, UserPlus, CheckCheck, Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AdminSidebar } from "@/components/admin/sidebar";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import type { AdminNotification } from "@/actions/notifications";

const LS_KEY = "gn_admin_notifs_read_ids";

interface AdminTopbarProps {
  userName: string;
  userEmail: string;
  notifications: AdminNotification[];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    function listener(e: MouseEvent) {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handler();
    }
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
}

export function AdminTopbar({ userName, userEmail, notifications: initialNotifications }: AdminTopbarProps) {
  const router = useRouter();
  const [bellOpen, setBellOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [notifications, setNotifications] = useState<AdminNotification[]>(initialNotifications);
  const bellRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useClickOutside(bellRef, () => setBellOpen(false));
  useClickOutside(profileRef, () => setProfileOpen(false));

  // Load read notification IDs from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_KEY);
      if (stored) setReadIds(new Set(JSON.parse(stored) as string[]));
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    async function poll() {
      try {
        const res = await fetch("/api/admin/notifications", { cache: "no-store" });
        if (res.ok) {
          const data = (await res.json()) as AdminNotification[];
          setNotifications(data);
        }
      } catch {
        // Ignore network errors — keep showing last known notifications
      }
    }

    const id = setInterval(poll, 30_000);
    return () => clearInterval(id);
  }, []);

  function markRead(id: string) {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      try {
        localStorage.setItem(LS_KEY, JSON.stringify([...next]));
      } catch {}
      return next;
    });
  }

  function markAllRead() {
    const allIds = notifications.map((n) => n.id);
    const next = new Set(allIds);
    setReadIds(next);
    try {
      localStorage.setItem(LS_KEY, JSON.stringify([...next]));
    } catch {}
  }

  function handleNotificationClick(n: { id: string; link: string }) {
    markRead(n.id);
    setBellOpen(false);
    router.push(n.link);
  }

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-[#2A2A2A] bg-[#111111] px-4 lg:px-6">
      {/* Mobile sidebar trigger */}
      <Sheet>
        <SheetTrigger
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#A3A3A3] transition-colors duration-150 hover:bg-[#2A2A2A] hover:text-white lg:hidden focus-visible:outline-none"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-60 p-0 border-r border-[#2A2A2A] bg-[#111111]"
        >
          <AdminSidebar />
        </SheetContent>
      </Sheet>

      <div className="flex-1" />

      {/* Notification bell */}
      <div ref={bellRef} className="relative">
        <button
          type="button"
          onClick={() => { setBellOpen((o) => !o); setProfileOpen(false); }}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-[#A3A3A3] transition-colors duration-150 hover:bg-[#2A2A2A] hover:text-white focus-visible:outline-none"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#5DC600] text-[9px] font-bold text-black">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {bellOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] shadow-xl z-50">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2A2A2A]">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-white">Notifications</p>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-[#5DC600]/15 px-2 py-0.5 text-xs font-medium text-[#5DC600]">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-[#A3A3A3] transition-colors hover:bg-[#2A2A2A] hover:text-white focus-visible:outline-none"
                >
                  <CheckCheck className="h-3 w-3" />
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notification list */}
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-sm text-[#A3A3A3]">
                No new notifications
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {notifications.slice(0, 15).map((n) => {
                  const isUnread = !readIds.has(n.id);
                  return (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => handleNotificationClick(n)}
                      className={`flex w-full items-start gap-3 border-b border-[#2A2A2A] px-4 py-3 text-left last:border-0 transition-colors hover:bg-[#222] focus-visible:outline-none ${
                        isUnread ? "bg-[#5DC600]/[0.04]" : ""
                      }`}
                    >
                      <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${n.type === "pending_review" ? "bg-yellow-400/10" : "bg-[#5DC600]/10"}`}>
                        {n.type === "new_order" ? (
                          <ShoppingBag className="h-3.5 w-3.5 text-[#5DC600]" />
                        ) : n.type === "pending_review" ? (
                          <Star className="h-3.5 w-3.5 text-yellow-400" />
                        ) : (
                          <UserPlus className="h-3.5 w-3.5 text-[#5DC600]" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-medium text-white">{n.title}</p>
                          {isUnread && (
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#5DC600]" />
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-xs text-[#A3A3A3]">{n.body}</p>
                        <p className="mt-1 text-[10px] text-[#555]">
                          {new Date(n.createdAt).toLocaleString("en-NG", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* User menu */}
      <div ref={profileRef} className="relative">
        <button
          type="button"
          onClick={() => { setProfileOpen((o) => !o); setBellOpen(false); }}
          className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors duration-150 hover:bg-[#2A2A2A] focus-visible:outline-none"
          aria-label="User menu"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-[#5DC600]/20 text-[#5DC600] text-xs font-semibold">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden text-left lg:block">
            <p className="text-sm font-medium text-white leading-none">{userName}</p>
            <p className="text-xs text-[#A3A3A3] leading-none mt-0.5">{userEmail}</p>
          </div>
        </button>
        {profileOpen && (
          <div className="absolute right-0 top-full mt-2 w-52 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] shadow-xl z-50">
            <div className="px-3 py-2 border-b border-[#2A2A2A]">
              <p className="text-xs text-[#A3A3A3]">Signed in as</p>
              <p className="text-sm font-medium text-white truncate">{userEmail}</p>
            </div>
            <div className="p-1">
              <button
                type="button"
                onClick={() => { setProfileOpen(false); router.push("/"); }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-white transition-colors hover:bg-[#2A2A2A]"
              >
                <Store className="h-4 w-4 text-[#A3A3A3]" />
                View store
              </button>
            </div>
            <div className="p-1 border-t border-[#2A2A2A]">
              <button
                type="button"
                onClick={() => { setProfileOpen(false); handleSignOut(); }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-400 transition-colors hover:bg-[#2A2A2A]"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
