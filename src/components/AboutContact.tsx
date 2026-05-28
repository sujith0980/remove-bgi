import React, { useState } from 'react';
import { Mail, ShieldCheck, Cpu, Copy, Check, ChevronDown, HelpCircle } from 'lucide-react';

interface AboutContactProps {
  initialTab?: 'about' | 'contact' | 'faq';
}

interface FAQItem {
  question: string;
  answer: string;
}

export default function AboutContact({ initialTab = 'about' }: AboutContactProps) {
  const [activeTab, setActiveTab] = useState<'about' | 'contact' | 'faq'>(initialTab);
  const [copied, setCopied] = useState(false);

  // Accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('contact@bgiremove.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const faqs: FAQItem[] = [
    {
      question: "Is BGI Remove really completely free with zero limits?",
      answer: "Yes, 100% free! Traditional background removers charge expensive platform subscription credits or restrict high-resolution downloads. Because BGI Remove processes images directly in your own browser utilizing your own system's graphics capability, we have zero server CPU overhead. We do not place watermarks, throttle high-definitions, or charge hidden fees."
    },
    {
      question: "Are my photos uploaded to any external servers?",
      answer: "Absolutely not. In accordance with our '100% Privacy-First' standard, no image data or metadata is ever transmitted to a database, cloud server, or remote computer. Everything—from automatic model inferencing to manual brush adjustment—happens strictly inside your local web browser sandbox."
    },
    {
      question: "Can I use BGI Remove offline?",
      answer: "Yes! Once you visit BGI Remove for the first time, your browser caches the core layout assets and the lightweight neural segmenting weight layers (approx. ~20MB). After the initial download, you can open our portal and remove, blur, or customize image backdrops fully offline with zero internet access."
    },
    {
      question: "How does the local browser background segmenting work?",
      answer: "We use standard ONNX (Open Neural Network Exchange) models configured with WebAssembly (WASM) multi-threading filter chains. When you drop an image, the model computes segmentation arrays locally, isolating the frontmost subject from background artifacts in milliseconds."
    },
    {
      question: "What should I do if the automatic cut misses fine details?",
      answer: "We have built a premium interactive 'Manual Brush' editor natively into our web software. Simply switch to the sandbox brush tab to restore missed hairs, erase unwanted background pixels, or refine complex transparencies with precision."
    },
    {
      question: "Do you offer direct API integration or commercial subscriptions?",
      answer: "Because we prioritize decentralized computing, we do not host a REST API server. However, if you would like custom integrations, unique regional biometric passport weights, or need enterprise guidance, feel free to contact us directly at contact@bgiremove.com."
    }
  ];

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-12 md:py-16 font-sans">
      
      {/* Tab Switcher */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex rounded-xl bg-zinc-900 p-1 border border-zinc-800">
          <button
            onClick={() => setActiveTab('about')}
            className={`px-4 sm:px-5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'about'
                ? 'bg-zinc-800 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            About BGI Remove
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`px-4 sm:px-5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'contact'
                ? 'bg-zinc-800 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            Contact & Support
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-4 sm:px-5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'faq'
                ? 'bg-zinc-800 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            FAQs Accordion
          </button>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 sm:p-10 shadow-xs">
        {activeTab === 'about' ? (
          <div className="space-y-8 animate-fadeIn">
            {/* About Top Header */}
            <div>
              <span className="text-[10px] uppercase font-mono font-bold text-indigo-400 tracking-wider">our origin & mission</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1 animate-fadeIn">
                Local Serverless Graphic Processing
              </h2>
              <p className="mt-4 text-sm text-zinc-400 leading-relaxed">
                BGI Remove was founded with a single paradigm in mind: <strong>your photos should never leave your personal computer.</strong> Traditional background removal tools force you to upload high-definition images to remote databases, generating server costs, bandwidth consumption, and privacy vulnerabilities. We designed BGI Remove as an alternative model of modern browser-side computing.
              </p>
            </div>

            {/* Core Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-850">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-zinc-100 font-bold">
                  <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                  <h3 className="text-sm">100% Privacy Absolute</h3>
                </div>
                <p className="text-xs text-zinc-450 leading-relaxed">
                  We don't maintain file hosts or transfer image databases. All segmented matrices and neural model inferences are computed locally on your system hardware. Your records remain private.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-zinc-100 font-bold">
                  <Cpu className="h-5 w-5 text-indigo-400 shrink-0" />
                  <h3 className="text-sm">High Precision Neural Nets</h3>
                </div>
                <p className="text-xs text-zinc-450 leading-relaxed">
                  Utilizing state-of-the-art ONNX runtime architectures compiled via WebAssembly, we convert complex segmentation layers into multi-threaded browser queries for real-time edge processing.
                </p>
              </div>
            </div>

            {/* Detailed Company Section */}
            <div className="space-y-4 pt-6 border-t border-zinc-850">
              <h4 className="text-sm font-bold text-zinc-100">Democratizing Creative Tools</h4>
              <p className="text-xs text-zinc-450 leading-relaxed">
                We believe that premium photo-editing and transparency matting tools should not require expensive, recurring software subscriptions. Whether you are generating professional passport photos, white-background product listings for Amazon and Shopify, or high-definition marketing designs, BGI Remove provides advanced tools entirely free of charge.
              </p>
              <div className="p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-xs text-indigo-300 font-semibold leading-relaxed animate-pulse">
                Enjoying BGI Remove? We are continuously training newer, faster, light-weight local models to tackle complex subjects like wind-blown hair and transparent glass. Spread the word to help us support the free serverless community.
              </div>
            </div>
            
            {/* Quick Button to go to Contact */}
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setActiveTab('faq')}
                className="text-xs font-bold text-zinc-400 hover:text-indigo-400 flex items-center gap-1.5 transition-colors"
              >
                <span>Read common FAQs</span>
                <HelpCircle className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : activeTab === 'contact' ? (
          <div className="space-y-8 animate-fadeIn">
            {/* Contact Top Header */}
            <div>
              <span className="text-[10px] uppercase font-mono font-bold text-indigo-400 tracking-wider">direct inquiry channels</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1 animate-fadeIn">
                Get in Touch with our Team
              </h2>
              <p className="mt-4 text-sm text-zinc-400 leading-relaxed">
                Have a feature request, spotted a model error, or want to integrate our client-side background removal technology into your own platform? You can reach us directly via email. We read every incoming message and love technical feedback.
              </p>
            </div>

            {/* Direct Mail Channel */}
            <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-850 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-zinc-100">Official Support Channel</p>
                  <p className="text-xs font-bold text-zinc-400 font-mono">contact@bgiremove.com</p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleCopyEmail}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-xs font-bold text-zinc-355 text-zinc-300 hover:text-white hover:bg-zinc-800 transition active:scale-98"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Email</span>
                    </>
                  )}
                </button>
                <a
                  href="mailto:contact@bgiremove.com"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-zinc-800 px-4 py-2.5 text-xs font-bold text-white hover:bg-zinc-700 transition active:scale-98"
                >
                  <span>Mail Direct</span>
                </a>
              </div>
            </div>
            
            {/* Quick Button to go to FAQs */}
            <div className="flex justify-end pt-4 border-t border-zinc-850">
              <button
                onClick={() => setActiveTab('faq')}
                className="text-xs font-bold text-zinc-400 hover:text-indigo-400 flex items-center gap-1.5 transition-colors"
              >
                <span>Read our FAQs</span>
                <HelpCircle className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-fadeIn">
            {/* FAQ Top Header */}
            <div>
              <span className="text-[10px] uppercase font-mono font-bold text-indigo-400 tracking-wider">knowledge base</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1 animate-fadeIn">
                Frequently Asked Questions
              </h2>
              <p className="mt-4 text-sm text-zinc-400 leading-relaxed">
                Find answers to common questions about BGI Remove's advanced browser-side neural models, privacy-focused sandboxing, export quality, and offline performance.
              </p>
            </div>

            {/* Accordion Questions List */}
            <div className="space-y-3 pt-6 border-t border-zinc-850">
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;

                return (
                  <div 
                    key={idx}
                    className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                      isOpen 
                        ? 'border-indigo-500/35 bg-indigo-500/5 ring-1 ring-indigo-500/10' 
                        : 'border-zinc-800 bg-zinc-950 hover:bg-zinc-900/55'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      className="w-full flex items-center justify-between p-5 text-left font-bold text-zinc-100 text-xs sm:text-sm select-none gap-4"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown className={`h-4 w-4 text-zinc-450 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-400' : ''}`} />
                    </button>

                    <div 
                      className={`transition-all duration-200 border-zinc-850 ${
                        isOpen 
                          ? 'max-h-[300px] border-t p-5 text-xs text-zinc-300 leading-relaxed' 
                          : 'max-h-0 pointer-events-none text-[0px] p-0 border-t-0'
                      }`}
                    >
                      {faq.answer}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Micro FAQ Help Footnote */}
            <div className="pt-6 border-t border-zinc-850 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs font-semibold text-zinc-300 text-center sm:text-left">
                Still have questions or need technical support?
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('contact')}
                className="rounded-xl px-4 py-2 border border-zinc-800 text-xs font-bold text-zinc-350 hover:text-indigo-400 hover:bg-zinc-800 transition active:scale-98"
              >
                Go to Direct Contact Form
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
