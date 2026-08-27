import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('animate-pulse rounded-[1.1rem] bg-surface-elevated', className)}
      {...props}
    />
  )
}

export { Skeleton }
