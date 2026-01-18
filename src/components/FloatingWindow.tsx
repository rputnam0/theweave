import * as React from "react";
import { Resizable } from "re-resizable";

interface FloatingWindowProps {
  title: string;
  icon?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  initialWidth?: number;
  initialHeight?: number;
  initialX?: number;
  initialY?: number;
  minWidth?: number;
  minHeight?: number;
  zIndex: number;
  onFocus: () => void;
}

export function FloatingWindow({
  title,
  icon,
  onClose,
  children,
  initialWidth = 400,
  initialHeight = 300,
  initialX = 100,
  initialY = 100,
  minWidth = 300,
  minHeight = 200,
  zIndex,
  onFocus,
}: FloatingWindowProps) {
  const [position, setPosition] = React.useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
  const windowRef = React.useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only allow dragging from title bar
    if ((e.target as HTMLElement).closest('.window-title-bar')) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
      onFocus();
    }
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  return (
    <div
      ref={windowRef}
      className="fixed"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex,
      }}
      onMouseDown={() => onFocus()}
    >
      <Resizable
        defaultSize={{
          width: initialWidth,
          height: initialHeight,
        }}
        minWidth={minWidth}
        minHeight={minHeight}
        bounds="parent"
        handleStyles={{
          right: {
            right: '-4px',
            width: '8px',
            cursor: 'ew-resize',
          },
          bottom: {
            bottom: '-4px',
            height: '8px',
            cursor: 'ns-resize',
          },
          bottomRight: {
            right: '-4px',
            bottom: '-4px',
            width: '12px',
            height: '12px',
            cursor: 'nwse-resize',
          },
        }}
        enable={{
          top: false,
          right: true,
          bottom: true,
          left: false,
          topRight: false,
          bottomRight: true,
          bottomLeft: false,
          topLeft: false,
        }}
      >
        <div className="h-full flex flex-col bg-background border-2 border-t-white border-l-white border-r-black border-b-black shadow-[2px_2px_0_0_#808080,4px_4px_0_0_#000]">
          {/* Title Bar */}
          <div
            className="window-title-bar bg-primary h-[20px] px-1 flex items-center justify-between select-none cursor-move shrink-0"
            onMouseDown={handleMouseDown}
          >
            <div className="flex items-center gap-1 text-primary-foreground pointer-events-none">
              {icon && <span className="flex items-center">{icon}</span>}
              <span className="font-bold text-[11px] leading-none mb-[1px]">{title}</span>
            </div>
            <div className="flex gap-[2px]">
              <button
                className="w-[14px] h-[13px] bg-muted border border-t-white border-l-white border-r-black border-b-black flex items-center justify-center active:shadow-[inset_1px_1px_0_0_#000] pointer-events-auto"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <span className="text-[10px] leading-none mb-[3px] font-bold">_</span>
              </button>
              <button
                className="w-[14px] h-[13px] bg-muted border border-t-white border-l-white border-r-black border-b-black flex items-center justify-center active:shadow-[inset_1px_1px_0_0_#000] pointer-events-auto"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <div className="relative w-[9px] h-[8px] mb-[1px]">
                  <div className="absolute top-0 right-0 w-[6px] h-[5px] border-t-2 border-l border-r border-b border-black"></div>
                  <div className="absolute bottom-0 left-0 w-[6px] h-[5px] border-t-2 border-l border-r border-b border-black bg-muted z-10"></div>
                </div>
              </button>
              <button
                className="w-[14px] h-[13px] bg-muted border border-t-white border-l-white border-r-black border-b-black flex items-center justify-center active:shadow-[inset_1px_1px_0_0_#000] pointer-events-auto hover:bg-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
              >
                <span className="text-[12px] leading-none font-bold">×</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </div>
      </Resizable>
    </div>
  );
}
