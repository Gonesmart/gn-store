"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Truck, X, Save, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateOrderStatus, updateTrackingNumber, updateOrderNotes, cancelOrder } from "@/actions/orders";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import type { OrderStatus } from "@prisma/client";

const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Mark Processing",
  PROCESSING: "Mark Shipped",
  SHIPPED: "Mark Delivered",
  DELIVERED: "",
  CANCELLED: "",
};

interface OrderActionsPanelProps {
  orderId: string;
  currentStatus: OrderStatus;
  currentTracking: string | null;
  currentNotes: string | null;
}

export function OrderActionsPanel({
  orderId,
  currentStatus,
  currentTracking,
  currentNotes,
}: OrderActionsPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tracking, setTracking] = useState(currentTracking ?? "");
  const [notes, setNotes] = useState(currentNotes ?? "");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextStatuses = STATUS_TRANSITIONS[currentStatus];
  const primaryNext = nextStatuses.find((s) => s !== "CANCELLED");
  const canCancel = currentStatus !== "DELIVERED" && currentStatus !== "CANCELLED";

  function handleStatusChange(status: OrderStatus) {
    setError(null);
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, status);
      if (!result.success) setError(result.error);
      else router.refresh();
    });
  }

  function handleSaveTracking() {
    if (!tracking.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await updateTrackingNumber(orderId, tracking.trim());
      if (!result.success) setError(result.error);
      else router.refresh();
    });
  }

  function handleSaveNotes() {
    setError(null);
    startTransition(async () => {
      const result = await updateOrderNotes(orderId, notes);
      if (!result.success) setError(result.error);
    });
  }

  function handleCancel() {
    setError(null);
    startTransition(async () => {
      const result = await cancelOrder(orderId);
      if (!result.success) setError(result.error);
      else { setCancelOpen(false); router.refresh(); }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Status advance */}
      {primaryNext && (
        <Button
          onClick={() => handleStatusChange(primaryNext)}
          disabled={isPending}
          className="w-full bg-[#5DC600] font-semibold text-black hover:bg-[#4DAF00] focus-visible:ring-[#5DC600]"
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {STATUS_LABELS[currentStatus]}
        </Button>
      )}

      {/* Tracking number */}
      {(currentStatus === "PROCESSING" || currentStatus === "SHIPPED" || currentStatus === "DELIVERED") && (
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-[#A3A3A3]">Tracking number</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              placeholder="e.g. GIG123456789"
              className="flex-1 rounded-lg border border-[#2A2A2A] bg-[#0D0D0D] px-3 py-2 text-sm text-white placeholder:text-[#4A4A4A] focus:border-[#5DC600] focus:outline-none"
            />
            <Button
              onClick={handleSaveTracking}
              disabled={isPending || !tracking.trim()}
              size="sm"
              className="border border-[#2A2A2A] bg-[#1A1A1A] text-white hover:bg-[#2A2A2A]"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}

      {/* Admin notes */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-[#A3A3A3]">Admin notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Internal notes visible only to admins…"
          className="resize-none rounded-lg border border-[#2A2A2A] bg-[#0D0D0D] px-3 py-2 text-sm text-white placeholder:text-[#4A4A4A] focus:border-[#5DC600] focus:outline-none"
        />
        <Button
          onClick={handleSaveNotes}
          disabled={isPending}
          size="sm"
          variant="outline"
          className="self-end border-[#2A2A2A] bg-transparent text-[#A3A3A3] hover:bg-[#2A2A2A] hover:text-white"
        >
          <Save className="mr-1.5 h-3.5 w-3.5" />
          Save notes
        </Button>
      </div>

      {/* Cancel */}
      {canCancel && (
        <div className="border-t border-[#2A2A2A] pt-4">
          <Button
            onClick={() => setCancelOpen(true)}
            disabled={isPending}
            variant="outline"
            className="w-full border-red-500/30 bg-transparent text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
            <X className="mr-2 h-4 w-4" />
            Cancel order
          </Button>
        </div>
      )}

      {/* Current status display */}
      {currentStatus === "DELIVERED" && (
        <div className="rounded-lg border border-[#5DC600]/20 bg-[#5DC600]/5 px-3 py-2 text-center text-sm text-[#5DC600]">
          Order delivered - no further actions
        </div>
      )}
      {currentStatus === "CANCELLED" && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-center text-sm text-red-400">
          Order cancelled
        </div>
      )}

      {/* Cancel confirmation dialog */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="border-[#2A2A2A] bg-[#1A1A1A] text-white sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Cancel this order?</DialogTitle>
            <DialogDescription className="text-[#A3A3A3]">
              The order status will be set to{" "}
              <OrderStatusBadge status="CANCELLED" size="sm" />{" "}
              and cannot be reversed from here. Ensure you have communicated with the customer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="border-[#2A2A2A] bg-transparent text-[#A3A3A3] hover:bg-[#2A2A2A] hover:text-white"
              onClick={() => setCancelOpen(false)}
              disabled={isPending}
            >
              Keep order
            </Button>
            <Button
              onClick={handleCancel}
              disabled={isPending}
              className="bg-red-500 font-semibold text-white hover:bg-red-600"
            >
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Cancel order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
