import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AddressBook } from "@/components/store/address-book";

export default async function AddressesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const addresses = await db.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Addresses</h1>
        <p className="mt-1 text-sm text-gray-400 dark:text-[#A3A3A3]">
          Manage your saved delivery addresses.
        </p>
      </div>
      <AddressBook addresses={addresses} />
    </div>
  );
}
