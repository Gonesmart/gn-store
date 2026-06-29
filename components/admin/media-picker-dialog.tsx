"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, ImageIcon, Check, Loader2, Library } from "lucide-react";
import { getMediaItems } from "@/actions/media";

type MediaItem = {
  id: string;
  url: string;
  publicId: string;
  name: string;
  format: string;
  width: number | null;
  height: number | null;
};

interface MediaPickerDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (items: Array<{ url: string; publicId: string }>) => void;
  multiple?: boolean;
}

export function MediaPickerDialog({
  open,
  onClose,
  onSelect,
  multiple = false,
}: MediaPickerDialogProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setSelected(new Set());
    getMediaItems(1, 200).then(({ items: fetched }) => {
      setItems(fetched);
      setLoading(false);
    });
  }, [open]);

  function toggleSelect(id: string) {
    if (multiple) {
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    } else {
      setSelected((prev) => (prev.has(id) ? new Set() : new Set([id])));
    }
  }

  function handleConfirm() {
    const chosen = items
      .filter((i) => selected.has(i.id))
      .map((i) => ({ url: i.url, publicId: i.publicId }));
    onSelect(chosen);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative z-10 flex w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-[#2A2A2A] bg-[#111111] shadow-2xl"
        style={{ maxHeight: "80vh" }}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#2A2A2A] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <Library className="h-4 w-4 text-[#5DC600]" />
            <h2 className="text-sm font-semibold text-white">Media Library</h2>
            {selected.size > 0 && (
              <span className="rounded-full bg-[#5DC600]/15 px-2 py-0.5 text-xs font-medium text-[#5DC600]">
                {selected.size} selected
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-[#A3A3A3] hover:bg-[#2A2A2A] hover:text-white transition-colors focus-visible:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-[#5DC600]" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center gap-3 text-center">
              <ImageIcon className="h-9 w-9 text-[#3A3A3A]" />
              <div>
                <p className="text-sm font-medium text-white">No media uploaded yet</p>
                <p className="mt-1 text-xs text-[#A3A3A3]">
                  Upload images in the Media Library first.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
              {items.map((item) => {
                const isSelected = selected.has(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleSelect(item.id)}
                    className={`group relative aspect-square overflow-hidden rounded-lg border-2 transition-all duration-150 focus-visible:outline-none ${
                      isSelected
                        ? "border-[#5DC600] ring-2 ring-[#5DC600]/25"
                        : "border-[#2A2A2A] hover:border-[#5DC600]/50"
                    }`}
                  >
                    <Image
                      src={item.url}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="120px"
                      unoptimized
                    />
                    {/* Hover overlay */}
                    {!isSelected && (
                      <div className="absolute inset-0 bg-black/0 transition-colors duration-150 group-hover:bg-black/25" />
                    )}
                    {/* Selected overlay */}
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#5DC600]/20">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#5DC600] shadow">
                          <Check className="h-3.5 w-3.5 text-black" strokeWidth={3} />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-[#2A2A2A] px-5 py-3">
          <p className="text-xs text-[#555]">{items.length} file{items.length !== 1 ? "s" : ""}</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-[#A3A3A3] hover:bg-[#2A2A2A] hover:text-white transition-colors focus-visible:outline-none"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={selected.size === 0}
              className="rounded-lg bg-[#5DC600] px-4 py-2 text-sm font-bold text-black hover:bg-[#4DAF00] transition-colors focus-visible:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {multiple
                ? `Insert ${selected.size > 0 ? selected.size + " " : ""}Image${selected.size !== 1 ? "s" : ""}`
                : "Use This Image"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
