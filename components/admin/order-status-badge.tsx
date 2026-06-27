import type { OrderStatus, PaymentStatus } from "@prisma/client";

const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; classes: string }
> = {
  PENDING: {
    label: "Pending",
    classes: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  },
  PROCESSING: {
    label: "Processing",
    classes: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },
  SHIPPED: {
    label: "Shipped",
    classes: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  },
  DELIVERED: {
    label: "Delivered",
    classes: "bg-[#5DC600]/15 text-[#5DC600] border-[#5DC600]/30",
  },
  CANCELLED: {
    label: "Cancelled",
    classes: "bg-red-500/15 text-red-400 border-red-500/30",
  },
};

const PAYMENT_STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; classes: string }
> = {
  UNPAID: {
    label: "Unpaid",
    classes: "bg-red-500/15 text-red-400 border-red-500/30",
  },
  PAID: {
    label: "Paid",
    classes: "bg-[#5DC600]/15 text-[#5DC600] border-[#5DC600]/30",
  },
  REFUNDED: {
    label: "Refunded",
    classes: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  },
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: "sm" | "md";
}

export function OrderStatusBadge({ status, size = "md" }: OrderStatusBadgeProps) {
  const config = ORDER_STATUS_CONFIG[status];
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${sizeClasses} ${config.classes}`}
    >
      {config.label}
    </span>
  );
}

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  size?: "sm" | "md";
}

export function PaymentStatusBadge({ status, size = "md" }: PaymentStatusBadgeProps) {
  const config = PAYMENT_STATUS_CONFIG[status];
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${sizeClasses} ${config.classes}`}
    >
      {config.label}
    </span>
  );
}
