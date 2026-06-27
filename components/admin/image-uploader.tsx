"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, X, Loader2, GripVertical } from "lucide-react";
import { getUploadSignature } from "@/actions/products";
import type { ProductImageFormValues } from "@/lib/validations/product";

interface ImageUploaderProps {
  images: ProductImageFormValues[];
  onChange: (images: ProductImageFormValues[]) => void;
}

export function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);

    try {
      const sigResult = await getUploadSignature();
      if (!sigResult.success) throw new Error(sigResult.error);

      const { signature, timestamp, cloudName, apiKey } = sigResult.data;

      const uploaded: ProductImageFormValues[] = [];

      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", apiKey);
        formData.append("timestamp", String(timestamp));
        formData.append("signature", signature);
        formData.append("folder", "gn-store/products");

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: "POST", body: formData }
        );

        if (!res.ok) throw new Error("Upload failed");
        const data = (await res.json()) as {
          secure_url: string;
          public_id: string;
        };

        uploaded.push({
          url: data.secure_url,
          publicId: data.public_id,
          position: images.length + uploaded.length,
          altText: undefined,
        });
      }

      onChange([...images, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeImage(index: number) {
    const next = images.filter((_, i) => i !== index).map((img, i) => ({ ...img, position: i }));
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img, i) => (
            <div
              key={img.url}
              className="group relative aspect-square overflow-hidden rounded-lg border border-[#2A2A2A] bg-[#0D0D0D]"
            >
              <Image
                src={img.url}
                alt={img.altText ?? `Product image ${i + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors duration-150 group-hover:bg-black/40" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity duration-150 hover:bg-red-500 group-hover:opacity-100"
                aria-label="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              {i === 0 && (
                <span className="absolute bottom-1.5 left-1.5 rounded bg-[#5DC600]/90 px-1.5 py-0.5 text-[10px] font-semibold text-black">
                  Main
                </span>
              )}
              <div className="absolute left-1.5 top-1.5 cursor-grab opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                <GripVertical className="h-4 w-4 text-white drop-shadow" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload zone */}
      <label
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 transition-colors duration-150 ${
          uploading
            ? "border-[#5DC600]/40 bg-[#5DC600]/5"
            : "border-[#2A2A2A] bg-[#0D0D0D] hover:border-[#5DC600]/40 hover:bg-[#5DC600]/5"
        }`}
      >
        {uploading ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-[#5DC600]" />
            <p className="text-sm text-[#A3A3A3]">Uploading…</p>
          </>
        ) : (
          <>
            <ImagePlus className="h-8 w-8 text-[#A3A3A3]" />
            <div className="text-center">
              <p className="text-sm font-medium text-white">Click to upload images</p>
              <p className="mt-0.5 text-xs text-[#A3A3A3]">
                PNG, JPG, WEBP — multiple files supported
              </p>
            </div>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          disabled={uploading}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
