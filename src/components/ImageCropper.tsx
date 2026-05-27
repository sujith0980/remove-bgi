import React, { useState, useEffect, useRef } from 'react';
import { Scissors, Check, X, Crop, RotateCcw, Image as ImageIcon, Sliders, Minimize } from 'lucide-react';

interface ImageCropperProps {
  imageSrc: string | File;
  name: string;
  onConfirm: (croppedBlob: Blob) => void;
  onSkip: () => void;
  onCancel: () => void;
}

interface CropBox {
  x: number;      // 0 to 1, normalized left coordinate
  y: number;      // 0 to 1, normalized top coordinate
  width: number;  // 0 to 1, normalized width index
  height: number; // 0 to 1, normalized height index
}

interface AspectRatioOption {
  id: string;
  name: string;
  ratio: number | null; // width / height, or null for Free
}

export default function ImageCropper({
  imageSrc,
  name,
  onConfirm,
  onSkip,
  onCancel
}: ImageCropperProps) {
  const [imgUrl, setImgUrl] = useState<string>('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Crop State (initially centering 85% of image)
  const [crop, setCrop] = useState<CropBox>({
    x: 0.1,
    y: 0.1,
    width: 0.8,
    height: 0.8
  });

  // Aspect ratio state
  const [activeRatioId, setActiveRatioId] = useState<string>('free');

  // Drag handles management
  const dragInfo = useRef<{
    active: boolean;
    handle: string; // 'nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w', 'move'
    startX: number;
    startY: number;
    startCrop: CropBox;
  } | null>(null);

  const aspectRatios: AspectRatioOption[] = [
    { id: 'free', name: 'Free-form', ratio: null },
    { id: '1:1', name: '1:1 Square (Avatar)', ratio: 1.0 },
    { id: '4:3', name: '4:3 Product (Shopify/eBay)', ratio: 4 / 3 },
    { id: '3:4', name: '3:4 Portrait (Biometric)', ratio: 3 / 4 },
    { id: '16:9', name: '16:9 Widescreen', ratio: 16 / 9 }
  ];

  // Convert File object to temporary URL
  useEffect(() => {
    let tempUrl = '';
    if (imageSrc instanceof File) {
      tempUrl = URL.createObjectURL(imageSrc);
      setImgUrl(tempUrl);
    } else if (typeof imageSrc === 'string') {
      setImgUrl(imageSrc);
    }

    return () => {
      // Clean up object URL to prevent memory leaks
      if (tempUrl) {
        URL.revokeObjectURL(tempUrl);
      }
    };
  }, [imageSrc]);

  // Adjust crop box when aspect ratio changes
  const applyRatioConstraint = (ratioId: string) => {
    setActiveRatioId(ratioId);
    if (!imageRef.current) return;

    const opt = aspectRatios.find(r => r.id === ratioId);
    if (!opt || opt.ratio === null) return;

    const imgWidth = imageRef.current.naturalWidth;
    const imgHeight = imageRef.current.naturalHeight;
    const imgRatio = imgWidth / imgHeight;

    // Normalize target aspect ratio to normalized container coordinates
    // R_norm = ratio / imgRatio
    const rNorm = opt.ratio / imgRatio;

    setCrop(prev => {
      let nextW = prev.width;
      let nextH = prev.width / rNorm;

      // Keep it inside bounds
      if (nextH > 1) {
        nextH = 1;
        nextW = nextH * rNorm;
      }
      if (nextW > 1) {
        nextW = 1;
        nextH = nextW / rNorm;
      }

      const nextX = Math.max(0, Math.min(1 - nextW, 0.5 - nextW / 2));
      const nextY = Math.max(0, Math.min(1 - nextH, 0.5 - nextH / 2));

      return {
        x: nextX,
        y: nextY,
        width: nextW,
        height: nextH
      };
    });
  };

  // Drag Event Handlers using high-precision PointerEvents (touch + click friendly)
  const handlePointerDown = (e: React.PointerEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent secondary buttons
    if (e.button !== 0) return;

    if (!containerRef.current) return;

    // Capture pointer to track coordinates outside elements smoothly
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    dragInfo.current = {
      active: true,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startCrop: { ...crop }
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragInfo.current || !dragInfo.current.active || !imageRef.current) return;
    e.preventDefault();

    const info = dragInfo.current;
    const rect = imageRef.current.getBoundingClientRect();

    if (rect.width === 0 || rect.height === 0) return;

    // Calculate delta normalized coordinates
    const deltaX = (e.clientX - info.startX) / rect.width;
    const deltaY = (e.clientY - info.startY) / rect.height;

    const start = info.startCrop;
    const currentRatioOpt = aspectRatios.find(r => r.id === activeRatioId);
    const lockedRatio = currentRatioOpt?.ratio || null;

    let nextCrop = { ...crop };

    if (info.handle === 'move') {
      // Free drag move
      nextCrop.x = Math.max(0, Math.min(1 - start.width, start.x + deltaX));
      nextCrop.y = Math.max(0, Math.min(1 - start.height, start.y + deltaY));
      setCrop(nextCrop);
      return;
    }

    // Normalized Aspect Modifier
    const imgRatio = imageRef.current.naturalWidth / imageRef.current.naturalHeight;
    const normRatio = lockedRatio ? lockedRatio / imgRatio : null;

    // Resize bounding limits
    const minSize = 0.08; // Min 8% of original image size to prevent collapse

    if (normRatio === null) {
      // FREE FORM RESIZING (No ratio locks)
      switch (info.handle) {
        case 'se': // Bottom-Right
          nextCrop.width = Math.max(minSize, Math.min(1 - start.x, start.width + deltaX));
          nextCrop.height = Math.max(minSize, Math.min(1 - start.y, start.height + deltaY));
          break;
        case 'sw': // Bottom-Left
          const maxW_sw = start.x + start.width;
          nextCrop.x = Math.max(0, Math.min(maxW_sw - minSize, start.x + deltaX));
          nextCrop.width = maxW_sw - nextCrop.x;
          nextCrop.height = Math.max(minSize, Math.min(1 - start.y, start.height + deltaY));
          break;
        case 'ne': // Top-Right
          const maxH_ne = start.y + start.height;
          nextCrop.width = Math.max(minSize, Math.min(1 - start.x, start.width + deltaX));
          nextCrop.y = Math.max(0, Math.min(maxH_ne - minSize, start.y + deltaY));
          nextCrop.height = maxH_ne - nextCrop.y;
          break;
        case 'nw': // Top-Left
          const maxW_nw = start.x + start.width;
          const maxH_nw = start.y + start.height;
          nextCrop.x = Math.max(0, Math.min(maxW_nw - minSize, start.x + deltaX));
          nextCrop.width = maxW_nw - nextCrop.x;
          nextCrop.y = Math.max(0, Math.min(maxH_nw - minSize, start.y + deltaY));
          nextCrop.height = maxH_nw - nextCrop.y;
          break;
        case 'n': // Top edge
          const maxH_n = start.y + start.height;
          nextCrop.y = Math.max(0, Math.min(maxH_n - minSize, start.y + deltaY));
          nextCrop.height = maxH_n - nextCrop.y;
          break;
        case 's': // Bottom edge
          nextCrop.height = Math.max(minSize, Math.min(1 - start.y, start.height + deltaY));
          break;
        case 'w': // Left edge
          const maxW_w = start.x + start.width;
          nextCrop.x = Math.max(0, Math.min(maxW_w - minSize, start.x + deltaX));
          nextCrop.width = maxW_w - nextCrop.x;
          break;
        case 'e': // Right edge
          nextCrop.width = Math.max(minSize, Math.min(1 - start.x, start.width + deltaX));
          break;
      }
    } else {
      // RATIO LOCKED RESIZING (Maintains specified proportion)
      let candidateWidth = start.width;
      let candidateHeight = start.height;

      switch (info.handle) {
        case 'se': // Bottom-Right
          // Base delta on the axis with larger movement
          if (Math.abs(deltaX) > Math.abs(deltaY * normRatio)) {
            candidateWidth = Math.max(minSize, Math.min(1 - start.x, start.width + deltaX));
            candidateHeight = candidateWidth / normRatio;
          } else {
            candidateHeight = Math.max(minSize, Math.min(1 - start.y, start.height + deltaY));
            candidateWidth = candidateHeight * normRatio;
          }
          if (candidateWidth + start.x <= 1 && candidateHeight + start.y <= 1) {
            nextCrop.width = candidateWidth;
            nextCrop.height = candidateHeight;
          }
          break;

        case 'sw': // Bottom-Left
          if (Math.abs(deltaX) > Math.abs(deltaY * normRatio)) {
            candidateWidth = Math.max(minSize, Math.min(start.x + start.width, start.width - deltaX));
            candidateHeight = candidateWidth / normRatio;
          } else {
            candidateHeight = Math.max(minSize, Math.min(1 - start.y, start.height + deltaY));
            candidateWidth = candidateHeight * normRatio;
          }

          if (candidateWidth <= start.x + start.width && candidateHeight + start.y <= 1) {
            nextCrop.x = start.x + start.width - candidateWidth;
            nextCrop.width = candidateWidth;
            nextCrop.height = candidateHeight;
          }
          break;

        case 'ne': // Top-Right
          if (Math.abs(deltaX) > Math.abs(deltaY * normRatio)) {
            candidateWidth = Math.max(minSize, Math.min(1 - start.x, start.width + deltaX));
            candidateHeight = candidateWidth / normRatio;
          } else {
            candidateHeight = Math.max(minSize, Math.min(start.y + start.height, start.height - deltaY));
            candidateWidth = candidateHeight * normRatio;
          }

          if (candidateWidth + start.x <= 1 && candidateHeight <= start.y + start.height) {
            nextCrop.y = start.y + start.height - candidateHeight;
            nextCrop.width = candidateWidth;
            nextCrop.height = candidateHeight;
          }
          break;

        case 'nw': // Top-Left
          if (Math.abs(deltaX) > Math.abs(deltaY * normRatio)) {
            candidateWidth = Math.max(minSize, Math.min(start.x + start.width, start.width - deltaX));
            candidateHeight = candidateWidth / normRatio;
          } else {
            candidateHeight = Math.max(minSize, Math.min(start.y + start.height, start.height - deltaY));
            candidateWidth = candidateHeight * normRatio;
          }

          if (candidateWidth <= start.x + start.width && candidateHeight <= start.y + start.height) {
            nextCrop.x = start.x + start.width - candidateWidth;
            nextCrop.width = candidateWidth;
            nextCrop.y = start.y + start.height - candidateHeight;
            nextCrop.height = candidateHeight;
          }
          break;

        // Sides in aspect-ratio mode adapt on both edges centered or simple stretch
        case 'n':
          candidateHeight = Math.max(minSize, Math.min(start.y + start.height, start.height - deltaY));
          candidateWidth = candidateHeight * normRatio;
          if (candidateWidth <= 1 && candidateHeight <= start.y + start.height) {
            nextCrop.y = start.y + start.height - candidateHeight;
            nextCrop.height = candidateHeight;
            // Center horizontal adaptation
            nextCrop.x = Math.max(0, Math.min(1 - candidateWidth, start.x + (start.width - candidateWidth) / 2));
            nextCrop.width = candidateWidth;
          }
          break;
        case 's':
          candidateHeight = Math.max(minSize, Math.min(1 - start.y, start.height + deltaY));
          candidateWidth = candidateHeight * normRatio;
          if (candidateWidth <= 1 && candidateHeight + start.y <= 1) {
            nextCrop.height = candidateHeight;
            nextCrop.x = Math.max(0, Math.min(1 - candidateWidth, start.x + (start.width - candidateWidth) / 2));
            nextCrop.width = candidateWidth;
          }
          break;
        case 'w':
          candidateWidth = Math.max(minSize, Math.min(start.x + start.width, start.width - deltaX));
          candidateHeight = candidateWidth / normRatio;
          if (candidateHeight <= 1 && candidateWidth <= start.x + start.width) {
            nextCrop.x = start.x + start.width - candidateWidth;
            nextCrop.width = candidateWidth;
            nextCrop.y = Math.max(0, Math.min(1 - candidateHeight, start.y + (start.height - candidateHeight) / 2));
            nextCrop.height = candidateHeight;
          }
          break;
        case 'e':
          candidateWidth = Math.max(minSize, Math.min(1 - start.x, start.width + deltaX));
          candidateHeight = candidateWidth / normRatio;
          if (candidateHeight <= 1 && candidateWidth + start.x <= 1) {
            nextCrop.width = candidateWidth;
            nextCrop.y = Math.max(0, Math.min(1 - candidateHeight, start.y + (start.height - candidateHeight) / 2));
            nextCrop.height = candidateHeight;
          }
          break;
      }
    }

    setCrop(nextCrop);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragInfo.current) {
      if (dragInfo.current.active) {
        try {
          (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        } catch (_) {}
      }
      dragInfo.current = null;
    }
  };

  // Perform Cropping on canvas relative to full-resolution master
  const handleConfirmCrop = () => {
    if (!imageRef.current || !imgUrl) return;

    const img = imageRef.current;
    const canvas = document.createElement('canvas');

    const sourceX = crop.x * img.naturalWidth;
    const sourceY = crop.y * img.naturalHeight;
    const sourceWidth = crop.width * img.naturalWidth;
    const sourceHeight = crop.height * img.naturalHeight;

    canvas.width = Math.round(sourceWidth);
    canvas.height = Math.round(sourceHeight);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      alert('Could not initialize graphic canvas context for cropping.');
      return;
    }

    // Draw the subregion of the original high-resolution image
    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    // Convert trimmed section to PNG blob
    canvas.toBlob((blob) => {
      if (blob) {
        onConfirm(blob);
      } else {
        alert('Failed to extract crop pixels from canvas.');
      }
    }, 'image/png', 1.0);
  };

  // Preset quick layout helpers
  const handleResetCrop = () => {
    setCrop({
      x: 0.1,
      y: 0.1,
      width: 0.8,
      height: 0.8
    });
    setActiveRatioId('free');
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-8 flex flex-col justify-center animate-fadeIn font-sans">
      
      {/* Visual Title Header Grid */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-neutral-150 pb-5 mb-6 gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono font-bold text-orange-600 tracking-wider flex items-center gap-1">
            <Minimize className="h-3 w-3" /> Step 1: Trim & Optimize Area
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-950 tracking-tight mt-1">
            Cropping Sandbox: {name}
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5 font-medium leading-relaxed">
            By cropping irrelevant corners, you can restrict boundary calculations, achieve <strong>faster local background removal</strong>, and protect memory.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
          <button
            onClick={onCancel}
            className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-bold text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50 active:scale-98 transition flex items-center gap-1.5 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
            <span>Cancel</span>
          </button>
          <button
            onClick={onSkip}
            className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-bold text-neutral-700 hover:text-neutral-950 hover:bg-neutral-50 active:scale-98 transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>Skip & Process Full Image</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Left Side: Dynamic Workspace Area (3 Cols) */}
        <div className="lg:col-span-3 flex flex-col items-center justify-center p-3 sm:p-6 rounded-2xl border border-neutral-150 bg-neutral-50/50 relative overflow-hidden min-h-[350px] md:min-h-[460px]">
          
          <div 
            ref={containerRef}
            className="relative select-none max-w-full flex items-center justify-center"
            style={{ touchAction: 'none' }}
          >
            {/* The Actual Loaded Image */}
            <img
              ref={imageRef}
              src={imgUrl}
              alt="Cropping target"
              className="max-h-[350px] md:max-h-[440px] w-auto max-w-full rounded bg-white shadow-xs object-contain pointer-events-none"
              onLoad={() => setImageLoaded(true)}
              referrerPolicy="no-referrer"
            />

            {imageLoaded && (
              <>
                {/* 1. Transparent Overlay Grid Darkened Panes */}
                <div className="absolute inset-0 pointer-events-none bg-black/50 z-10 rounded">
                  {/* Outer cutouts dynamically implemented with styled segments */}
                  {/* Top Backdrop */}
                  <div 
                    className="absolute bg-black/35 top-0 left-0 right-0" 
                    style={{ height: `${crop.y * 100}%` }}
                  />
                  {/* Bottom Backdrop */}
                  <div 
                    className="absolute bg-black/35 bottom-0 left-0 right-0" 
                    style={{ height: `${(1 - crop.y - crop.height) * 100}%` }}
                  />
                  {/* Left Backdrop */}
                  <div 
                    className="absolute bg-black/35 left-0" 
                    style={{ 
                      top: `${crop.y * 100}%`, 
                      bottom: `${(1 - crop.y - crop.height) * 100}%`,
                      width: `${crop.x * 100}%` 
                    }}
                  />
                  {/* Right Backdrop */}
                  <div 
                    className="absolute bg-black/35 right-0" 
                    style={{ 
                      top: `${crop.y * 100}%`, 
                      bottom: `${(1 - crop.y - crop.height) * 100}%`,
                      width: `${(1 - crop.x - crop.width) * 100}%` 
                    }}
                  />
                </div>

                {/* 2. Clear Interactive Inner Active Crop Box */}
                <div
                  className="absolute border border-dashed border-white/90 shadow-[0_0_0_4000px_rgba(0,0,0,0)] z-20 cursor-grab active:cursor-grabbing group"
                  style={{
                    left: `${crop.x * 100}%`,
                    top: `${crop.y * 100}%`,
                    width: `${crop.width * 100}%`,
                    height: `${crop.height * 100}%`
                  }}
                  onPointerDown={(e) => handlePointerDown(e, 'move')}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                >
                  {/* Fine Photographic Rule of Thirds Guideline grid lines */}
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                    <div className="border-r border-b border-white/20" />
                    <div className="border-r border-b border-white/20" />
                    <div className="border-b border-white/20" />
                    <div className="border-r border-b border-white/20" />
                    <div className="border-r border-b border-white/20" />
                    <div className="border-b border-white/20" />
                    <div className="border-r border-white/20" />
                    <div className="border-r border-white/20" />
                    <div className="border-none" />
                  </div>

                  {/* Aesthetic white line borders */}
                  <div className="absolute inset-0 border border-white/40 pointer-events-none" />

                  {/* Classic L-Shape Corner Overlay borders */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-3 border-l-3 border-white pointer-events-none" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-3 border-r-3 border-white pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-3 border-l-3 border-white pointer-events-none" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-3 border-r-3 border-white pointer-events-none" />

                  {/* Corner resizing touch nodes */}
                  {/* Top-Left */}
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 'nw')}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    className="absolute -top-2.5 -left-2.5 w-6 h-6 rounded-full border border-neutral-300 bg-white shadow-md cursor-nwse-resize hover:bg-orange-500 hover:border-orange-600 transition flex items-center justify-center"
                    style={{ touchAction: 'none' }}
                  />
                  {/* Top-Right */}
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 'ne')}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full border border-neutral-300 bg-white shadow-md cursor-nesw-resize hover:bg-orange-500 hover:border-orange-600 transition flex items-center justify-center"
                    style={{ touchAction: 'none' }}
                  />
                  {/* Bottom-Left */}
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 'sw')}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    className="absolute -bottom-2.5 -left-2.5 w-6 h-6 rounded-full border border-neutral-300 bg-white shadow-md cursor-nesw-resize hover:bg-orange-500 hover:border-orange-600 transition flex items-center justify-center"
                    style={{ touchAction: 'none' }}
                  />
                  {/* Bottom-Right */}
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 'se')}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    className="absolute -bottom-2.5 -right-2.5 w-6 h-6 rounded-full border border-neutral-300 bg-white shadow-md cursor-nwse-resize hover:bg-orange-500 hover:border-orange-600 transition flex items-center justify-center"
                    style={{ touchAction: 'none' }}
                  />

                  {/* Edge midpoint resizing handles for standard adjustments */}
                  {/* Top Mid */}
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 'n')}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-3 rounded-md border border-neutral-300 bg-white shadow-xs cursor-ns-resize hover:bg-orange-500 transition"
                    style={{ touchAction: 'none' }}
                  />
                  {/* Bottom Mid */}
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 's')}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-3 rounded-md border border-neutral-300 bg-white shadow-xs cursor-ns-resize hover:bg-orange-500 transition"
                    style={{ touchAction: 'none' }}
                  />
                  {/* Left Mid */}
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 'w')}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-4 rounded-md border border-neutral-300 bg-white shadow-xs cursor-ew-resize hover:bg-orange-500 transition"
                    style={{ touchAction: 'none' }}
                  />
                  {/* Right Mid */}
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 'e')}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-4 rounded-md border border-neutral-300 bg-white shadow-xs cursor-ew-resize hover:bg-orange-500 transition"
                    style={{ touchAction: 'none' }}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Side: Control Panels & Presets (1 Col) */}
        <div className="space-y-6">
          
          {/* Preset Aspect Ratio Grid */}
          <div className="rounded-2xl border border-neutral-150 p-5 bg-white space-y-4">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-0.5 tracking-wider font-mono">Aspect Templates</span>
            <div className="flex flex-col space-y-2">
              {aspectRatios.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => applyRatioConstraint(opt.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-bold transition duration-150 text-left ${
                    activeRatioId === opt.id
                      ? 'border-orange-500 bg-orange-50/20 text-orange-700'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                  }`}
                >
                  <span>{opt.name}</span>
                  {activeRatioId === opt.id && (
                    <span className="h-4 w-4 bg-orange-500 text-white rounded-full flex items-center justify-center text-[10px]">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Guidelines Section */}
          <div className="p-4 rounded-xl border border-orange-100 bg-orange-50/30 text-[11px] text-neutral-500 leading-relaxed space-y-2.5">
            <span className="font-extrabold text-orange-800 text-xs block">Pro Tips</span>
            <p>Drag the center of the crop grid to relocate the window. Pull the thick circular corners to scale locked aspects.</p>
            <p>By fitting the borders tightly around your subject, you ensure the AI model isolates delicate outline structures (like hair locks or transparent garments) with higher pixel efficiency.</p>
          </div>

          {/* Action Trigger Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={handleConfirmCrop}
              className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 text-white px-5 py-3.5 text-xs font-extrabold shadow-sm transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Scissors className="h-4 w-4" />
              <span>Confirm & Erase Background</span>
            </button>
            <button
              onClick={handleResetCrop}
              className="w-full rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 px-5 py-3 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 text-neutral-400" />
              <span>Reset Boundaries</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
