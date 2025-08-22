import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-3xl border border-neutral-200/50 dark:border-neutral-600/50 bg-gradient-to-br from-white/90 via-white/80 to-white/70 dark:from-neutral-900/90 dark:via-neutral-800/80 dark:to-neutral-700/70 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-glow",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-heading font-semibold leading-none tracking-tight gradient-text-primary",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed",
      className
    )}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// Enhanced card variants
const CardVibrant = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-3xl border border-primary-200/50 dark:border-primary-500/30 bg-gradient-to-br from-primary-50/80 via-accent-50/80 to-purple-50/80 dark:from-primary-900/20 dark:via-accent-900/20 dark:to-purple-900/20 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-glow",
      className
    )}
    {...props}
  />
))
CardVibrant.displayName = "CardVibrant"

const CardSuccess = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-3xl border border-green-200/50 dark:border-green-500/30 bg-gradient-to-br from-green-50/80 via-emerald-50/80 to-teal-50/80 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-glow",
      className
    )}
    {...props}
  />
))
CardSuccess.displayName = "CardSuccess"

const CardGlass = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-3xl border border-white/20 dark:border-neutral-600/30 bg-white/10 dark:bg-neutral-800/10 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1",
      className
    )}
    {...props}
  />
))
CardGlass.displayName = "CardGlass"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, CardVibrant, CardSuccess, CardGlass }
