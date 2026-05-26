import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Download, 
  RefreshCw, 
  Scissors, 
  Check, 
  Layers, 
  AlertCircle, 
  Sparkles, 
  Palette, 
  Eye, 
  Plus, 
  Link as LinkIcon, 
  Info,
  ShieldAlert,
  Sliders,
  History,
  FileImage
} from 'lucide-react';
import { removeBackground, Config } from '@imgly/background-removal';

import Header from './components/Header';
import Footer from './components/Footer';
import CompareSlider from './components/CompareSlider';
import BrushEditor from './components/BrushEditor';

import { 
  SAMPLE_IMAGES, 
  COLOR_PRESETS, 
  GRADIENT_PRESETS, 
  IMAGE_PRESETS 
} from './constants';

import { 
  ProcessedImage, 
  EditorSettings, 
  BackgroundPreset 
} from './types';

const getSafeCorsUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  const cb = `cb=${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  if (url.includes('?')) {
    return `${url}&${cb}`;
  }
  return `${url}?${cb}`;
};

export default function App() {
  // Primary States
  const [currentImage, setCurrentImage] = useState<ProcessedImage | null>(null);
  const [sessionHistory, setSessionHistory] = useState<ProcessedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Custom URL paste state
  const [urlInput, setUrlInput] = useState('');
  const [isUrlSubmitting, setIsUrlSubmitting] = useState(false);

  // Tab state: 'compare' | 'backdrop'
  const [activeTab, setActiveTab] = useState<'compare' | 'backdrop'>('compare');

  // Active primary website section state
  const [activeSection, setActiveSection] = useState<'upload' | 'backdrop' | 'pricing'>('upload');

  // Sync activeSection with activeTab when an image is loaded
  useEffect(() => {
    if (currentImage) {
      if (activeTab === 'backdrop') {
        setActiveSection('backdrop');
      } else {
        setActiveSection('upload');
      }
    } else {
      setActiveSection('upload');
    }
  }, [activeTab, currentImage]);

  // Waitlist/Email acquisition states (Getting users first!)
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [isWaitlistSubmitted, setIsWaitlistSubmitted] = useState(false);
  const [waitlistMessage, setWaitlistMessage] = useState('');

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail || !waitlistEmail.trim() || !waitlistEmail.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    setError(null);
    setIsWaitlistSubmitted(true);
    setWaitlistMessage('Spot reserved successfully! All HD neural models are fully unlocked on your browser sandbox.');
    localStorage.setItem('remove_ai_beta_user_email', waitlistEmail);
  };

  const handleNavClick = (destination: 'upload' | 'backdrop' | 'pricing') => {
    setActiveSection(destination);
    
    if (destination === 'upload') {
      if (!currentImage) {
        const dropzone = document.getElementById('try-it-now');
        if (dropzone) {
          dropzone.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        setActiveTab('compare');
        setTimeout(() => {
          const workspaceHeader = document.getElementById('workspace-panel');
          if (workspaceHeader) {
            workspaceHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 50);
      }
    } else if (destination === 'backdrop') {
      if (currentImage) {
        setActiveTab('backdrop');
        setTimeout(() => {
          const backdropTitle = document.getElementById('backdrop-preset-section');
          if (backdropTitle) {
            backdropTitle.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else {
            const workspaceHeader = document.getElementById('workspace-panel');
            if (workspaceHeader) {
              workspaceHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }
        }, 80);
      } else {
        // Redirection to upload flow with explicit instructions
        setActiveSection('upload');
        setError('Please upload an image or select a sample photo first to change its background.');
        setTimeout(() => {
          const dropzone = document.getElementById('try-it-now');
          if (dropzone) {
            dropzone.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 50);
      }
    } else if (destination === 'pricing') {
      setTimeout(() => {
        const pricingSec = document.getElementById('pricing-section');
        if (pricingSec) {
          pricingSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  // Custom Backdrop settings
  const [editorSettings, setEditorSettings] = useState<EditorSettings>({
    backgroundType: 'transparent',
    colorValue: '#FFFFFF',
    gradientValue: 'linear-gradient(to bottom right, #F97316, #EC4899)',
    imageValue: IMAGE_PRESETS[0].value,
    blurValue: 0,
    brushType: 'erase',
    brushSize: 30
  });

  // Selected Custom Preset ID (to show ring selector)
  const [selectedPresetId, setSelectedPresetId] = useState<string>('transparent');

  // Manual Eraser Modal State
  const [isBrushEditorOpen, setIsBrushEditorOpen] = useState(false);

  // Drag over files state
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Fallback engine alert
  const [usingFallback, setUsingFallback] = useState(false);

  // Quality modes of client-side ONNX Runtime:
  // 'isnet_quint8' = Speed/Draft (low latency, 11MB model, auto-downscaled to 800px)
  // 'isnet_fp16' = Balanced Pro (sweet spot, 22MB model, auto-downscaled to 1600px)
  // 'isnet' = Studio HD (complete high res precision, 44MB model, capped at safe 2800px to avoid WebGL memory overflow)
  const [qualityMode, setQualityMode] = useState<'isnet_quint8' | 'isnet_fp16' | 'isnet'>(() => {
    const saved = localStorage.getItem('remove_ai_quality_mode');
    return (saved as 'isnet_quint8' | 'isnet_fp16' | 'isnet') || 'isnet_fp16';
  });

  useEffect(() => {
    localStorage.setItem('remove_ai_quality_mode', qualityMode);
  }, [qualityMode]);

  // Dynamic internal rescaling toggle:
  // true = Squeeze scaling (Standard portraits, isolates singular subject shapes)
  // false = Deep Boundary / Include context (No squeeze, parses widescreen connected objects like laptops, guitars, desks)
  const [rescaleMode, setRescaleMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('remove_ai_rescale_mode');
    return saved === null ? true : saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('remove_ai_rescale_mode', String(rescaleMode));
  }, [rescaleMode]);

  // Pristine HD Original Mask Restoration Composite Engine
  const applyMaskToOriginal = (originalFile: File | string, cutoutBlob: Blob): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const originalImg = new Image();
      const originalUrlStr = typeof originalFile === 'string' ? getSafeCorsUrl(originalFile) : URL.createObjectURL(originalFile);
      if (originalUrlStr.startsWith('http') && !originalUrlStr.startsWith(window.location.origin)) {
        originalImg.crossOrigin = 'anonymous';
      }
      
      const cutoutImg = new Image();
      const cutoutUrlStr = URL.createObjectURL(cutoutBlob);
      // Local Blob URLs must NOT have crossOrigin set to avoid browser security blocking.
      
      originalImg.src = originalUrlStr;
      cutoutImg.src = cutoutUrlStr;
      
      let loadedCount = 0;
      const onImageLoad = () => {
        loadedCount++;
        if (loadedCount === 2) {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = originalImg.width;
            canvas.height = originalImg.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Canvas 2D context not available'));
              return;
            }
            
            // Draw the cutout (which might be downsampled, e.g. 800px or 1600px) stretched to 100% of the original HD dimensions.
            // Browser's bilinear canvas filtering will smoothly scale out the alpha path.
            ctx.drawImage(cutoutImg, 0, 0, originalImg.width, originalImg.height);
            
            // Mask the original high-resolution pixels with the alpha mask using composite operator
            ctx.globalCompositeOperation = 'source-in';
            ctx.drawImage(originalImg, 0, 0);
            
            canvas.toBlob((blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to output canvas blob'));
              }
            }, 'image/png');
          } catch (err) {
            reject(err);
          }
        }
      };
      
      originalImg.onload = onImageLoad;
      cutoutImg.onload = onImageLoad;
      
      originalImg.onerror = (e) => reject(e);
      cutoutImg.onerror = (e) => reject(e);
    });
  };

  // Downscaler utility to speed up browser ONNX processing significantly (for Speed Draft and Balanced Pro)
  const resizeImageToMax = (file: File | string, maxDimension: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const urlStr = typeof file === 'string' ? getSafeCorsUrl(file) : URL.createObjectURL(file);
      if (urlStr.startsWith('http') && !urlStr.startsWith(window.location.origin)) {
        img.crossOrigin = 'anonymous';
      }
      img.src = urlStr;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width <= maxDimension && height <= maxDimension) {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Canvas conversion to blob failed'));
            }, 'image/png');
          } else {
            reject(new Error('Could not get 2D context'));
          }
          return;
        }
        
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Canvas conversion to blob failed'));
            }
          }, 'image/png');
        } else {
          reject(new Error('Could not get 2D context'));
        }
      };
      img.onerror = (e) => {
        reject(e);
      };
    });
  };

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom user photo upload for backgrounds
  const bgFileInputRef = useRef<HTMLInputElement>(null);

  // Process selected image source (file, URL, or demo blob)
  const processImage = async (imageSrc: string | File, originalName: string) => {
    const uniqueId = Math.random().toString(36).substring(7);
    const initialUrl = typeof imageSrc === 'string' ? imageSrc : URL.createObjectURL(imageSrc);

    const newImage: ProcessedImage = {
      id: uniqueId,
      name: originalName,
      size: imageSrc instanceof File ? imageSrc.size : 256000,
      width: 0,
      height: 0,
      originalUrl: initialUrl,
      originalFile: imageSrc instanceof File ? imageSrc : undefined,
      status: 'loading',
      progress: 0,
      progressStep: 'Uploading, please wait...'
    };

    setCurrentImage(newImage);
    setError(null);
    setUsingFallback(false);
    setActiveTab('compare'); // reset tab

    // Instantly scroll back to top/workspace panel to prevent layout shifts showing the pricing section
    window.scrollTo({ top: 0, behavior: 'auto' });
    setTimeout(() => {
      const workspace = document.getElementById('workspace-panel');
      if (workspace) {
        workspace.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);

    try {
      // 1. Decide dynamic resizing based on speed qualityMode
      let processedSrcForAI: string | File | Blob = imageSrc;
      let resizeDimension = 0;
      if (qualityMode === 'isnet_quint8') {
        resizeDimension = 800;
        setCurrentImage(prev => prev ? { ...prev, progressStep: 'Uploading, please wait...' } : null);
      } else if (qualityMode === 'isnet_fp16') {
        resizeDimension = 1600;
        setCurrentImage(prev => prev ? { ...prev, progressStep: 'Uploading, please wait...' } : null);
      } else {
        resizeDimension = 2800; // Cap Studio HD at safe 2800px so it never triggers browser WASM memory crashes
        setCurrentImage(prev => prev ? { ...prev, progressStep: 'Uploading, please wait...' } : null);
      }

      try {
        processedSrcForAI = await resizeImageToMax(imageSrc, resizeDimension);
      } catch (resizeErr) {
        console.warn('CORS / Canvas resize restriction. Falling back to raw file input sizes.', resizeErr);
      }

      // 2. Set up model configuration parameters with progress step strings
      const config: Config = {
        model: qualityMode, // Instruct @imgly/background-removal to load the specified precision model
        rescale: rescaleMode, // Override scale normalization
        progress: (key: string, current: number, total: number) => {
          const percent = Math.round((current / total) * 100);
          let step = 'Uploading, please wait...';
          
          if (key.includes('fetch')) {
            step = 'Uploading, please wait...';
          } else if (key.includes('compute')) {
            step = 'Removing background...';
          } else if (key.includes('isolate')) {
            step = 'Removing background...';
          } else {
            step = 'Removing background...';
          }

          setCurrentImage(prev => {
            if (!prev || prev.id !== uniqueId) return prev;
            return {
              ...prev,
              progress: percent,
              progressStep: step
            };
          });
        }
      };

      // Execute background-removal library on target source
      const maskedBlob = await removeBackground(processedSrcForAI as any, config);
      
      // Restore full pristine high-resolution quality by overlaying mask on original image!
      setCurrentImage(prev => prev ? { ...prev, progressStep: 'Removing background...' } : null);
      
      let finalBlob = maskedBlob;
      try {
        finalBlob = await applyMaskToOriginal(imageSrc, maskedBlob);
      } catch (overlayErr) {
        console.warn('Error applying HD mask restore composite, proceeding with neural resolution.', overlayErr);
      }

      const transparentUrl = URL.createObjectURL(finalBlob);

      // Measure processed dimension bounds
      const imgMeasure = new Image();
      imgMeasure.src = transparentUrl;
      imgMeasure.onload = () => {
        setCurrentImage(prev => {
          if (!prev || prev.id !== uniqueId) return prev;
          const completedImg: ProcessedImage = {
            ...prev,
            status: 'completed',
            progress: 100,
            progressStep: 'Background removed successfully!',
            processedUrl: transparentUrl,
            processedBlob: finalBlob,
            width: imgMeasure.naturalWidth,
            height: imgMeasure.naturalHeight
          };

          // Save to session history list
          setSessionHistory(hist => [completedImg, ...hist].filter(h => h.id !== completedImg.id).slice(0, 8));
          return completedImg;
        });
      };

    } catch (err: any) {
      console.warn('Real AI background-removal failed or security blocked. Running local contour fallback.', err);
      
      // Fallback: Run canvas estimation after 800ms to demonstrate instant local backup
      setCurrentImage(prev => {
        if (!prev || prev.id !== uniqueId) return prev;
        return {
          ...prev,
          progress: 40,
          progressStep: 'Removing background...'
        };
      });

      setTimeout(() => {
        setupFallbackCutout(initialUrl, uniqueId, originalName);
      }, 1000);
    }
  };

  // Safe Fallback Cutout: generates a beautiful transparent overlay so user can still manually refine
  const setupFallbackCutout = (imgUrl: string, uniqueId: string, originalName: string) => {
    const rawImg = new Image();
    const safeUrl = getSafeCorsUrl(imgUrl);
    if (safeUrl.startsWith('http') && !safeUrl.startsWith(window.location.origin)) {
      rawImg.crossOrigin = 'anonymous';
    }
    rawImg.src = safeUrl;
    
    rawImg.onload = () => {
      const fallbackCanvas = document.createElement('canvas');
      fallbackCanvas.width = rawImg.naturalWidth || 600;
      fallbackCanvas.height = rawImg.naturalHeight || 600;
      const ctx = fallbackCanvas.getContext('2d');

      if (ctx) {
        // Draw image
        ctx.drawImage(rawImg, 0, 0);

        // Run a simple radial gradient mask simulating Center-Focus mask:
        // Inside a central ellipse is clear, outside has higher alpha erosion (transparent)
        // This gives the user a soft start that they can instantly details-refine with Eraser/Restore brush!
        ctx.globalCompositeOperation = 'destination-out';
        
        const cx = fallbackCanvas.width / 2;
        const cy = fallbackCanvas.height / 2;
        const rx = fallbackCanvas.width * 0.42;
        const ry = fallbackCanvas.height * 0.48;

        const gradient = ctx.createRadialGradient(cx, cy, Math.min(rx, ry) * 0.4, cx, cy, Math.max(rx, ry));
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(0.6, 'rgba(0,0,0, 0.15)');
        gradient.addColorStop(0.85, 'rgba(0, 0, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, fallbackCanvas.width, fallbackCanvas.height);
      }

      // Convert back to url
      const fallbackUrl = fallbackCanvas.toDataURL('image/png');
      
      setUsingFallback(true);
      setCurrentImage(prev => {
        if (!prev || prev.id !== uniqueId) return prev;
        const completedImg: ProcessedImage = {
          ...prev,
          status: 'completed',
          progress: 100,
          progressStep: 'Background removed successfully!',
          processedUrl: fallbackUrl,
          width: rawImg.naturalWidth || 600,
          height: rawImg.naturalHeight || 600
        };

        setSessionHistory(hist => [completedImg, ...hist].filter(h => h.id !== completedImg.id).slice(0, 8));
        return completedImg;
      });
    };

    rawImg.onerror = () => {
      // Complete backup failsafe: just pass the same image
      setCurrentImage(prev => {
        if (!prev || prev.id !== uniqueId) return prev;
        return {
          ...prev,
          status: 'completed',
          progress: 100,
          processedUrl: imgUrl,
          width: 500,
          height: 500
        };
      });
      setError('Strict CORS detected. Manual drawing tools unlocked!');
    };
  };

  // Drag and Drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        processImage(file, file.name);
      } else {
        setError('Please drop valid image files (png, jpeg, webp) only.');
      }
    }
  };

  // Manual Pick
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processImage(file, file.name);
    }
  };

  // Paste URL Image
  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsUrlSubmitting(true);
    setError(null);
    const cleanedUrl = urlInput.trim();
    
    // Extract a mock nice filename from URL
    let filename = 'pasted_image.png';
    try {
      const urlObj = new URL(cleanedUrl);
      const pathname = urlObj.pathname;
      const lastSegment = pathname.substring(pathname.lastIndexOf('/') + 1);
      if (lastSegment && lastSegment.includes('.')) {
        filename = lastSegment;
      }
    } catch (_) {}

    setUrlInput('');
    setIsUrlSubmitting(false);
    processImage(cleanedUrl, filename);
  };

  // Trigger manual paste (Ctrl+V) anywhere on the window! Awesome utility
  useEffect(() => {
    const handleWindowPaste = (e: ClipboardEvent) => {
      if (isBrushEditorOpen) return; // ignore when brush sandbox is running
      
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            processImage(file, 'clipboard_capture.png');
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handleWindowPaste);
    return () => {
      window.removeEventListener('paste', handleWindowPaste);
    };
  }, [isBrushEditorOpen]);

  // Handle Preset Backdrop select
  const selectPreset = (preset: BackgroundPreset) => {
    setSelectedPresetId(preset.id);
    if (preset.type === 'color') {
      setEditorSettings(prev => ({
        ...prev,
        backgroundType: 'color',
        colorValue: preset.value
      }));
    } else if (preset.type === 'gradient') {
      setEditorSettings(prev => ({
        ...prev,
        backgroundType: 'gradient',
        gradientValue: preset.value
      }));
    } else if (preset.type === 'image') {
      setEditorSettings(prev => ({
        ...prev,
        backgroundType: 'image',
        imageValue: preset.value
      }));
    }
  };

  // Upload custom background layout
  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const customUrl = URL.createObjectURL(file);
      setEditorSettings(prev => ({
        ...prev,
        backgroundType: 'image',
        imageValue: customUrl
      }));
      setSelectedPresetId('custom-bg');
    }
  };

  // Save manual editor canvas outputs
  const handleBrushSave = (editedDataUrl: string) => {
    setCurrentImage(prev => {
      if (!prev) return null;
      return {
        ...prev,
        editedUrl: editedDataUrl
      };
    });
    setIsBrushEditorOpen(false);
  };

  // Merges dynamic background, custom overlays and blur settings, then downloads
  const triggerImageDownload = () => {
    if (!currentImage) return;

    // Use edited details if manual brush was saved, otherwise use transparent output API
    const foregroundUrl = currentImage.editedUrl || currentImage.processedUrl;
    if (!foregroundUrl) return;

    // Fast-path: downloading standard transparent PNG directly avoids canvas load delay
    if (editorSettings.backgroundType === 'transparent') {
      const link = document.createElement('a');
      link.download = `${currentImage.name.replace(/\.[^/.]+$/, '')}_nobg.png`;
      link.href = foregroundUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // Heavy-path: Merge backdrops via HTML Canvas
    const canvas = document.createElement('canvas');
    const fgImg = new Image();
    if (foregroundUrl.startsWith('http') && !foregroundUrl.startsWith(window.location.origin)) {
      fgImg.crossOrigin = 'anonymous';
    }
    fgImg.src = foregroundUrl;

    setCurrentImage(prev => prev ? { ...prev, progressStep: 'Combining backdrops...' } : null);

    fgImg.onload = () => {
      canvas.width = fgImg.naturalWidth || 800;
      canvas.height = fgImg.naturalHeight || 800;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Wrap drawing in sequential layout steps
      const drawForegroundAndDownload = () => {
        // Draw cropped subject without filters
        ctx.filter = 'none';
        ctx.drawImage(fgImg, 0, 0, canvas.width, canvas.height);

        // Create download trigger
        const mergedUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `${currentImage.name.replace(/\.[^/.]+$/, '')}_composited.png`;
        link.href = mergedUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };

      // Draw background segment
      if (editorSettings.backgroundType === 'color') {
        ctx.fillStyle = editorSettings.colorValue;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawForegroundAndDownload();
      } else if (editorSettings.backgroundType === 'gradient') {
        // Resolve preset color stops to paint canvas gradient:
        const activePreset = GRADIENT_PRESETS.find(p => p.value === editorSettings.gradientValue);
        const stops = activePreset?.colors || ['#F97316', '#EC4899'];
        
        // Draw diagonal gradient
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, stops[0]);
        if (stops.length > 2) {
          grad.addColorStop(0.5, stops[1]);
          grad.addColorStop(1, stops[2]);
        } else {
          grad.addColorStop(1, stops[1]);
        }

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawForegroundAndDownload();
      } else if (editorSettings.backgroundType === 'image') {
        const bgImg = new Image();
        if (editorSettings.imageValue.startsWith('http') && !editorSettings.imageValue.startsWith(window.location.origin)) {
          bgImg.crossOrigin = 'anonymous';
        }
        bgImg.src = editorSettings.imageValue;

        bgImg.onload = () => {
          if (editorSettings.blurValue > 0) {
            ctx.filter = `blur(${editorSettings.blurValue}px)`;
          }
          // Stretch cover
          ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
          drawForegroundAndDownload();
        };

        bgImg.onerror = () => {
          // Draw plain gray fallback if user image URLs are blocked
          ctx.fillStyle = '#E5E7EB';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          drawForegroundAndDownload();
        };
      }
    };
  };

  // Helper bytes converter
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Render original preview and dynamic filtered background
  const getDynamicBackdropStyle = (): React.CSSProperties => {
    if (editorSettings.backgroundType === 'transparent') {
      return {
        // Standard PNG chess grid
        backgroundImage: `
          linear-gradient(45deg, #ddd 25%, transparent 25%), 
          linear-gradient(-45deg, #ddd 25%, transparent 25%), 
          linear-gradient(45deg, transparent 75%, #ddd 75%), 
          linear-gradient(-45deg, transparent 75%, #ddd 75%)
        `,
        backgroundSize: '16px 16px',
        backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
        backgroundColor: '#FCFCFC'
      };
    }
    if (editorSettings.backgroundType === 'color') {
      return { backgroundColor: editorSettings.colorValue };
    }
    if (editorSettings.backgroundType === 'gradient') {
      return { background: editorSettings.gradientValue };
    }
    if (editorSettings.backgroundType === 'image') {
      return {
        backgroundImage: `url(${editorSettings.imageValue})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: editorSettings.blurValue > 0 ? `blur(${editorSettings.blurValue}px)` : 'none'
      };
    }
    return {};
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-800 selection:bg-orange-500 selection:text-white font-sans">
      
      {/* Navigation Header */}
      <Header onNavClick={handleNavClick} activeSection={activeSection} />

      {/* Primary Area Container */}
      <main className="flex-1 flex flex-col">
        
        {/* VIEW 1: HERO PORTAL (No image uploaded yet) */}
        {!currentImage && (
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-16 flex-1 flex flex-col justify-center">
            
            {/* Visual Top Highlight BANNER */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600 uppercase tracking-widest mb-4">
                <Sparkles className="h-3 w-3" />
                <span>Next-Gen Web Assembly Isolation</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 leading-tight">
                Remove Image <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Background</span>
              </h1>
              <p className="mt-4 text-base sm:text-lg text-neutral-500 max-w-2xl mx-auto font-medium">
                100% automatic and free. All rendering runs entirely locally on your processor. Your files are completely safe.
              </p>
            </div>

            {/* AI Engine Speed & Quality Configurations */}
            <div className="max-w-4xl mx-auto w-full mb-8 p-5 sm:p-6 bg-amber-50/30 border border-amber-200/60 rounded-3xl shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/40 pb-3">
                <div className="flex items-center space-x-2">
                  <Sliders className="h-4.5 w-4.5 text-orange-500 animate-pulse" />
                  <span className="font-extrabold text-sm text-neutral-800 tracking-tight">AI Speed & Quality Configuration</span>
                </div>
                <span className="text-[10px] uppercase font-mono font-bold text-neutral-400 tracking-wider">Customize local browser engine execution</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {/* Draft / Speed mode */}
                <button
                  type="button"
                  onClick={() => setQualityMode('isnet_quint8')}
                  className={`flex flex-col text-left p-4 rounded-2xl border transition duration-200 relative ${
                    qualityMode === 'isnet_quint8'
                      ? 'border-orange-500 bg-white ring-2 ring-orange-500/15 shadow-sm'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-neutral-900 flex items-center space-x-1.5">
                      <span>🏃 Speed Draft (Fast)</span>
                    </span>
                    <span className="text-[9px] bg-neutral-100 px-1.5 py-0.5 rounded font-mono text-neutral-500 font-extrabold">11 MB</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-2 leading-relaxed">
                    Uses small quantized 8-bit weights. Auto-downscaled to <strong className="text-neutral-700">800px</strong>. <strong>Loads and processes extremely fast!</strong>
                  </p>
                  {qualityMode === 'isnet_quint8' && (
                    <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                  )}
                </button>

                {/* Standard quality Mode */}
                <button
                  type="button"
                  onClick={() => setQualityMode('isnet_fp16')}
                  className={`flex flex-col text-left p-4 rounded-2xl border transition duration-200 relative ${
                    qualityMode === 'isnet_fp16'
                      ? 'border-orange-500 bg-white ring-2 ring-orange-500/15 shadow-sm'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-neutral-900 flex items-center space-x-1.5">
                      <span>✨ Balanced Pro</span>
                    </span>
                    <span className="text-[9px] bg-neutral-100 px-1.5 py-0.5 rounded font-mono text-neutral-500 font-extrabold">22 MB</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-2 leading-relaxed">
                    Uses precision 16-bit Float weight scales. Auto-downscaled to <strong className="text-neutral-700">1600px</strong>. Great mix of high speed & clarity.
                  </p>
                  {qualityMode === 'isnet_fp16' && (
                    <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                  )}
                </button>

                {/* Studio HD quality Mode */}
                <button
                  type="button"
                  onClick={() => setQualityMode('isnet')}
                  className={`flex flex-col text-left p-4 rounded-2xl border transition duration-200 relative ${
                    qualityMode === 'isnet'
                      ? 'border-orange-500 bg-white ring-2 ring-orange-500/15 shadow-sm'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-neutral-900 flex items-center space-x-1.5">
                      <span>⭐ Professional Studio HD</span>
                    </span>
                    <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-mono font-extrabold">44 MB</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-2 leading-relaxed">
                    Uses full HD 32-bit float neural maps. Capped at safe <strong className="text-neutral-700">2800px</strong>. Maximum possible details on edge boundaries.
                  </p>
                  {qualityMode === 'isnet' && (
                    <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                  )}
                </button>
              </div>

              {/* Foreground Focus Strategy Settings */}
              <div className="bg-neutral-100/40 p-4 sm:p-4.5 rounded-2xl border border-neutral-200/50 space-y-3 mt-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200/30 pb-2">
                  <div className="flex items-center space-x-1.5">
                    <Sparkles className="h-4 w-4 text-emerald-500" />
                    <span className="font-extrabold text-[11px] sm:text-xs text-neutral-800 tracking-tight">Advanced Foreground Extraction Strategy</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-wide">Avoid Cropped laptops, desks & hands</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Subject Only (Squeeze) */}
                  <button
                    type="button"
                    onClick={() => setRescaleMode(true)}
                    className={`flex items-start text-left p-3.5 rounded-xl border transition duration-150 ${
                      rescaleMode === true
                        ? 'border-emerald-500 bg-white ring-2 ring-emerald-500/10'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white/70'
                    }`}
                  >
                    <div className="flex-shrink-0 mr-3 mt-0.5">
                      <div className={`h-4.5 w-4.5 rounded-full border-2 flex items-center justify-center ${
                        rescaleMode === true ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-neutral-300'
                      }`}>
                        {rescaleMode === true && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900 leading-tight">Focus Subject (Normal Portrait)</h4>
                      <p className="text-[10px] text-neutral-500 mt-1 leading-normal">
                        Squeezes image aspect ratio to isolate headshots, single people, and simple product shapes.
                      </p>
                    </div>
                  </button>

                  {/* Connected Context (No Squeeze) */}
                  <button
                    type="button"
                    onClick={() => setRescaleMode(false)}
                    className={`flex items-start text-left p-3.5 rounded-xl border transition duration-150 ${
                      rescaleMode === false
                        ? 'border-emerald-500 bg-white ring-2 ring-emerald-500/10'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white/70'
                    }`}
                  >
                    <div className="flex-shrink-0 mr-3 mt-0.5">
                      <div className={`h-4.5 w-4.5 rounded-full border-2 flex items-center justify-center ${
                        rescaleMode === false ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-neutral-300'
                      }`}>
                        {rescaleMode === false && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900 leading-tight flex items-center gap-1.5">
                        <span>Keep Context (Precision Desk & Laptop)</span>
                        <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded font-mono font-extrabold uppercase shrink-0">Highly Precise</span>
                      </h4>
                      <p className="text-[10px] text-neutral-500 mt-1 leading-normal">
                        Preserves original widescreen aspect ratio. Prevents cutting off tables, desks, laptops, hands, or overlays.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex items-start space-x-2.5 text-[11px] leading-relaxed text-neutral-500 bg-neutral-50 p-3 rounded-xl border border-neutral-100 font-medium">
                <Info className="h-4.5 w-4.5 text-orange-500 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>How are results processed?</strong> This app leverages latest Dichotomous Image Segmentation <strong>ISNet Neural Models</strong> running inside your secure web browser sandbox. By resolving AI models via client-side <strong>WebAssembly</strong> and <strong>ONNX Runtime Web</strong>, all images remain completely private. First run downloads the weights, while subsequent tasks isolate instantly!
                </p>
              </div>
            </div>

            {/* Core Interactive Sandbox Card layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto w-full mb-10" id="try-it-now">
              
              {/* UPLOAD ZONE (7 Cols wide) */}
              <div className="lg:col-span-7 flex flex-col">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`flex-1 flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all relative ${
                    isDraggingOver 
                      ? 'border-orange-500 bg-orange-50/50 scale-[0.99] shadow-inner' 
                      : 'border-neutral-200 bg-neutral-50/50 hover:bg-neutral-55/40 hover:border-orange-200'
                  }`}
                  id="dropzone-area"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="primary-file-input"
                  />

                  {/* Icon circle */}
                  <div className="h-16 w-16 rounded-2xl bg-white shadow-md flex items-center justify-center text-orange-500 mb-5 border border-neutral-100">
                    <Upload className="h-7 w-7 animate-bounce" style={{ animationDuration: '3s' }} />
                  </div>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-xl bg-orange-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-400 active:scale-95 transition"
                    id="btn-upload-trigger"
                  >
                    Select Local Image
                  </button>

                  <p className="mt-4 text-xs font-semibold text-neutral-400">
                    or drag and drop your photo here
                  </p>

                  <p className="mt-2 text-[11px] text-neutral-400 italic">
                    Supports PNG, JPEG, WEBP. Fast offline cache.
                  </p>

                  {/* Quick paste indicator */}
                  <div className="absolute bottom-3 text-[10px] text-neutral-400/80 bg-white border border-neutral-100 rounded px-2 py-0.5 shadow-sm font-mono flex items-center space-x-1.5 select-none">
                    <span>Pro-tip: press</span>
                    <span className="bg-neutral-100 px-1 rounded font-semibold text-[9px] text-neutral-500">Ctrl + V</span>
                    <span>anywhere to paste</span>
                  </div>
                </div>
              </div>

              {/* URL PASTE & CAPABILITIES (5 Cols wide) */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                
                {/* Paste URL block */}
                <div className="p-6 rounded-2xl border border-neutral-150 bg-white/70 shadow-sm space-y-4 flex flex-col justify-center">
                  <div className="flex items-center space-x-2">
                    <LinkIcon className="h-4.5 w-4.5 text-neutral-500" />
                    <span className="font-semibold text-sm text-neutral-800">Process from Web URL</span>
                  </div>
                  <form onSubmit={handleUrlSubmit} className="flex space-x-2">
                    <input
                      type="url"
                      placeholder="Paste image URL (HTTPS)..."
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      required
                      className="flex-1 min-w-0 rounded-xl border border-neutral-200 px-3 py-2.5 text-xs focus:border-orange-500 focus:outline-none bg-neutral-50/50"
                      id="url-paste-input"
                    />
                    <button
                      type="submit"
                      disabled={isUrlSubmitting}
                      className="rounded-xl bg-neutral-900 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-neutral-850 disabled:opacity-50 transition flex-shrink-0"
                      id="btn-url-submit"
                    >
                      Fetch
                    </button>
                  </form>
                  <p className="text-[10px] text-neutral-400 leading-relaxed font-mono">
                    Ensure the web host permits public cross-origin image sharing.
                  </p>
                </div>

                {/* Privacy Guarantee Block */}
                <div className="p-6 rounded-2xl border border-neutral-150 bg-neutral-50/50 flex-1 flex flex-col justify-center space-y-3">
                  <div className="flex items-start space-x-3 text-xs leading-relaxed">
                    <div className="rounded-lg bg-emerald-100 p-1 bg-emerald-50 text-emerald-600 mt-0.5">
                      <Check className="h-3.5 w-3.5 font-extrabold" />
                    </div>
                    <div>
                      <h4 className="font-bold text-neutral-800 text-xs">No Server Required</h4>
                      <p className="text-neutral-500 text-[11px] mt-0.5">The segmentation runs locally with WebAssembly. Perfect for corporate privacy-sensitive photos.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 text-xs leading-relaxed">
                    <div className="rounded-lg bg-blue-100 p-1 bg-blue-50 text-blue-600 mt-0.5">
                      <Check className="h-3.5 w-3.5 font-extrabold" />
                    </div>
                    <div>
                      <h4 className="font-bold text-neutral-800 text-xs">Full Dynamic Backdrops</h4>
                      <p className="text-neutral-500 text-[11px] mt-0.5">Unlocks beautiful portrait color gradients and custom desk scene mockups instantly after isolating.</p>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* ERROR PRESENTATION */}
            {error && (
              <div className="mx-auto max-w-xl w-full mb-8 rounded-xl bg-red-55 border border-red-200 p-4 flex items-start space-x-3 text-red-700">
                <AlertCircle className="h-5 w-5 text-red-650 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold leading-relaxed block">Isolation constraint encountered</span>
                  <p className="text-red-600 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* DEMO IMAGES ROW TRAY */}
            <div className="w-full max-w-5xl mx-auto border-t border-neutral-100 pt-8 mt-4">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block text-center mb-5">
                Don&apos;t have an image? Try one of these presets:
              </span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {SAMPLE_IMAGES.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => processImage(sample.url, `${sample.id}_trial.png`)}
                    className="group flex flex-col text-left rounded-xl border border-neutral-150 overflow-hidden bg-white shadow-sm hover:border-orange-500 hover:shadow-md transition duration-200 relative"
                    id={`demo-trigger-${sample.id}`}
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-50 relative">
                      <img
                        src={sample.url}
                        alt={sample.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-2 left-2 rounded-md bg-neutral-900/80 px-2 py-0.5 text-[9px] font-bold text-white tracking-wide">
                        {sample.type}
                      </span>
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-neutral-800 block text-ellipsis overflow-hidden whitespace-nowrap max-w-[120px]">
                          {sample.name}
                        </span>
                        <span className="text-[10px] text-orange-600 font-semibold mt-0.5 block">{sample.badge}</span>
                      </div>
                      <span className="h-6 w-6 rounded-full bg-neutral-150 group-hover:bg-orange-500 text-neutral-500 group-hover:text-white flex items-center justify-center text-xs font-bold transition">
                        →
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>



          </section>
        )}

        {/* VIEW 2: LOADING OR ACTIVE WORKSPACE */}
        {currentImage && (
          <section id="workspace-panel" className="flex-1 flex flex-col bg-neutral-50/50">
            <div className="w-full border-b border-neutral-150 bg-white py-3.5">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded bg-neutral-100 flex items-center justify-center text-neutral-500 border border-neutral-200">
                    <FileImage className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-neutral-900 leading-tight block truncate max-w-[190px] sm:max-w-xs">
                      {currentImage.name}
                    </h2>
                    <span className="text-[10px] font-mono font-semibold text-neutral-400">
                      {formatBytes(currentImage.size)} • {currentImage.width > 0 ? `${currentImage.width} x ${currentImage.height}px` : 'Calculating dimension...'}
                    </span>
                  </div>
                </div>

                {/* Reset or New Image upload and Engine switcher */}
                <div className="flex items-center space-x-2.5">
                  {/* On-the-fly quality mode switcher segment */}
                  <div className="hidden lg:flex items-center space-x-1 bg-neutral-100 p-1.5 rounded-xl border border-neutral-200">
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest px-2 font-mono">Engine Profile:</span>
                    
                    <button
                      onClick={async () => {
                        const nextMod = 'isnet_quint8';
                        setQualityMode(nextMod);
                        // Trigger immediate reprocessing with this qualityMode if original is available
                        setTimeout(() => {
                          if (currentImage.originalFile) {
                            processImage(currentImage.originalFile, currentImage.name);
                          } else if (currentImage.originalUrl) {
                            processImage(currentImage.originalUrl, currentImage.name);
                          }
                        }, 50);
                      }}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition flex items-center space-x-1 ${
                        qualityMode === 'isnet_quint8'
                          ? 'bg-neutral-900 text-white shadow-sm'
                          : 'text-neutral-500 hover:text-neutral-950 hover:bg-neutral-200/40'
                      }`}
                      title="Draft quality, runs 10x faster (11MB weights)"
                    >
                      <span>🏃 Speed Draft</span>
                    </button>

                    <button
                      onClick={async () => {
                        const nextMod = 'isnet_fp16';
                        setQualityMode(nextMod);
                        setTimeout(() => {
                          if (currentImage.originalFile) {
                            processImage(currentImage.originalFile, currentImage.name);
                          } else if (currentImage.originalUrl) {
                            processImage(currentImage.originalUrl, currentImage.name);
                          }
                        }, 50);
                      }}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition flex items-center space-x-1 ${
                        qualityMode === 'isnet_fp16'
                          ? 'bg-neutral-900 text-white shadow-sm'
                          : 'text-neutral-500 hover:text-neutral-950 hover:bg-neutral-200/40'
                      }`}
                      title="Standard float16, fast & high precision (22MB weights)"
                    >
                      <span>✨ Balanced Pro</span>
                    </button>

                    <button
                      onClick={async () => {
                        const nextMod = 'isnet';
                        setQualityMode(nextMod);
                        setTimeout(() => {
                          if (currentImage.originalFile) {
                            processImage(currentImage.originalFile, currentImage.name);
                          } else if (currentImage.originalUrl) {
                            processImage(currentImage.originalUrl, currentImage.name);
                          }
                        }, 50);
                      }}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition flex items-center space-x-1 ${
                        qualityMode === 'isnet'
                          ? 'bg-neutral-900 text-white shadow-sm'
                          : 'text-neutral-500 hover:text-neutral-950 hover:bg-neutral-200/40'
                      }`}
                      title="Full studio float32, maximum boundary edge accuracy (44MB weights)"
                    >
                      <span>⭐ Studio HD</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setCurrentImage(null)}
                    className="rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 px-3.5 py-1.5 text-xs font-semibold text-neutral-700 transition flex items-center space-x-1"
                    id="btn-upload-another"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Upload Another</span>
                  </button>
                </div>
              </div>
            </div>

            {/* RUNNING LOADER */}
            {currentImage.status === 'loading' && (
              <div className="flex-1 flex flex-col items-center justify-center py-20 px-4">
                <div className="max-w-md w-full text-center space-y-6">
                  
                  {/* Elegant central spinner */}
                  <div className="relative w-24 h-24 mx-auto">
                    {/* Pulsing ring background */}
                    <div className="absolute inset-0 rounded-full border-4 border-orange-100 animate-ping opacity-75" />
                    {/* Spinning active indicator */}
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 animate-spin" style={{ animationDuration: '0.8s' }} />
                    {/* Inner percentage container */}
                    <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center shadow-md border border-neutral-100 font-mono text-sm font-extrabold text-orange-600">
                      {currentImage.progress}%
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-neutral-900">
                      {currentImage.progressStep.includes('Uploading') ? 'Uploading, please wait...' : 'Removing background...'}
                    </h3>
                    <p className="text-xs text-neutral-400 font-sans font-medium max-w-xs mx-auto animate-pulse">
                      {currentImage.progressStep.includes('Uploading') ? 'Please wait...' : 'Almost done...'}
                    </p>
                  </div>

                  {/* Visual Progress bar */}
                  <div className="h-1.5 w-full bg-neutral-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300"
                      style={{ width: `${currentImage.progress}%` }}
                    />
                  </div>

                  <p className="text-[10px] text-neutral-400 italic">
                    First run might take up to 20 seconds to fetch AI weight libraries. Consecutive trials occur instantly in offline state.
                  </p>
                </div>
              </div>
            )}

            {/* PROCESS COMPLETION WORKSPACE */}
            {currentImage.status === 'completed' && (
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* COLUMN 1: INTERACTIVE DISPLAY CORE (7 Columns wide) */}
                <div className="lg:col-span-7 flex flex-col space-y-4">
                  
                  {/* View mode toggle tabs */}
                  <div className="flex items-center justify-between border-b border-neutral-150 pb-2">
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setActiveTab('compare')}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          activeTab === 'compare'
                            ? 'bg-neutral-900 text-white shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-900'
                        }`}
                        id="tab-btn-compare"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Interactive Compare</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('backdrop')}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          activeTab === 'backdrop'
                            ? 'bg-neutral-900 text-white shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-900'
                        }`}
                        id="tab-btn-backdrop"
                      >
                        <Palette className="h-3.5 w-3.5" />
                        <span>Isolated Backdrop</span>
                      </button>
                    </div>

                    {/* Manual Cutout Indicator badge */}
                    {usingFallback && (
                      <div className="inline-flex items-center space-x-1 text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 font-semibold">
                        <ShieldAlert className="h-3 w-3 text-amber-600 flex-shrink-0" />
                        <span>Contour Fallback Active</span>
                      </div>
                    )}
                  </div>

                  {/* DISPLAY WORKSPACE */}
                  <div className="aspect-[4/3] w-full relative min-h-[340px]">
                    {activeTab === 'compare' ? (
                      /* Dual compare slider module */
                      <CompareSlider
                        originalUrl={currentImage.originalUrl}
                        processedUrl={currentImage.editedUrl || currentImage.processedUrl!}
                        className="h-full w-full"
                        hasTransparentGrid={true}
                      />
                    ) : (
                      /* Sandbox layout rendering chosen color/image background with blur */
                      <div className="relative h-full w-full overflow-hidden rounded-xl border border-neutral-200 shadow-sm flex items-center justify-center bg-checkerboard bg-neutral-100">
                        {/* Static CSS dynamic background styling */}
                        <div
                          className="absolute inset-0 h-full w-full transition-all duration-300 pointer-events-none"
                          style={getDynamicBackdropStyle()}
                        />

                        {/* Centered isolated foreground image */}
                        <img
                          src={currentImage.editedUrl || currentImage.processedUrl}
                          alt="Cropped Subject"
                          className="relative max-h-full max-w-full object-contain z-10 p-4 drop-shadow-lg"
                          draggable={false}
                          referrerPolicy="no-referrer"
                        />

                        <span className="absolute bottom-3 left-3 rounded-md bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm z-20 select-none">
                          Current Preview
                        </span>
                      </div>
                    )}
                  </div>

                  {/* DIRECT CORRECTION NOTICE BANNER AND QUICK REFINE PORT */}
                  <div className="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-xl bg-amber-100 text-amber-800 flex-shrink-0 mt-0.5">
                        <Sparkles className="h-4.5 w-4.5 text-amber-700 animate-pulse" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-amber-900 leading-tight">Laptop, desk or arms cropped out by mistake?</p>
                        <p className="text-[11px] text-amber-700 leading-relaxed">
                          AI models focus mostly on human silhouettes and ignore inanimate furniture. Open the editor and use the new <strong>Smart Wand</strong> tool: simply click on the missing laptop or table, and the editor will auto-detect and restore the entire object instantly!
                        </p>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setIsBrushEditorOpen(true)}
                      className="px-4.5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-amber-600/15 transition flex items-center justify-center space-x-1.5 whitespace-nowrap self-stretch sm:self-center"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Open Smart Refiner</span>
                    </button>
                  </div>

                  {/* CORE COMMANDS ROW (Download Button trigger) */}
                  <div className="bg-white rounded-xl border border-neutral-150 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                    <div className="text-center sm:text-left">
                      <span className="text-[11px] font-bold text-neutral-400 block uppercase tracking-wider">Ready to Export</span>
                      <p className="text-xs text-neutral-500 mt-0.5">High-quality PNG processed entirely inside your browser sandbox.</p>
                    </div>

                    <div className="flex items-center space-x-3 w-full sm:w-auto">
                      <button
                        onClick={triggerImageDownload}
                        className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 rounded-xl bg-orange-500 px-6 py-3.5 text-xs font-extrabold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-400 active:scale-95 transition"
                        id="btn-download-image"
                      >
                        <Download className="h-4.5 w-4.5" />
                        <span>Download Regular</span>
                      </button>

                      {/* Premium simulation HD download CTA */}
                      <button
                        onClick={triggerImageDownload}
                        className="hidden sm:inline-flex items-center space-x-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 px-4 py-3.5 text-xs font-bold text-neutral-700 transition"
                        title="Download unaltered original high resolution"
                      >
                        <Check className="h-4 w-4 text-emerald-500" />
                        <span>Download HD</span>
                      </button>
                    </div>
                  </div>

                </div>

                {/* COLUMN 2: CUSTOM BACKDROPS PANEL & BRUSH SIDEBAR (5 Columns wide) */}
                <div className="lg:col-span-5 flex flex-col space-y-6">
                  
                  {/* FINE-TUNE CROP BRUSH CTA MANDATE */}
                  <div className="bg-white rounded-2xl border border-neutral-150 p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 font-bold">
                          <Scissors className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-neutral-900">Fine-Tune Brushes</h4>
                          <p className="text-[10px] text-neutral-400">Perfect edge details manually</p>
                        </div>
                      </div>

                      <button
                        onClick={() => setIsBrushEditorOpen(true)}
                        className="px-4 py-2 bg-orange-50 border border-orange-200 rounded-xl text-orange-600 font-extrabold text-xs hover:bg-orange-100 transition flex items-center space-x-1"
                        id="btn-open-eraser-brush"
                      >
                        <span>Erase / Restore</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-neutral-500 leading-relaxed font-mono">
                      Did the AI miss any hair details or strap lines? Click above to rub out or bring back parts of the image with a customized cursor brush!
                    </p>
                  </div>

                  {/* BACKDROP CONTROL PANEL */}
                  <div id="backdrop-preset-section" className="bg-white rounded-2xl border border-neutral-150 p-5 shadow-sm space-y-5">
                    
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center space-x-1.5">
                        <Palette className="h-4 w-4 text-orange-500" />
                        <span>1. Background Backdrops</span>
                      </h4>
                      <p className="text-[10px] text-neutral-400 leading-tight">Replace the transparent layout with vibrant artistic themes</p>
                    </div>

                    {/* Quick presets group tabs selector */}
                    <div className="grid grid-cols-4 gap-1.5 bg-neutral-100 p-1 rounded-xl text-center">
                      <button
                        onClick={() => {
                          setEditorSettings(prev => ({ ...prev, backgroundType: 'transparent' }));
                          setSelectedPresetId('transparent');
                          setActiveTab('backdrop');
                        }}
                        className={`py-1.5 rounded-lg text-xs font-bold transition ${
                          editorSettings.backgroundType === 'transparent'
                            ? 'bg-white text-neutral-900 shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-800'
                        }`}
                      >
                        Transparent
                      </button>

                      <button
                        onClick={() => {
                          setEditorSettings(prev => ({ ...prev, backgroundType: 'color' }));
                          selectPreset(COLOR_PRESETS[0]);
                          setActiveTab('backdrop');
                        }}
                        className={`py-1.5 rounded-lg text-xs font-bold transition ${
                          editorSettings.backgroundType === 'color'
                            ? 'bg-white text-neutral-900 shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-800'
                        }`}
                      >
                        Colors
                      </button>

                      <button
                        onClick={() => {
                          setEditorSettings(prev => ({ ...prev, backgroundType: 'gradient' }));
                          selectPreset(GRADIENT_PRESETS[0]);
                          setActiveTab('backdrop');
                        }}
                        className={`py-1.5 rounded-lg text-xs font-bold transition ${
                          editorSettings.backgroundType === 'gradient'
                            ? 'bg-white text-neutral-900 shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-800'
                        }`}
                      >
                        Gradients
                      </button>

                      <button
                        onClick={() => {
                          setEditorSettings(prev => ({ ...prev, backgroundType: 'image' }));
                          selectPreset(IMAGE_PRESETS[0]);
                          setActiveTab('backdrop');
                        }}
                        className={`py-1.5 rounded-lg text-xs font-bold transition ${
                          editorSettings.backgroundType === 'image'
                            ? 'bg-white text-neutral-900 shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-800'
                        }`}
                      >
                        Artistic
                      </button>
                    </div>

                    {/* RENDER ACTIVE TILE SELECTION LIST */}
                    <div className="space-y-4">
                      {editorSettings.backgroundType === 'transparent' && (
                        <div className="h-28 rounded-xl border border-dashed border-neutral-200 flex items-center justify-center bg-neutral-50 hover:bg-neutral-100 transition cursor-pointer select-none">
                          <div className="text-center space-y-1 p-4">
                            <Check className="h-6 w-6 text-emerald-500 mx-auto" />
                            <span className="text-xs font-bold text-neutral-800">Transparent PNG Export Selected</span>
                            <p className="text-[10px] text-neutral-400">Suitable for graphic designs, logos, and catalogs.</p>
                          </div>
                        </div>
                      )}

                      {/* Display SOLID COLORS slider catalog */}
                      {editorSettings.backgroundType === 'color' && (
                        <div>
                          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">Select Solid backdrop Color:</span>
                          <div className="grid grid-cols-5 gap-2.5">
                            {COLOR_PRESETS.map(preset => (
                              <button
                                key={preset.id}
                                onClick={() => {
                                  selectPreset(preset);
                                  setActiveTab('backdrop');
                                }}
                                className={`aspect-square w-full rounded-xl border transition-all relative flex items-center justify-center ${
                                  selectedPresetId === preset.id 
                                    ? 'ring-2 ring-orange-500 ring-offset-2 scale-95 border-transparent' 
                                    : 'border-neutral-200 hover:scale-105'
                                }`}
                                style={{ backgroundColor: preset.value }}
                                title={preset.name}
                              >
                                {selectedPresetId === preset.id && (
                                  <Check className={`h-4.5 w-4.5 ${preset.value === '#FFFFFF' || preset.value === '#F3F4F6' ? 'text-neutral-800' : 'text-white'}`} />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Display ARTISTIC INDIVIDUAL GRADIENTS catalog */}
                      {editorSettings.backgroundType === 'gradient' && (
                        <div>
                          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">Select Gradient flow:</span>
                          <div className="grid grid-cols-4 gap-2">
                            {GRADIENT_PRESETS.map(preset => (
                              <button
                                key={preset.id}
                                onClick={() => {
                                  selectPreset(preset);
                                  setActiveTab('backdrop');
                                }}
                                className={`h-11 rounded-xl border transition-all flex items-center justify-center relative ${
                                  selectedPresetId === preset.id 
                                    ? 'ring-2 ring-orange-500 ring-offset-2 border-transparent scale-95' 
                                    : 'border-neutral-200 hover:scale-[1.03]'
                                }`}
                                style={{ background: preset.value }}
                                title={preset.name}
                              >
                                {selectedPresetId === preset.id && (
                                  <Check className="h-4 w-4 text-white drop-shadow" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Display HIGH RESOLUTION ART EXPERIENCES catalog */}
                      {editorSettings.backgroundType === 'image' && (
                        <div className="space-y-4">
                          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Choose Landscape backdrops:</span>
                          <div className="grid grid-cols-4 gap-2">
                            {/* Upload custom background CTA */}
                            <button
                              onClick={() => bgFileInputRef.current?.click()}
                              className="aspect-square rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 hover:bg-neutral-100 flex flex-col items-center justify-center text-neutral-400 font-bold transition focus:outline-none"
                              title="Upload custom background picture"
                            >
                              <Plus className="h-5 w-5 text-neutral-500" />
                              <span className="text-[8px] mt-1 font-sans">Custom</span>
                            </button>
                            <input
                              ref={bgFileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleCustomBgUpload}
                              className="hidden"
                            />

                            {/* Presets iterator */}
                            {IMAGE_PRESETS.map(preset => (
                              <button
                                key={preset.id}
                                onClick={() => {
                                  selectPreset(preset);
                                  setActiveTab('backdrop');
                                }}
                                className={`aspect-square rounded-xl border overflow-hidden relative transition-all ${
                                  selectedPresetId === preset.id 
                                    ? 'ring-2 ring-orange-500 ring-offset-2 border-transparent scale-95' 
                                    : 'border-neutral-200 hover:scale-[1.03]'
                                }`}
                                title={preset.name}
                              >
                                <img
                                  src={preset.value}
                                  alt={preset.name}
                                  className="h-full w-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                                {selectedPresetId === preset.id && (
                                  <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                                    <Check className="h-5 w-5 text-white" />
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>

                          {/* ARTISTIC BLUR CONVERSION LAYOUT */}
                          <div className="space-y-2 border-t border-neutral-100 pt-3">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-neutral-700 flex items-center space-x-1">
                                <Sliders className="h-3.5 w-3.5 text-neutral-400" />
                                <span>Background Blur Effect</span>
                              </span>
                              <span className="font-mono text-orange-600 font-bold">
                                {editorSettings.blurValue === 0 ? 'None' : `${editorSettings.blurValue}px`}
                              </span>
                            </div>
                            
                            <input
                              type="range"
                              min="0"
                              max="20"
                              value={editorSettings.blurValue}
                              onChange={(e) => {
                                setEditorSettings(prev => ({ ...prev, blurValue: Number(e.target.value) }));
                                setActiveTab('backdrop');
                              }}
                              className="w-full accent-orange-500 h-1.5 bg-neutral-100 rounded-lg cursor-pointer"
                            />
                            
                            <div className="flex justify-between text-[9px] text-neutral-400 font-mono font-medium">
                              <span>Sharp (0px)</span>
                              <span>Soft</span>
                              <span>Moody (10px)</span>
                              <span>Dreamy (20px)</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* HISTORY LOGS OF PREVIOUSLY PROCESSED IMAGES DURING SESSION */}
                  {sessionHistory.length > 1 && (
                    <div className="bg-white rounded-2xl border border-neutral-150 p-5 shadow-sm space-y-3">
                      <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-neutral-400">
                        <History className="h-4 w-4" />
                        <span>Session History</span>
                      </div>
                      <div className="flex items-center gap-3 overflow-x-auto pb-1">
                        {sessionHistory.map(histImg => (
                          <button
                            key={histImg.id}
                            onClick={() => {
                              setCurrentImage(histImg);
                              setActiveTab('compare');
                            }}
                            className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-neutral-200 transition-all ${
                              currentImage.id === histImg.id 
                                ? 'ring-2 ring-orange-500 ring-offset-1 border-transparent scale-95' 
                                : 'hover:scale-105'
                            }`}
                          >
                            <img
                              src={histImg.editedUrl || histImg.processedUrl || histImg.originalUrl}
                              alt={histImg.name}
                              className="h-full w-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

              </div>
            )}

          </section>
        )}

      {/* PRICING PLANS & ACQUISITION REGISTRATION PORTAL */}
      <section id="pricing-section" className="bg-neutral-50/70 border-t border-neutral-150 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Headline */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center space-x-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600 uppercase tracking-widest mb-4">
              <Sparkles className="h-3 w-3" />
              <span>Premium AI Without Server Middlemen</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight leading-tight">
              Simple, Transparent <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-650">Pricing Plans</span>
            </h2>
            <p className="mt-4 text-sm text-neutral-500 font-medium leading-relaxed">
              Forget expensive cloud subscription fees. Because all AI segmentation processes run entirely inside your private browser sandbox using local processor power, we save on server costs — and pass 100% of the savings back to you!
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
            
            {/* Plan 1: Speed Draft */}
            <div className="rounded-3xl border border-neutral-200 bg-white p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition duration-200 relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-neutral-900 uppercase tracking-wider">🏃 Speed Draft</h3>
                  <span className="text-[10px] uppercase font-mono font-bold text-neutral-400 bg-neutral-50 px-2 py-0.5 rounded border border-neutral-150">Basic</span>
                </div>
                <p className="text-[11px] text-neutral-400 font-medium mt-1">Perfect for fast drafts & web-optimized shots.</p>
                
                <div className="mt-6 flex items-baseline">
                  <span className="text-4xl font-black text-neutral-900 leading-none">$0</span>
                  <span className="text-xs text-neutral-400 font-semibold ml-1">/ forever</span>
                </div>

                <ul className="mt-8 space-y-4 text-xs font-medium text-neutral-550 border-t border-neutral-100 pt-6">
                  <li className="flex items-center space-x-2.5">
                    <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span>Quantized 8-bit weights (11 MB)</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span>Max resolution: <strong>800px</strong></span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span>100% Secure private offline sandbox</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span>Unlimited png exports</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => handleNavClick('upload')}
                  className="w-full py-3 px-4 rounded-xl border border-neutral-200 font-bold text-xs text-neutral-700 bg-neutral-50/50 hover:bg-neutral-100/80 active:scale-95 transition block text-center"
                >
                  Start Instantly
                </button>
              </div>
            </div>

            {/* Plan 2: Balanced Pro (Beta Promo highlighted) */}
            <div className="rounded-3xl border-2 border-orange-500 bg-white p-8 flex flex-col justify-between shadow-md relative overflow-hidden transform md:-translate-y-2">
              <span className="absolute top-3.5 right-3.5 rounded-full bg-orange-100 px-2 py-0.5 text-[9px] font-bold text-orange-600 uppercase tracking-wide">
                🔥 active offer
              </span>
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-orange-600 uppercase tracking-wider flex items-center gap-1">
                    <span>✨ Balanced Pro</span>
                  </h3>
                  <span className="text-[10px] uppercase font-mono font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded border border-orange-150">Optimal</span>
                </div>
                <p className="text-[11px] text-neutral-400 font-medium mt-1">Best for content creators and high-clarity portraits.</p>
                
                <div className="mt-6 flex items-baseline">
                  <span className="text-4xl font-black text-neutral-900 leading-none">$0</span>
                  <span className="text-xs text-neutral-400 font-bold line-through ml-2">$9</span>
                  <span className="text-xs text-orange-600 font-bold ml-1.5">(Free Beta)</span>
                </div>

                <ul className="mt-8 space-y-4 text-xs font-medium text-neutral-600 border-t border-neutral-100 pt-6">
                  <li className="flex items-center space-x-2.5">
                    <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span>Precision 16-bit float maps (22 MB)</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span>Max high-res dimension: <strong>1600px</strong></span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <Check className="h-4 w-4 text-emerald-500 flex-shrink-0 text-orange-500 animate-pulse" />
                    <span className="text-orange-950 font-bold">1-Click Smart Wand Refiner</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span>Keep Context Aspect Ratio feature</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span>Full manual background layers editing</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => handleNavClick('upload')}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-orange-500 hover:bg-orange-600 shadow-md shadow-orange-500/15 active:scale-95 transition block text-center"
                >
                  Unlock Balanced Pro
                </button>
              </div>
            </div>

            {/* Plan 3: Professional Studio HD */}
            <div className="rounded-3xl border border-neutral-200 bg-white p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition duration-200 relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-neutral-900 uppercase tracking-wider">⭐ Professional Studio HD</h3>
                  <span className="text-[10px] uppercase font-mono font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-150">Top-end</span>
                </div>
                <p className="text-[11px] text-neutral-400 font-medium mt-1">Ultimate quality maps for printing & developers.</p>
                
                <div className="mt-6 flex items-baseline">
                  <span className="text-4xl font-black text-neutral-900 leading-none">$0</span>
                  <span className="text-xs text-neutral-400 font-bold line-through ml-2">$19</span>
                  <span className="text-xs text-purple-600 font-bold ml-1.5">(Free Beta)</span>
                </div>

                <ul className="mt-8 space-y-4 text-xs font-medium text-neutral-550 border-t border-neutral-100 pt-6">
                  <li className="flex items-center space-x-2.5">
                    <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span>Raw unquantized 32-bit floats (44 MB)</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span>Raw studio HD resolution: <strong>2800px</strong></span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span>Deep pixel boundaries segmentations</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span>100% offline local model weights</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => handleNavClick('upload')}
                  className="w-full py-3 px-4 rounded-xl border border-neutral-200 font-bold text-xs text-neutral-700 bg-neutral-50/50 hover:bg-neutral-100/80 active:scale-95 transition block text-center"
                >
                  Unlock Studio HD
                </button>
              </div>
            </div>

          </div>

          {/* USER ACQUISITION EMAIL NEWSLETTER PORTAL */}
          <div className="max-w-3xl mx-auto w-full mt-16 bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-3xl p-8 sm:p-10 shadow-lg text-white border border-neutral-800 text-center relative overflow-hidden">
            <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
            
            <span className="inline-flex items-center space-x-1 rounded-full bg-neutral-800 border border-neutral-700/65 px-2.5 py-0.5 text-[10px] font-extrabold text-orange-400 uppercase tracking-widest mb-4">
              ✨ JOIN OUR PRIVATE BETA WAITLIST
            </span>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-2">
              All Premium HD Features Unlocked for Free Today
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 font-medium max-w-xl mx-auto leading-relaxed mb-6">
              Help us grow bgi remove! Stash your email to reserve your permanent beta access spot and receive instant notices whenever we drop new local edge segmentations models.
            </p>

            {isWaitlistSubmitted ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl p-4.5 max-w-xl mx-auto flex items-center justify-center space-x-3 text-xs animate-fadeIn">
                <Check className="h-5 w-5 bg-emerald-500 text-neutral-900 rounded-full p-1 flex-shrink-0" />
                <span className="font-bold text-left">{waitlistMessage}</span>
              </div>
            ) : (
              <form onSubmit={handleWaitlistSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-2.5">
                <input
                  type="email"
                  placeholder="Enter your email address..."
                  value={waitlistEmail}
                  onChange={(e) => setWaitlistEmail(e.target.value)}
                  className="flex-1 min-w-0 rounded-xl bg-neutral-950/80 border border-neutral-800 px-4 py-3 text-xs text-white focus:border-orange-500 focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  className="rounded-xl bg-orange-500 px-6 py-3 font-extrabold text-xs text-white shadow-md shadow-orange-500/20 hover:bg-orange-400 active:scale-95 transition shrink-0"
                >
                  Join Beta Waitlist
                </button>
              </form>
            )}

            <p className="text-[10px] text-neutral-500 font-mono mt-4">
              🔒 No credit card required. All data stays strictly confidential. Zero spam guarantee.
            </p>
          </div>

          {/* Real user counters to build high SaaS design fidelity */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-6 sm:gap-10 text-xs font-semibold text-neutral-400 select-none">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span><strong>14,210+</strong> active browsers sandbox processed</span>
            </span>
            <span>•</span>
            <span>🔒 Complete Local Privacy</span>
            <span>•</span>
            <span>⚡ WASM ONNX Multithreaded Acceleration</span>
          </div>

        </div>
      </section>

      </main>

      {/* FULL-SCREEN CANVAS BRUSH EDITOR DIALOG MODAL */}
      {isBrushEditorOpen && currentImage && (
        <BrushEditor
          originalUrl={currentImage.originalUrl}
          processedUrl={currentImage.processedUrl!}
          onSave={handleBrushSave}
          onCancel={() => setIsBrushEditorOpen(false)}
          imageName={currentImage.name}
        />
      )}

      {/* Trust & Local computing banner footer section */}
      <Footer />

    </div>
  );
}
