"use client";

import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: string;
  createdAt: string;
  guestEmail: string | null;
  user: { name: string; email: string } | null;
}

function getOrderStatusColor(status: string) {
  const map: Record<string, string> = {
    PENDING: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    PROCESSING: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    SHIPPED: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    DELIVERED: "bg-[#5DC600]/15 text-[#5DC600] border-[#5DC600]/30",
    CANCELLED: "bg-red-500/15 text-red-400 border-red-500/30",
  };
  return map[status] ?? "bg-[#2A2A2A] text-[#A3A3A3]";
}

export function RecentOrdersTable({ orders }: { orders: Order[] }) {
  const router = useRouter();

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ShoppingCart className="h-10 w-10 text-[#2A2A2A] mb-3" />
        <p className="text-sm font-medium text-[#A3A3A3]">No orders yet</p>
        <p className="text-xs text-[#4A4A4A] mt-1">
          Orders will appear here once customers start purchasing.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-[#2A2A2A] hover:bg-transparent">
          <TableHead className="text-[#A3A3A3]">Order</TableHead>
          <TableHead className="text-[#A3A3A3]">Customer</TableHead>
          <TableHead className="text-[#A3A3A3]">Status</TableHead>
          <TableHead className="text-right text-[#A3A3A3]">Total</TableHead>
          <TableHead className="text-[#A3A3A3]">Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow
            key={order.id}
            className="border-[#2A2A2A] hover:bg-[#242424] cursor-pointer"
            onClick={() => router.push(`/admin/orders/${order.id}`)}
          >
            <TableCell className="font-medium text-white">
              {order.orderNumber}
            </TableCell>
            <TableCell className="text-[#A3A3A3]">
              {order.user?.name ?? order.guestEmail ?? "Guest"}
            </TableCell>
            <TableCell>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getOrderStatusColor(order.status)}`}
              >
                {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
              </span>
            </TableCell>
            <TableCell className="text-right font-medium text-white">
              {order.total}
            </TableCell>
            <TableCell className="text-[#A3A3A3] text-sm">
              {new Date(order.createdAt).toLocaleDateString("en-NG", {
                day: "numeric",
                month: "short",
              })}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
