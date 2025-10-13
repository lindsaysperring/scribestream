export function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-4 bg-muted animate-pulse rounded" />
      <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
      <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 bg-muted animate-pulse rounded" />
      <div className="h-10 bg-muted animate-pulse rounded w-24" />
    </div>
  );
}