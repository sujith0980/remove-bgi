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
      className={`relative select-none overflow-hidden rounded-xl border border-neutral-200 shadow-sm ${className}`}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      id="compare-slider-container"
    >
      {/* Original Image (Right side / Base) */}
      <div className="absolute inset-0 h-full w-full bg-neutral-100">
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
          className="relative h-full w-full"
          style={{
            // Keep the inner contents full width so they match the image underneath exactly
            width: containerRef.current?.getBoundingClientRect().width || '100vw',
          }}
        >
          {/* Transparent Grid Pattern if requested */}
          <div
            className={`absolute inset-0 h-full w-full ${
              hasTransparentGrid ? 'bg-checkerboard' : 'bg-neutral-50'
            }`}
            style={{
              backgroundImage: hasTransparentGrid
                ? 'radial-gradient(ellipse at center, rgba(255,255,255,1) 0%, rgba(240,240,240,1) 100%)'
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
                width: containerRef.current?.getBoundingClientRect().width || '100%',
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
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border border-neutral-300 shadow-lg flex items-center justify-center pointer-events-none transition-transform group-hover:scale-110 active:scale-95">
          <div className="flex space-x-1 text-neutral-500 font-bold select-none text-sm">
            <span>‹</span>
            <span>›</span>
          </div>
        </div>
      </div>
    </div>
  );
}
