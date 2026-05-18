export function SolvePageSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 rounded bg-gray-200" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-64 rounded-lg bg-gray-100" />
        <div className="h-64 rounded-lg bg-gray-100" />
      </div>
    </div>
  );
}
