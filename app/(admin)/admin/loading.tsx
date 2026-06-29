export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-5">
      {/* Page header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="h-7 w-40 animate-pulse rounded-lg bg-[#1A1A1A]" />
          <div className="h-4 w-56 animate-pulse rounded bg-[#1A1A1A]" />
        </div>
        <div className="h-9 w-28 animate-pulse rounded-lg bg-[#1A1A1A]" />
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-xl bg-[#1A1A1A]"
          />
        ))}
      </div>

      {/* Main content area */}
      <div className="h-72 animate-pulse rounded-xl bg-[#1A1A1A]" />
      <div className="h-48 animate-pulse rounded-xl bg-[#1A1A1A]" />
    </div>
  );
}
