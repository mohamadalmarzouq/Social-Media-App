import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transform hover:-translate-y-1 active:translate-y-0 shadow-lg hover:shadow-xl",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 hover:from-primary-600 hover:via-primary-700 hover:to-primary-800 text-white hover:shadow-glow",
        destructive: "bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 text-white hover:shadow-glow",
        outline: "border-2 border-neutral-200/50 dark:border-neutral-600/50 bg-gradient-to-r from-white/90 to-white/70 dark:from-neutral-800/90 dark:to-neutral-700/70 text-neutral-900 dark:text-white hover:border-primary-300 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950/20 backdrop-blur-sm hover:shadow-glow",
        secondary: "bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-300 dark:from-neutral-800 dark:via-neutral-700 dark:to-neutral-600 text-neutral-900 dark:text-white hover:from-neutral-200 hover:via-neutral-300 hover:to-neutral-400 dark:hover:from-neutral-700 dark:hover:via-neutral-600 dark:hover:to-neutral-500 hover:shadow-glow",
        ghost: "hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white backdrop-blur-sm",
        link: "text-primary-600 dark:text-primary-400 underline-offset-4 hover:underline hover:text-primary-700 dark:hover:text-primary-300",
        primary: "bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 hover:from-primary-600 hover:via-primary-700 hover:to-primary-800 text-white hover:shadow-glow",
        success: "bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white hover:shadow-glow",
        accent: "bg-gradient-to-r from-accent-500 via-purple-500 to-pink-500 hover:from-accent-600 hover:via-purple-600 hover:to-pink-600 text-white hover:shadow-glow",
        warning: "bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 text-white hover:shadow-glow",
        glass: "bg-white/20 dark:bg-neutral-800/20 backdrop-blur-md border border-white/30 dark:border-neutral-600/30 text-neutral-900 dark:text-neutral-100 hover:bg-white/30 dark:hover:bg-neutral-800/30 hover:shadow-glow",
        vibrant: "bg-gradient-to-r from-primary-500 via-accent-500 to-purple-500 hover:from-primary-600 hover:via-accent-600 hover:to-purple-600 text-white hover:shadow-glow animate-pulse-glow",
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 rounded-xl px-4 py-2",
        lg: "h-12 rounded-3xl px-8 py-4 text-base",
        xl: "h-14 rounded-3xl px-10 py-5 text-lg",
        icon: "h-11 w-11 rounded-2xl",
        iconLg: "h-14 w-14 rounded-3xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
