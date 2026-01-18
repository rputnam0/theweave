import * as React from "react"
import { cn } from "./utils"

// Component 1 & 2: Tab (inactive/active)
export interface TabProps extends React.HTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  accent?: 'amber' | 'blue';
}

export const Tab = React.forwardRef<HTMLButtonElement, TabProps>(
  ({ className, active = false, accent = 'amber', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "px-2 py-1.5 font-mono text-sm transition-colors focus:outline-none flex items-center justify-center min-w-[10ch]",
          active 
            ? "bg-[var(--accent)] text-[var(--background)] font-bold" 
            : "text-[var(--foreground)] hover:bg-[var(--muted)]",
          accent === 'blue' && active && "bg-[var(--info)]",
          className
        )}
        {...props}
      >
        {active ? `> ${children} <` : `[ ${children} ]`}
      </button>
    )
  }
)
Tab.displayName = "Tab"

// Component 3: SectionHeader
export const SectionHeader = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className={cn("mt-8 mb-4", className)}>
        <h3
          ref={ref}
          className="font-mono text-xl font-bold text-[var(--accent)] mb-1"
          {...props}
        >
          &gt; {children}
        </h3>
        <AsciiSeparator />
      </div>
    )
  }
)
SectionHeader.displayName = "SectionHeader"

// Component 4: Rule
export const Rule = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "w-full overflow-hidden whitespace-nowrap text-[var(--muted-foreground)] opacity-50 font-mono my-4 select-none",
          className
        )}
        aria-hidden="true"
        {...props}
      >
        ================================================================================================================================================================================
      </div>
    )
  }
)
Rule.displayName = "Rule"

// New Component: AsciiSeparator
export const AsciiSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "w-full overflow-hidden whitespace-nowrap text-[var(--border)] font-mono select-none leading-none",
          className
        )}
        aria-hidden="true"
        {...props}
      >
        --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
      </div>
    )
  }
)
AsciiSeparator.displayName = "AsciiSeparator"

// Component 5: StatusLine
export interface StatusLineProps extends React.HTMLAttributes<HTMLDivElement> {
  status: string;
  label?: string;
  variant?: 'amber' | 'blue' | 'red' | 'green';
}

export const StatusLine = React.forwardRef<HTMLDivElement, StatusLineProps>(
  ({ className, status, label = "STATUS", variant = 'amber', ...props }, ref) => {
    const variantColor = {
      amber: "text-[var(--warning)]",
      blue: "text-[var(--info)]",
      red: "text-[var(--destructive)]",
      green: "text-[var(--success)]",
    }[variant];

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-2 font-mono text-xs",
          className
        )}
        {...props}
      >
        <span className={cn("animate-pulse", variantColor)}>●</span>
        <span className="text-[var(--muted-foreground)]">{label}:</span>
        <span className={cn("font-bold uppercase tracking-wider", variantColor)}>{status}</span>
      </div>
    )
  }
)
StatusLine.displayName = "StatusLine"

// Component 6: BreadcrumbPrompt
export const BreadcrumbPrompt = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-2 font-mono text-sm text-[var(--muted-foreground)]",
          className
        )}
        {...props}
      >
        <span className="select-none text-[var(--muted-foreground)] opacity-70">$</span>
        <div className="flex items-center gap-1">
          {children}
        </div>
      </div>
    )
  }
)
BreadcrumbPrompt.displayName = "BreadcrumbPrompt"

// Component 7: DividerPipe
export const DividerPipe = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center overflow-hidden h-full text-[var(--muted-foreground)] opacity-30 select-none w-6 shrink-0",
          className
        )}
        aria-hidden="true"
        {...props}
      >
        {Array.from({ length: 50 }).map((_, i) => (
          <span key={i} className="leading-none">|</span>
        ))}
      </div>
    )
  }
)
DividerPipe.displayName = "DividerPipe"

// Component 8: DividerDither
export const DividerDither = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center overflow-hidden h-full text-[var(--muted-foreground)] opacity-20 select-none w-6 shrink-0 font-mono text-xs",
          className
        )}
        aria-hidden="true"
        {...props}
      >
        {Array.from({ length: 40 }).map((_, i) => {
          const char = ['░', '▒', '▓', '▒'][i % 4];
          return <span key={i} className="leading-none">{char}</span>;
        })}
      </div>
    )
  }
)
DividerDither.displayName = "DividerDither"

// Component 9: QuoteBox
export const QuoteBox = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "font-mono text-sm my-6 relative pl-4",
          className
        )}
        {...props}
      >
         <div className="absolute left-0 top-0 bottom-0 w-px bg-[var(--primary)]" /> 
         {/* Could be replaced with ASCII pipe if strict ASCII is needed, but simple line + text box works well for quotes */}
         <div className="text-[var(--primary)] whitespace-pre-wrap py-2 bg-[var(--muted)]/20 px-4 border border-[var(--primary)] border-dashed">
            {children}
         </div>
      </div>
    )
  }
)
QuoteBox.displayName = "QuoteBox"

// New Component: AsciiCard
// Wraps content in an ASCII box
export interface AsciiCardProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    footer?: React.ReactNode;
}

export const AsciiCard = React.forwardRef<HTMLDivElement, AsciiCardProps>(
    ({ className, children, title, footer, ...props }, ref) => {
        return (
            <div ref={ref} className={cn("relative font-mono my-4 group", className)} {...props}>
                {/* Top Border */}
                <div className="flex items-center text-[var(--border)] group-hover:text-[var(--foreground)] transition-colors select-none">
                    <span>+</span>
                    <div className="flex-1 border-b border-dashed border-current mx-1" />
                    <span>+</span>
                </div>
                
                <div className="flex">
                     {/* Left Border */}
                    <div className="flex flex-col text-[var(--border)] group-hover:text-[var(--foreground)] transition-colors select-none">
                        <div className="h-full border-l border-dashed border-current w-px ml-[4px]" />
                    </div>

                    <div className="flex-1 px-4 py-2 min-w-0">
                        {title && (
                            <div className="mb-2 font-bold text-[var(--accent)] uppercase tracking-wider flex items-center gap-2">
                                <span>[{title}]</span>
                            </div>
                        )}
                        {children}
                        {footer && (
                            <div className="mt-4 pt-2 border-t border-dashed border-[var(--border)] group-hover:border-[var(--foreground)] transition-colors">
                                {footer}
                            </div>
                        )}
                    </div>

                    {/* Right Border */}
                    <div className="flex flex-col text-[var(--border)] group-hover:text-[var(--foreground)] transition-colors select-none">
                         <div className="h-full border-r border-dashed border-current w-px mr-[4px]" />
                    </div>
                </div>

                {/* Bottom Border */}
                <div className="flex items-center text-[var(--border)] group-hover:text-[var(--foreground)] transition-colors select-none">
                    <span>+</span>
                    <div className="flex-1 border-b border-dashed border-current mx-1" />
                    <span>+</span>
                </div>
            </div>
        );
    }
);
AsciiCard.displayName = "AsciiCard";
