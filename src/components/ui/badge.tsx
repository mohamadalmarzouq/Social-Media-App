import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border-2 px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100",
        secondary:
          "border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100",
        destructive:
          "border-danger-200 dark:border-danger-500/30 bg-danger-100 dark:bg-danger-500/15 text-danger-700 dark:text-danger-300",
        outline: "text-neutral-700 dark:text-neutral-300",
        success:
          "border-success-200 dark:border-success-500/30 bg-success-100 dark:bg-success-500/15 text-success-700 dark:text-success-300",
        warning:
          "border-warning-200 dark:border-warning-500/30 bg-warning-100 dark:bg-warning-500/15 text-warning-700 dark:text-warning-300",
        info:
          "border-primary-200 dark:border-primary-500/30 bg-primary-100 dark:bg-primary-500/15 text-primary-700 dark:text-primary-300",
        active:
          "border-success-200 dark:border-success-500/30 bg-success-100 dark:bg-success-500/15 text-success-700 dark:text-success-300",
        pending:
          "border-warning-200 dark:border-warning-500/30 bg-warning-100 dark:bg-warning-500/15 text-warning-700 dark:text-warning-300",
        cancelled:
          "border-danger-200 dark:border-danger-500/30 bg-danger-100 dark:bg-danger-500/15 text-danger-700 dark:text-danger-300",
        completed:
          "border-success-200 dark:border-success-500/30 bg-success-100 dark:bg-success-500/15 text-success-700 dark:text-success-300",
        draft:
          "border-neutral-200 dark:border-neutral-500/30 bg-neutral-100 dark:bg-neutral-500/15 text-neutral-700 dark:text-neutral-300",
      },
      size: {
        default: "px-3 py-1.5 text-xs",
        sm: "px-2 py-1 text-xs",
        lg: "px-4 py-2 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
