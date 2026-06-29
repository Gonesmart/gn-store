"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { approveReview, deleteReview } from "@/actions/reviews-admin";

interface ReviewActionsProps {
  reviewId: string;
  approved: boolean;
  productName: string;
}

export function ReviewActions({ reviewId, approved, productName }: ReviewActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleApprove() {
    setError(null);
    startTransition(async () => {
      const result = await approveReview(reviewId);
      if (!result.success) setError(result.error);
      else router.refresh();
    });
  }

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteReview(reviewId);
      if (!result.success) {
        setError(result.error);
      } else {
        setDeleteOpen(false);
        router.refresh();
      }
    });
  }

  return (
    <>
      <div className="flex items-center gap-1.5">
        {!approved && (
          <button
            type="button"
            onClick={handleApprove}
            disabled={isPending}
            title="Approve review"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-[#2A2A2A] bg-transparent text-[#A3A3A3] transition-colors hover:border-[#5DC600]/40 hover:bg-[#5DC600]/10 hover:text-[#5DC600] focus-visible:outline-none disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" />
            )}
          </button>
        )}
        <button
          type="button"
          onClick={() => setDeleteOpen(true)}
          disabled={isPending}
          title="Delete review"
          className="flex h-7 w-7 items-center justify-center rounded-md border border-[#2A2A2A] bg-transparent text-[#A3A3A3] transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 focus-visible:outline-none disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-400">{error}</p>
      )}

      <Dialog open={deleteOpen} onOpenChange={(o) => { setDeleteOpen(o); if (!o) setError(null); }}>
        <DialogContent className="border-[#2A2A2A] bg-[#1A1A1A] text-white sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete review?</DialogTitle>
            <DialogDescription className="text-[#A3A3A3]">
              This review on <span className="font-medium text-white">{productName}</span> will be
              permanently deleted. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
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
