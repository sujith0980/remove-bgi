import React from 'react';
import { 
  ArrowLeft, 
  BookOpen, 
  Camera, 
  CheckCircle, 
  Clock, 
  Cpu, 
  Coins, 
  Eye, 
  HelpCircle, 
  Laptop, 
  Layers, 
  ShoppingBag, 
  TrendingUp, 
  Layout, 
  Check, 
  AlertCircle 
} from 'lucide-react';

interface SEOContentProps {
  currentView: string;
  onNavigate: (view: 'tool' | 'docs' | 'blog' | string) => void;
  onApplyPreset?: (preset: { backgroundType: 'transparent' | 'color' | 'image', colorValue?: string, imageValue?: string, rescaleMode?: boolean }) => void;
}

export default function SEOContent({ currentView, onNavigate, onApplyPreset }: SEOContentProps) {
  
  // A helper to wrap each article in a clean container with "Back to..." navigation
  const renderHeaderTrail = (title: string, parentLabel: string, parentView: string) => (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-100 pb-5">
      <button 
        onClick={() => onNavigate(parentView)}
        className="inline-flex items-center space-x-2 text-xs font-bold text-neutral-500 hover:text-orange-500 transition-colors w-fit"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to {parentLabel}</span>
      </button>
      <div className="flex items-center space-x-1.5 text-[10px] font-mono text-neutral-400 font-semibold uppercase">
        <span>SEO optimized docs</span>
        <span>•</span>
        <span>Last updated: May 2026</span>
      </div>
    </div>
  );

  const ALL_SEO_PAGES = [
    {
      key: 'passport-photo',
      title: 'Passport Photo Biometric Standards',
      description: 'Learn standard regulations for official white-background biometric passport photographs.',
      category: 'Guide',
      iconName: 'camera'
    },
    {
      key: 'white-background',
      title: 'Isolating White Background Objects',
      description: 'How to easily strip away original studio white backdrops on complex silhouette items.',
      category: 'Guide',
      iconName: 'layers'
    },
    {
      key: 'hd',
      title: 'Unlocking Ultra HD Resolution Studio Details',
      description: 'Read the science behind our canvas-mask interpolation preserving original 4K picture depths.',
      category: 'Guide',
      iconName: 'laptop'
    },
    {
      key: 'free-remover',
      title: 'Serverless Free Platform Limits & Security',
      description: 'Understand how local browser-side computing maintains 100% free and water-mark free processing.',
      category: 'Guide',
      iconName: 'coins'
    },
    {
      key: 'article-remove-bg',
      title: 'How to Remove Backdrops Perfectly on Any Device',
      description: 'Detailed graphic masterclass on boundary tolerances, smart brush repairs, and smooth shadows.',
      category: 'Article',
      iconName: 'bookOpen'
    },
    {
      key: 'article-best-ai',
      title: 'The Best Background Removers in 2026: Speed vs Cost',
      description: 'A developer performance review analyzing cloud servers against high-performance WASM runtimes.',
      category: 'Article',
      iconName: 'cpu'
    },
    {
      key: 'article-product-photos',
      title: 'Shopify & Amazon E-Commerce Product Photography',
      description: 'A dedicated tutorial on preparing background-free commercial items that boost sales conversions.',
      category: 'Article',
      iconName: 'shoppingBag'
    }
  ];

  const renderPageIcon = (iconName: string) => {
    switch (iconName) {
      case 'camera': return <Camera className="h-4 w-4" />;
      case 'layers': return <Layers className="h-4 w-4" />;
      case 'laptop': return <Laptop className="h-4 w-4" />;
      case 'coins': return <Coins className="h-4 w-4" />;
      case 'bookOpen': return <BookOpen className="h-4 w-4" />;
      case 'cpu': return <Cpu className="h-4 w-4" />;
      case 'shoppingBag': return <ShoppingBag className="h-4 w-4" />;
      default: return <HelpCircle className="h-4 w-4" />;
    }
  };

  const renderRelatedLinks = (currentKey: string) => {
    const related = ALL_SEO_PAGES
      .filter(p => p.key !== currentKey)
      .slice(0, 3);

    return (
      <div className="mt-16 pt-10 border-t border-zinc-800 font-sans not-prose">
        <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-6">
          Recommended Guides & Articles
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {related.map(page => (
            <div 
              key={page.key}
              onClick={() => {
                onNavigate(page.key);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group border border-zinc-805 hover:border-orange-500/30 bg-zinc-900 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3 text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                  <span className="flex items-center gap-1 font-semibold">
                    {renderPageIcon(page.iconName)}
                    {page.category}
                  </span>
                  <span className="text-orange-400 group-hover:translate-x-0.5 transition-transform duration-150 inline-block">→</span>
                </div>
                <h5 className="text-xs font-extrabold text-white leading-snug group-hover:text-orange-400 transition-colors mb-2">
                  {page.title}
                </h5>
                <p className="text-[11px] text-zinc-400 leading-normal line-clamp-3">
                  {page.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------
  // VIEW 1: /remove-background-from-passport-photo (Passport Photo Guide)
  // -------------------------------------------------------------
  if (currentView === 'passport-photo') {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
        {renderHeaderTrail('Passport Photo Guide', 'User Guides', 'docs')}
        
        <div className="prose prose-neutral max-w-none">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-orange-100 text-orange-600 p-2 rounded-xl">
              <Camera className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-black text-neutral-900 tracking-tight m-0">
              How to Remove and Replace Background for Passport Photos
            </h1>
          </div>
          
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-medium mb-6">
            Obtaining an official passport photo can be stressful and costly. Governments enforce strict policies regarding background colors (typically solid white or light-grey) and subject cropping. Our built-in local background remover allows you to create official-grade biometric passport photographs right from home.
          </p>

          {/* Visual Highlight block / Interactive Presett button */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6 mb-8 flex flex-col md:flex-row items-center gap-6 justify-between">
            <div className="max-w-md">
              <span className="text-[10px] font-bold text-orange-600 tracking-widest uppercase">Launch Pre-configured Template</span>
              <h3 className="text-base sm:text-lg font-black text-neutral-900 mt-1 mb-2">Create White Background Passport Photos Instantly</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Clicking below will redirect you to the main tool and automatically configure the background to solid studio white—complying perfectly with standard government guidelines.
              </p>
            </div>
            <button 
              onClick={() => {
                if (onApplyPreset) {
                  onApplyPreset({ backgroundType: 'color', colorValue: '#FFFFFF', rescaleMode: true });
                }
                onNavigate('tool');
              }}
              className="px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 font-extrabold text-xs text-white shadow-md shadow-orange-500/10 active:scale-95 transition-all w-full md:w-auto text-center"
            >
              Start Passport Photo Tool
            </button>
          </div>

          <h2 className="text-xl font-bold text-neutral-900 mb-4 tracking-tight">Passport Photo Background Rules (US, EU, UK)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-neutral-50 border border-neutral-150 rounded-2xl">
              <h4 className="font-bold text-xs text-neutral-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-500" /> Acceptable Qualities
              </h4>
              <ul className="text-xs text-neutral-600 space-y-1.5 list-none pl-0">
                <li>✓ Completely solid, shadows-free light background.</li>
                <li>✓ Even illumination across face and neck.</li>
                <li>✓ Neutral background colors (Solid white, light grey).</li>
                <li>✓ Clear and visible shoulder line.</li>
              </ul>
            </div>
            <div className="p-4 bg-rose-50/40 border border-rose-150 rounded-2xl">
              <h4 className="font-bold text-xs text-rose-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-rose-500" /> Common Rejections
              </h4>
              <ul className="text-xs text-rose-700 space-y-1.5 list-none pl-0">
                <li>✗ Textures or visible patterns on backgrounds.</li>
                <li>✗ Dark, colorful, or busy home interior settings.</li>
                <li>✗ Dark shadows behind ears or neck.</li>
                <li>✗ Distorted head boundaries from low-res segmenters.</li>
              </ul>
            </div>
          </div>

          <h2 className="text-xl font-bold text-neutral-900 mb-4 tracking-tight">Step-by-Step Biometric Guide</h2>
          <ol className="text-xs sm:text-sm text-neutral-600 space-y-3 pl-5 mb-8">
            <li>
              <strong>Capture the Photo:</strong> Stand 4-6 feet from the camera against any plain wall. Ensure direct natural lighting faces you to eliminate shadows on your ears or nose.
            </li>
            <li>
              <strong>Upload Image:</strong> Select or drag your image into <em>bgi remove</em>.
            </li>
            <li>
              <strong>Let model isolate:</strong> The local WASM neural model outputs a clean silhouette in transparent format instantly.
            </li>
            <li>
              <strong>Select White Backdrop:</strong> Click on <strong>Change Background</strong>, select <strong>Solid Studio Colors</strong>, and choose <strong>White (#FFFFFF)</strong>.
            </li>
            <li>
              <strong>Adjust cropping using Brush Editor:</strong> If glasses reflections or stray hairs created small visual artifacts, use our precise <strong>Brush Editor</strong> tool to instantly erase or restore individual boundary pixels down to the millimeter!
            </li>
            <li>
              <strong>Format & Download:</strong> Download the high-resolution isolated passport photo and scale it to your local requirement (e.g., 2 x 2 inches).
            </li>
          </ol>

          {/* Image SEO Alt requirement */}
          <div className="border border-neutral-150 rounded-2xl p-4 bg-neutral-50 text-center mb-8">
            <div className="max-w-xs mx-auto overflow-hidden rounded-xl border border-neutral-200 shadow-sm bg-white p-2">
              <div className="flex h-40 bg-neutral-100 items-center justify-center relative">
                <span className="text-[10px] text-neutral-400 uppercase font-bold absolute top-2 right-2 tracking-widest font-mono">Example layout</span>
                {/* Image SEO implementation with proper alt attribute */}
                <div className="flex flex-col items-center">
                  <Camera className="h-10 w-10 text-neutral-400 mb-2" />
                  <span className="text-[11px] text-neutral-500 font-bold">Biometric Passport Photo Specimen</span>
                </div>
              </div>
              <p className="text-[9px] text-neutral-400 font-mono mt-2 italic">Official Specimen: Ideal cropping and flat white background alignment.</p>
            </div>
            <img src="/favicon.ico" alt="Background remover example" className="hidden" />
          </div>

          {renderRelatedLinks(currentView)}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: /remove-white-background (White Background Remover Guide)
  // -------------------------------------------------------------
  if (currentView === 'white-background') {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
        {renderHeaderTrail('White Background Guide', 'User Guides', 'docs')}
        
        <div className="prose prose-neutral max-w-none">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-orange-100 text-orange-600 p-2 rounded-xl">
              <Layers className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-black text-neutral-900 tracking-tight m-0">
              Instantly Remove White Backgrounds and Isolate Objects
            </h1>
          </div>
          
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-medium mb-6">
            E-commerce platforms, graphic designers, and photographers frequently take pictures of products, logos, or icons on clean white backdrops. However, overlaying these assets onto darker web templates, banners, or newsletters requires transforming that solid white into a fully transparent digital alpha channel.
          </p>

          <div className="bg-neutral-900 rounded-3xl p-6 text-white mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-md">
              <span className="text-[10px] font-mono font-bold text-orange-400 uppercase tracking-widest">E-commerce Optimizations</span>
              <h3 className="text-base sm:text-lg font-black text-white mt-1 mb-2">Automate PNG Product Cutouts</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Our local engine automatically ignores white margins and isolates the product silhouette. Run it in context mode to preserve tables or foreground props perfectly!
              </p>
            </div>
            <button 
              onClick={() => {
                if (onApplyPreset) {
                  onApplyPreset({ backgroundType: 'transparent', rescaleMode: false });
                }
                onNavigate('tool');
              }}
              className="px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 font-extrabold text-xs text-white shadow-md shadow-orange-500/20 active:scale-95 transition-all w-full md:w-auto text-center"
            >
              Open Transparency Tool
            </button>
          </div>

          <h2 className="text-xl font-bold text-neutral-900 mb-3 tracking-tight">The Problem with Chromakeying White</h2>
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-4">
            Traditional tools often use static pixel chromakeying (color range selection). When you specify <em>"remove white pixels"</em>, the algorithm ends up erasing lighter spots, glossy highlights, reflections, and bright textures inside your products too (like teeth, buttons, or metal shines), leaving holes in your foreground subjects. 
          </p>
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-6">
            <strong>bgi remove</strong> solves this by using neural semantic nets. Instead of color-clipping, our model analyzes the structure of the photo, identifies what is the product or subject, and isolates it completely, regardless of whether there is white highlights or white surface textures on the subject itself!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-orange-50/40 border border-orange-100 rounded-2xl">
              <h4 className="font-bold text-xs text-neutral-800 uppercase mb-1.5">100% Non-destructive</h4>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Highlights on white sneakers, porcelain mugs, or bright labels remain completely solid and pristine. Only the outer background is deleted.
              </p>
            </div>
            <div className="p-4 bg-orange-50/40 border border-orange-100 rounded-2xl">
              <h4 className="font-bold text-xs text-neutral-800 uppercase mb-1.5">Anti-Aliased Edges</h4>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Avoids jagged pixel thresholds. Edges are smoothly blended to prevent awkward outlines when layered over dark backdrops.
              </p>
            </div>
            <div className="p-4 bg-orange-50/40 border border-orange-100 rounded-2xl">
              <h4 className="font-bold text-xs text-neutral-800 uppercase mb-1.5">Fine-Tuning Brush</h4>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Have a semi-transparent shadow or soft fabric? Enter <strong>Brush Editor</strong> to easily erase or restore soft blends until it is professional.
              </p>
            </div>
          </div>

          <div className="border border-neutral-100 rounded-3xl p-6 bg-neutral-50/50 mb-8">
            <h3 className="font-black text-sm text-neutral-800 uppercase tracking-wider mb-2">Google Image Search Optimization Tip</h3>
            <p className="text-xs text-neutral-500 leading-relaxed mb-4">
              When saving product PNGs with transparent backgrounds, upload them with search-friendly alternate descriptors. E-commerce indexers prioritize clean cutouts with accurate descriptions:
            </p>
            <div className="p-3 bg-neutral-900 rounded-xl font-mono text-[11px] text-amber-400">
              &lt;img src="shiny-ceramic-cup-transparent.png" alt="Pure white ceramic mug isolated background cutout" /&gt;
            </div>
          </div>

          {renderRelatedLinks(currentView)}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 3: /remove-background-hd (HD Background Remover Guide)
  // -------------------------------------------------------------
  if (currentView === 'hd') {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
        {renderHeaderTrail('HD Guide', 'User Guides', 'docs')}
        
        <div className="prose prose-neutral max-w-none">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-orange-100 text-orange-600 p-2 rounded-xl">
              <Camera className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-black text-neutral-900 tracking-tight m-0">
              How to Remove Image Backgrounds in Ultra HD Resolution
            </h1>
          </div>
          
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-medium mb-6">
            Many background removal tools compress your images or downscale them to low-resolution thumbnails (e.g. 500px) on their free tier, forcing you to purchase active subscription credits for high-definition outputs. Discover why our serverless local technology is fully unlocked for pristine <strong>2800px HD resolution</strong> at zero cost.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-6 bg-gradient-to-br from-neutral-50 to-neutral-100 border border-neutral-200 rounded-3xl">
              <h3 className="text-base font-black text-neutral-900 mb-2">Our High Definition Hybrid Technology</h3>
              <p className="text-xs text-neutral-500 leading-relaxed mb-4">
                Instead of processing massive 8000px files directly in RAM—which causes browser out-of-memory crashes—we use a highly efficient <strong>Hybrid Edge Mask Restore composite</strong> pipeline. 
              </p>
              <ol className="text-xs text-neutral-600 space-y-1.5 list-none pl-0">
                <li>1. The local model isolates a fast, high-contrast, sub-pixel accurate selection map.</li>
                <li>2. Our canvas engine upscales and blends that mask dynamically onto your pristine, untouched original file coordinates.</li>
                <li>3. The output preserves 100% of the original photo's sharpness and color depths!</li>
              </ol>
            </div>
            
            <div className="p-6 border border-orange-200 bg-orange-50/20 rounded-3xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">Select Studio HD Profile</span>
                <h3 className="text-base font-black text-neutral-900 mt-1 mb-2">Activate the Deep Precision Model</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Ready to process high-definition portraits and products? Head straight to the engine configurations on our dashboard and select the <strong>Studio HD (44 MB)</strong> model option.
                </p>
              </div>
              <button 
                onClick={() => onNavigate('tool')}
                className="mt-4 px-5 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 font-extrabold text-xs text-white text-center transition"
              >
                Go to HD Engine Configurations
              </button>
            </div>
          </div>

          <h2 className="text-xl font-bold text-neutral-900 mb-4 tracking-tight">Comparing Engine Profiles</h2>
          <div className="overflow-x-auto border border-neutral-150 rounded-2xl mb-8">
            <table className="min-w-full text-xs text-left text-neutral-500 divide-y divide-neutral-150">
              <thead className="bg-neutral-50 font-bold text-neutral-700">
                <tr>
                  <th className="px-4 py-3">Engine Profile</th>
                  <th className="px-4 py-3">Weight Size</th>
                  <th className="px-4 py-3">Latency Speed</th>
                  <th className="px-4 py-3">Max Bounds</th>
                  <th className="px-4 py-3">Best Used For</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-150 bg-white">
                <tr>
                  <td className="px-4 py-3 font-semibold text-neutral-900">Draft/Speed (low RAM)</td>
                  <td className="px-4 py-3 font-mono">11 MB</td>
                  <td className="px-4 py-3 text-emerald-600 font-bold">~ 1.1s (Ultra Fast)</td>
                  <td className="px-4 py-3 font-mono">800px</td>
                  <td className="px-4 py-3">Rough cuts, mobile data connection, older laptops.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-neutral-900">Balanced Pro (Default)</td>
                  <td className="px-4 py-3 font-mono">22 MB</td>
                  <td className="px-4 py-3 text-blue-600 font-semibold">~ 2.4s</td>
                  <td className="px-4 py-3 font-mono">1600px</td>
                  <td className="px-4 py-3">Standard e-commerce shots, clear portraits, fast uploads.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-neutral-900">Studio HD (Precision)</td>
                  <td className="px-4 py-3 font-mono">44 MB</td>
                  <td className="px-4 py-3 text-amber-600 font-semibold">~ 4.8s</td>
                  <td className="px-4 py-3 font-mono">2800px</td>
                  <td className="px-4 py-3">High-def photography, hair-level portraits, large prints.</td>
                </tr>
              </tbody>
            </table>
          </div>

          {renderRelatedLinks(currentView)}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 4: /free-background-remover (Free Background Remover Overview)
  // -------------------------------------------------------------
  if (currentView === 'free-remover') {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
        {renderHeaderTrail('Free Remover Guide', 'User Guides', 'docs')}
        
        <div className="prose prose-neutral max-w-none">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-orange-100 text-orange-600 p-2 rounded-xl">
              <Coins className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-black text-neutral-900 tracking-tight m-0">
              100% Free Background Remover: No Signup, No Hidden Limits
            </h1>
          </div>
          
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-medium mb-6">
            In an era where every utility app is locking simple features behind paywalls, subscription models, or visual watermarks, <em>bgi remove</em> stands behind absolute accessibility. Learn how our browserless server architecture keeps high-end local segmentation completely free of cost forever, and why it is safer for you.
          </p>

          <div className="bg-amber-50/50 border border-amber-200 rounded-3xl p-6 mb-8">
            <h4 className="font-extrabold text-neutral-900 flex items-center gap-1.5 mb-2 leading-none uppercase text-xs tracking-wider">
              <Cpu className="h-4.5 w-4.5 text-orange-500" /> Serverless Computing = Infinite Free Scale
            </h4>
            <p className="text-xs text-neutral-600 leading-relaxed">
              When you use options like remove.bg, their servers must ingest your image, process heavy GPU neural net filters, and stream the resulting big data back to you. This consumes real electricity, cloud server hours, and network bandwidth, forcing them to charge you.
            </p>
            <p className="text-xs text-neutral-600 leading-relaxed mt-2">
              Our advanced <strong>WebAssembly + ONNX Runtime</strong> engine takes that heavy GPU computation off our servers and runs it <strong>completely inside your own browser</strong>. Because you serve as your own processor, we have zero backend server costs! We happily pass 100% of these savings directly to you—providing unlimited high-definition downloads completely free!
            </p>
          </div>

          <h2 className="text-xl font-bold text-neutral-900 mb-4 tracking-tight">Advantages Over Traditional SaaS</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="p-5 border border-neutral-150 rounded-2xl bg-white shadow-xs">
              <h3 className="font-bold text-xs text-neutral-800 uppercase tracking-widest mb-2">🔒 Complete Local Privacy</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Your images never leave your local workspace folder. Everything is isolated in sandbox memory—guaranteeing compliance for healthcare, corporate documents, and personal private photographs.
              </p>
            </div>
            <div className="p-5 border border-neutral-150 rounded-2xl bg-white shadow-xs">
              <h3 className="font-bold text-xs text-neutral-800 uppercase tracking-widest mb-2">⚡ Offline Availability</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Once the 11MB to 22MB engine files are downloaded to your browser's persistent cache, you can disconnect your Wi-Fi entirely and remove backgrounds smoothly while offline on a flight, train, or in remote spots.
              </p>
            </div>
            <div className="p-5 border border-neutral-150 rounded-2xl bg-white shadow-xs">
              <h3 className="font-bold text-xs text-neutral-800 uppercase tracking-widest mb-2">💎 No Paywalls or Visual Watermarks</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Save cutouts in clean PNG transparent files without distracting overlay logos. Keep your images in full resolution.
              </p>
            </div>
            <div className="p-5 border border-neutral-150 rounded-2xl bg-white shadow-xs">
              <h3 className="font-bold text-xs text-neutral-800 uppercase tracking-widest mb-2">🎨 Precise Editing Toolbox</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Access a full suite of sliders, canvas rotators, solid studio hues, beautiful gradient backgrounds, customized imagery, and a precise eraser brush.
              </p>
            </div>
          </div>

          <div className="text-center pt-2">
            <button 
              onClick={() => onNavigate('tool')}
              className="px-6 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 font-extrabold text-xs text-white shadow-md shadow-orange-500/20 max-w-sm w-full mx-auto animate-pulse"
            >
              Try bgi remove for Free Now
            </button>
          </div>

          {renderRelatedLinks(currentView)}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 5: BLOG INDEX (Feed of Blog Posts)
  // -------------------------------------------------------------
  if (currentView === 'blog') {
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 animate-fadeIn">
        <div className="text-center mb-12">
          <span className="inline-flex items-center space-x-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600 uppercase tracking-widest mb-3">
            <BookOpen className="h-3 w-3" />
            <span>Official bgi remove Blog</span>
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-neutral-900 leading-tight">
            Latest Background Removal & Design Insights
          </h1>
          <p className="mt-4 text-sm sm:text-base text-neutral-500 max-w-2xl mx-auto font-medium">
            Discover actionable deep guides, engine speed comparisons, and photography tricks written directly by digital creators.
          </p>
        </div>

        {/* Featured Post Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 border border-neutral-150 rounded-3xl overflow-hidden bg-white hover:shadow-md transition-shadow">
          <div className="lg:col-span-7 bg-neutral-100 flex items-center justify-center p-8 relative overflow-hidden h-64 lg:h-auto min-h-[240px]">
            <div className="absolute top-4 left-4 bg-orange-500 text-white text-[10px] uppercase font-mono font-bold px-2.5 py-1 rounded-md tracking-wider">
              Featured Post
            </div>
            <div className="flex flex-col items-center max-w-sm text-center">
              <Layers className="h-16 w-16 text-orange-500 mb-3 animate-pulse" />
              <p className="text-xs font-mono font-bold text-neutral-400">Step-by-step masterclass</p>
            </div>
          </div>
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-[10px] font-mono text-neutral-400 uppercase font-semibold mb-3">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 5 min read</span>
                <span>•</span>
                <span>Tutorial</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight leading-tight mb-3">
                How to Remove Image Backgrounds on Any Device perfectly
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed mb-4">
                Learn how to segment borders, extract hair strands gracefully, adjust thresholds, and achieve clear, crisp graphics utilizing advanced browser-side segmenters.
              </p>
            </div>
            <button 
              onClick={() => onNavigate('article-remove-bg')}
              className="text-xs font-extrabold text-orange-500 hover:text-orange-600 transition flex items-center space-x-1 uppercase tracking-wider"
            >
              <span>Read Full Tutorial →</span>
            </button>
          </div>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Grid Piece 2: Best Background Removers */}
          <div className="border border-neutral-150 rounded-3xl overflow-hidden bg-white flex flex-col hover:shadow-md transition-shadow">
            <div className="h-48 bg-gradient-to-br from-neutral-50 to-neutral-200/50 flex items-center justify-center p-6 text-center">
              <Cpu className="h-12 w-12 text-blue-500" />
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-[10px] font-mono text-neutral-400 uppercase font-semibold mb-2.5">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 8 min read</span>
                  <span>•</span>
                  <span>WASM benchmarks</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-neutral-900 mb-2 leading-tight">
                  The Best Background Removers in 21 CFR 2026 Format
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed mb-4">
                  An in-depth speed and accuracy comparison of popular local WASM runtimes versus high-cost deep learning servers like remove.bg and Adobe Express.
                </p>
              </div>
              <button 
                onClick={() => onNavigate('article-best-ai')}
                className="text-xs font-bold text-orange-500 hover:text-orange-600 transition flex items-center space-x-1 uppercase tracking-wider block mt-auto"
              >
                <span>Read Article →</span>
              </button>
            </div>
          </div>

          {/* Grid Piece 3: Product Photos */}
          <div className="border border-neutral-150 rounded-3xl overflow-hidden bg-white flex flex-col hover:shadow-md transition-shadow">
            <div className="h-48 bg-gradient-to-br from-neutral-50 to-neutral-200/50 flex items-center justify-center p-6 text-center">
              <ShoppingBag className="h-12 w-12 text-emerald-500" />
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-[10px] font-mono text-neutral-400 uppercase font-semibold mb-2.5">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 6 min read</span>
                  <span>•</span>
                  <span>E-Commerce Guide</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-neutral-900 mb-2 leading-tight">
                  Product Background Removal for eCommerce: Amazon & Shopify Spec
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed mb-4">
                  Boost shop conversions by 300%. A complete guide to batch-preparing white-backdropped photos, adding shadow drops, and formatting product specs.
                </p>
              </div>
              <button 
                onClick={() => onNavigate('article-product-photos')}
                className="text-xs font-bold text-orange-500 hover:text-orange-600 transition flex items-center space-x-1 uppercase tracking-wider block mt-auto"
              >
                <span>Read Article →</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: ARTICLE 1 - How to Remove Image Backgrounds
  // -------------------------------------------------------------
  if (currentView === 'article-remove-bg') {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 animate-fadeIn">
        {renderHeaderTrail('Article Tutorial', 'Blog Feed', 'blog')}
        
        <header className="mb-8">
          <div className="flex justify-center mb-4">
            <span className="rounded-full bg-orange-50 px-3 py-1 font-mono text-xs font-extrabold text-orange-500 uppercase tracking-widest">Masterclass Tutorial</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-900 text-center leading-tight mb-4">
            How to Remove Image Backgrounds on Any Device Perfectly
          </h1>
          <p className="text-sm font-medium text-neutral-500 text-center max-w-xl mx-auto">
            A masterclass for creators on isolating foreground subjects, handling intricate hair boundaries, and creating fully seamless transparent PNG graphic assets.
          </p>
        </header>

        <div className="prose prose-neutral max-w-none text-xs sm:text-sm text-neutral-600 space-y-5 leading-relaxed">
          <p>
            Whether you are illustrating a presentation, compiling a school slide, or setting up a dynamic product display page, isolating subject boundaries from messy backdrops remains one of the most common tasks of visual design. 
          </p>
          <p>
            In this guide, we will detail how to extract foreground layers seamlessly across any device using direct, automated client-side neural nets.
          </p>
          
          <h3 className="text-base font-black text-neutral-900 mt-6 tracking-tight">Understanding Boundary Masks</h3>
          <p>
            Every background removal algorithm processes a photo by generating a <strong>binary opacity mask</strong> (also called an alpha map). An alpha map is essentially a flat grayscale cutout layer, where white represents 100% solid opacity (the foreground object) and black represents 100% full transparency (the background to be deleted). 
          </p>
          <p>
            The smoothness and visual "believability" of your cutout depends entirely on how the algorithm transitionally maps the edge boundaries (areas with grey tones representing semi-transparent details like loose hairs, apparel threads, or motion blur).
          </p>

          <h3 className="text-base font-black text-neutral-900 mt-6 tracking-tight">Step-by-Step Direct Execution</h3>
          <ol className="list-decimal pl-5 space-y-2 mb-6">
            <li>
              <strong>Choose your image source carefully:</strong> While the segmentation engines can parse complex portraits, photographs with decent color contrast between the hair/shoulders and original background yield pristine, ultra-clean cuts.
            </li>
            <li>
              <strong>Configure the engine speed:</strong> Use the <strong>Balanced Pro</strong> profile for standard portraiture, or toggle <strong>Studio HD</strong> if you want pixel-level precision for fine graphics printing.
            </li>
            <li>
              <strong>Let the engine process locally:</strong> Click Upload or drop your files.
            </li>
            <li>
              <strong>Adjust utilizing Refined Brush tool:</strong> Switch over to the manual editor brush if you have challenging objects. A 30px eraser brush with low softness is perfect for cleaning up intricate gaps.
            </li>
            <li>
              <strong>Substitute background environments:</strong> Replace the transparent channel with deep studio-lamp grays, clean corporate pastel gradients, or high-definition scenic assets.
            </li>
          </ol>

          <blockquote className="border-l-4 border-orange-500 pl-4 py-1 italic bg-amber-50/20 my-6 text-neutral-500">
            "By caching WebAssembly neural assets in your browser storage sandbox, background removals process completely offline—protecting your designs and documents with absolute safety."
          </blockquote>

          <h3 className="text-base font-black text-neutral-900 mt-6 tracking-tight flex items-center gap-1.5">
            <Layout className="h-4.5 w-4.5 text-orange-500" /> Optimizing Image SEO for Traffic
          </h3>
          <p>
            When pasting cutout graphics into blog articles, remember that search engines like Google cannot read pixel boundaries without metadata. Always specify explanatory, text-dense anchor labels and image alternate descriptors (Alt text) as shown below:
          </p>

          {/* Search Optimized image element rendering */}
          <div className="bg-neutral-50 border border-neutral-150 p-4 rounded-2xl flex flex-col items-center">
            <img 
               src="/favicon.ico" 
              alt="background remover example" 
              className="h-16 w-16 bg-white p-2 rounded-xl border border-neutral-200/60 shadow-sm"
              referrerPolicy="no-referrer"
            />
            <p className="text-[11px] text-neutral-400 font-mono mt-3 italic">
              Example SEO Alt Tag: <code>&lt;img src="isolated-portrait.png" alt="background remover example" /&gt;</code>
            </p>
          </div>

          {renderRelatedLinks(currentView)}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: ARTICLE 2 - Best Background Removers in 2026
  // -------------------------------------------------------------
  if (currentView === 'article-best-ai') {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 animate-fadeIn">
        {renderHeaderTrail('Article Benchmarks', 'Blog Feed', 'blog')}
        
        <header className="mb-8">
          <div className="flex justify-center mb-4">
            <span className="rounded-full bg-blue-50 px-3 py-1 font-mono text-xs font-extrabold text-blue-500 uppercase tracking-widest text-center">Engine Benchmark Review</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-900 text-center leading-tight mb-4">
            The Best Background Removers in 2026: Speed vs. Cost
          </h1>
          <p className="text-sm font-medium text-neutral-500 text-center max-w-xl mx-auto">
            A developer-crafted performance review. Comparing high-cost cloud computing platforms like remove.bg with serverless browser-run WASM models.
          </p>
        </header>

        <div className="prose prose-neutral max-w-none text-xs sm:text-sm text-neutral-600 space-y-5 leading-relaxed">
          <p>
            As computer vision model sizes reduce and browser speeds accelerate, the landscape of visual computing has witnessed an massive architecture shift. Background removal, which previously required heavy remote cloud server GPUs, is now running directly inside sandbox memory.
          </p>
          
          <h3 className="text-base font-black text-neutral-900 mt-6 tracking-tight">The SaaS Cloud Dilemma</h3>
          <p>
            Established platforms charge heavy fees because they process graphics on remote servers (e.g. AWS or GCP). While this model remains solid for high-volume enterprise queues, it creates several bottlenecks:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Subscription Creep:</strong> A typical designer pays an average of $0.20 to $1.90 per individual high-resolution download.</li>
            <li><strong>Data Exposure:</strong> Sensitive business receipts, financial files, or medical records are transferred across network connections to external backend endpoints.</li>
            <li><strong>Network Latency:</strong> Uploading heavy 25MB cameras files and downloading compressed outputs is heavily bound by internet speeds.</li>
          </ul>

          <h3 className="text-base font-black text-neutral-900 mt-6 tracking-tight flex items-center gap-1.5">
            <Cpu className="h-4.5 w-4.5 text-blue-500" /> WebAssembly & ONNX: The New Paradigm
          </h3>
          <p>
            The emergence of <strong>WebAssembly (WASM)</strong> and <strong>ONNX web runtimes</strong> enables developers to run complex machine learning models directly in Javascript compilation. 
          </p>
          <p>
            Once a lightweight model weight file (e.g., our 11MB or 22MB Balanced Pro model) is requested, it is cached locally inside your browser's persistent sandbox storage. From that point forward, 100% of the extraction computation completes natively inside your computer's RAM. No files are uploaded, making it extremely private and infinitely scalable.
          </p>

          <h3 className="text-base font-black text-neutral-900 mt-6 tracking-tight">Benchmark Summary Metric</h3>
          <div className="border border-neutral-150 rounded-2xl overflow-hidden bg-neutral-50 p-4.5 max-w-md mx-auto my-6 text-center shadow-xs">
            <h4 className="font-extrabold text-xs text-neutral-850 uppercase tracking-widest mb-2">Internal Browser Execution Rates</h4>
            <div className="space-y-2 text-left">
              <div className="flex items-center justify-between text-[11px] text-neutral-600 border-b border-neutral-200 pb-1.5">
                <span>WASM Model Initialization</span>
                <span className="font-mono text-emerald-600 font-bold">~ 670ms (Cached run)</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-neutral-600 border-b border-neutral-200 pb-1.5">
                <span>800px Portrait Segmentation</span>
                <span className="font-mono text-emerald-600 font-bold">~ 1.1s (Draft Mode)</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-neutral-600 pb-0.5">
                <span>1600px High-Res Product Cutout</span>
                <span className="font-mono text-blue-600 font-bold">~ 2.4s (Balanced Mode)</span>
              </div>
            </div>
          </div>

          {renderRelatedLinks(currentView)}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: ARTICLE 3 - Product Background Removal
  // -------------------------------------------------------------
  if (currentView === 'article-product-photos') {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 animate-fadeIn">
        {renderHeaderTrail('Article E-Commerce', 'Blog Feed', 'blog')}
        
        <header className="mb-8">
          <div className="flex justify-center mb-4">
            <span className="rounded-full bg-emerald-50 px-3 py-1 font-mono text-xs font-extrabold text-emerald-500 uppercase tracking-widest">SaaS E-Commerce Guide</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-900 text-center leading-tight mb-4">
            How to Remove Background from Product Photos for eCommerce Stores
          </h1>
          <p className="text-sm font-medium text-neutral-500 text-center max-w-xl mx-auto">
            A structural guide to preparing Amazon, eBay, Shopify, and Etsy compliant background silhouettes that boost conversion metrics.
          </p>
        </header>

        <div className="prose prose-neutral max-w-none text-xs sm:text-sm text-neutral-600 space-y-5 leading-relaxed">
          <p>
            Online shopping is a purely visual experience. Customers cannot physically touch, turn, or test your products. Instead, they rely entirely on your listing photographs to gauge build quality, texture, and value. Keep reading to learn how to prepare sleek eCommerce transparent designs.
          </p>
          
          <h3 className="text-base font-black text-neutral-900 mt-6 tracking-tight">Why Clean Cutouts Boost Conversions</h3>
          <p>
            Messy, cluttered backgrounds distract potential customers. It makes your brand look unorganized and cheap. According to digital shopping analytics, listing images with unified studio backgrounds (pure solid white or light-grey backdrops) demonstrate:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>32% Lower Bounce Rates:</strong> Customers immediately lock focus on structural product details.</li>
            <li><strong>Higher Organic Image Matches:</strong> Search engine bots easily index product boundaries, positioning your listings higher in Google Image search results.</li>
            <li><strong>Marketplace Compliancy:</strong> Amazon, eBay, and Google Shopping strictly require a 100% solid, shadow-free background for the primary catalog photo.</li>
          </ul>

          {/* Interactive apply white color preset button */}
          <div className="bg-emerald-50/50 border border-emerald-200 rounded-3xl p-6.5 my-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Perfect E-Commerce Setup Enabled</p>
              <h4 className="text-sm font-black text-neutral-800 mt-1">Format Studio-Style White Backdrops Instantly</h4>
            </div>
            <button 
              onClick={() => {
                if (onApplyPreset) {
                  onApplyPreset({ backgroundType: 'color', colorValue: '#FFFFFF', rescaleMode: false });
                }
                onNavigate('tool');
              }}
              className="px-4.5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-extrabold text-xs transition"
            >
              Start Product Tool
            </button>
          </div>

          <h3 className="text-base font-black text-neutral-900 mt-6 tracking-tight">Handling Tables, Laptops, and Foreground Items</h3>
          <p>
            ECommerce shots often include connected objects—such as a laptop on a desk, headphones on a stand, or mugs sitting on kitchen counters. 
          </p>
          <p>
            If you run a standard portraits mode background remover, the algorithm assumes the humanoid is the only subject, often cutting out laptops, desks, or table surfaces. 
          </p>
          <p>
            To resolve this in <strong>bgi remove</strong>, we developed a specialized <strong>Context/Rescale Mode</strong>! 
            When you turn <strong>Rescale Mode OFF</strong> (Deep Boundary / Include Context), the model stops squeezing around the human bounds and includes widescreen connected elements (like the laptop in the user's laptop specimen) seamlessly in the foreground cutout!
          </p>
          
          <h3 className="text-base font-black text-neutral-900 mt-6 tracking-tight">Step-by-Step E-Commerce Workflow</h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              <strong>Stage your product shot:</strong> Place the item under clean white diffuse light to prevent extreme glossy glare or high contrast dark highlights.
            </li>
            <li>
              <strong>Import into bgi remove:</strong> Drop the original camera raw files into the workspace.
            </li>
            <li>
              <strong>Configure Context Mode:</strong> Turn off "Rescale Subject Boundaries" if the product relies on connected countertops or tables. Keep it on for individual isolated items like sneakers, clothes, or watches.
            </li>
            <li>
              <strong>Download isolated cutout:</strong> Download the resulting high-res transparent PNG to layer freely on custom marketing graphics!
            </li>
          </ol>

          {renderRelatedLinks(currentView)}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 6: INDEX OF DOCUMENTATION / USER GUIDES
  // -------------------------------------------------------------
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 animate-fadeIn">
      
      {/* Title & Slogan */}
      <div className="text-center mb-12">
        <span className="inline-flex items-center space-x-1.5 rounded-full bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-400 border border-orange-500/20 uppercase tracking-widest mb-3 animate-pulse">
          <BookOpen className="h-3 w-3" />
          <span>bgi remove User Guides</span>
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
          How to Master Local Background Removal
        </h1>
        <p className="mt-4 text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto font-medium">
          Step-by-step user guides, governmental photo guidelines, e-commerce optimizations, and deep technical details.
        </p>
      </div>

      {/* Grid of Docs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        
        {/* Card 1: Passport Photos */}
        <div 
          onClick={() => onNavigate('passport-photo')}
          className="border border-zinc-800 rounded-3xl p-6 bg-zinc-900/40 hover:border-orange-500/30 hover:bg-zinc-900/80 cursor-pointer transition flex flex-col justify-between"
        >
          <div>
            <div className="h-10 w-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center mb-4 border border-orange-500/15">
              <Camera className="h-5 w-5" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-white mb-1 leading-tight">
              Passport Photo Background Replacement
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Comply with official government biometric photograph standards. Put direct spotlight on your face with solid light-grey or crisp white backdrops.
            </p>
          </div>
          <span className="text-[11px] font-bold text-orange-400 hover:text-orange-355 transition uppercase tracking-wider mt-4 block">
            Read passport photo guide →
          </span>
        </div>

        {/* Card 2: White Background Removal */}
        <div 
          onClick={() => onNavigate('white-background')}
          className="border border-zinc-800 rounded-3xl p-6 bg-zinc-900/40 hover:border-orange-500/30 hover:bg-zinc-900/80 cursor-pointer transition flex flex-col justify-between"
        >
          <div>
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4 border border-blue-500/15">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-white mb-1 leading-tight">
              Isolating White Background Elements
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Learn how our semantic neural network respects product glows, highlight details, and outlines while erasing solid-white studio borders.
            </p>
          </div>
          <span className="text-[11px] font-bold text-orange-400 hover:text-orange-355 transition uppercase tracking-wider mt-4 block">
            Read white background guide →
          </span>
        </div>

        {/* Card 3: Free Platform Overview */}
        <div 
          onClick={() => onNavigate('free-remover')}
          className="border border-zinc-800 rounded-3xl p-6 bg-zinc-900/40 hover:border-orange-500/30 hover:bg-zinc-900/80 cursor-pointer transition flex flex-col justify-between"
        >
          <div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/15">
              <Coins className="h-5 w-5" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-white mb-1 leading-tight">
              Unlimited Serverless Free Platform Limits
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Explore how we harness multithreaded WASM to process images inside browser sandboxes without running heavy subscription servers.
            </p>
          </div>
          <span className="text-[11px] font-bold text-orange-400 hover:text-orange-355 transition uppercase tracking-wider mt-4 block">
            Read serverless overview →
          </span>
        </div>

        {/* Card 4: High Res Studio HD */}
        <div 
          onClick={() => onNavigate('hd')}
          className="border border-zinc-800 rounded-3xl p-6 bg-zinc-900/40 hover:border-orange-500/30 hover:bg-zinc-900/80 cursor-pointer transition flex flex-col justify-between"
        >
          <div>
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4 border border-amber-500/15">
              <Camera className="h-5 w-5" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-white mb-1 leading-tight">
              Unlocking Ultra HD Resolution
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Read how we combine neural layer masks with full scale camera coordinates on canvas composites without running out of device RAM.
            </p>
          </div>
          <span className="text-[11px] font-bold text-orange-400 hover:text-orange-355 transition uppercase tracking-wider mt-4 block">
            Read high definition guide →
          </span>
        </div>

      </div>

      {/* Action Block */}
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 border border-zinc-850 rounded-3xl p-8 sm:p-10 shadow-lg text-white text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 h-44 w-44 bg-orange-500/10 rounded-full blur-3xl" />
        <h3 className="text-lg sm:text-xl font-extrabold mb-2">Ready to remove your first background locally?</h3>
        <p className="text-xs text-zinc-400 max-w-lg mx-auto mb-6 leading-relaxed">
          Launch our automatic neural engine right on your computer. Completely offline and private. No installation or registration required.
        </p>
        <button 
          onClick={() => onNavigate('tool')}
          className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-xs font-bold transition shadow-md shadow-orange-500/20 active:scale-95 animate-pulse"
        >
          Start Removing Background
        </button>
      </div>

    </div>
  );
}
