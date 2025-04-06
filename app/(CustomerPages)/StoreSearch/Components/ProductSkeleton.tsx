export default function ProductSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`group relative h-full ${compact ? "h-48" : "h-64"}`}>
      <div className="relative aspect-square">
        <div className="skeleton w-full h-full rounded-md"></div>
      </div>
      <div className="mt-3 px-1">
        <div className="skeleton h-4 w-3/4 mb-2"></div>
        <div className="skeleton h-5 w-1/4"></div>
      </div>
    </div>
  );
}