const Skeleton = ({ className }) => <div className={`animate-pulse rounded-xl bg-slate-700/60 ${className}`} />

export default function LoadingSkeleton({ type = 'dashboard' }) {
  if (type === 'hero') {
    return <Skeleton className="h-80 w-full" />
  }

  if (type === 'chart') {
    return (
      <div className="glass-card rounded-xl p-6">
        <Skeleton className="mb-6 h-8 w-48" />
        <Skeleton className="h-72 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <Skeleton className="h-80 w-full" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-32 w-full" />
    </div>
  )
}

