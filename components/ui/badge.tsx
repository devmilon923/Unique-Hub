import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline:
          "border border-border text-foreground hover:bg-muted/50",
        preorder:
          "border border-amber-300 bg-amber-50 text-amber-900 font-medium",
        discount:
          "border-transparent bg-rose-500 text-white font-bold",
        success:
          "border border-emerald-300 bg-emerald-50 text-emerald-800 font-medium",
        subtle:
          "border border-border/60 bg-muted/70 text-muted-foreground",
      },
      size: {
        default: "text-xs px-2.5 py-0.5",
        sm: "text-[11px] px-2 py-0.5",
        lg: "text-sm px-3 py-1",
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
