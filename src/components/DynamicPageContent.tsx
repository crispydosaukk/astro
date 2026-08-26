'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { getPublishedPageContents, DynamicPageItem } from '@/lib/dynamicContent';

interface DynamicPageContentProps {
  pageId: string;
  sectionPlacement?: 'top' | 'below-form' | 'educational' | 'remedies' | 'bottom';
  className?: string;
}

export default function DynamicPageContent({
  pageId,
  sectionPlacement,
  className = '',
}: DynamicPageContentProps) {
  const [items, setItems] = useState<DynamicPageItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadContent() {
      try {
        const data = await getPublishedPageContents(pageId, sectionPlacement);
        if (isMounted) {
          setItems(data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) setLoading(false);
      }
    }
    loadContent();
    return () => {
      isMounted = false;
    };
  }, [pageId, sectionPlacement]);

  if (loading || items.length === 0) {
    return null;
  }

  const themeStyles = {
    gold: {
      border: 'border-[#C9952B]/30',
      badge: 'bg-[#C9952B]/20 text-[#C9952B] border-[#C9952B]/30',
      title: 'text-gradient-gold',
      accent: 'bg-[#C9952B]/10',
    },
    rose: {
      border: 'border-rose-500/30',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      title: 'text-rose-400',
      accent: 'bg-rose-500/10',
    },
    emerald: {
      border: 'border-emerald-500/30',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      title: 'text-emerald-400',
      accent: 'bg-emerald-500/10',
    },
    cyan: {
      border: 'border-cyan-500/30',
      badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      title: 'text-cyan-400',
      accent: 'bg-cyan-500/10',
    },
    slate: {
      border: 'border-white/15',
      badge: 'bg-white/10 text-white border-white/20',
      title: 'text-foreground',
      accent: 'bg-white/5',
    },
  };

  return (
    <div className={`max-w-screen-2xl mx-auto px-6 lg:px-10 space-y-6 my-6 ${className}`}>
      {items.map((item) => {
        const theme = themeStyles[item.theme || 'gold'] || themeStyles.gold;

        return (
          <div
            key={item.id}
            className={`glass-card p-6 sm:p-8 lg:p-10 rounded-3xl border ${theme.border} ${theme.accent} shadow-2xl backdrop-blur-xl space-y-4`}
          >
            {/* Optional Header with Badge, Title, Subtitle */}
            {(item.badge || item.title || item.subtitle) && (
              <div className="space-y-2 border-b border-white/10 pb-4">
                {item.badge && (
                  <span
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold border ${theme.badge}`}
                  >
                    <Sparkles size={13} /> {item.badge}
                  </span>
                )}
                {item.title && (
                  <h3
                    className={`text-xl sm:text-2xl lg:text-3xl font-bold ${theme.title} tracking-tight`}
                  >
                    {item.title}
                  </h3>
                )}
                {item.subtitle && (
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {item.subtitle}
                  </p>
                )}
              </div>
            )}

            {/* Render formatted HTML Content from the Rich Text Editor */}
            <div
              className="dynamic-content-body text-foreground/90 text-sm sm:text-base leading-relaxed space-y-3 prose prose-invert max-w-none prose-p:my-2 prose-headings:text-foreground prose-a:text-[#C9952B] prose-a:underline hover:prose-a:opacity-80 prose-blockquote:border-l-4 prose-blockquote:border-[#C9952B] prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground prose-ul:list-disc prose-ul:pl-5 prose-ol:list-decimal prose-ol:pl-5"
              dangerouslySetInnerHTML={{ __html: item.htmlContent }}
            />
          </div>
        );
      })}
    </div>
  );
}
