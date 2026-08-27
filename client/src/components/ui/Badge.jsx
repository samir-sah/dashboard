import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring/30 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:     "border-brand-100 bg-brand-50 text-brand-800 hover:bg-brand-100",
        secondary:   "border-border bg-secondary text-secondary-foreground hover:bg-brand-50",
        destructive: "border-red-100 bg-red-50 text-destructive hover:bg-red-100",
        outline:     "border-border bg-background text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
