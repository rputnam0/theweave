import * as React from "react";
import { Slot } from "@radix-ui/react-slot@1.1.2";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-2 border-t-white border-l-white border-r-black border-b-black shadow-[inset_-1px_-1px_0_0_#0a0a0a,inset_1px_1px_0_0_#dfdfdf] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white active:shadow-[inset_1px_1px_0_0_#0a0a0a]",
        destructive:
          "bg-background text-red-600 border-2 border-t-white border-l-white border-r-black border-b-black shadow-[inset_-1px_-1px_0_0_#0a0a0a,inset_1px_1px_0_0_#dfdfdf] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white active:shadow-[inset_1px_1px_0_0_#0a0a0a]",
        outline:
          "border-2 bg-background text-foreground border-t-white border-l-white border-r-black border-b-black shadow-[inset_-1px_-1px_0_0_#0a0a0a,inset_1px_1px_0_0_#dfdfdf] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white",
        secondary:
          "bg-muted text-foreground border-2 border-t-white border-l-white border-r-black border-b-black shadow-[inset_-1px_-1px_0_0_#0a0a0a,inset_1px_1px_0_0_#dfdfdf] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white",
        ghost:
          "hover:bg-primary hover:text-primary-foreground transition-none",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
    }
>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = "Button";

export { Button, buttonVariants };