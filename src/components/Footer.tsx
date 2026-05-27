import React from 'react';
import { ShieldCheck, Server, RefreshCw, BookOpen, Tag, HelpCircle, FileText } from 'lucide-react';

interface FooterProps {
  onNavClick?: (destination: 'upload' | 'backdrop' | 'pricing' | 'docs' | 'blog' | string) => void;
}

export default function Footer({ onNavClick }: FooterProps) {
  const handleLink = (dest: string) => {
    if (onNavClick) {
      onNavClick(dest);
      // Scroll to top upon clicking links to ensure clean page transitions
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 py-16 text-zinc-450">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Top Segment: Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start mb-12 text-sm pb-10 border-b border-zinc-800">
          {/* Section 1 */}
          <div>
            <div className="flex items-center space-x-2 text-zinc-100 font-bold mb-3">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <span>100% Privacy Focused</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Unlike other background removal portals, all processing happens strictly inside your local web browser using advanced WebAssembly (WASM) and ONNX. No photos or personal data are ever uploaded to any database or server.
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <div className="flex items-center space-x-2 text-zinc-100 font-bold mb-3">
              <Server className="h-5 w-5 text-orange-500" />
              <span>Full-Featured Sandbox</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Includes a complete suite containing real-time dual sliding comparison, solid studio color backdrops, customizable image backgrounds, interactive blurs, and premium manual brush controls for absolute precision.
            </p>
          </div>

          {/* Section 3 */}
          <div>
            <div className="flex items-center space-x-2 text-zinc-100 font-bold mb-3">
              <RefreshCw className="h-5 w-5 text-blue-500" />
              <span>Fast & Local Models</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Powered by open source image segmenting models. The model weight is fetched from an optimized CDN once and cached locally by your browser for offline-subsequent runs.
            </p>
          </div>
        </div>

        {/* Middle Segment: SEO & Blog Links Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 text-xs">
          
          {/* Col 1: Brand Info */}
          <div>
            <span className="font-extrabold text-zinc-100 tracking-tight text-sm uppercase block mb-3">bgi remove</span>
            <p className="text-zinc-400 leading-relaxed">
              The premium, 100% serverless, zero-subscription cost background remover. Providing pristine graphics, solid studio white backdrops, and advanced pixel restoration brushes.
            </p>
          </div>

          {/* Col 2: Programmatic SEO Guides */}
          <div>
            <span className="font-extrabold text-zinc-300 tracking-wider uppercase block mb-3 flex items-center gap-1.5 font-mono">
              <BookOpen className="h-4 w-4 text-orange-500" /> User Guides
            </span>
            <ul className="space-y-2.5 font-medium/90">
              <li>
                <button 
                  onClick={() => handleLink('passport-photo')} 
                  className="hover:text-zinc-100 text-zinc-400 transition text-left cursor-pointer"
                >
                  Passport Photo Guidelines
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLink('white-background')} 
                  className="hover:text-zinc-100 text-zinc-400 transition text-left cursor-pointer"
                >
                  Remove White Backgrounds
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLink('free-remover')} 
                  className="hover:text-zinc-100 text-zinc-400 transition text-left cursor-pointer"
                >
                  Serverless Free Engine Limits
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLink('hd')} 
                  className="hover:text-zinc-100 text-zinc-400 transition text-left cursor-pointer"
                >
                  Studio HD 4K Quality Settings
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Blog Tutorials */}
          <div>
            <span className="font-extrabold text-zinc-300 tracking-wider uppercase block mb-3 flex items-center gap-1.5 font-mono">
              <Tag className="h-4 w-4 text-blue-500" /> Blog Articles
            </span>
            <ul className="space-y-2.5 font-medium/90">
              <li>
                <button 
                  onClick={() => handleLink('article-remove-bg')} 
                  className="hover:text-zinc-100 text-zinc-400 transition text-left cursor-pointer"
                >
                  How to Remove Backgrounds Perfectly
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLink('article-best-ai')} 
                  className="hover:text-zinc-100 text-zinc-400 transition text-left cursor-pointer text-ellipsis overflow-hidden"
                >
                  The Best Background Removers
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLink('article-product-photos')} 
                  className="hover:text-zinc-100 text-zinc-400 transition text-left cursor-pointer"
                >
                  Product Cutouts for Shopify Stores
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Company & Support */}
          <div>
            <span className="font-extrabold text-zinc-300 tracking-wider uppercase block mb-3 flex items-center gap-1.5 font-mono">
              <Server className="h-4 w-4 text-orange-500" /> Company & Support
            </span>
            <ul className="space-y-2.5 font-medium/90">
              <li>
                <button 
                  onClick={() => handleLink('about')} 
                  className="hover:text-zinc-100 text-zinc-400 transition text-left cursor-pointer"
                >
                  About BGI Remove
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLink('contact')} 
                  className="hover:text-zinc-100 text-zinc-400 transition text-left cursor-pointer"
                >
                  Contact Us & Support
                </button>
              </li>
              <li className="pt-1 border-t border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-0.5 animate-pulse">Support Email</span>
                <a 
                  href="mailto:contact@bgiremove.com" 
                  className="hover:text-zinc-100 text-zinc-400 transition font-mono"
                >
                  contact@bgiremove.com
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright trail */}
        <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-zinc-500">
          <p>© 2026 bgi remove. All rights reserved. Created for on-demand background removal.</p>
          <div className="flex space-x-3 mt-4 md:mt-0 font-medium">
            <span className="hover:text-zinc-300 transition cursor-pointer" onClick={() => handleLink('about')}>About us</span>
            <span>•</span>
            <span className="hover:text-zinc-300 transition cursor-pointer" onClick={() => handleLink('contact')}>Contact us</span>
            <span>•</span>
            <span className="hover:text-zinc-300 transition cursor-pointer" onClick={() => handleLink('docs')}>Local Sandbox Docs</span>
            <span>•</span>
            <span className="hover:text-zinc-300 transition cursor-pointer" onClick={() => handleLink('blog')}>Blog Index</span>
            <span>•</span>
            <span className="hover:text-zinc-300">WASM Segmenter</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
