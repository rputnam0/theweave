import * as React from "react"
import { cn } from "./utils"

// Windows 95 Tab Component
export interface Win95TabProps extends React.HTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export const Win95Tab = React.forwardRef<HTMLButtonElement, Win95TabProps>(
  ({ className, active = false, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "px-3 py-1 text-foreground transition-none relative font-medium",
          active 
            ? "bg-background border-t-2 border-l-2 border-r-2 border-t-input border-l-input border-r-border -mb-[2px] z-10" 
            : "bg-muted border border-t-input border-l-input border-r-border border-b-border shadow-[inset_1px_1px_0_0_var(--input),inset_-1px_-1px_0_0_var(--muted-foreground)]",
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Win95Tab.displayName = "Win95Tab"

// Windows 95 Window Component
export interface Win95WindowProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  icon?: React.ReactNode;
  showControls?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

export const Win95Window = React.forwardRef<HTMLDivElement, Win95WindowProps>(
  ({ className, title, icon, showControls = false, onClose, onMinimize, onMaximize, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-background border-2 border-t-input border-l-input border-r-border border-b-border shadow-[2px_2px_0_0_rgba(0,0,0,0.5)] flex flex-col overflow-hidden",
          className
        )}
        {...props}
      >
        {title && (
          <div className="bg-primary h-[18px] px-1 flex items-center justify-between select-none shrink-0 m-[2px]">
            <div className="flex items-center gap-1 text-primary-foreground">
              {icon && <span className="w-4 h-4 flex items-center justify-center scale-75">{icon}</span>}
              <span className="font-bold text-[11px] leading-none mb-[1px] font-medium">{title}</span>
            </div>
            {showControls && (
              <div className="flex gap-[2px]">
                {onMinimize && (
                  <button
                    onClick={onMinimize}
                    className="w-[14px] h-[12px] bg-muted border border-t-input border-l-input border-r-border border-b-border flex items-center justify-center active:shadow-[inset_1px_1px_0_0_var(--border)]"
                  >
                    <span className="text-[10px] leading-none mb-[4px] font-bold">_</span>
                  </button>
                )}
                {onMaximize && (
                  <button
                    onClick={onMaximize}
                    className="w-[14px] h-[12px] bg-muted border border-t-input border-l-input border-r-border border-b-border flex items-center justify-center active:shadow-[inset_1px_1px_0_0_var(--border)]"
                  >
                    <span className="w-[8px] h-[7px] border border-border mb-[1px]"></span>
                  </button>
                )}
                {onClose && (
                  <button
                    onClick={onClose}
                    className="w-[14px] h-[12px] bg-muted border border-t-input border-l-input border-r-border border-b-border flex items-center justify-center active:shadow-[inset_1px_1px_0_0_var(--border)]"
                  >
                    <span className="text-[12px] leading-none font-bold">×</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    )
  }
)
Win95Window.displayName = "Win95Window"

// Windows 95 Panel (Inset/Outset)
export interface Win95PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'inset' | 'outset' | 'flat';
}

export const Win95Panel = React.forwardRef<HTMLDivElement, Win95PanelProps>(
  ({ className, variant = 'inset', children, ...props }, ref) => {
    const variantStyles = {
      inset: "border-2 border-t-muted-foreground border-l-muted-foreground border-r-input border-b-input shadow-[inset_-1px_-1px_0_0_var(--background),inset_1px_1px_0_0_var(--border)]",
      outset: "border-2 border-t-input border-l-input border-r-muted-foreground border-b-muted-foreground shadow-[inset_-1px_-1px_0_0_var(--border),inset_1px_1px_0_0_var(--background)]",
      flat: "border border-border"
    };

    return (
      <div
        ref={ref}
        className={cn(
          "bg-background",
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Win95Panel.displayName = "Win95Panel"

// Windows 95 Button
export interface Win95ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'toolbar';
}

export const Win95Button = React.forwardRef<HTMLButtonElement, Win95ButtonProps>(
  ({ className, variant = 'default', children, disabled, ...props }, ref) => {
    if (variant === 'toolbar') {
      return (
        <button
          ref={ref}
          disabled={disabled}
          className={cn(
            "px-2 py-1 bg-background text-foreground flex items-center justify-center transition-none font-medium",
            !disabled && "hover:border hover:border-t-input hover:border-l-input hover:border-r-border hover:border-b-border active:border-t-muted-foreground active:border-l-muted-foreground active:border-r-input active:border-b-input active:shadow-[inset_1px_1px_0_0_var(--border)]",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          {...props}
        >
          {children}
        </button>
      );
    }

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "px-4 py-1 bg-background text-foreground min-w-[75px] border transition-none font-medium",
          !disabled && "border-t-input border-l-input border-r-border border-b-border shadow-[inset_1px_1px_0_0_var(--input),inset_-1px_-1px_0_0_var(--muted-foreground)] active:border-t-muted-foreground active:border-l-muted-foreground active:border-r-input active:border-b-input active:shadow-[inset_1px_1px_0_0_var(--border)]",
          disabled && "border-border opacity-50 cursor-not-allowed",
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Win95Button.displayName = "Win95Button"

// Windows 95 Input
export interface Win95InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Win95Input = React.forwardRef<HTMLInputElement, Win95InputProps>(
  ({ className, disabled, ...props }, ref) => {
    return (
      <input
        ref={ref}
        disabled={disabled}
        className={cn(
          "bg-input-background text-foreground px-2 py-1 outline-none",
          "border-2 border-t-muted-foreground border-l-muted-foreground border-r-input border-b-input",
          disabled && "bg-muted text-muted-foreground cursor-not-allowed",
          className
        )}
        {...props}
      />
    )
  }
)
Win95Input.displayName = "Win95Input"

// Windows 95 Toolbar
export const Win95Toolbar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-background flex items-center gap-1 px-1 py-1 shadow-none",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Win95Toolbar.displayName = "Win95Toolbar"

// Windows 95 Status Bar
export const Win95StatusBar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-background border-t-2 border-t-muted-foreground flex items-center gap-2 px-2 py-1 h-6",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Win95StatusBar.displayName = "Win95StatusBar"

// Windows 95 Status Bar Panel
export const Win95StatusPanel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "border border-t-muted-foreground border-l-muted-foreground border-r-input border-b-input shadow-[inset_1px_1px_0_0_var(--border)] px-2 py-0.5 text-xs font-normal",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Win95StatusPanel.displayName = "Win95StatusPanel"

// Windows 95 Separator (for toolbars)
export const Win95Separator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "w-[2px] h-5 bg-gradient-to-r from-muted-foreground to-input mx-1",
          className
        )}
        {...props}
      />
    )
  }
)
Win95Separator.displayName = "Win95Separator"

// Windows 95 Menu Bar
export const Win95MenuBar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-background flex items-center gap-[2px] px-1 py-[1px] text-[11px] border-b border-muted-foreground/10",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Win95MenuBar.displayName = "Win95MenuBar"

// Windows 95 Menu Item
export const Win95MenuItem = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "px-1.5 py-0.5 text-foreground hover:bg-primary hover:text-primary-foreground transition-none select-none font-normal",
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Win95MenuItem.displayName = "Win95MenuItem"

// Windows 95 Group Box
export interface Win95GroupBoxProps extends React.HTMLAttributes<HTMLFieldSetElement> {
  label?: string;
  title?: string; // Adding title as alias for label
  legendClassName?: string;
}

export const Win95GroupBox = React.forwardRef<HTMLFieldSetElement, Win95GroupBoxProps>(
  ({ className, label, title, legendClassName, children, ...props }, ref) => {
    const displayLabel = label || title;
    return (
      <fieldset
        ref={ref}
        className={cn(
          "border-2 border-t-muted-foreground border-l-muted-foreground border-r-input border-b-input px-2 pb-2 pt-3",
          className
        )}
        {...props}
      >
        {displayLabel && (
          <legend className={cn("px-1 text-sm text-foreground -ml-1 font-medium", legendClassName)}>
            {displayLabel}
          </legend>
        )}
        {children}
      </fieldset>
    )
  }
)
Win95GroupBox.displayName = "Win95GroupBox"

// Windows 95 List Box
export const Win95ListBox = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-input-background border-2 border-t-muted-foreground border-l-muted-foreground border-r-input border-b-input shadow-[inset_-1px_-1px_0_0_var(--background),inset_1px_1px_0_0_var(--border)] overflow-auto",
          className
        )}
        {...props}
      />
    )
  }
)
Win95ListBox.displayName = "Win95ListBox"

// Windows 95 List Item
export interface Win95ListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
}

export const Win95ListItem = React.forwardRef<HTMLDivElement, Win95ListItemProps>(
  ({ className, selected, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "px-2 py-0.5 cursor-pointer font-normal",
          selected && "bg-primary text-primary-foreground",
          !selected && "hover:bg-primary/10",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Win95ListItem.displayName = "Win95ListItem"

// Windows 95 Divider
export const Win95Divider = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "h-[2px] bg-gradient-to-b from-muted-foreground to-input my-2",
          className
        )}
        {...props}
      />
    )
  }
)
Win95Divider.displayName = "Win95Divider"

// Windows 95 Start Button
export const Win95StartButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "px-2 py-0.5 bg-background text-foreground border-2 border-t-input border-l-input border-r-border border-b-border shadow-[inset_-1px_-1px_0_0_var(--border),inset_1px_1px_0_0_var(--background)] active:border-t-muted-foreground active:border-l-muted-foreground active:border-r-input active:border-b-input active:shadow-[inset_1px_1px_0_0_var(--border)] flex items-center gap-1 font-bold italic h-[22px]",
          className
        )}
        {...props}
      >
        <div className="w-4 h-4 bg-primary flex items-center justify-center -ml-1">
           <div className="w-2 h-2 bg-white rotate-45"></div>
        </div>
        Start
      </button>
    )
  }
)
Win95StartButton.displayName = "Win95StartButton"

// Windows 95 Taskbar Item
export const Win95TaskbarItem = React.forwardRef<HTMLButtonElement, Win95TabProps>(
  ({ className, active = false, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "px-2 py-0.5 text-xs text-foreground truncate max-w-[150px] flex items-center gap-1 h-[22px] transition-none font-normal",
          active 
            ? "bg-[var(--input)] border-2 border-t-muted-foreground border-l-muted-foreground border-r-input border-b-input shadow-[inset_1px_1px_0_0_var(--border)]" 
            : "bg-background border-2 border-t-input border-l-input border-r-border border-b-border shadow-[inset_-1px_-1px_0_0_var(--border),inset_1px_1px_0_0_var(--background)] active:border-t-muted-foreground active:border-l-muted-foreground active:border-r-input active:border-b-input active:shadow-[inset_1px_1px_0_0_var(--border)]",
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Win95TaskbarItem.displayName = "Win95TaskbarItem"