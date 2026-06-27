"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CouponForm } from "@/components/admin/coupon-form";
import { toggleCoupon, deleteCoupon } from "@/actions/coupons";
import type { Coupon } from "@prisma/client";

interface CouponActionsProps {
  coupon: Coupon;
}

export function CouponActions({ coupon }: CouponActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function handleToggle() {
    startTransition(async () => {
      await toggleCoupon(coupon.id, !coupon.active);
      router.refresh();
    });
  }

  function handleDelete() {
    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteCoupon(coupon.id);
      if (!result.success) {
        setDeleteError(result.error);
      } else {
        setDeleteOpen(false);
        router.refresh();
      }
    });
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Active toggle */}
        <button
          role="switch"
          aria-checked={coupon.active}
          onClick={handleToggle}
          disabled={isPending}
          className={`relative h-5 w-9 rounded-full transition-colors disabled:opacity-50 ${
            coupon.active ? "bg-[#5DC600]" : "bg-[#2A2A2A]"
          }`}
          title={coupon.active ? "Disable coupon" : "Enable coupon"}
        >
          {isPending ? (
            <Loader2 className="absolute inset-0 m-auto h-3 w-3 animate-spin text-white" />
          ) : (
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                coupon.active ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          )}
        </button>

        {/* Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <button className="flex h-7 w-7 items-center justify-center rounded-md border border-[#2A2A2A] bg-transparent text-[#A3A3A3] transition-colors hover:bg-[#2A2A2A] hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5DC600]">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          } />
          <DropdownMenuContent
            align="end"
            className="w-40 border-[#2A2A2A] bg-[#1A1A1A] text-sm text-white"
          >
            <DropdownMenuItem
              render={<button className="w-full" />}
              onClick={() => setEditOpen(true)}
              className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-[#A3A3A3] outline-none hover:bg-[#2A2A2A] hover:text-white"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              render={<button className="w-full" />}
              onClick={() => setDeleteOpen(true)}
              className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-red-400 outline-none hover:bg-red-500/10 hover:text-red-300"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="border-[#2A2A2A] bg-[#1A1A1A] text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit coupon</DialogTitle>
            <DialogDescription className="text-[#A3A3A3]">
              Update{" "}
              <span className="font-mono font-medium text-white">{coupon.code}</span>
            </DialogDescription>
          </DialogHeader>
          <CouponForm
            mode="edit"
            initialData={coupon}
            onSuccess={() => setEditOpen(false)}
            onCancel={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={deleteOpen} onOpenChange={(o) => { setDeleteOpen(o); if (!o) setDeleteError(null); }}>
        <DialogContent className="border-[#2A2A2A] bg-[#1A1A1A] text-white sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete coupon?</DialogTitle>
            <DialogDescription className="text-[#A3A3A3]">
              <span className="font-mono font-medium text-white">{coupon.code}</span> will be
              permanently deleted. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {deleteError}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="border-[#2A2A2A] bg-transparent text-[#A3A3A3] hover:bg-[#2A2A2A] hover:text-white"
              onClick={() => setDeleteOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-500 font-semibold text-white hover:bg-red-600"
            >
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
