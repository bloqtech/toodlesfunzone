import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-3 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/85",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/85",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/85",
        outline:
          "text-foreground border-border bg-background/60 backdrop-blur",
        success:
          "border-transparent bg-[hsl(150,65%,46%)] text-white hover:bg-[hsl(150,65%,42%)]",
        info:
          "border-transparent bg-[hsl(198,90%,56%)] text-white hover:bg-[hsl(198,90%,52%)]",
        accent:
          "border-transparent bg-accent text-accent-foreground hover:bg-accent/85",
        soft:
          "border-transparent bg-primary/10 text-primary hover:bg-primary/15",
        gradient:
          "border-transparent text-white bg-[image:var(--gradient-sunset)] shadow-glow-primary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
