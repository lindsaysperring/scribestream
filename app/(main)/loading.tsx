export default function Loading() {
  return (
    <div className="container mx-auto p-4 min-h-screen max-w-4xl">
      <div className="space-y-8 py-8">
        <div className="space-y-2">
          <div className="h-8 w-2/3 bg-muted animate-pulse rounded" />
          <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-32 bg-muted animate-pulse rounded" />
      </div>
    </div>
  );
}