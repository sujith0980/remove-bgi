import React from 'react';
import { ShieldCheck, Server, RefreshCw } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-neutral-150 bg-neutral-50 py-12 text-neutral-500">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start mb-8 text-sm">
          {/* Section 1 */}
          <div>
            <div className="flex items-center space-x-2 text-neutral-900 font-bold mb-3">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <span>100% Privacy Focused</span>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Unlike other background removal portals, all processing happens strictly inside your local web browser using advanced WebAssembly (WASM) and ONNX. No photos or personal data are ever uploaded to any database or server.
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <div className="flex items-center space-x-2 text-neutral-900 font-bold mb-3">
              <Server className="h-5 w-5 text-orange-600" />
              <span>Full-Featured Sandbox</span>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Includes a complete suite containing real-time dual sliding comparison, solid studio color backdrops, customizable image backgrounds, interactive blurs, and premium manual brush controls for absolute precision.
            </p>
          </div>

          {/* Section 3 */}
          <div>
            <div className="flex items-center space-x-2 text-neutral-900 font-bold mb-3">
              <RefreshCw className="h-5 w-5 text-blue-600" />
              <span>Fast & Local Models</span>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Powered by the open source AI segmenting models. The model is fetched from an optimized CDN once and cached locally by your browser for offline-subsequent runs.
            </p>
          </div>
        </div>

        <div className="border-t border-neutral-200/60 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-neutral-400">
          <p>© 2026 remove bgi. All rights reserved. Created for on-demand background removal.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <span className="hover:text-neutral-600">Local Sandbox</span>
            <span>•</span>
            <span className="hover:text-neutral-600">Secure Protocol</span>
            <span>•</span>
            <span className="hover:text-neutral-600">WASM AI Engine</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
