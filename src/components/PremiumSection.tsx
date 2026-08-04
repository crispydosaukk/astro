import React from 'react';
import { Gem, Flame, Heart, Triangle, Compass, Info, Check } from 'lucide-react';
import { PremiumDetails } from '@/lib/cms';

export default function PremiumSection({ data }: { data?: PremiumDetails }) {
  if (!data || !data.enabled) return null;

  return (
    <section className="py-16 bg-background relative border-t border-white/10">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-12">
          {data.tagline && (
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-[#C9952B]/10 text-[#C9952B] border border-[#C9952B]/20 mb-4">
              {data.tagline}
            </span>
          )}
          <h2 className="text-3xl font-bold text-foreground mb-4">
            {data.titleLine1} <span className="text-gradient-gold">{data.titleLine2Gold}</span>
          </h2>
          {data.quote && (
            <p className="text-[#C9952B] font-semibold italic mt-4 mb-6 text-xl">
              {data.quote}
            </p>
          )}
          {data.description && (
            <p className="text-muted-foreground max-w-3xl mx-auto whitespace-pre-line">
              {data.description}
            </p>
          )}
        </div>

        {data.sloka && (
          <div className="glass-card border border-[#C9952B]/30 p-8 rounded-2xl mb-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="text-8xl">🕉️</span>
            </div>
            <p className="text-2xl font-sanskrit text-foreground mb-4 leading-loose whitespace-pre-line">
              {data.sloka.sanskrit}
            </p>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-semibold">✨ Transliteration</p>
              <p className="text-sm text-foreground/80 italic whitespace-pre-line">
                {data.sloka.transliteration}
              </p>
            </div>
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-sm text-[#C9952B] font-semibold mb-2">📖 Meaning</p>
              <p className="text-foreground whitespace-pre-line">
                {data.sloka.meaning}
              </p>
            </div>
          </div>
        )}

        {data.infoCards && data.infoCards.length > 0 && (
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {data.infoCards.map((card, idx) => (
              <div key={idx} className={`bg-card border border-border p-6 rounded-2xl hover:border-[#C9952B]/30 transition-colors ${idx === data.infoCards!.length - 1 && data.infoCards!.length % 2 !== 0 ? 'md:col-span-2 max-w-3xl mx-auto w-full' : ''}`}>
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="text-2xl">{card.icon || '✨'}</span> {card.title}
                </h3>
                {card.subtitle && (
                  <p className="text-sm font-semibold text-[#C9952B] mb-6 border-b border-border pb-3">
                    {card.subtitle}
                  </p>
                )}
                {card.description && (
                  <p className="text-sm text-muted-foreground mb-4 whitespace-pre-line">{card.description}</p>
                )}
                {card.points && card.points.length > 0 && (
                  <ul className="space-y-2 text-sm text-foreground/80 font-medium pl-2 mb-4">
                    {card.points.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2">
                        <span className="text-[#C9952B] mt-0.5">✔</span> 
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {card.subSections && card.subSections.length > 0 && (
                  <div className="space-y-5 mt-4">
                    {card.subSections.map((sub, sIdx) => (
                      <div key={sIdx}>
                        <h4 className="font-semibold text-foreground text-sm border-b border-border pb-2 mb-3">{sub.title}</h4>
                        {sub.description && (
                          <p className="text-sm text-muted-foreground mb-2 whitespace-pre-line">{sub.description}</p>
                        )}
                        {sub.points && sub.points.length > 0 && (
                          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                            {sub.points.map((pt, ptIdx) => (
                              <li key={ptIdx}>{pt}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {(data.summaryTitle || data.summaryPoints || data.summaryFooter) && (
          <div className="text-center bg-gradient-to-r from-background via-muted/50 to-background p-8 rounded-2xl border border-border">
            <h3 className="text-2xl font-bold text-foreground mb-6">
              {data.summaryTitle} <span className="text-gradient-gold">{data.summaryTitleGold}</span>
            </h3>
            {data.summaryPoints && data.summaryPoints.length > 0 && (
              <div className="flex flex-col items-center justify-center space-y-4 max-w-2xl mx-auto">
                {data.summaryPoints.map((pt, idx) => (
                  <p key={idx} className="text-lg text-foreground font-medium flex items-center gap-2">
                    <span className="text-[#C9952B]">✨</span> {pt}
                  </p>
                ))}
              </div>
            )}
            {data.summaryFooter && (
              <p className="text-sm text-muted-foreground mt-8 whitespace-pre-line italic text-[#C9952B] font-semibold">
                {data.summaryFooter}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
