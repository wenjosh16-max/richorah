import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[#FFF0F3] text-[#FF385C]",
        secondary: "bg-gray-100 text-[#717171]",
        success: "bg-[#E8F8F0] text-[#00875A]",
        warning: "bg-[#FFF8E8] text-[#CC8800]",
        danger: "bg-[#FFF0F3] text-[#FF385C]",
        info: "bg-blue-50 text-blue-700",
        outline: "border border-gray-300 text-[#717171]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  variant?: "default" | "secondary" | "success" | "warning" | "danger" | "info" | "outline"
}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
