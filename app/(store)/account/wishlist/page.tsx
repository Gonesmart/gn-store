import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Heart } from "lucide-react";
import { WishlistItemCard } from "@/components/store/wishlist-item-card";

export default async function WishlistPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const wishlist = await db.wishlist.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          images: { orderBy: { position: "asc" }, take: 1 },
          variants: { orderBy: { price: "asc" }, take: 1 },
        },
      },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Wishlist</h1>
        <p className="mt-1 text-sm text-gray-400 dark:text-[#A3A3A3]">
          {wishlist.length} saved item{wishlist.length !== 1 ? "s" : ""}
        </p>
      </div>

      {wishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-gray-200 py-20 text-center dark:border-[#2A2A2A]">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-[#1A1A1A]">
            <Heart size={24} className="text-gray-300 dark:text-[#3A3A3A]" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">Nothing saved yet</p>
            <p className="mt-1 text-sm text-gray-400 dark:text-[#A3A3A3]">
              Tap the heart icon on any product to save it here.
            </p>
          </div>
          <Link
            href="/shop"
            className="rounded-xl bg-[#5DC600] px-6 py-2.5 text-sm font-bold text-black hover:bg-[#4DAF00]"
          >
            Browse Shop
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wishlist.map(({ product }) => (
            <WishlistItemCard
              key={product.id}
              productId={product.id}
              name={product.name}
              slug={product.slug}
              price={product.variants[0]?.price.toString() ?? "0"}
              image={product.images[0]?.url ?? null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
