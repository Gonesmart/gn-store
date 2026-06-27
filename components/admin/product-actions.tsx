"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Copy, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { Button } from "@/components/ui/button";
import { deleteProduct, duplicateProduct, updateProductStatus } from "@/actions/products";
import type { ProductStatus } from "@prisma/client";

interface ProductActionsProps {
  product: {
    id: string;
    name: string;
    status: ProductStatus;
  };
}

export function ProductActions({ product }: ProductActionsProps) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  async function handleDuplicate() {
    setLoading("duplicate");
    const result = await duplicateProduct(product.id);
    setLoading(null);
    if (result.success) {
      router.push(`/admin/products/${result.data.id}`);
    }
  }

  async function handleDelete() {
    setLoading("delete");
    await deleteProduct(product.id);
    setLoading(null);
    setConfirmDelete(false);
    router.refresh();
  }

  async function handleToggleStatus() {
    const next: ProductStatus = product.status === "ACTIVE" ? "DRAFT" : "ACTIVE";
    setLoading("status");
    await updateProductStatus(product.id, next);
    setLoading(null);
    router.refresh();
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#A3A3A3] transition-colors hover:bg-[#2A2A2A] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5DC600]"
              aria-label="Product actions"
            />
          }
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MoreHorizontal className="h-4 w-4" />
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-44 border-[#2A2A2A] bg-[#1A1A1A] text-white"
        >
          <DropdownMenuItem
            className="cursor-pointer hover:bg-[#2A2A2A]"
            onClick={() => router.push(`/admin/products/${product.id}`)}
          >
            <Pencil className="mr-2 h-3.5 w-3.5" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer hover:bg-[#2A2A2A]"
            onClick={handleDuplicate}
          >
            <Copy className="mr-2 h-3.5 w-3.5" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer hover:bg-[#2A2A2A]"
            onClick={handleToggleStatus}
          >
            {product.status === "ACTIVE" ? (
              <>
                <EyeOff className="mr-2 h-3.5 w-3.5" />
                Unpublish
              </>
            ) : (
              <>
                <Eye className="mr-2 h-3.5 w-3.5" />
                Publish
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-[#2A2A2A]" />
          <DropdownMenuItem
            className="cursor-pointer text-red-400 hover:bg-red-500/10"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="border-[#2A2A2A] bg-[#1A1A1A] text-white sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete product?</DialogTitle>
            <DialogDescription className="text-[#A3A3A3]">
              <strong className="text-white">{product.name}</strong> will be permanently deleted along with all its variants and images. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmDelete(false)}
              className="border-[#2A2A2A] bg-transparent text-[#A3A3A3] hover:bg-[#2A2A2A] hover:text-white"
              disabled={loading === "delete"}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading === "delete"}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading === "delete" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
