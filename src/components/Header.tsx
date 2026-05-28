import React from 'react';
import { Scissors, UploadCloud, BookOpen, Newspaper, Coins } from 'lucide-react';

interface HeaderProps {
  onNavClick: (destination: 'upload' | 'backdrop' | 'pricing' | 'docs' | 'blog') => void;
  activeSection?: 'upload' | 'backdrop' | 'pricing' | 'docs' | 'blog' | string;
}

export default function Header({ onNavClick, activeSection = 'upload' }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => onNavClick('upload')}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-650 text-white shadow-sm hover:bg-indigo-600 transition">
            <Scissors className="h-5 w-5 -rotate-90" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-sans font-extrabold text-lg tracking-tight text-white">
              BGI<span className="text-indigo-400">Remove</span>
            </span>
            <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[9px] font-bold text-indigo-400 border border-indigo-505/20 uppercase tracking-wide">
              Free Beta
            </span>
          </div>
        </div>

        {/* Central Navigation Options */}
        <nav className="flex items-center bg-zinc-90 w-max max-w-full p-1 rounded-xl border border-zinc-800/80 overflow-x-auto scrollbar-none shadow-inner">
          <button
            onClick={() => onNavClick('upload')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 shrink-0 ${
              activeSection === 'upload'
                ? 'bg-zinc-800 text-white ring-1 ring-zinc-700/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
            }`}
            id="nav-btn-upload"
          >
            <UploadCloud className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            <span className="hidden sm:inline">Upload Image</span>
            <span className="inline sm:hidden">Upload</span>
          </button>

          <button
            onClick={() => onNavClick('docs')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 shrink-0 ${
              activeSection === 'docs'
                ? 'bg-zinc-800 text-white ring-1 ring-zinc-700/30'
                : 'text-zinc-300 hover:text-white hover:bg-zinc-850'
            }`}
            id="nav-btn-docs"
          >
            <BookOpen className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span>User Guides</span>
          </button>

          <button
            onClick={() => onNavClick('blog')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 shrink-0 ${
              activeSection === 'blog'
                ? 'bg-zinc-800 text-white ring-1 ring-zinc-700/30'
                : 'text-zinc-300 hover:text-white hover:bg-zinc-850'
            }`}
            id="nav-btn-blog"
          >
            <Newspaper className="h-3.5 w-3.5 text-teal-400 shrink-0" />
            <span>Blog</span>
          </button>

          <button
            onClick={() => onNavClick('pricing')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 shrink-0 ${
              activeSection === 'pricing'
                ? 'bg-zinc-800 text-white ring-1 ring-zinc-700/30'
                : 'text-zinc-300 hover:text-white hover:bg-zinc-850'
            }`}
            id="nav-btn-pricing"
          >
            <Coins className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>Pricing</span>
          </button>
        </nav>

        {/* Empty placeholder to keep center navigation visually symmetrical */}
        <div className="hidden lg:block w-36" />
      </div>
    </header>
  );
}
