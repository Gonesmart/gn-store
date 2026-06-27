"use client";

import { Menu, Bell } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AdminSidebar } from "@/components/admin/sidebar";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface AdminTopbarProps {
  userName: string;
  userEmail: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function AdminTopbar({ userName, userEmail }: AdminTopbarProps) {
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-[#2A2A2A] bg-[#111111] px-4 lg:px-6">
      {/* Mobile sidebar trigger — render prop makes SheetTrigger render as a button */}
      <Sheet>
        <SheetTrigger
          render={
            <button
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#A3A3A3] transition-colors duration-150 hover:bg-[#2A2A2A] hover:text-white lg:hidden"
              aria-label="Open navigation"
            />
          }
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

      {/* Spacer */}
      <div className="flex-1" />

      {/* Notification bell */}
      <button
        className="flex h-9 w-9 items-center justify-center rounded-lg text-[#A3A3A3] transition-colors duration-150 hover:bg-[#2A2A2A] hover:text-white"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
      </button>

      {/* User menu — render prop makes trigger render as our styled button */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors duration-150 hover:bg-[#2A2A2A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5DC600]"
              aria-label="User menu"
            />
          }
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
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-52 bg-[#1A1A1A] border-[#2A2A2A] text-white"
        >
          <DropdownMenuLabel className="text-[#A3A3A3] text-xs font-normal">
            Signed in as
          </DropdownMenuLabel>
          <DropdownMenuLabel className="pt-0 font-medium">{userEmail}</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-[#2A2A2A]" />
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => router.push("/")}
          >
            View store
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-[#2A2A2A]" />
          <DropdownMenuItem
            onClick={handleSignOut}
            className="text-red-400 cursor-pointer"
            variant="destructive"
          >
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
