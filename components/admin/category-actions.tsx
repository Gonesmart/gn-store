"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
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
import { deleteCategory } from "@/actions/categories";

interface CategoryActionsProps {
  category: {
    id: string;
    name: string;
    productCount: number;
    childrenCount: number;
  };
}

export function CategoryActions({ category }: CategoryActionsProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);
    const result = await deleteCategory(category.id);
    setDeleting(false);

    if (!result.success) {
      setDeleteError(result.error);
      return;
    }

    setDeleteOpen(false);
    router.refresh();
  }

  const canDelete = category.productCount === 0 && category.childrenCount === 0;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#A3A3A3] transition-colors hover:bg-[#2A2A2A] hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5DC600]"
              aria-label="Category actions"
            />
          }
        >
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-40 border-[#2A2A2A] bg-[#1A1A1A] text-white"
        >
          <DropdownMenuItem
            className="cursor-pointer gap-2 hover:bg-[#2A2A2A] focus:bg-[#2A2A2A]"
            render={<Link href={`/admin/categories/${category.id}`} />}
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-[#2A2A2A]" />
          <DropdownMenuItem
            className="cursor-pointer gap-2 text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-400"
            onClick={() => {
              setDeleteError(null);
              setDeleteOpen(true);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="border-[#2A2A2A] bg-[#1A1A1A] text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription className="text-[#A3A3A3]">
              {canDelete ? (
                <>
                  Are you sure you want to delete{" "}
                  <span className="font-medium text-white">{category.name}</span>?
                  This cannot be undone.
                </>
              ) : (
                <>
                  <span className="font-medium text-white">{category.name}</span>{" "}
                  cannot be deleted because it has{" "}
                  {category.productCount > 0 && (
                    <span className="text-yellow-400">
                      {category.productCount} product(s)
                    </span>
                  )}
                  {category.productCount > 0 && category.childrenCount > 0 && " and "}
                  {category.childrenCount > 0 && (
                    <span className="text-yellow-400">
                      {category.childrenCount} subcategory/subcategories
                    </span>
                  )}{" "}
                  assigned to it.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {deleteError && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {deleteError}
            </p>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="border-[#2A2A2A] bg-transparent text-[#A3A3A3] hover:bg-[#2A2A2A] hover:text-white"
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            {canDelete && (
              <Button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-500 font-semibold text-white hover:bg-red-600 active:bg-red-700"
              >
                {deleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting…
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
