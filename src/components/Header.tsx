import React from 'react';
import { Scissors, ShieldCheck, Sparkles, Layers, Upload, Palette, Tag } from 'lucide-react';

interface HeaderProps {
  onNavClick: (destination: 'upload' | 'backdrop' | 'pricing') => void;
  activeSection?: 'upload' | 'backdrop' | 'pricing';
}

export default function Header({ onNavClick, activeSection = 'upload' }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-150 bg-white/90 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => onNavClick('upload')}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white shadow-md shadow-orange-500/20 active:scale-95 transition">
            <Scissors className="h-5 w-5 -rotate-90" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-sans font-extrabold text-xl tracking-tight text-neutral-900">
                bgi<span className="text-orange-500"> remove</span>
              </span>
              <span className="rounded-full bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-600 uppercase tracking-wide">
                Free Beta
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 font-mono font-medium -mt-1 hidden sm:block">100% Client-Side Private AI</p>
          </div>
        </div>

        {/* Central Navigation Options */}
        <nav className="flex items-center bg-neutral-100/80 p-1 rounded-xl border border-neutral-200/50">
          <button
            onClick={() => onNavClick('upload')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
              activeSection === 'upload'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-650 hover:text-neutral-900 hover:bg-neutral-200/50'
            }`}
            id="nav-btn-upload"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Upload Image</span>
          </button>

          <button
            onClick={() => onNavClick('backdrop')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
              activeSection === 'backdrop'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-650 hover:text-neutral-900 hover:bg-neutral-200/50'
            }`}
            id="nav-btn-backdrop"
          >
            <Palette className="h-3.5 w-3.5" />
            <span>Change Background</span>
          </button>

          <button
            onClick={() => onNavClick('pricing')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
              activeSection === 'pricing'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-650 hover:text-neutral-900 hover:bg-neutral-200/50'
            }`}
            id="nav-btn-pricing"
          >
            <Tag className="h-3.5 w-3.5" />
            <span className="flex items-center gap-1">
              <span>Pricing</span>
              <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-extrabold uppercase shrink-0">Free</span>
            </span>
          </button>
        </nav>

        {/* Action Button & Platform Indicators */}
        <div className="hidden lg:flex items-center space-x-4">
          <div className="flex items-center space-x-1 text-xs text-neutral-500 font-medium bg-neutral-50 border border-neutral-100 px-3 py-1 rounded-lg">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Serverless (100% Secure)</span>
          </div>
        </div>
      </div>
    </header>
  );
}
