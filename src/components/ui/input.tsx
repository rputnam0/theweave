import * as React from "react";

import { cn } from "./utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-7 w-full min-w-0 border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white shadow-[inset_-1px_-1px_0_0_#dfdfdf,inset_1px_1px_0_0_#0a0a0a] px-2 py-1 text-sm bg-input-background transition-none outline-none file:inline-flex file:h-5 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus:border-t-black focus:border-l-black",
        className,
      )}
      {...props}
    />
  );
}

export { Input };