"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { getCategoryUploadSignature } from "@/actions/categories";

interface CategoryImageUploaderProps {
  value: string;
  publicId: string;
  onChange: (url: string, publicId: string) => void;
}

export function CategoryImageUploader({
  value,
  publicId,
  onChange,
}: CategoryImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | null) {
    if (!file || !file.type.startsWith("image/")) return;
    setError(null);
    setUploading(true);

    try {
      const sigResult = await getCategoryUploadSignature();
      if (!sigResult.success) throw new Error(sigResult.error);

      const { signature, timestamp, cloudName, apiKey } = sigResult.data;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", String(timestamp));
      formData.append("signature", signature);
      formData.append("folder", "gn-store/categories");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );

      if (!res.ok) throw new Error("Upload failed");
      const data = (await res.json()) as {
        secure_url: string;
        public_id: string;
      };

      onChange(data.secure_url, data.public_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remove() {
    onChange("", "");
  }

  if (value) {
    return (
      <div className="relative h-32 w-32 overflow-hidden rounded-xl border border-[#2A2A2A] bg-[#0D0D0D]">
        <Image
          src={value}
          alt="Category image"
          fill
          className="object-cover"
          sizes="128px"
        />
        <button
          type="button"
          onClick={remove}
          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-red-500 transition-colors duration-150"
          aria-label="Remove image"
        >
          <X className="h-3.5 w-3.5" />
        </button>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 px-2 py-1">
          <p className="truncate text-[10px] text-white/80">
            {publicId.split("/").pop()}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label
        className={`flex h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors duration-150 ${
          uploading
            ? "border-[#5DC600]/40 bg-[#5DC600]/5"
            : "border-[#2A2A2A] bg-[#0D0D0D] hover:border-[#5DC600]/40 hover:bg-[#5DC600]/5"
        }`}
      >
        {uploading ? (
          <>
            <Loader2 className="h-7 w-7 animate-spin text-[#5DC600]" />
            <p className="text-xs text-[#A3A3A3]">Uploading…</p>
          </>
        ) : (
          <>
            <ImagePlus className="h-7 w-7 text-[#A3A3A3]" />
            <p className="text-xs text-[#A3A3A3]">Click to upload</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          disabled={uploading}
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
      </label>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
