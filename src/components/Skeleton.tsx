export function SkeletonCard() {
  return (
    <div className="animate-shimmer rounded-xl h-32 w-full" />
  )
}

export function SkeletonText({ width = 'w-full' }: { width?: string }) {
  return (
    <div className={`animate-shimmer rounded h-4 ${width}`} />
  )
}

export function SkeletonStatCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-2">
      <div className="animate-shimmer rounded h-3 w-20" />
      <div className="animate-shimmer rounded h-6 w-16" />
    </div>
  )
}
