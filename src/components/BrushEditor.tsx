import React, { useState, useRef, useEffect } from 'react';
import { Eraser, Scissors, Undo, RotateCcw, Check, X, ZoomIn, ZoomOut, Maximize, Sparkles, Sliders } from 'lucide-react';

interface BrushEditorProps {
  originalUrl: string;
  processedUrl: string; // Transparent background image
  onSave: (editedDataUrl: string) => void;
  onCancel: () => void;
  imageName: string;
}

export default function BrushEditor({
  originalUrl,
  processedUrl,
  onSave,
  onCancel,
  imageName
}: BrushEditorProps) {
  const [brushMode, setBrushMode] = useState<'erase' | 'restore' | 'wand'>('erase');
  const [wandTolerance, setWandTolerance] = useState(32);
  const [brushSize, setBrushSize] = useState(30);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 600 });
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalImgRef = useRef<HTMLImageElement | null>(null);
  const processedImgRef = useRef<HTMLImageElement | null>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);

  // Store coordinates of last mouse positions to smooth strokes
  const lastX = useRef<number | null>(null);
  const lastY = useRef<number | null>(null);

  // Pre-load images
  useEffect(() => {
    const origImg = new Image();
    if (originalUrl.startsWith('http') && !originalUrl.startsWith(window.location.origin)) {
      origImg.crossOrigin = 'anonymous';
    }
    origImg.src = originalUrl;
    originalImgRef.current = origImg;

    const procImg = new Image();
    if (processedUrl.startsWith('http') && !processedUrl.startsWith(window.location.origin)) {
      procImg.crossOrigin = 'anonymous';
    }
    procImg.src = processedUrl;
    processedImgRef.current = procImg;

    procImg.onload = () => {
      // Scale canvas to fit nicely inside the viewport
      const maxWidth = Math.min(window.innerWidth * 0.6, 800);
      const maxHeight = Math.min(window.innerHeight * 0.65, 550);

      let w = procImg.naturalWidth || 600;
      let h = procImg.naturalHeight || 600;

      // Maintain aspect ratio
      const ratio = w / h;
      if (w > maxWidth) {
        w = maxWidth;
        h = w / ratio;
      }
      if (h > maxHeight) {
        h = maxHeight;
        w = h * ratio;
      }

      setCanvasSize({ width: Math.round(w), height: Math.round(h) });
      setIsImageLoaded(true);
    };
  }, [originalUrl, processedUrl]);

  // Initial canvas draw once image is loaded
  useEffect(() => {
    if (!isImageLoaded || !canvasRef.current || !processedImgRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and draw processed transparent image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    try {
      ctx.drawImage(processedImgRef.current, 0, 0, canvas.width, canvas.height);
      // Save initial state to undo stack
      const dataUrl = canvas.toDataURL('image/png');
      setUndoStack([dataUrl]);
    } catch (e) {
      console.error('Error drawing image to canvas:', e);
    }
  }, [isImageLoaded, canvasSize]);

  // Save current canvas state to undo stack
  const saveState = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    setUndoStack(prev => {
      const next = [...prev, dataUrl];
      // Keep undo stack safe size
      if (next.length > 30) next.shift();
      return next;
    });
    setRedoStack([]); // Clear redo
  };

  const handleUndo = () => {
    if (undoStack.length <= 1) return; // Need at least the original state
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const nextStack = [...undoStack];
    const currentState = nextStack.pop(); // Remove current
    if (currentState) setRedoStack(prev => [...prev, currentState]);

    const previousStateUrl = nextStack[nextStack.length - 1];
    setUndoStack(nextStack);

    // Re-draw previous state
    const img = new Image();
    img.src = previousStateUrl;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const handleReset = () => {
    if (undoStack.length === 0 || !canvasRef.current || !processedImgRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    saveState();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(processedImgRef.current, 0, 0, canvas.width, canvas.height);
    
    // Save state after reset
    const dataUrl = canvas.toDataURL('image/png');
    setUndoStack(prev => [...prev, dataUrl]);
  };

  // Convert client coordinate into canvas coordinate
  const getCanvasCoords = (clientX: number, clientY: number): { x: number; y: number } | null => {
    if (!canvasRef.current) return null;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const drawStroke = (x: number, y: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !originalImgRef.current) return;

    if (lastX.current === null || lastY.current === null) {
      lastX.current = x;
      lastY.current = y;
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;

    if (brushMode === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.beginPath();
      ctx.moveTo(lastX.current, lastY.current);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      // Restore Mode using scratch canvas
      const scratch = document.createElement('canvas');
      scratch.width = canvas.width;
      scratch.height = canvas.height;
      const sCtx = scratch.getContext('2d');

      if (sCtx) {
        sCtx.lineCap = 'round';
        sCtx.lineJoin = 'round';
        sCtx.lineWidth = brushSize;
        sCtx.strokeStyle = 'rgba(0,0,0,1)';
        sCtx.beginPath();
        sCtx.moveTo(lastX.current, lastY.current);
        sCtx.lineTo(x, y);
        sCtx.stroke();

        // Overlay with original image
        sCtx.globalCompositeOperation = 'source-in';
        sCtx.drawImage(originalImgRef.current, 0, 0, canvas.width, canvas.height);

        // Stamp onto main canvas
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(scratch, 0, 0);
      }
    }

    lastX.current = x;
    lastY.current = y;
  };

  const runSmartWandRestore = (startX: number, startY: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !originalImgRef.current) return;

    const w = canvas.width;
    const h = canvas.height;

    // Create offscreen canvas for original image
    const offscreen = document.createElement('canvas');
    offscreen.width = w;
    offscreen.height = h;
    const oCtx = offscreen.getContext('2d');
    if (!oCtx) return;

    oCtx.drawImage(originalImgRef.current, 0, 0, w, h);
    const origImgData = oCtx.getImageData(0, 0, w, h);
    const origPixels = origImgData.data;

    // Read current canvas pixels so we can modify them
    const currentImgData = ctx.getImageData(0, 0, w, h);
    const currentPixels = currentImgData.data;

    const roundedX = Math.min(w - 1, Math.max(0, Math.round(startX)));
    const roundedY = Math.min(h - 1, Math.max(0, Math.round(startY)));

    const seedIndex = (roundedY * w + roundedX) * 4;
    const seedR = origPixels[seedIndex];
    const seedG = origPixels[seedIndex + 1];
    const seedB = origPixels[seedIndex + 2];
    const seedA = origPixels[seedIndex + 3];

    // If click is on a fully transparent or near-transparent original region, do nothing
    if (seedA < 5) return;

    // Use a flat visited array for maximum 60fps performance
    const visited = new Uint8Array(w * h);
    const queue: number[] = [];

    const startIdx = roundedY * w + roundedX;
    queue.push(startIdx);
    visited[startIdx] = 1;

    let head = 0;
    while (head < queue.length) {
      const currIdx = queue[head++];
      const cx = currIdx % w;
      const cy = Math.floor(currIdx / w);

      // 4-connectivity flood fill
      const neighbors = [
        [cx + 1, cy],
        [cx - 1, cy],
        [cx, cy + 1],
        [cx, cy - 1]
      ];

      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
          const nIndex = ny * w + nx;
          if (visited[nIndex] === 0) {
            visited[nIndex] = 1;
            const pIdx = nIndex * 4;
            const r = origPixels[pIdx];
            const g = origPixels[pIdx + 1];
            const b = origPixels[pIdx + 2];
            const a = origPixels[pIdx + 3];

            if (a > 5) {
              const rDiff = r - seedR;
              const gDiff = g - seedG;
              const bDiff = b - seedB;
              const distance = Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);

              if (distance <= wandTolerance) {
                queue.push(nIndex);
              }
            }
          }
        }
      }
    }

    // copy matched pixels
    for (let i = 0; i < queue.length; i++) {
      const idx = queue[i];
      const pIdx = idx * 4;
      currentPixels[pIdx] = origPixels[pIdx];
      currentPixels[pIdx + 1] = origPixels[pIdx + 1];
      currentPixels[pIdx + 2] = origPixels[pIdx + 2];
      currentPixels[pIdx + 3] = origPixels[pIdx + 3];
    }

    ctx.putImageData(currentImgData, 0, 0);
    saveState();
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!canvasRef.current) return;
    canvasRef.current.setPointerCapture(e.pointerId);
    
    const coords = getCanvasCoords(e.clientX, e.clientY);
    if (!coords) return;

    if (brushMode === 'wand') {
      runSmartWandRestore(coords.x, coords.y);
      return;
    }

    setIsDrawing(true);
    lastX.current = coords.x;
    lastY.current = coords.y;
    
    // Draw initial dot
    drawStroke(coords.x, coords.y);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    // Handle floating brush cursor position and visibility
    if (cursorRef.current && canvasRef.current) {
      if (brushMode === 'wand') {
        // Hide regular round sizing brush cursor for magic wand crosshair cursor
        cursorRef.current.style.display = 'none';
      } else {
        const rect = canvasRef.current.getBoundingClientRect();
        const withinX = e.clientX >= rect.left && e.clientX <= rect.right;
        const withinY = e.clientY >= rect.top && e.clientY <= rect.bottom;

        if (withinX && withinY) {
          cursorRef.current.style.display = 'block';
          cursorRef.current.style.left = `${e.clientX}px`;
          cursorRef.current.style.top = `${e.clientY}px`;
          // Scale with zoom
          const clientBrushSize = brushSize * (rect.width / canvasRef.current.width);
          cursorRef.current.style.width = `${clientBrushSize}px`;
          cursorRef.current.style.height = `${clientBrushSize}px`;
        } else {
          cursorRef.current.style.display = 'none';
        }
      }
    }

    if (brushMode === 'wand') return;
    if (!isDrawing) return;

    const coords = getCanvasCoords(e.clientX, e.clientY);
    if (!coords) return;

    drawStroke(coords.x, coords.y);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (brushMode === 'wand') {
      if (canvasRef.current) {
        canvasRef.current.releasePointerCapture(e.pointerId);
      }
      return;
    }
    if (!isDrawing) return;
    if (canvasRef.current) {
      canvasRef.current.releasePointerCapture(e.pointerId);
    }
    setIsDrawing(false);
    lastX.current = null;
    lastY.current = null;
    saveState();
  };

  const handleSave = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    onSave(dataUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-neutral-900 text-white" id="brush-editor-workspace">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-neutral-800 bg-neutral-950 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="rounded-lg bg-orange-600 p-1.5">
            <Scissors className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold">Tweak / Rub Out & Restore</h1>
            <p className="text-xs text-neutral-400">Refine transparency edges for {imageName}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onCancel}
            className="flex items-center space-x-1.5 rounded-lg border border-neutral-700 bg-transparent px-4 py-2 text-sm font-medium hover:bg-neutral-800 transition"
            id="editor-btn-cancel"
          >
            <X className="h-4 w-4" />
            <span>Cancel</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-1.5 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-lg hover:bg-emerald-500 transition"
            id="editor-btn-apply"
          >
            <Check className="h-4 w-4" />
            <span>Apply Changes</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex flex-1 flex-col md:flex-row overflow-hidden relative">
        {/* Hovering Brush Size Indicator */}
        <div
          ref={cursorRef}
          style={{ display: 'none' }}
          className="pointer-events-none fixed z-50 rounded-full border border-orange-500 bg-orange-500/20 -translate-x-1/2 -translate-y-1/2 mix-blend-difference"
        />

        {/* Left Side Tool Options (Sidebar) */}
        <div className="w-full md:w-80 flex-shrink-0 border-b md:border-b-0 md:border-r border-neutral-800 bg-neutral-950 p-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-6">
            {/* Mode Selectors */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Brush Mode</label>
              <div className="mt-2.5 grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => setBrushMode('erase')}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                    brushMode === 'erase'
                      ? 'border-orange-500 bg-orange-500/10 text-orange-400 shadow-md'
                      : 'border-neutral-800 bg-neutral-900/50 text-neutral-400 hover:bg-neutral-900 hover:text-white'
                  }`}
                  id="editor-btn-erase"
                >
                  <Eraser className="h-5 w-5 mb-1.5" />
                  <span className="font-bold text-[10px]">Erase</span>
                  <span className="text-[8px] text-neutral-500 mt-0.5 leading-tight text-center">Cut out</span>
                </button>

                <button
                  onClick={() => setBrushMode('restore')}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                    brushMode === 'restore'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-md'
                      : 'border-neutral-800 bg-neutral-900/50 text-neutral-400 hover:bg-neutral-900 hover:text-white'
                  }`}
                  id="editor-btn-restore"
                >
                  <Scissors className="h-5 w-5 mb-1.5 rotate-90" />
                  <span className="font-bold text-[10px]">Restore</span>
                  <span className="text-[8px] text-neutral-500 mt-0.5 leading-tight text-center">Brush back</span>
                </button>

                <button
                  onClick={() => setBrushMode('wand')}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                    brushMode === 'wand'
                      ? 'border-sky-500 bg-sky-500/10 text-sky-450 shadow-md'
                      : 'border-neutral-800 bg-neutral-900/50 text-neutral-400 hover:bg-neutral-900 hover:text-white'
                  }`}
                  id="editor-btn-wand"
                >
                  <Sparkles className="h-5 w-5 mb-1.5" />
                  <span className="font-bold text-[10px] flex items-center">Smart Wand</span>
                  <span className="text-[8px] text-sky-500 font-extrabold mt-0.5 leading-tight text-center">1-Click Auto</span>
                </button>
              </div>
            </div>

            {/* Conditional Settings Panel */}
            {brushMode !== 'wand' ? (
              /* Brush Size setting */
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold uppercase tracking-wider text-neutral-400">Brush Size</span>
                  <span className="font-mono text-orange-400 text-sm font-bold bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                    {brushSize}px
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-full accent-orange-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                  id="brush-size-range"
                />
                <div className="flex items-center justify-center h-20 bg-neutral-900/35 rounded-lg border border-neutral-850 overflow-hidden relative">
                  {/* Visual Circle Indicator of brush size */}
                  <div
                    className={`rounded-full border border-dashed transition-all ${
                      brushMode === 'erase' ? 'border-orange-500/80 bg-orange-500/10' : 'border-emerald-500/80 bg-emerald-500/10'
                    }`}
                    style={{
                      width: `${brushSize}px`,
                      height: `${brushSize}px`,
                      maxHeight: '74px',
                      maxWidth: '74px',
                    }}
                  />
                </div>
              </div>
            ) : (
              /* Tolerance setting for Smart Wand */
              <div className="space-y-2 bg-neutral-900/30 p-3.5 rounded-xl border border-neutral-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
                    <Sliders className="h-3 w-3 text-sky-400" />
                    <span>Color Tolerance</span>
                  </span>
                  <span className="font-mono text-sky-400 text-sm font-bold bg-neutral-950 px-2 py-0.5 rounded border border-neutral-850">
                    {wandTolerance}
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={wandTolerance}
                  onChange={(e) => setWandTolerance(Number(e.target.value))}
                  className="w-full accent-sky-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                  id="wand-tolerance-range"
                />
                <p className="text-[10px] text-neutral-400 leading-normal mt-1 bg-neutral-950/40 p-2 rounded border border-neutral-800/40">
                  ⚡ <strong>How to use:</strong> Tap any missing area in the image (like a laptop, desk, chair, or hands) and the app will automatically restore that entire contiguous object! Raise tolerance for wider colors, lower for narrow.
                </p>
              </div>
            )}

            {/* Undo/Redo & Reset controls */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">History Action</label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleUndo}
                  disabled={undoStack.length <= 1}
                  className="flex-1 flex items-center justify-center space-x-1 py-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-sm hover:bg-neutral-850 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  id="editor-btn-undo"
                  title="Undo last stroke"
                >
                  <Undo className="h-4 w-4" />
                  <span className="text-xs">Undo Stroke</span>
                </button>

                <button
                  onClick={handleReset}
                  className="px-3.5 py-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-850 transition"
                  id="editor-btn-reset-canvas"
                  title="Reset to absolute beginning"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Guidelines */}
          <div className="mt-8 border-t border-neutral-850 pt-5 text-xs text-neutral-500 space-y-2.5">
            <h4 className="font-semibold text-neutral-400">Pro Tips:</h4>
            <p>• Use <span className="font-semibold text-orange-400">Erase</span> to shave off stray background halos or fuzzy hair areas.</p>
            <p>• Use <span className="font-semibold text-emerald-400">Restore</span> to retrieve missed shirt straps, details, or items.</p>
            <p>• Double finger pinch on touch screens, or use the zoom buttons to inspect detailed layouts.</p>
          </div>
        </div>

        {/* Central Drawing Canvas Workspace Area */}
        <div
          ref={workspaceRef}
          className="flex-1 bg-neutral-900 p-8 flex items-center justify-center overflow-auto relative cursor-none"
          id="editor-drawing-sandbox"
        >
          {/* Zoom & View Utilities */}
          <div className="absolute top-4 right-4 z-10 flex bg-neutral-950/80 border border-neutral-800 backdrop-blur rounded-lg p-1 space-x-1">
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.25))}
              className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <div className="px-2 text-xs font-mono font-medium flex items-center text-neutral-300">
              {Math.round(zoomLevel * 100)}%
            </div>
            <button
              onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.25))}
              className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              title="Reset Zoom"
            >
              <Maximize className="h-4 w-4" />
            </button>
          </div>

          {!isImageLoaded ? (
            <div className="flex flex-col items-center space-y-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
              <p className="text-sm text-neutral-400">Setting up drawing board...</p>
            </div>
          ) : (
            /* Styled Border & Checkerboard behind transparent Canvas elements */
            <div
              className={`relative border-2 border-neutral-700 bg-checkerboard shadow-2xl transition-transform duration-75`}
              style={{
                width: `${canvasSize.width}px`,
                height: `${canvasSize.height}px`,
                transform: `scale(${zoomLevel})`,
                // Web checkerboard visual pattern
                backgroundImage: `
                  linear-gradient(45deg, #222 25%, transparent 25%), 
                  linear-gradient(-45deg, #222 25%, transparent 25%), 
                  linear-gradient(45deg, transparent 75%, #222 75%), 
                  linear-gradient(-45deg, transparent 75%, #222 75%)
                `,
                backgroundSize: '16px 16px',
                backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
              }}
            >
              <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="absolute inset-0 block touch-none select-none"
                style={{
                  cursor: brushMode === 'wand' ? 'crosshair' : 'none'
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
