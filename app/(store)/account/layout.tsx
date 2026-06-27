import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { AccountSidebar } from "@/components/store/account-sidebar";

export const metadata = { title: "My Account - GN Store" };

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login?redirect=/account");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
        <AccountSidebar user={session.user} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
