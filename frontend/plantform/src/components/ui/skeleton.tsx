import { cn } from "@/lib/utils"
import { Card, CardContent } from "./card"
import { Spinner } from "./spinner"

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200",
        className
      )}
    />
  )
}

export function CourseCardSkeleton() {
  return (
    <Card>
      <Skeleton className="h-32 w-full rounded-t-xl" />
      <CardContent className="pt-4">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  )
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Spinner size="lg" />
    </div>
  )
}
