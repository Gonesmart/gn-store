"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, X, CheckCircle2 } from "lucide-react";
import { getMediaUploadSignature, saveMediaItem } from "@/actions/media";

interface UploadState {
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

export function MediaUploader() {
  const router = useRouter();
  const [uploads, setUploads] = useState<UploadState[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function updateUpload(index: number, patch: Partial<UploadState>) {
    setUploads((prev) => prev.map((u, i) => (i === index ? { ...u, ...patch } : u)));
  }

  async function processFiles(files: File[]) {
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) return;

    const sigResult = await getMediaUploadSignature();
    if (!sigResult.success) return;

    const { signature, timestamp, cloudName, apiKey } = sigResult.data;

    const newUploads: UploadState[] = imageFiles.map((file) => ({
      file,
      status: "uploading",
    }));
    setUploads(newUploads);

    let anySucceeded = false;

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", apiKey);
        formData.append("timestamp", String(timestamp));
        formData.append("signature", signature);
        formData.append("folder", "gn-store/media");

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: "POST", body: formData }
        );

        if (!res.ok) throw new Error("Upload failed");

        const data = (await res.json()) as {
          secure_url: string;
          public_id: string;
          format: string;
          bytes: number;
          width: number;
          height: number;
          original_filename: string;
        };

        const saveResult = await saveMediaItem({
          url: data.secure_url,
          publicId: data.public_id,
          name: data.original_filename || file.name,
          size: data.bytes,
          format: data.format,
          width: data.width,
          height: data.height,
        });

        if (saveResult.success) {
          anySucceeded = true;
          updateUpload(i, { status: "done" });
        } else {
          updateUpload(i, { status: "error", error: saveResult.error });
        }
      } catch (err) {
        updateUpload(i, {
          status: "error",
          error: err instanceof Error ? err.message : "Upload failed",
        });
      }
    }

    if (anySucceeded) router.refresh();

    setTimeout(() => {
      setUploads([]);
      if (inputRef.current) inputRef.current.value = "";
    }, 2000);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    processFiles(Array.from(e.dataTransfer.files));
  }

  const activeCount = uploads.filter((u) => u.status === "uploading").length;
  const hasActive = activeCount > 0;

  return (
    <div className="space-y-3">
      <label
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 transition-colors duration-150 ${
          dragOver
            ? "border-[#5DC600] bg-[#5DC600]/10"
            : hasActive
            ? "border-[#5DC600]/40 bg-[#5DC600]/5"
            : "border-[#2A2A2A] bg-[#0D0D0D] hover:border-[#5DC600]/40 hover:bg-[#5DC600]/5"
        }`}
      >
        {hasActive ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-[#5DC600]" />
            <p className="text-sm text-[#A3A3A3]">
              Uploading {activeCount} file{activeCount !== 1 ? "s" : ""}…
            </p>
          </>
        ) : (
          <>
            <ImagePlus className="h-8 w-8 text-[#A3A3A3]" />
            <div className="text-center">
              <p className="text-sm font-medium text-white">
                Drop images here or click to browse
              </p>
              <p className="mt-0.5 text-xs text-[#A3A3A3]">
                PNG, JPG, WEBP, GIF — multiple files supported
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
          disabled={hasActive}
          onChange={(e) => processFiles(Array.from(e.target.files ?? []))}
        />
      </label>

      {/* Upload progress pills */}
      {uploads.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {uploads.map((u, i) => (
            <div
              key={i}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors ${
                u.status === "done"
                  ? "border-[#5DC600]/30 bg-[#5DC600]/10 text-[#5DC600]"
                  : u.status === "error"
                  ? "border-red-500/30 bg-red-500/10 text-red-400"
                  : "border-[#2A2A2A] bg-[#1A1A1A] text-[#A3A3A3]"
              }`}
            >
              {u.status === "uploading" && <Loader2 className="h-3 w-3 animate-spin" />}
              {u.status === "done" && <CheckCircle2 className="h-3 w-3" />}
              {u.status === "error" && <X className="h-3 w-3" />}
              <span className="max-w-[140px] truncate">{u.file.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
