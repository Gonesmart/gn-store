"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { cloudinary } from "@/lib/cloudinary";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role: string }).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function getMediaUploadSignature() {
  try {
    await requireAdmin();
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder: "gn-store/media" },
      process.env.CLOUDINARY_API_SECRET!
    );
    return {
      success: true as const,
      data: {
        timestamp,
        signature,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
        apiKey: process.env.CLOUDINARY_API_KEY!,
      },
    };
  } catch (err) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : "Failed to get upload signature",
    };
  }
}

export interface SaveMediaItemInput {
  url: string;
  publicId: string;
  name: string;
  size: number;
  format: string;
  width?: number;
  height?: number;
}

export async function saveMediaItem(input: SaveMediaItemInput) {
  try {
    const session = await requireAdmin();

    const existing = await db.media.findUnique({ where: { publicId: input.publicId } });
    if (existing) return { success: true as const, data: existing };

    const media = await db.media.create({
      data: {
        url: input.url,
        publicId: input.publicId,
        name: input.name,
        size: input.size,
        format: input.format,
        width: input.width ?? null,
        height: input.height ?? null,
        uploadedBy: session.user.id,
      },
    });

    revalidatePath("/admin/media");
    return { success: true as const, data: media };
  } catch (err) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : "Failed to save media item",
    };
  }
}

export async function deleteMediaItem(id: string) {
  try {
    await requireAdmin();

    const media = await db.media.findUnique({ where: { id } });
    if (!media) return { success: false as const, error: "Media item not found" };

    await cloudinary.uploader.destroy(media.publicId).catch(() => null);
    await db.media.delete({ where: { id } });

    revalidatePath("/admin/media");
    return { success: true as const };
  } catch (err) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : "Failed to delete media item",
    };
  }
}

export async function deleteMediaItems(ids: string[]) {
  try {
    await requireAdmin();
    if (ids.length === 0) return { success: true as const };

    const items = await db.media.findMany({ where: { id: { in: ids } } });

    await Promise.all(
      items.map((item) => cloudinary.uploader.destroy(item.publicId).catch(() => null))
    );

    await db.media.deleteMany({ where: { id: { in: ids } } });

    revalidatePath("/admin/media");
    return { success: true as const };
  } catch (err) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : "Failed to delete media items",
    };
  }
}

export async function getMediaItems(page = 1, pageSize = 48) {
  try {
    await requireAdmin();
  } catch {
    return { items: [], total: 0, page, pageSize, totalPages: 0 };
  }
  const [items, total] = await Promise.all([
    db.media.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.media.count(),
  ]);
  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}
