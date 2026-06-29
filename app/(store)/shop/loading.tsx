export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0D0D0D]">
      {/* Header skeleton */}
      <div className="border-b border-gray-100 dark:border-[#1E1E1E]">
        <div className="mx-auto max-w-7xl px-4 pb-6 pt-8 lg:px-8">
          <div className="mb-4 h-4 w-28 animate-pulse rounded bg-gray-100 dark:bg-[#1A1A1A]" />
          <div className="h-9 w-48 animate-pulse rounded-lg bg-gray-100 dark:bg-[#1A1A1A]" />
        </div>
      </div>

      {/* Main layout */}
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="flex gap-8">
          {/* Desktop sidebar skeleton */}
          <div className="hidden w-60 shrink-0 lg:block">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-[#2A2A2A] dark:bg-[#1A1A1A]">
              <div className="mb-5 h-3 w-16 animate-pulse rounded bg-gray-100 dark:bg-[#2A2A2A]" />
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="mb-3 h-4 animate-pulse rounded bg-gray-100 dark:bg-[#2A2A2A]" style={{ width: `${60 + i * 8}%` }} />
              ))}
            </div>
          </div>

          {/* Product grid skeleton */}
          <div className="min-w-0 flex-1">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="h-9 w-24 animate-pulse rounded-xl bg-gray-100 dark:bg-[#1A1A1A] lg:hidden" />
              <div className="ml-auto h-9 w-36 animate-pulse rounded-xl bg-gray-100 dark:bg-[#1A1A1A]" />
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 lg:gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-[#2A2A2A] dark:bg-[#1A1A1A]">
                  <div className="aspect-[4/5] animate-pulse bg-gray-100 dark:bg-[#242424]" />
                  <div className="p-4">
                    <div className="mb-2 h-2.5 w-16 animate-pulse rounded bg-gray-100 dark:bg-[#2A2A2A]" />
                    <div className="mb-3 h-4 animate-pulse rounded bg-gray-100 dark:bg-[#2A2A2A]" />
                    <div className="h-4 w-20 animate-pulse rounded bg-gray-100 dark:bg-[#2A2A2A]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
