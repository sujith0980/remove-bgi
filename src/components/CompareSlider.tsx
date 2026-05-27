import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface CompareSliderProps {
  originalUrl: string;
  processedUrl: string;
  className?: string;
  hasTransparentGrid?: boolean;
}

export default function CompareSlider({
  originalUrl,
  processedUrl,
  className = '',
  hasTransparentGrid = true
}: CompareSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage (0-100)
  const [isDragging, setIsDragging] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(position);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 0) return;
    handleMove(e.touches[0].clientX);
  };

  // Setup ResizeObserver to track container width reactively and responsively
  useEffect(() => {
    if (!containerRef.current) return;
    
    setContainerWidth(containerRef.current.getBoundingClientRect().width);

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden rounded-xl border border-zinc-800 shadow-sm ${className}`}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      id="compare-slider-container"
    >
      {/* Original Image (Right side / Base) */}
      <div className="absolute inset-0 h-full w-full bg-zinc-950">
        <img
          src={originalUrl}
          alt="Original"
          className="h-full w-full object-contain"
          draggable={false}
          referrerPolicy="no-referrer"
        />
        {/* Badge: Original */}
        <span className="absolute bottom-3 right-3 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm z-10 select-none">
          Original
        </span>
      </div>

      {/* Transparent checkerboard background for processed image */}
      <div
        className="absolute inset-0 h-full overflow-hidden pointer-events-none"
        style={{
          width: `${sliderPosition}%`,
        }}
      >
        <div
          className="relative h-full"
          style={{
            // Keep the inner contents full width so they match the image underneath exactly
            width: containerWidth ? `${containerWidth}px` : '100%',
          }}
        >
          {/* Transparent Grid Pattern if requested */}
          <div
            className={`absolute inset-0 h-full w-full ${
              hasTransparentGrid ? 'bg-checkerboard' : 'bg-zinc-900'
            }`}
            style={{
              backgroundImage: hasTransparentGrid
                ? 'radial-gradient(ellipse at center, rgba(30,30,30,1) 0%, rgba(15,15,15,1) 100%)'
                : 'none',
            }}
          >
            {hasTransparentGrid && (
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(45deg, #ccc 25%, transparent 25%), 
                    linear-gradient(-45deg, #ccc 25%, transparent 25%), 
                    linear-gradient(45deg, transparent 75%, #ccc 75%), 
                    linear-gradient(-45deg, transparent 75%, #ccc 75%)
                  `,
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                }}
              />
            )}

            <img
              src={processedUrl}
              alt="Processed"
              className="absolute inset-0 h-full w-full object-contain"
              draggable={false}
              referrerPolicy="no-referrer"
              style={{
                width: containerWidth ? `${containerWidth}px` : '100%',
              }}
            />
          </div>

          {/* Badge: Removed BG */}
          <span className="absolute bottom-3 left-3 rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white shadow-sm z-10 select-none">
            Background Removed
          </span>
        </div>
      </div>

      {/* Interactive Slider Separator */}
      <div
        className="absolute bottom-0 top-0 w-1 cursor-ew-resize bg-white shadow-md z-20 group"
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onTouchStart={(e) => {
          setIsDragging(true);
        }}
        id="slider-divider"
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 shadow-lg flex items-center justify-center pointer-events-none transition-transform group-hover:scale-110 active:scale-95">
          <div className="flex space-x-1 text-zinc-300 font-bold select-none text-sm">
            <span>‹</span>
            <span>›</span>
          </div>
        </div>
      </div>
    </div>
  );
}
