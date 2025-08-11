import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

export interface ToastProps {
  id: string
  title?: string
  description?: string
  variant?: "default" | "success" | "warning" | "error"
  duration?: number
  onClose?: (id: string) => void
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, title, description, variant = "default", onClose, id, ...props }, ref) => {
    const variantClasses = {
      default: "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900",
      success: "border-success-200 dark:border-success-500/30 bg-success-50 dark:bg-success-500/10",
      warning: "border-warning-200 dark:border-warning-500/30 bg-warning-50 dark:bg-warning-500/10",
      error: "border-danger-200 dark:border-danger-500/30 bg-danger-50 dark:bg-danger-500/10",
    }

    const iconClasses = {
      default: "text-neutral-600 dark:text-neutral-400",
      success: "text-success-600 dark:text-success-400",
      warning: "text-warning-600 dark:text-warning-400",
      error: "text-danger-600 dark:text-danger-400",
    }

    const textClasses = {
      default: "text-neutral-900 dark:text-neutral-100",
      success: "text-success-900 dark:text-success-100",
      warning: "text-warning-900 dark:text-warning-100",
      error: "text-danger-900 dark:text-danger-100",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-2xl border-2 p-6 pr-8 shadow-lg transition-all duration-200 hover:shadow-xl",
          variantClasses[variant],
          className
        )}
        {...props}
      >
        <div className="grid gap-1">
          {title && (
            <div className={cn("text-sm font-semibold", textClasses[variant])}>
              {title}
            </div>
          )}
          {description && (
            <div className={cn("text-sm opacity-90", textClasses[variant])}>
              {description}
            </div>
          )}
        </div>
        <button
          onClick={() => onClose?.(id)}
          className={cn(
            "absolute right-2 top-2 rounded-lg p-1 opacity-0 transition-all hover:bg-neutral-100 dark:hover:bg-neutral-800 group-hover:opacity-100",
            iconClasses[variant]
          )}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }
)
Toast.displayName = "Toast"

export { Toast }
