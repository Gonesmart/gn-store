import { Images } from "lucide-react";
import { db } from "@/lib/db";
import { MediaUploader } from "@/components/admin/media-uploader";
import { MediaGrid } from "@/components/admin/media-grid";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Media Library" };

const PAGE_SIZE = 48;

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function MediaPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));

  const [items, total] = await Promise.all([
    db.media.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.media.count(),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Media Library</h1>
          <p className="mt-1 text-sm text-[#A3A3A3]">
            {total} file{total !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#2A2A2A] bg-[#1A1A1A]">
          <Images className="h-4 w-4 text-[#5DC600]" />
        </div>
      </div>

      {/* Upload zone */}
      <div
        className="rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] p-4"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.2)" }}
      >
        <MediaUploader />
      </div>

      {/* Grid */}
      <MediaGrid items={items} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <a
              href={`/admin/media?page=${page - 1}`}
              className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-2 text-sm text-[#A3A3A3] transition-colors hover:bg-[#2A2A2A] hover:text-white"
            >
              Previous
            </a>
          )}
          <span className="text-sm text-[#A3A3A3]">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <a
              href={`/admin/media?page=${page + 1}`}
              className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-2 text-sm text-[#A3A3A3] transition-colors hover:bg-[#2A2A2A] hover:text-white"
            >
              Next
            </a>
          )}
        </div>
      )}
    </div>
  );
}
