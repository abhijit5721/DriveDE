import { cn } from '../../utils/cn';

/**
 * Skeleton component for loading states.
 * Uses a type alias for HTML attributes to avoid empty interface linting errors.
 */
type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-slate-200 dark:bg-slate-800', className)}
      {...props}
    />
  );
}
