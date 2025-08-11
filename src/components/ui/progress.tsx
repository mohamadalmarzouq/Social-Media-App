import * as React from "react"
import { cn } from "@/lib/utils"

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  variant?: "default" | "success" | "warning" | "danger"
  size?: "sm" | "default" | "lg"
  showLabel?: boolean
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, variant = "default", size = "default", showLabel = false, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    
    const variantClasses = {
      default: "bg-gradient-to-r from-primary-500 to-primary-600",
      success: "bg-gradient-to-r from-success-500 to-success-600",
      warning: "bg-gradient-to-r from-warning-500 to-warning-600",
      danger: "bg-gradient-to-r from-danger-500 to-danger-600",
    }
    
    const sizeClasses = {
      sm: "h-2",
      default: "h-3",
      lg: "h-4",
    }
    
    return (
      <div className="w-full space-y-2">
        {showLabel && (
          <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400">
            <span>Progress</span>
            <span>{Math.round(percentage)}%</span>
          </div>
        )}
        <div
          ref={ref}
          className={cn(
            "w-full bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden",
            sizeClasses[size],
            className
          )}
          {...props}
        >
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              variantClasses[variant]
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }
