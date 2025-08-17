import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ResizeHandleProps {
  onResize: (width: number) => void;
  className?: string;
}

export function ResizeHandle({ onResize, className }: ResizeHandleProps) {
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const deltaX = e.clientX - startXRef.current;
      const newWidth = Math.max(60, startWidthRef.current + deltaX);
      onResize(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.userSelect = '';
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, onResize]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const headerElement = e.currentTarget.closest('th');
    if (headerElement) {
      startXRef.current = e.clientX;
      startWidthRef.current = headerElement.offsetWidth;
      setIsResizing(true);
    }
  };

  return (
    <div
      className={cn(
        "absolute right-0 top-0 h-full w-1 ",
        "bg-transparent hover:bg-primary/20 transition-colors",
        "after:content-[''] after:absolute after:right-[-2px] after:top-0 after:h-full after:w-1",
        "after:bg-primary/50 after:opacity-0 hover:after:opacity-100",
        isResizing && "after:opacity-100",
        className
      )}
      onMouseDown={handleMouseDown}
    />
  );
}