"use client";

import { useState, useTransition, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Copy,
  Trash2,
  Check,
  CheckSquare,
  Square,
  Loader2,
  X,
  ExternalLink,
} from "lucide-react";
import { deleteMediaItem, deleteMediaItems } from "@/actions/media";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Media } from "@prisma/client";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface MediaGridProps {
  items: Media[];
  newItems?: Media[];
}

export function MediaGrid({ items, newItems = [] }: MediaGridProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Media | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const allItems = [...newItems, ...items];

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    if (selected.size === allItems.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(allItems.map((i) => i.id)));
    }
  }

  async function copyUrl(item: Media) {
    await navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  function handleDeleteSingle(item: Media) {
    setDeleteTarget(item);
  }

  function confirmDeleteSingle() {
    if (!deleteTarget) return;
    startTransition(async () => {
      await deleteMediaItem(deleteTarget.id);
      setDeleteTarget(null);
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(deleteTarget.id);
        return next;
      });
      router.refresh();
    });
  }

  function confirmBulkDelete() {
    const ids = Array.from(selected);
    startTransition(async () => {
      await deleteMediaItems(ids);
      setSelected(new Set());
      setBulkDeleteOpen(false);
      router.refresh();
    });
  }

  const hasSelection = selected.size > 0;
  const allSelected = selected.size === allItems.length && allItems.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Selection toolbar */}
      <div className="flex items-center justify-between">
        <button
          onClick={selectAll}
          className="flex items-center gap-2 text-sm text-[#A3A3A3] transition-colors hover:text-white"
        >
          {allSelected ? (
            <CheckSquare className="h-4 w-4 text-[#5DC600]" />
          ) : (
            <Square className="h-4 w-4" />
          )}
          {allSelected ? "Deselect all" : "Select all"}
        </button>

        {hasSelection && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#A3A3A3]">
              {selected.size} selected
            </span>
            <Button
              variant="outline"
              onClick={() => setBulkDeleteOpen(true)}
              className="h-8 border-red-500/30 bg-red-500/10 px-3 text-xs text-red-400 hover:bg-red-500/20 hover:text-red-300"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Delete {selected.size}
            </Button>
            <button
              onClick={() => setSelected(new Set())}
              className="text-[#A3A3A3] hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Grid */}
      {allItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#2A2A2A] bg-[#1A1A1A] py-20 text-center">
          <p className="text-sm font-medium text-[#A3A3A3]">No media yet</p>
          <p className="mt-1 text-xs text-[#4A4A4A]">
            Upload your first image using the zone above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {allItems.map((item) => {
            const isSelected = selected.has(item.id);
            const isCopied = copiedId === item.id;

            return (
              <div
                key={item.id}
                className={`group relative aspect-square overflow-hidden rounded-lg border bg-[#0D0D0D] transition-all duration-150 ${
                  isSelected
                    ? "border-[#5DC600] ring-1 ring-[#5DC600]/50"
                    : "border-[#2A2A2A] hover:border-[#3A3A3A]"
                }`}
              >
                {/* Image */}
                <Image
                  src={item.url}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 17vw"
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 flex flex-col justify-between bg-black/0 transition-colors duration-150 group-hover:bg-black/60">
                  {/* Top: select checkbox + open */}
                  <div className="flex items-start justify-between p-2 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                    <button
                      onClick={() => toggleSelect(item.id)}
                      className="flex h-5 w-5 items-center justify-center rounded border border-white/40 bg-black/50 text-white transition-colors hover:border-[#5DC600] hover:bg-[#5DC600]"
                      aria-label="Select"
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </button>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-5 w-5 items-center justify-center rounded bg-black/50 text-white/70 hover:text-white"
                      aria-label="Open original"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  {/* Bottom: metadata + actions */}
                  <div className="translate-y-1 p-2 opacity-0 transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100">
                    {/* File info */}
                    <p className="mb-1.5 truncate text-[10px] font-medium leading-none text-white">
                      {item.name}
                    </p>
                    <div className="mb-2 flex items-center gap-1.5">
                      <span className="rounded bg-white/10 px-1 py-0.5 text-[9px] uppercase tracking-wide text-white/60">
                        {item.format}
                      </span>
                      <span className="text-[9px] text-white/50">
                        {formatBytes(item.size)}
                      </span>
                      {item.width && item.height && (
                        <span className="text-[9px] text-white/40">
                          {item.width}×{item.height}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => copyUrl(item)}
                        className={`flex flex-1 items-center justify-center gap-1 rounded py-1 text-[10px] font-medium transition-colors ${
                          isCopied
                            ? "bg-[#5DC600]/20 text-[#5DC600]"
                            : "bg-white/10 text-white hover:bg-white/20"
                        }`}
                        aria-label="Copy URL"
                      >
                        {isCopied ? (
                          <>
                            <Check className="h-3 w-3" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            Copy URL
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteSingle(item)}
                        className="flex items-center justify-center rounded bg-white/10 px-2 py-1 text-white/70 transition-colors hover:bg-red-500/20 hover:text-red-400"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Always-visible selection ring */}
                {isSelected && (
                  <div className="pointer-events-none absolute inset-0 flex items-start justify-start p-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded border border-[#5DC600] bg-[#5DC600]">
                      <Check className="h-3 w-3 text-black" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Single delete dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="border-[#2A2A2A] bg-[#1A1A1A] text-white sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete image</DialogTitle>
            <DialogDescription className="text-[#A3A3A3]">
              <span className="font-medium text-white">{deleteTarget?.name}</span> will be
              permanently removed from Cloudinary and the media library. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="border-[#2A2A2A] bg-transparent text-[#A3A3A3] hover:bg-[#2A2A2A] hover:text-white"
              onClick={() => setDeleteTarget(null)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDeleteSingle}
              disabled={isPending}
              className="bg-red-500 font-semibold text-white hover:bg-red-600"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk delete dialog */}
      <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <DialogContent className="border-[#2A2A2A] bg-[#1A1A1A] text-white sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete {selected.size} images</DialogTitle>
            <DialogDescription className="text-[#A3A3A3]">
              These {selected.size} images will be permanently removed from Cloudinary and the
              media library. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="border-[#2A2A2A] bg-transparent text-[#A3A3A3] hover:bg-[#2A2A2A] hover:text-white"
              onClick={() => setBulkDeleteOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmBulkDelete}
              disabled={isPending}
              className="bg-red-500 font-semibold text-white hover:bg-red-600"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete {selected.size}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
