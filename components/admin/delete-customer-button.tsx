"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteCustomer } from "@/actions/customers";

interface DeleteCustomerButtonProps {
  customerId: string;
  customerName: string;
}

export function DeleteCustomerButton({
  customerId,
  customerName,
}: DeleteCustomerButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setError(null);
    const result = await deleteCustomer(customerId);
    if (result.success) {
      setOpen(false);
    } else {
      setError(result.error ?? "Something went wrong");
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="flex h-7 w-7 items-center justify-center rounded-md text-[#A3A3A3] transition-colors hover:bg-red-500/10 hover:text-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400"
        aria-label={`Delete ${customerName}`}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </DialogTrigger>
      <DialogContent className="border-[#2A2A2A] bg-[#1A1A1A] text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Delete customer</DialogTitle>
          <DialogDescription className="text-[#A3A3A3]">
            This will permanently delete{" "}
            <span className="font-semibold text-white">{customerName}</span> and
            all their data including addresses and reviews. Their order history
            will be preserved. This cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <DialogFooter className="gap-2">
          <button
            onClick={() => setOpen(false)}
            disabled={loading}
            className="rounded-lg border border-[#2A2A2A] bg-[#0D0D0D] px-4 py-2 text-sm text-[#A3A3A3] transition-colors hover:bg-[#2A2A2A] hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Delete customer
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
