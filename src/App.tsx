import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  UploadCloud,
  Image as ImageIcon, 
  Trash2, 
  Download, 
  RefreshCw, 
  Scissors, 
  Check, 
  Layers, 
  AlertCircle, 
  Palette, 
  Eye, 
  Plus, 
  Link as LinkIcon, 
  Info,
  ShieldAlert,
  Sliders,
  History,
  FileImage,
  ShieldCheck,
  X,
  Sparkles
} from 'lucide-react';
import { removeBackground, Config } from '@imgly/background-removal';

import Header from './components/Header';
import Footer from './components/Footer';
import CompareSlider from './components/CompareSlider';
import BrushEditor from './components/BrushEditor';
import SEOContent from './components/SEOContent';
import Breadcrumbs from './components/Breadcrumbs';
import AboutContact from './components/AboutContact';
import ImageCropper from './components/ImageCropper';

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
  const [croppingImage, setCroppingImage] = useState<{ src: string | File; name: string } | null>(null);
  const [sessionHistory, setSessionHistory] = useState<ProcessedImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Quick helper to initiate cropping step
  const initiateImageSelect = (src: string | File, name: string) => {
    setCroppingImage({ src, name });
  };
  
  // Custom URL paste state
  const [urlInput, setUrlInput] = useState('');
  const [isUrlSubmitting, setIsUrlSubmitting] = useState(false);

  // Gemini AI Background Generation states
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAiBg, setIsGeneratingAiBg] = useState(false);
  const [aiBgError, setAiBgError] = useState<string | null>(null);
  const [aiGeneratedImages, setAiGeneratedImages] = useState<string[]>([]);

  const handleGenerateAiBackground = async () => {
    if (!aiPrompt.trim()) return;

    setIsGeneratingAiBg(true);
    setAiBgError(null);

    try {
      const response = await fetch('/api/generate-backdrop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: aiPrompt.trim(),
          aspectRatio: '1:1',
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate background image.');
      }

      if (data.imageUrl) {
        setEditorSettings(prev => ({
          ...prev,
          backgroundType: 'ai',
          imageValue: data.imageUrl,
        }));
        setSelectedPresetId('ai-generated');
        setAiGeneratedImages(prev => [data.imageUrl, ...prev].slice(0, 8));
        setActiveTab('backdrop');
      } else {
        throw new Error('Invalid image data received from server.');
      }
    } catch (err: any) {
      console.error(err);
      setAiBgError(err?.message || 'Failed to generate AI background.');
    } finally {
      setIsGeneratingAiBg(false);
    }
  };

  // Tab state: 'compare' | 'backdrop'
  const [activeTab, setActiveTab] = useState<'compare' | 'backdrop'>('compare');

  // Active primary website section state
  const [activeSection, setActiveSection] = useState<string>('upload');

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

  // Dynamic SEO Metadata and Header Management
  useEffect(() => {
    let title = 'BGI Remove - Free Image Background Remover';
    let description = 'Remove image backgrounds instantly using BGI Remove. Fully client-side, secure, and free.';
    let schemaType = 'WebApplication';
    let schemaData: any = null;

    const slug = activeSection === 'upload' ? '' : activeSection;
    const pageUrl = `https://bgiremove.com/${slug}`;

    switch (activeSection) {
      case 'about':
        title = 'About Company & Local Sandboxed Models | BGI Remove';
        description = 'Discover the mission behind BGI Remove—built entirely for secure, client-side browser backgrounds erasure with zero data storage.';
        schemaType = 'AboutPage';
        schemaData = {
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": "About BGI Remove team",
          "url": "https://bgiremove.com/about",
          "description": "Learn about BGI Remove - our local serverless AI processing models and core commitments to complete privacy and premium tools."
        };
        break;
      case 'contact':
        title = 'Contact Us & Direct Technical Support | BGI Remove';
        description = 'Contact our specialist technical team directly or send your feedback and model requests using our integrated form.';
        schemaType = 'ContactPage';
        schemaData = {
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "name": "Contact BGI Remove Support",
          "url": "https://bgiremove.com/contact",
          "description": "Send us direct support messages, technical feedback, or customized request notes regarding regional biometric features."
        };
        break;
      case 'upload':
        title = 'BGI Remove - Free High Resolution Background Remover';
        description = 'Remove image backgrounds automatically and for free using BGI Remove. Fully client-side, secure, and offline-capable.';
        schemaData = {
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "BGI Remove",
          "url": "https://bgiremove.com/",
          "applicationCategory": "MultimediaApplication",
          "operatingSystem": "All",
          "browserRequirements": "Requires HTML5 Canvas and WebAssembly support",
          "description": "Premium local serverless background removal tool powered by high precision WASM segmented neural models.",
          "offers": {
            "@type": "Offer",
            "price": "0.00",
            "priceCurrency": "USD"
          }
        };
        break;
      case 'backdrop':
        title = 'Change Backgrounds Online - Transparent & Colors | BGI Remove';
        description = 'Replace image backgrounds with white, solid studio colors, or custom templates instantly. High quality and 100% private.';
        schemaData = {
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "BGI Remove - Backdrop Editor",
          "url": "https://bgiremove.com/backdrop",
          "applicationCategory": "MultimediaApplication",
          "operatingSystem": "All",
          "description": "Change backgrounds on cutout images instantly using color pickers, blur sliders, and stock preset backdrops.",
          "offers": {
            "@type": "Offer",
            "price": "0.00",
            "priceCurrency": "USD"
          }
        };
        break;
      case 'pricing':
        title = 'BGI Remove - 100% Free Premium Tiers & Pricing';
        description = 'Explore free beta pricing plans for high-resolution background removal. Zero subscription fees, zero server watermarks.';
        schemaData = {
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "BGI Remove - Pricing Page",
          "url": "https://bgiremove.com/pricing",
          "applicationCategory": "MultimediaApplication",
          "operatingSystem": "All",
          "description": "Unlock premium float32 4K background eraser layers during our open free beta trial.",
          "offers": {
            "@type": "Offer",
            "price": "0.00",
            "priceCurrency": "USD"
          }
        };
        break;
      case 'docs':
        title = 'User Guides, Specifications & Background Erasers | BGI Remove';
        description = 'Browse tutorials on biometric passport cropping, background erasing, transparent PNG isolation, and studio settings.';
        schemaType = 'Article';
        break;
      case 'blog':
        title = 'BGI Remove Blog - Photo Editing Skills & Benchmarks';
        description = 'Discover tips, photography tricks, and comparison benchmark studies written by digital design creators.';
        schemaType = 'Article';
        break;
      case 'passport-photo':
        title = 'Passport Photo Background Remover & Biometric Rules | BGI Remove';
        description = 'Prepare US and EU compliant biometric passport photos by instantly replacing backgrounds with solid flat studio white.';
        schemaType = 'Article';
        break;
      case 'white-background':
        title = 'Remove White Backgrounds Online & Isolate Icons | BGI Remove';
        description = 'Automatically isolate transparent outlines and vector masks from original white backdrops without quality loss.';
        schemaType = 'Article';
        break;
      case 'free-remover':
        title = '100% Free Serverless Image Background Removal | BGI Remove';
        description = 'Learn how BGI Remove utilizes advanced local client web-assembly parameters to remain 100% free of cloud costs.';
        schemaType = 'Article';
        break;
      case 'hd':
        title = 'Studio HD 4K Background Remover Quality Settings | BGI Remove';
        description = 'Access maximum image clarity up to 2800px on your high-definition graphics using local float32 neural parameters.';
        schemaType = 'Article';
        break;
      case 'article-remove-bg':
        title = 'How to Remove Image Backgrounds Perfectly - Master Tutorial';
        description = 'A guide to professional photo masking—covering optimal shooting angles, lighting, and pixel level contrast tricks.';
        schemaType = 'Article';
        break;
      case 'article-best-ai':
        title = 'Best Background Removers in 2026: Speed vs Cost';
        description = 'An in-depth performance study testing local browser WASM runtimes against high-priced cloud servers.';
        schemaType = 'Article';
        break;
      case 'article-product-photos':
        title = 'A Guide to Product Background Removal for Shopify Stores';
        description = 'Increase storefront sales by automatically isolating product items onto pristine, distraction-free neutral tiles.';
        schemaType = 'Article';
        break;
      case 'article-professional-headshots':
        title = 'Professional Headshots: Remove Backgrounds for LinkedIn & Portfolios';
        description = 'Create clean, professional headshots with background removal and smart portrait styling for resumes, networks, and profiles.';
        schemaType = 'Article';
        break;
      case 'article-free-background-remover':
        title = 'Free Background Remover for Small Business & Social Media';
        description = 'Use free browser-based background removal to make product photos, social graphics, and marketing visuals look premium.';
        schemaType = 'Article';
        break;
    }

    if (schemaType === 'Article' && !schemaData) {
      schemaData = {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        "headline": title,
        "description": description,
        "url": pageUrl,
        "image": "https://bgiremove.com/og-image.svg",
        "inLanguage": "en-US",
        "author": {
          "@type": "Organization",
          "name": "BGI Remove Specialist Editorial Team"
        },
        "publisher": {
          "@type": "Organization",
          "name": "BGI Remove",
          "logo": {
            "@type": "ImageObject",
            "url": "https://bgiremove.com/favicon.ico"
          }
        },
        "mainEntityOfPage": pageUrl
      };
    }

    // Update browser document title
    document.title = title;

    // Helper to dynamically update meta tags in client HTML
    const updateMetaTag = (selector: string, attribute: string, value: string) => {
      const element = document.querySelector(selector);
      if (element) {
        element.setAttribute(attribute, value);
      }
    };

    updateMetaTag('meta[name="description"]', 'content', description);
    updateMetaTag('meta[property="og:title"]', 'content', title);
    updateMetaTag('meta[property="og:description"]', 'content', description);
    updateMetaTag('meta[property="og:url"]', 'content', pageUrl);
    updateMetaTag('meta[name="twitter:title"]', 'content', title);
    updateMetaTag('meta[name="twitter:description"]', 'content', description);

    // 1. Dynamic Canonical Tag Injection
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', pageUrl);

    // 2. Structured Data Schema JSON-LD Injector
    let jsonLdScript = document.getElementById('bgi-seo-jsonld') as HTMLScriptElement;
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.id = 'bgi-seo-jsonld';
      jsonLdScript.type = 'application/ld+json';
      document.head.appendChild(jsonLdScript);
    }
    jsonLdScript.textContent = JSON.stringify(schemaData);

  }, [activeSection]);


  const handleNavClick = (destination: 'upload' | 'backdrop' | 'pricing' | 'docs' | 'blog' | string) => {
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
    } else {
      // For general virtual guides or blogs, scroll smoothly and instantly to top coordinates
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
    brushSize: 30,
    shadowValue: 0
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

  // Beta Modal promotional alert popup state for premium tiers
  const [betaModal, setBetaModal] = useState<{
    isOpen: boolean;
    profileName: string;
    originalPrice: string;
    targetMode: 'isnet_fp16' | 'isnet';
    description: string;
  } | null>(null);

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
  const applyMaskToOriginal = (originalFile: string | File | Blob, cutoutBlob: Blob): Promise<Blob> => {
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
  const resizeImageToMax = (file: string | File | Blob, maxDimension: number): Promise<Blob> => {
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
  const processImage = async (imageSrc: string | File | Blob, originalName: string) => {
    const uniqueId = Math.random().toString(36).substring(7);
    const initialUrl = typeof imageSrc === 'string' ? imageSrc : URL.createObjectURL(imageSrc);

    const newImage: ProcessedImage = {
      id: uniqueId,
      name: originalName,
      size: imageSrc instanceof Blob ? imageSrc.size : 256000,
      width: 0,
      height: 0,
      originalUrl: initialUrl,
      originalFile: imageSrc instanceof Blob ? imageSrc : undefined,
      status: 'loading',
      progress: 0,
      progressStep: 'Reading image data...'
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
      let processedSrcToSegment: string | File | Blob = imageSrc;
      let resizeDimension = 0;
      if (qualityMode === 'isnet_quint8') {
        resizeDimension = 800;
        setCurrentImage(prev => prev ? { ...prev, progressStep: 'Optimizing and resizing image...' } : null);
      } else if (qualityMode === 'isnet_fp16') {
        resizeDimension = 1600;
        setCurrentImage(prev => prev ? { ...prev, progressStep: 'Optimizing and resizing image...' } : null);
      } else {
        resizeDimension = 2800; // Cap Studio HD at safe 2800px so it never triggers browser WASM memory crashes
        setCurrentImage(prev => prev ? { ...prev, progressStep: 'Optimizing and resizing image...' } : null);
      }

      try {
        processedSrcToSegment = await resizeImageToMax(imageSrc, resizeDimension);
      } catch (resizeErr) {
        console.warn('CORS / Canvas resize restriction. Falling back to raw file input sizes.', resizeErr);
      }

      // 2. Set up model configuration parameters with progress step strings
      const config: Config = {
        model: qualityMode, // Instruct @imgly/background-removal to load the specified precision model
        rescale: rescaleMode, // Override scale normalization
        progress: (key: string, current: number, total: number) => {
          const percent = Math.round((current / total) * 100);
          let step = 'Analyzing pixels...';
          
          if (key.includes('fetch')) {
            step = 'Downloading local model parameters (first load)...';
          } else if (key.includes('compute')) {
            step = 'Isolating foreground structure...';
          } else if (key.includes('isolate')) {
            step = 'Generating alpha transparency mask...';
          } else {
            step = 'Processing segmentations...';
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
      const maskedBlob = await removeBackground(processedSrcToSegment as any, config);
      
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
      console.warn('Real background-removal failed or security blocked. Running local contour fallback.', err);
      
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
        initiateImageSelect(file, file.name);
      } else {
        setError('Please drop valid image files (png, jpeg, webp) only.');
      }
    }
  };

  // Manual Pick
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      initiateImageSelect(file, file.name);
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
    initiateImageSelect(cleanedUrl, filename);
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
            initiateImageSelect(file, 'clipboard_capture.png');
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
        // Draw cropped subject with optional drop shadow
        ctx.filter = 'none';
        
        const sVal = editorSettings.shadowValue || 0;
        if (sVal > 0) {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
          // Map shadow blur from interactive viewport width (~600px display context) onto real layout canvas width:
          const scale = canvas.width / 600;
          ctx.shadowBlur = sVal * scale;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = (sVal * 0.4) * scale;
        } else {
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        }

        ctx.drawImage(fgImg, 0, 0, canvas.width, canvas.height);

        // Reset shadow properties after drawing the subject to avoid bleeding
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

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
      } else if (editorSettings.backgroundType === 'image' || editorSettings.backgroundType === 'ai') {
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
    if (editorSettings.backgroundType === 'image' || editorSettings.backgroundType === 'ai') {
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
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 selection:bg-indigo-500 selection:text-white font-sans">
      
      {/* Navigation Header */}
      <Header onNavClick={handleNavClick} activeSection={activeSection} />

      {/* Primary Area Container */}
      <main className="flex-1 flex flex-col">
        {['docs', 'blog', 'passport-photo', 'white-background', 'hd', 'free-remover', 'article-remove-bg', 'article-best-ai', 'article-product-photos', 'article-professional-headshots', 'article-free-background-remover', 'about', 'contact'].includes(activeSection) ? (
          <>
            <Breadcrumbs activeSection={activeSection} onNavigate={(view) => setActiveSection(view)} />
            {['about', 'contact'].includes(activeSection) ? (
              <AboutContact initialTab={activeSection as 'about' | 'contact'} />
            ) : (
              <SEOContent 
                currentView={activeSection} 
                onNavigate={(view) => setActiveSection(view)}
                onApplyPreset={(preset) => {
                  // Apply Preset Backdrop Settings
                  setEditorSettings(prev => ({
                    ...prev,
                    backgroundType: preset.backgroundType,
                    colorValue: preset.colorValue || prev.colorValue,
                    imageValue: preset.imageValue || prev.imageValue
                  }));
                  if (preset.rescaleMode !== undefined) {
                    setRescaleMode(preset.rescaleMode);
                  }
                }}
              />
            )}
          </>
        ) : (
          <>
            {croppingImage ? (
              <ImageCropper
                imageSrc={croppingImage.src}
                name={croppingImage.name}
                onConfirm={(croppedBlob) => {
                  const savedName = croppingImage.name;
                  setCroppingImage(null);
                  processImage(croppedBlob, savedName);
                }}
                onSkip={() => {
                  const savedSrc = croppingImage.src;
                  const savedName = croppingImage.name;
                  setCroppingImage(null);
                  processImage(savedSrc, savedName);
                }}
                onCancel={() => {
                  setCroppingImage(null);
                }}
              />
            ) : (
              <>
                {/* VIEW 1: HERO PORTAL (No image uploaded yet) */}
                {!currentImage && (
          <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex-1 flex flex-col justify-center">
            
            {/* Elegant Header Display Info */}
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Remove Image <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-500">Background</span>
              </h1>
              <p className="mt-4 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto">
                100% automatic and free. Processing is done securely in your browser—your files never leave your computer.
              </p>
            </div>

            {/* Core Interactive Sandbox Card layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch w-full mb-12" id="try-it-now">
              
              {/* UPLOAD ZONE (7 Cols wide) */}
              <div className="lg:col-span-7 flex flex-col">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`flex-1 flex flex-col items-center justify-center p-10 rounded-2xl border-2 border-dashed transition-all relative ${
                    isDraggingOver 
                      ? 'border-indigo-500 bg-indigo-500/10' 
                      : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 hover:border-indigo-500/30'
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
                  <div className="h-14 w-14 rounded-xl bg-indigo-500/10 shadow-inner flex items-center justify-center text-indigo-400 mb-6 border border-indigo-500/20 hover:scale-105 transition duration-150">
                    <UploadCloud className="h-7 w-7 animate-pulse" />
                  </div>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-xl bg-indigo-650 px-6 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-600 active:scale-98 transition duration-150"
                    id="btn-upload-trigger"
                  >
                    Select Photo
                  </button>

                  <p className="mt-4 text-xs font-semibold text-zinc-500 animate-pulse">
                    or drag and drop your file here
                  </p>

                  <p className="mt-2 text-[11px] text-zinc-500">
                    Supports PNG, JPEG, WEBP.
                  </p>

                  {/* Quick paste indicator */}
                  <div className="absolute bottom-4 text-[10px] text-zinc-500 bg-zinc-950 border border-zinc-850 rounded px-2.0 py-0.5 shadow-sm font-mono flex items-center space-x-1 select-none">
                    <span>Press</span>
                    <span className="bg-zinc-900 px-1 rounded font-semibold text-[9px] text-zinc-400 border border-zinc-800">Ctrl + V</span>
                    <span>anywhere to paste</span>
                  </div>
                </div>
              </div>

              {/* URL PASTE & PRIVACY INFO (5 Cols wide) */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                
                {/* Paste URL block */}
                <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 shadow-sm space-y-4 flex flex-col justify-center">
                  <div className="flex items-center space-x-2">
                    <LinkIcon className="h-4 w-4 text-zinc-400" />
                    <span className="font-semibold text-sm text-zinc-100">Process from URL</span>
                  </div>
                  <form onSubmit={handleUrlSubmit} className="flex space-x-2">
                    <input
                      type="url"
                      placeholder="Paste secure image URL (https://...)"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      required
                      className="flex-1 min-w-0 rounded-xl border border-zinc-800 px-3 py-2.5 text-xs focus:border-indigo-500 focus:outline-none bg-zinc-950 text-zinc-100 placeholder-zinc-500"
                      id="url-paste-input"
                    />
                    <button
                      type="submit"
                      disabled={isUrlSubmitting}
                      className="rounded-xl bg-zinc-800 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-zinc-700 disabled:opacity-50 transition flex-shrink-0"
                      id="btn-url-submit"
                    >
                      Fetch
                    </button>
                  </form>
                  <p className="text-[10px] text-zinc-500 leading-relaxed font-mono">
                    Must be direct URL and allow CORS requests.
                  </p>
                </div>

                {/* Privacy Guarantee Block */}
                <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 flex-1 flex flex-col justify-center space-y-4">
                  <div className="flex items-start space-x-3 text-xs leading-relaxed">
                    <div className="rounded-lg bg-emerald-500/10 p-1 text-emerald-400 mt-0.5">
                      <Check className="h-3.5 w-3.5 font-bold" />
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-200 text-xs">No Server Uploads</h4>
                      <p className="text-zinc-400 text-[11px] mt-0.5 font-medium">Your graphics are secure and private—all rendering is done via high-speed WebAssembly directly in your browser.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 text-xs leading-relaxed">
                    <div className="rounded-lg bg-indigo-500/10 p-1 text-indigo-400 mt-0.5">
                      <Check className="h-3.5 w-3.5 font-bold" />
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-200 text-xs">Dynamic Backdrops</h4>
                      <p className="text-zinc-400 text-[11px] mt-0.5 font-medium">Instantly apply studio-style solid colors, subtle gradients, or blurred background templates.</p>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* ERROR PRESENTATION */}
            {error && (
              <div className={`mx-auto max-w-xl w-full mb-8 rounded-xl p-4 flex items-start space-x-3 border ${
                error.toLowerCase().includes('please upload') || error.toLowerCase().includes('cors')
                  ? 'bg-indigo-500/5 border-indigo-500/20 text-indigo-300'
                  : 'bg-red-500/5 border-red-500/20 text-red-400'
              }`}>
                {error.toLowerCase().includes('please upload') || error.toLowerCase().includes('cors') ? (
                  <Info className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="text-xs">
                  <span className="font-bold leading-relaxed block">
                    {error.toLowerCase().includes('please upload') 
                      ? 'Upload Required' 
                      : error.toLowerCase().includes('cors') 
                      ? 'Local Sandbox Guide' 
                      : 'Attention Required'}
                  </span>
                  <p className={`${
                    error.toLowerCase().includes('please upload') || error.toLowerCase().includes('cors')
                      ? 'text-zinc-300'
                      : 'text-red-400'
                  } mt-0.5`}>{error}</p>
                </div>
              </div>
            )}

            {/* DEMO IMAGES ROW TRAY */}
            <div className="w-full max-w-5xl mx-auto border-t border-zinc-900 pt-8 mt-4">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block text-center mb-5 animate-pulse">
                Don&apos;t have an image? Try one of these presets:
              </span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {SAMPLE_IMAGES.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => initiateImageSelect(sample.url, `${sample.id}_trial.png`)}
                    className="group flex flex-col text-left rounded-xl border border-zinc-850 overflow-hidden bg-zinc-900/60 shadow-sm hover:bg-zinc-900 hover:border-indigo-500/40 hover:shadow-md transition duration-205 relative"
                    id={`demo-trigger-${sample.id}`}
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden bg-zinc-950 relative">
                      <img
                        src={sample.url}
                        alt={sample.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-2 left-2 rounded-md bg-zinc-950/95 px-2 py-0.5 text-[9px] font-bold text-white tracking-wide border border-zinc-800">
                        {sample.type}
                      </span>
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-zinc-200 block text-ellipsis overflow-hidden whitespace-nowrap max-w-[120px]">
                          {sample.name}
                        </span>
                        <span className="text-[10px] text-indigo-400 font-semibold mt-0.5 block">{sample.badge}</span>
                      </div>
                      <span className="h-6 w-6 rounded-full bg-zinc-800 group-hover:bg-indigo-600 text-zinc-400 group-hover:text-white flex items-center justify-center text-xs font-bold transition">
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
          <section id="workspace-panel" className="flex-1 flex flex-col bg-zinc-950">
            <div className="w-full border-b border-zinc-850 bg-zinc-900 py-3.5">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded bg-zinc-950 flex items-center justify-center text-zinc-400 border border-zinc-850">
                    <FileImage className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white leading-tight block truncate max-w-[190px] sm:max-w-xs">
                      {currentImage.name}
                    </h2>
                    <span className="text-[10px] font-mono font-semibold text-zinc-500">
                      {formatBytes(currentImage.size)} • {currentImage.width > 0 ? `${currentImage.width} x ${currentImage.height}px` : 'Calculating dimension...'}
                    </span>
                  </div>
                </div>

                {/* Reset or New Image upload and Engine switcher */}
                <div className="flex items-center space-x-2.5">
                  {/* On-the-fly quality mode switcher segment */}
                  <div className="hidden lg:flex items-center space-x-1 bg-zinc-950 p-1.5 rounded-xl border border-zinc-850">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest px-2 font-mono">Engine Profile:</span>
                    
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
                          ? 'bg-zinc-850 text-white shadow-sm border border-zinc-750'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
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
                          ? 'bg-zinc-850 text-white shadow-sm border border-zinc-750'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
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
                          ? 'bg-zinc-850 text-white shadow-sm border border-zinc-750'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                      }`}
                      title="Full studio float32, maximum boundary edge accuracy (44MB weights)"
                    >
                      <span>⭐ Studio HD</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setCurrentImage(null)}
                    className="rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 px-3.5 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white transition flex items-center space-x-1"
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
              <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 bg-zinc-950">
                <div className="max-w-md w-full text-center space-y-6">
                  
                  {/* Elegant central spinner */}
                  <div className="relative w-24 h-24 mx-auto">
                    {/* Pulsing ring background */}
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-500/10 animate-ping opacity-75" />
                    {/* Spinning active indicator */}
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin" style={{ animationDuration: '0.8s' }} />
                    {/* Inner percentage container */}
                    <div className="absolute inset-2 bg-zinc-900 rounded-full flex items-center justify-center shadow-md border border-zinc-800 font-mono text-sm font-extrabold text-indigo-400">
                      {currentImage.progress}%
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-white">
                      {currentImage.progressStep}
                    </h3>
                    <p className="text-xs text-zinc-400 font-sans font-medium max-w-xs mx-auto animate-pulse">
                      {currentImage.progress < 30 ? 'Setting up edge vectors...' : currentImage.progress < 90 ? 'Isolating pixel boundaries...' : 'Restoring high-res details...'}
                    </p>
                  </div>

                  {/* Visual Progress bar */}
                  <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-850">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-300"
                      style={{ width: `${currentImage.progress}%` }}
                    />
                  </div>

                  <p className="text-[10px] text-zinc-500 italic">
                    First run might take up to 20 seconds to fetch required local parameters. Consecutive trials occur instantly in offline state.
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
                  <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setActiveTab('compare')}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          activeTab === 'compare'
                            ? 'bg-zinc-800 text-white shadow-sm'
                            : 'text-zinc-400 hover:text-zinc-150'
                        }`}
                        id="tab-btn-compare"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Interactive Compare</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('backdrop')}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 shrink-0 ${
                          activeTab === 'backdrop'
                            ? 'bg-zinc-805 text-white shadow-sm ring-1 ring-zinc-700/30'
                            : 'text-zinc-300 hover:text-white hover:bg-zinc-850'
                        }`}
                        id="tab-btn-backdrop"
                      >
                        <Palette className="h-3.5 w-3.5 text-pink-400" />
                        <span>Change Background</span>
                      </button>
                    </div>

                    {/* Manual Cutout Indicator badge */}
                    {usingFallback && (
                      <div className="inline-flex items-center space-x-1 text-[10px] text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5 font-semibold">
                        <ShieldAlert className="h-3 w-3 text-amber-400 flex-shrink-0" />
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
                      <div className="relative h-full w-full overflow-hidden rounded-xl border border-zinc-800 shadow-sm flex items-center justify-center bg-checkerboard bg-zinc-950">
                        {/* Static CSS dynamic background styling */}
                        <div
                          className="absolute inset-0 h-full w-full transition-all duration-300 pointer-events-none"
                          style={getDynamicBackdropStyle()}
                        />

                        {/* Centered isolated foreground image */}
                        <img
                          src={currentImage.editedUrl || currentImage.processedUrl}
                          alt="Cropped Subject"
                          className="relative max-h-full max-w-full object-contain z-10 p-4 transition-all duration-150"
                          draggable={false}
                          referrerPolicy="no-referrer"
                          style={{
                            filter: (editorSettings.shadowValue || 0) > 0
                              ? `drop-shadow(0px ${((editorSettings.shadowValue || 0) * 0.4).toFixed(1)}px ${(editorSettings.shadowValue || 0)}px rgba(0, 0, 0, 0.45))`
                              : 'none'
                          }}
                        />

                        <span className="absolute bottom-3 left-3 rounded-md bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm z-20 select-none border border-zinc-800">
                          Current Preview
                        </span>
                      </div>
                    )}
                  </div>

                  {/* DIRECT CORRECTION NOTICE BANNER AND QUICK REFINE PORT */}
                  <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 flex-shrink-0 mt-0.5 border border-amber-500/15">
                        <Info className="h-4.5 w-4.5 text-amber-400 font-bold" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-amber-300 leading-tight">Laptop, desk or arms cropped out by mistake?</p>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          Segmentation algorithms focus mostly on human silhouettes and ignore inanimate furniture. Open the editor and use the new <strong>Smart Wand</strong> tool: simply click on the missing laptop or table, and the editor will auto-detect and restore the entire object instantly!
                        </p>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setIsBrushEditorOpen(true)}
                      className="px-4.5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-amber-600/15 transition flex items-center justify-center space-x-1.5 whitespace-nowrap self-stretch sm:self-center"
                    >
                      <Scissors className="h-3.5 w-3.5" />
                      <span>Open Smart Refiner</span>
                    </button>
                  </div>

                  {/* CORE COMMANDS ROW (Download Button trigger) */}
                  <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                    <div className="text-center sm:text-left">
                      <span className="text-[11px] font-bold text-zinc-500 block uppercase tracking-wider">Ready to Export</span>
                      <p className="text-xs text-zinc-400 mt-0.5">High-quality PNG processed entirely inside your browser sandbox.</p>
                    </div>

                    <div className="flex items-center space-x-3 w-full sm:w-auto">
                      <button
                        onClick={triggerImageDownload}
                        className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 rounded-xl bg-indigo-650 px-6 py-3.5 text-xs font-extrabold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-600 active:scale-95 transition"
                        id="btn-download-image"
                      >
                        <Download className="h-4.5 w-4.5" />
                        <span>Download Regular</span>
                      </button>

                      {/* Premium simulation HD download CTA */}
                      <button
                        onClick={triggerImageDownload}
                        className="hidden sm:inline-flex items-center space-x-2 rounded-xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 px-4 py-3.5 text-xs font-bold text-zinc-300 transition"
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
                  <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/15">
                          <Scissors className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">Fine-Tune Brushes</h4>
                          <p className="text-[10px] text-zinc-500">Perfect edge details manually</p>
                        </div>
                      </div>

                      <button
                        onClick={() => setIsBrushEditorOpen(true)}
                        className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 font-extrabold text-xs hover:bg-indigo-500/25 transition flex items-center space-x-1"
                        id="btn-open-eraser-brush"
                      >
                        <span>Erase / Restore</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed font-mono">
                      Did the automatic cutting miss any hair details or strap lines? Click above to rub out or bring back parts of the image with a customized cursor brush!
                    </p>
                  </div>

                  {/* BACKDROP CONTROL PANEL */}
                  <div id="backdrop-preset-section" className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5 shadow-sm space-y-5">
                    
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center space-x-1.5">
                        <Palette className="h-4 w-4 text-indigo-400" />
                        <span>1. Background Backdrops</span>
                      </h4>
                      <p className="text-[10px] text-zinc-500 leading-tight">Replace the transparent layout with vibrant artistic themes</p>
                    </div>

                    {/* Quick presets group tabs selector */}
                    <div className="grid grid-cols-5 gap-1 bg-zinc-950 p-1 rounded-xl text-center border border-zinc-850">
                      <button
                        onClick={() => {
                          setEditorSettings(prev => ({ ...prev, backgroundType: 'transparent' }));
                          setSelectedPresetId('transparent');
                          setActiveTab('backdrop');
                        }}
                        className={`py-1.5 rounded-lg text-[9px] sm:text-xs font-bold transition whitespace-nowrap overflow-hidden text-ellipsis ${
                          editorSettings.backgroundType === 'transparent'
                            ? 'bg-zinc-800 text-white shadow-sm'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        Clean
                      </button>

                      <button
                        onClick={() => {
                          setEditorSettings(prev => ({ ...prev, backgroundType: 'color' }));
                          selectPreset(COLOR_PRESETS[0]);
                          setActiveTab('backdrop');
                        }}
                        className={`py-1.5 rounded-lg text-[9px] sm:text-xs font-bold transition ${
                          editorSettings.backgroundType === 'color'
                            ? 'bg-zinc-800 text-white shadow-sm'
                            : 'text-zinc-400 hover:text-zinc-200'
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
                        className={`py-1.5 rounded-lg text-[9px] sm:text-xs font-bold transition ${
                          editorSettings.backgroundType === 'gradient'
                            ? 'bg-zinc-805 text-white shadow-sm'
                            : 'text-zinc-400 hover:text-zinc-200'
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
                        className={`py-1.5 rounded-lg text-[9px] sm:text-xs font-bold transition ${
                          editorSettings.backgroundType === 'image'
                            ? 'bg-zinc-800 text-white shadow-sm'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        Artistic
                      </button>

                      <button
                        onClick={() => {
                          setEditorSettings(prev => ({ ...prev, backgroundType: 'ai' }));
                          setSelectedPresetId('ai-generated');
                          setActiveTab('backdrop');
                        }}
                        className={`py-1.5 rounded-lg text-[9px] sm:text-xs font-extrabold transition flex items-center justify-center space-x-0.5 ${
                          editorSettings.backgroundType === 'ai'
                            ? 'bg-indigo-600 text-white shadow-sm border border-indigo-500/20'
                            : 'text-zinc-400 hover:text-indigo-400'
                        }`}
                      >
                        <Sparkles className="h-3 w-3 text-indigo-400 shrink-0" />
                        <span>AI backdrop</span>
                      </button>
                    </div>

                    {/* RENDER ACTIVE TILE SELECTION LIST */}
                    <div className="space-y-4">
                      {editorSettings.backgroundType === 'transparent' && (
                        <div className="h-28 rounded-xl border border-dashed border-zinc-800 flex items-center justify-center bg-zinc-950 hover:bg-zinc-900 transition cursor-pointer select-none">
                          <div className="text-center space-y-1 p-4">
                            <Check className="h-6 w-6 text-emerald-500 mx-auto" />
                            <span className="text-xs font-bold text-zinc-200">Transparent PNG Export Selected</span>
                            <p className="text-[10px] text-zinc-500">Suitable for graphic designs, logos, and catalogs.</p>
                          </div>
                        </div>
                      )}

                      {/* Display SOLID COLORS slider catalog */}
                      {editorSettings.backgroundType === 'color' && (
                        <div>
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">Select Solid backdrop Color:</span>
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
                                    ? 'ring-2 ring-indigo-500 scale-95 border-transparent' 
                                    : 'border-zinc-800 hover:scale-105'
                                }`}
                                style={{ backgroundColor: preset.value }}
                                title={preset.name}
                              >
                                {selectedPresetId === preset.id && (
                                  <Check className={`h-4.5 w-4.5 ${preset.value === '#FFFFFF' || preset.value === '#F3F4F6' ? 'text-zinc-950 font-bold' : 'text-white'}`} />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Display ARTISTIC INDIVIDUAL GRADIENTS catalog */}
                      {editorSettings.backgroundType === 'gradient' && (
                        <div>
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">Select Gradient flow:</span>
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
                                    ? 'ring-2 ring-indigo-500 border-transparent scale-95' 
                                    : 'border-zinc-800 hover:scale-[1.03]'
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
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Choose Landscape backdrops:</span>
                          <div className="grid grid-cols-4 gap-2">
                            {/* Upload custom background CTA */}
                            <button
                              onClick={() => bgFileInputRef.current?.click()}
                              className="aspect-square rounded-xl border-2 border-dashed border-zinc-850 bg-zinc-950 hover:bg-zinc-900 flex flex-col items-center justify-center text-zinc-500 font-bold transition focus:outline-none"
                              title="Upload custom background picture"
                            >
                              <Plus className="h-5 w-5 text-zinc-400" />
                              <span className="text-[8px] mt-1 font-sans text-zinc-500">Custom</span>
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
                                    ? 'ring-2 ring-indigo-500 border-transparent scale-95' 
                                    : 'border-zinc-850 hover:scale-[1.03]'
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
                          <div className="space-y-2 border-t border-zinc-850 pt-3">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-zinc-200 flex items-center space-x-1">
                                <Sliders className="h-3.5 w-3.5 text-zinc-500" />
                                <span>Background Blur Effect</span>
                              </span>
                              <span className="font-mono text-indigo-400 font-bold">
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
                              className="w-full accent-indigo-650 h-1.5 bg-zinc-950 rounded-lg cursor-pointer"
                            />
                            
                            <div className="flex justify-between text-[9px] text-zinc-500 font-mono font-medium">
                              <span>Sharp (0px)</span>
                              <span>Soft</span>
                              <span>Moody (10px)</span>
                              <span>Dreamy (20px)</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {editorSettings.backgroundType === 'ai' && (
                        <div className="space-y-4 select-none">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                            Generate Backdrop with Gemini API:
                          </span>
                          
                          <div className="space-y-2">
                            <textarea
                              placeholder="e.g., A luxury office desk with plants and soft bokeh, a futuristic neon cyberpunk street, beautiful sunset beach outdoors..."
                              value={aiPrompt}
                              onChange={(e) => setAiPrompt(e.target.value)}
                              rows={2}
                              className="w-full text-xs p-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 placeholder-zinc-650 focus:outline-none focus:border-indigo-500 resize-none font-sans"
                            />
                            
                            <button
                              onClick={handleGenerateAiBackground}
                              disabled={isGeneratingAiBg || !aiPrompt.trim()}
                              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-850 disabled:text-zinc-500 disabled:cursor-not-allowed font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 min-h-[40px]"
                            >
                              {isGeneratingAiBg ? (
                                <>
                                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                  <span>Generating Backdrop... (may take ~10s)</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="h-3.5 w-3.5" />
                                  <span>Generate Backdrop with Gemini</span>
                                </>
                              )}
                            </button>
                          </div>

                          {aiBgError && (
                            <div className="p-3.5 bg-red-950/20 border border-red-900/40 rounded-xl flex items-start space-x-2 text-red-400 text-xs">
                              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                              <span>{aiBgError}</span>
                            </div>
                          )}

                          {aiGeneratedImages.length > 0 && (
                            <div className="space-y-2 border-t border-zinc-850 pt-3">
                              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                                Generated Backdrops History:
                              </span>
                              <div className="grid grid-cols-4 gap-2">
                                {aiGeneratedImages.map((imgUrl, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => {
                                      setEditorSettings(prev => ({
                                        ...prev,
                                        backgroundType: 'ai',
                                        imageValue: imgUrl
                                      }));
                                      setSelectedPresetId(`ai-${idx}`);
                                      setActiveTab('backdrop');
                                    }}
                                    className={`aspect-square rounded-xl border overflow-hidden relative transition-all ${
                                      editorSettings.imageValue === imgUrl && editorSettings.backgroundType === 'ai'
                                        ? "ring-2 ring-indigo-500 border-transparent scale-95"
                                        : "border-zinc-850 hover:scale-[1.03]"
                                    }`}
                                  >
                                    <img src={imgUrl} alt="Generated Background" className="h-full w-full object-cover" />
                                    {editorSettings.imageValue === imgUrl && editorSettings.backgroundType === 'ai' && (
                                      <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                                        <Check className="h-5 w-5 text-white" />
                                      </div>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* ARTISTIC BLUR CONVERSION LAYOUT FOR AI BG */}
                          {editorSettings.imageValue && editorSettings.backgroundType === 'ai' && (
                            <div className="space-y-2 border-t border-zinc-850 pt-3">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-zinc-200 flex items-center space-x-1">
                                  <Sliders className="h-3.5 w-3.5 text-zinc-500" />
                                  <span>Background Blur Effect</span>
                                </span>
                                <span className="font-mono text-indigo-400 font-bold">
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
                                className="w-full accent-indigo-650 h-1.5 bg-zinc-950 rounded-lg cursor-pointer"
                              />

                              <div className="flex justify-between text-[9px] text-zinc-500 font-mono font-medium">
                                <span>Sharp (0px)</span>
                                <span>Soft</span>
                                <span>Moody (10px)</span>
                                <span>Dreamy (20px)</span>
                              </div>
                            </div>
                          )}

                          {/* DEPTH DROP SHADOW SLIDER */}
                          <div className="space-y-2 border-t border-zinc-850 pt-3">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-zinc-200 flex items-center space-x-1">
                                <Layers className="h-3.5 w-3.5 text-zinc-500" />
                                <span>Subject Drop Shadow</span>
                              </span>
                              <span className="font-mono text-indigo-400 font-bold">
                                {editorSettings.shadowValue === 0 ? 'None' : `${editorSettings.shadowValue}px`}
                              </span>
                            </div>
                            
                            <input
                              type="range"
                              min="0"
                              max="40"
                              value={editorSettings.shadowValue || 0}
                              onChange={(e) => {
                                setEditorSettings(prev => ({ ...prev, shadowValue: Number(e.target.value) }));
                                setActiveTab('backdrop');
                              }}
                              className="w-full accent-indigo-650 h-1.5 bg-zinc-950 rounded-lg cursor-pointer"
                            />
                            
                            <div className="flex justify-between text-[9px] text-zinc-500 font-mono font-medium">
                              <span>Sharp / Flat (0px)</span>
                              <span>Subtle (12px)</span>
                              <span>Balanced (24px)</span>
                              <span>Deep (40px)</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* HISTORY LOGS OF PREVIOUSLY PROCESSED IMAGES DURING SESSION */}
                  {sessionHistory.length > 1 && (
                    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5 shadow-sm space-y-3">
                      <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500">
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
                            className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-zinc-850 transition-all ${
                              currentImage.id === histImg.id 
                                ? 'ring-2 ring-indigo-500 border-transparent scale-95' 
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

      {/* ENGINE ARCHITECTURES & PERFORMANCE STATIONS */}
      <section id="pricing-section" className="bg-neutral-50 border-t border-neutral-150 py-16 md:py-20 text-neutral-800">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          
          {/* Main heading */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight leading-tight">
              Flexible Processing Profiles. <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">Zero Cost.</span>
            </h2>
            <p className="mt-4 text-sm text-neutral-500 font-medium leading-relaxed max-w-xl mx-auto">
              Our editor performs all neural network segmentation locally in your browser sandbox. Enjoy high-performance background removal with no subscription fees or server wait queues.
            </p>
          </div>

          {/* Clean specifications layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch mb-16">
            
            {/* Speed Draft Profile */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 flex flex-col justify-between shadow-xs hover:border-neutral-300 transition duration-150">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-widest">Speed Draft</h3>
                  <span className="text-[9px] font-mono font-bold text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded font-extrabold uppercase">Basic</span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-2 font-medium">Highly optimized for instant web drafts and quick social media graphics.</p>
                
                <div className="mt-5">
                  <div className="flex items-baseline">
                    <span className="text-2xl font-extrabold text-neutral-900">$0</span>
                    <span className="text-[10px] text-neutral-450 font-semibold ml-1">/ forever</span>
                  </div>
                </div>

                <ul className="mt-6 space-y-3.5 text-xs font-semibold text-neutral-600">
                  <li className="flex items-center space-x-2">
                    <Check className="h-3.5 w-3.5 text-indigo-600 flex-shrink-0" />
                    <span>8-bit quantized weights</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="h-3.5 w-3.5 text-indigo-600 flex-shrink-0" />
                    <span>Capped at 800px width</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="h-3.5 w-3.5 text-indigo-600 flex-shrink-0" />
                    <span>Runs locally on CPU/GPU</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6.5">
                <button
                  type="button"
                  onClick={() => handleNavClick('upload')}
                  className="w-full py-2.5 px-3 rounded-lg border border-neutral-200 font-bold text-xs text-neutral-700 hover:bg-neutral-50 active:scale-98 transition block text-center"
                >
                  Apply Filter
                </button>
              </div>
            </div>

            {/* Balanced Pro Profile */}
            <div className="rounded-2xl border-2 border-indigo-500 bg-white p-6 flex flex-col justify-between shadow-xs relative font-sans">
              <span className="absolute top-3 right-3 rounded-full bg-indigo-100 px-2 py-0.5 text-[8px] font-bold text-indigo-700 uppercase tracking-wide">
                Active Offer
              </span>
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <h3 className="text-xs font-bold text-indigo-700 uppercase tracking-widest">Balanced Pro</h3>
                  <span className="text-[9px] font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 uppercase font-extrabold">Optimal</span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-2 font-medium">The optimal balance of speed and perimeter accuracy for portrait cutouts.</p>
                
                <div className="mt-5">
                  <div className="flex items-baseline">
                    <span className="text-2xl font-extrabold text-neutral-900">$0</span>
                    <span className="text-xs text-neutral-400 font-bold line-through ml-2">$9</span>
                    <span className="text-[10px] text-indigo-600 font-bold ml-1.5">(Free Beta)</span>
                  </div>
                </div>

                <ul className="mt-6 space-y-3.5 text-xs font-semibold text-neutral-600">
                  <li className="flex items-center space-x-2">
                    <Check className="h-3.5 w-3.5 text-indigo-600 flex-shrink-0" />
                    <span>Precision float16 neural engine</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="h-3.5 w-3.5 text-indigo-600 flex-shrink-0" />
                    <span>Processes up to 1600px size</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="h-3.5 w-3.5 text-indigo-600 flex-shrink-0" />
                    <span>1-click smart wand restoration</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6.5">
                <button
                  type="button"
                  onClick={() => setBetaModal({
                    isOpen: true,
                    profileName: 'Balanced Pro Engine',
                    originalPrice: '$9.00 / month',
                    targetMode: 'isnet_fp16',
                    description: 'The Balanced Pro engine processes up to 1600px sizes using high precision float16 parameters for optimal portrait outline accuracy and speeds.'
                  })}
                  className="w-full py-2.5 px-3 rounded-lg font-bold text-xs text-white bg-indigo-650 hover:bg-indigo-700 active:scale-98 transition block text-center cursor-pointer"
                >
                  Activate Balanced
                </button>
              </div>
            </div>

            {/* Studio HD Profile */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 flex flex-col justify-between shadow-xs hover:border-neutral-300 transition duration-150">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-widest">Studio HD (4K)</h3>
                  <span className="text-[9px] font-mono font-bold text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded font-extrabold uppercase font-semibold">Premium</span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-2 font-medium">Full accuracy float32 neural maps for print-ready high resolution designs.</p>
                
                <div className="mt-5">
                  <div className="flex items-baseline">
                    <span className="text-2xl font-extrabold text-neutral-900">$0</span>
                    <span className="text-xs text-neutral-400 font-bold line-through ml-2">$19</span>
                    <span className="text-[10px] text-purple-600 font-bold ml-1.5">(Free Beta)</span>
                  </div>
                </div>

                <ul className="mt-6 space-y-3.5 text-xs font-semibold text-neutral-600">
                  <li className="flex items-center space-x-2">
                    <Check className="h-3.5 w-3.5 text-indigo-600 flex-shrink-0" />
                    <span>Full float32 accuracy matrix</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="h-3.5 w-3.5 text-indigo-600 flex-shrink-0" />
                    <span>Deep boundary edge detection</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="h-3.5 w-3.5 text-indigo-600 flex-shrink-0" />
                    <span>Maximum clarity up to 2800px</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6.5">
                <button
                  type="button"
                  onClick={() => setBetaModal({
                    isOpen: true,
                    profileName: 'Studio HD (4K) Engine',
                    originalPrice: '$19.00 / month',
                    targetMode: 'isnet',
                    description: 'The Studio HD engine runs a complete float32 neural accuracy matrix to capture maximum boundary edges and fine details up to 2800px high-resolution width.'
                  })}
                  className="w-full py-2.5 px-3 rounded-lg border border-neutral-200 font-bold text-xs text-neutral-700 hover:bg-neutral-50 active:scale-98 transition block text-center cursor-pointer"
                >
                  Select Studio HD
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>
              </>
            )}
          </>
        )}
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

      {/* PROMOTIONAL FREE BETA POPUP DIALOG */}
      {betaModal && betaModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs font-sans animate-fadeIn">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-xl animate-scaleIn">
            
            {/* Elegant header banner with sparkle */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white text-center relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <button
                  type="button"
                  onClick={() => setBetaModal(null)}
                  className="rounded-full bg-white/10 p-1.5 text-white hover:bg-white/20 transition-colors cursor-pointer-none focus:outline-none"
                  aria-label="Close modal"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mx-auto h-12 w-12 rounded-full bg-white/20 flex items-center justify-center mb-3">
                <Sparkles className="h-6 w-6 text-yellow-300 animate-pulse" />
              </div>
              <h3 className="text-lg font-extrabold tracking-tight">Free Beta Premium Access</h3>
              <p className="text-[10px] text-indigo-100 mt-1 uppercase tracking-widest font-bold">Active Promo Period</p>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="text-center mb-5">
                <div className="text-neutral-400 text-[10px] font-mono font-bold uppercase tracking-wider mb-1">UNLOCKED ENGINE</div>
                <h4 className="text-xl font-extrabold text-neutral-900 tracking-tight">{betaModal.profileName}</h4>
                
                <div className="mt-4.5 inline-flex items-center space-x-2 bg-neutral-50 px-3.5 py-2 rounded-xl border border-neutral-100">
                  <span className="text-neutral-400 line-through text-xs font-bold font-mono">{betaModal.originalPrice}</span>
                  <span className="text-neutral-300 font-mono text-[11px] font-semibold">→</span>
                  <span className="text-indigo-600 font-extrabold text-sm font-mono">$0.00</span>
                  <span className="text-indigo-600 font-extrabold text-[9px] bg-indigo-50 border border-indigo-100 rounded-lg px-2 py-0.5 tracking-wider uppercase font-sans">100% Free Beta</span>
                </div>
              </div>

              <p className="text-xs text-neutral-500 font-medium leading-relaxed text-center mb-6">
                {betaModal.description} All computations perform directly inside your secure local browser sandbox. Enjoy unlimited edits with zero fees.
              </p>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    const targetMode = betaModal.targetMode;
                    setQualityMode(targetMode);
                    setBetaModal(null);
                    
                    // Reprocess active picture if exists:
                    if (currentImage) {
                      const source = currentImage.originalFile || currentImage.originalUrl;
                      if (source) {
                        setTimeout(() => {
                           processImage(source, currentImage.name);
                        }, 50);
                      }
                    }
                    
                    // Route user to Workspace
                    handleNavClick('upload');
                  }}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-indigo-650 hover:bg-indigo-700 shadow-md shadow-indigo-500/10 active:scale-98 transition text-center block cursor-pointer"
                >
                  Activate & Process for Free
                </button>
                <button
                  type="button"
                  onClick={() => setBetaModal(null)}
                  className="w-full py-2.5 px-3 rounded-xl border border-neutral-200 font-bold text-[11px] text-neutral-550 hover:text-neutral-800 hover:bg-neutral-50 active:scale-98 transition text-center block cursor-pointer"
                >
                  Close & Explore Options
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Trust & Local computing banner footer section */}
      <Footer onNavClick={handleNavClick} />

    </div>
  );
}
