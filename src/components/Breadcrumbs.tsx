import React from 'react';
import { ChevronRight, Home, BookOpen, Layers, Newspaper } from 'lucide-react';

interface BreadcrumbsProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

interface BreadcrumbItem {
  section: string;
  label: string;
  icon?: React.ReactNode;
}

export default function Breadcrumbs({ activeSection, onNavigate }: BreadcrumbsProps) {
  // If the user is on the main tool / root page, we don't render breadcrumbs
  const showBreadcrumbs = [
    'docs', 'blog', 'passport-photo', 'white-background', 'hd', 'free-remover',
    'article-remove-bg', 'article-best-ai', 'article-product-photos', 'about', 'contact'
  ].includes(activeSection);

  if (!showBreadcrumbs) return null;

  // Set up the static metadata for each section
  const sectionMetadata: Record<string, { title: string; parent: { section: string; label: string; icon?: React.ReactNode } | null }> = {
    about: {
      title: 'About Company',
      parent: null
    },
    contact: {
      title: 'Contact Us',
      parent: null
    },
    docs: {
      title: 'User Guides',
      parent: null
    },
    blog: {
      title: 'Blog Insights',
      parent: null
    },
    'passport-photo': {
      title: 'Passport Photo Biometric Standards',
      parent: { section: 'docs', label: 'User Guides', icon: <BookOpen className="h-3.5 w-3.5" /> }
    },
    'white-background': {
      title: 'Isolating White Background Objects',
      parent: { section: 'docs', label: 'User Guides', icon: <BookOpen className="h-3.5 w-3.5" /> }
    },
    hd: {
      title: 'Unlocking Ultra HD Resolution Studio Details',
      parent: { section: 'docs', label: 'User Guides', icon: <BookOpen className="h-3.5 w-3.5" /> }
    },
    'free-remover': {
      title: 'Serverless Free Platform Limits',
      parent: { section: 'docs', label: 'User Guides', icon: <BookOpen className="h-3.5 w-3.5" /> }
    },
    'article-remove-bg': {
      title: 'Perfect Cutouts Masterclass',
      parent: { section: 'blog', label: 'Blog Insights', icon: <Newspaper className="h-3.5 w-3.5" /> }
    },
    'article-best-ai': {
      title: '2026 Background Removers Benchmark',
      parent: { section: 'blog', label: 'Blog Insights', icon: <Newspaper className="h-3.5 w-3.5" /> }
    },
    'article-product-photos': {
      title: 'Shopify Product Photography Guide',
      parent: { section: 'blog', label: 'Blog Insights', icon: <Newspaper className="h-3.5 w-3.5" /> }
    }
  };

  const currentMeta = sectionMetadata[activeSection];
  if (!currentMeta) return null;

  const breadcrumbs: BreadcrumbItem[] = [];

  // 1. Root Element (Home)
  breadcrumbs.push({
    section: 'upload',
    label: 'Home',
    icon: <Home className="h-3.5 w-3.5 text-neutral-400 group-hover:text-orange-500 transition-colors" />
  });

  // 2. Parent Element if exists
  if (currentMeta.parent) {
    breadcrumbs.push({
      section: currentMeta.parent.section,
      label: currentMeta.parent.label,
      icon: currentMeta.parent.icon
    });
  }

  // 3. Current Element
  breadcrumbs.push({
    section: activeSection,
    label: currentMeta.title
  });

  // Built-in JSON-LD Structured Data Schema for Breadcrumbs
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => {
      const slug = item.section === 'upload' ? '' : item.section;
      return {
        "@type": "ListItem",
        "position": index + 1,
        "name": item.label,
        "item": `https://bgiremove.com/${slug}`
      };
    })
  };

  return (
    <div className="w-full border-b border-zinc-800 bg-zinc-900/50 py-3 font-sans">
      <div id="bgi-breadcrumb-seo" className="hidden" aria-hidden="true">
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-zinc-400" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;

            return (
              <React.Fragment key={crumb.section}>
                {idx > 0 && (
                  <ChevronRight className="h-3 w-3 text-zinc-700 flex-shrink-0" />
                )}

                {isLast ? (
                  <span className="text-white font-extrabold truncate max-w-[180px] sm:max-w-[320px] md:max-w-none" aria-current="page">
                    {crumb.label}
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      onNavigate(crumb.section);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="group inline-flex items-center gap-1.5 text-zinc-455 hover:text-orange-400 transition-colors py-0.5"
                  >
                    {crumb.icon}
                    <span>{crumb.label}</span>
                  </button>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
