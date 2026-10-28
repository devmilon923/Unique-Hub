import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-4xl border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all duration-150 ease-out outline-none select-none cursor-pointer focus-visible:border-blue-bell-500 focus-visible:ring-3 focus-visible:ring-blue-bell-500/20 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-onyx-900 shadow-xs hover:shadow-sm active:scale-[0.98]",
        commerce:
          "bg-commerce text-commerce-foreground hover:bg-commerce-hover active:bg-blue-bell-800 shadow-xs hover:shadow-sm active:scale-[0.98]",
        logistics:
          "bg-logistics text-logistics-foreground hover:bg-logistics-hover active:bg-blue-bell-800 shadow-xs active:scale-[0.98]",
        outline:
          "border border-border bg-card text-foreground hover:bg-blue-bell-50/70 hover:border-blue-bell-200 hover:text-blue-bell-800 active:bg-blue-bell-100/80 active:scale-[0.98]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-alabaster-100 hover:text-foreground active:bg-alabaster-200 active:scale-[0.98]",
        ghost:
          "hover:bg-blue-bell-50/70 hover:text-blue-bell-800 active:bg-blue-bell-100/80 active:scale-[0.98]",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 active:bg-destructive/30 focus-visible:border-destructive/40 focus-visible:ring-destructive/20",
        link: "text-blue-bell-700 underline-offset-4 hover:underline hover:text-blue-bell-800",
      },
      size: {
        default:
          "h-9 gap-1.5 px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        xs: "h-6 gap-1 px-2.5 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 px-3 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        lg: "h-10 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-9",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
