import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";
import { getAdminNotifications } from "@/actions/notifications";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login?callbackUrl=/admin");
  }

  if ((session.user as { role: string }).role !== "ADMIN") {
    redirect("/");
  }

  const notifications = await getAdminNotifications();

  return (
    <div className="flex h-screen overflow-hidden bg-[#0D0D0D]">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden lg:flex lg:shrink-0">
        <AdminSidebar />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopbar
          userName={session.user.name}
          userEmail={session.user.email}
          notifications={notifications}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
