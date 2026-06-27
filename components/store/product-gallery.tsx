"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type GalleryImage = {
  id: string;
  url: string;
  altText: string | null;
};

export function ProductGallery({
  images,
  productName,
}: {
  images: GalleryImage[];
  productName: string;
}) {
  const [activeIdx, setActiveIdx] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-gray-100 dark:bg-[#1A1A1A]">
        <span
          className="select-none text-[120px] font-black leading-none text-[#5DC600]"
          style={{ opacity: 0.06 }}
        >
          GN
        </span>
      </div>
    );
  }

  const active = images[activeIdx];

  function prev() {
    setActiveIdx((i) => (i - 1 + images.length) % images.length);
  }
  function next() {
    setActiveIdx((i) => (i + 1) % images.length);
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-[#1A1A1A]">
        <Image
          src={active.url}
          alt={active.altText ?? productName}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-md backdrop-blur-sm transition-opacity hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600] dark:bg-black/70 dark:text-white dark:hover:bg-black/90"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-md backdrop-blur-sm transition-opacity hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600] dark:bg-black/70 dark:text-white dark:hover:bg-black/90"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Dot indicators for mobile */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 md:hidden">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                aria-label={`Go to image ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === activeIdx
                    ? "w-5 bg-[#5DC600]"
                    : "w-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail strip — hidden on mobile */}
      {images.length > 1 && (
        <div className="hidden gap-2 md:flex">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIdx(i)}
              aria-label={`View image ${i + 1}`}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600] ${
                i === activeIdx
                  ? "border-[#5DC600] opacity-100"
                  : "border-transparent opacity-50 hover:opacity-80"
              }`}
            >
              <Image
                src={img.url}
                alt={img.altText ?? `${productName} ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
