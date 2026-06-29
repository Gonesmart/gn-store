import Link from "next/link";
import { Users } from "lucide-react";
import { db } from "@/lib/db";
import { DeleteCustomerButton } from "@/components/admin/delete-customer-button";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Customers" };

const PAGE_SIZE = 20;

interface PageProps {
  searchParams: Promise<{ search?: string; page?: string }>;
}

function formatCurrency(amount: number): string {
  return `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(" ");
  const initials =
    parts.length >= 2
      ? parts[0][0] + parts[parts.length - 1][0]
      : parts[0].slice(0, 2);
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#5DC600]/15 text-xs font-bold text-[#5DC600]">
      {initials.toUpperCase()}
    </div>
  );
}

export default async function CustomersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.search?.trim() || undefined;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));

  const where = {
    role: "CUSTOMER",
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [customers, total] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        createdAt: true,
        _count: { select: { orders: true } },
        orders: {
          where: { paymentStatus: "PAID" },
          select: { total: true },
        },
      },
    }),
    db.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function buildUrl(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    const merged = {
      ...(search ? { search } : {}),
      ...(page > 1 ? { page: String(page) } : {}),
      ...overrides,
    };
    Object.entries(merged).forEach(([k, v]) => {
      if (v) p.set(k, v);
    });
    const qs = p.toString();
    return `/admin/customers${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Customers
          </h1>
          <p className="mt-1 text-sm text-[#A3A3A3]">
            {total} registered customer{total !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#2A2A2A] bg-[#1A1A1A]">
          <Users className="h-4 w-4 text-[#5DC600]" />
        </div>
      </div>

      {/* Search */}
      <div
        className="rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] p-4"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.2)" }}
      >
        <form method="GET" action="/admin/customers">
          <input
            type="search"
            name="search"
            defaultValue={search}
            placeholder="Search by name or email…"
            className="w-full rounded-lg border border-[#2A2A2A] bg-[#0D0D0D] px-3 py-2 text-sm text-white placeholder:text-[#4A4A4A] focus:border-[#5DC600] focus:outline-none"
          />
        </form>
      </div>

      {/* Table */}
      <div
        className="overflow-hidden rounded-xl border border-[#2A2A2A] bg-[#1A1A1A]"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.2)" }}
      >
        {customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Users className="mb-4 h-10 w-10 text-[#A3A3A3] opacity-40" />
            <p className="text-sm font-medium text-[#A3A3A3]">
              No customers found
            </p>
            {search && (
              <Link
                href="/admin/customers"
                className="mt-2 text-xs text-[#5DC600] hover:underline"
              >
                Clear search
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2A2A2A]">
                  {["Customer", "Email", "Verified", "Joined", "Orders", "Total spent", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-[#A3A3A3]"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {customers.map((customer, idx) => {
                  const totalSpent = customer.orders.reduce(
                    (sum, o) => sum + Number(o.total),
                    0
                  );
                  return (
                    <tr
                      key={customer.id}
                      className={`border-b border-[#2A2A2A] transition-colors hover:bg-[#0D0D0D] ${
                        idx === customers.length - 1 ? "border-b-0" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Initials name={customer.name} />
                          <span className="font-medium text-white">
                            {customer.name}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-[#A3A3A3]">
                        {customer.email}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {customer.emailVerified ? (
                          <span className="inline-flex items-center rounded-full border border-[#5DC600]/30 bg-[#5DC600]/10 px-2 py-0.5 text-xs font-medium text-[#5DC600]">
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-[#2A2A2A] bg-[#2A2A2A]/50 px-2 py-0.5 text-xs font-medium text-[#A3A3A3]">
                            Unverified
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-[#A3A3A3]">
                        {formatDate(customer.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-[#A3A3A3]">
                        {customer._count.orders}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-white">
                        {formatCurrency(totalSpent)}
                      </td>
                      <td className="px-4 py-3">
                        <DeleteCustomerButton
                          customerId={customer.id}
                          customerName={customer.name}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={buildUrl({ page: String(page - 1) })}
              className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-2 text-sm text-[#A3A3A3] transition-colors hover:bg-[#2A2A2A] hover:text-white"
            >
              Previous
            </Link>
          )}
          <span className="text-sm text-[#A3A3A3]">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={buildUrl({ page: String(page + 1) })}
              className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-2 text-sm text-[#A3A3A3] transition-colors hover:bg-[#2A2A2A] hover:text-white"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
