import React from 'react';
import { Gem, Flame, Heart, Triangle, Compass, Info, Check } from 'lucide-react';
import { PremiumDetails } from '@/lib/cms';

export default function PremiumSection({ data }: { data?: PremiumDetails }) {
  if (!data || !data.enabled) return null;

  return (
    <section className="py-16 bg-[#F8F3EA] text-[#292522] relative border-t border-[#E5D9C8]">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-12">
          {data.tagline && (
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-[#EDE4D5] text-[#713B32] border border-[#E5D9C8] mb-4">
              {data.tagline}
            </span>
          )}
          <h2 className="text-3xl font-bold text-[#292522] mb-4">
            {data.titleLine1} <span className="text-gradient-gold">{data.titleLine2Gold}</span>
          </h2>
          {data.quote && (
            <p className="text-[#713B32] font-semibold italic mt-4 mb-6 text-xl">
              {data.quote}
            </p>
          )}
          {data.description && (
            <p className="text-[#6B5E55] max-w-3xl mx-auto whitespace-pre-line">
              {data.description}
            </p>
          )}
        </div>

        {data.sloka && (
          <div className="bg-[#FFFDFC] border border-[#E5D9C8] p-8 rounded-3xl mb-12 text-center relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="text-8xl">🕉️</span>
            </div>
            <p className="text-2xl font-sanskrit text-[#292522] mb-4 leading-loose whitespace-pre-line font-bold">
              {data.sloka.sanskrit}
            </p>
            <div className="space-y-2">
              <p className="text-sm text-[#713B32] font-bold">✨ Transliteration</p>
              <p className="text-sm text-[#292522]/80 italic whitespace-pre-line">
                {data.sloka.transliteration}
              </p>
            </div>
            <div className="mt-6 pt-6 border-t border-[#E5D9C8]">
              <p className="text-sm text-[#713B32] font-bold mb-2">📖 Meaning</p>
              <p className="text-[#292522] whitespace-pre-line">
                {data.sloka.meaning}
              </p>
            </div>
          </div>
        )}

        {data.infoCards && data.infoCards.length > 0 && (
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {data.infoCards.map((card, idx) => (
              <div key={idx} className={`bg-[#FFFDFC] border border-[#E5D9C8] p-7 rounded-3xl shadow-sm hover:shadow-xl hover:border-[#B88A44] transition-all card-hover ${idx === data.infoCards!.length - 1 && data.infoCards!.length % 2 !== 0 ? 'md:col-span-2 max-w-3xl mx-auto w-full' : ''}`}>
                <h3 className="text-xl font-bold text-[#292522] mb-3 flex items-center gap-2">
                  <span className="text-2xl">{card.icon || '✨'}</span> {card.title}
                </h3>
                {card.subtitle && (
                  <p className="text-sm font-bold text-[#713B32] mb-5 border-b border-[#E5D9C8] pb-3">
                    {card.subtitle}
                  </p>
                )}
                {card.description && (
                  <p className="text-sm text-[#6B5E55] mb-4 whitespace-pre-line">{card.description}</p>
                )}
                {card.points && card.points.length > 0 && (
                  <ul className="space-y-2 text-sm text-[#292522] font-medium pl-2 mb-4">
                    {card.points.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2">
                        <span className="text-[#713B32] mt-0.5 font-bold">✔</span> 
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {card.subSections && card.subSections.length > 0 && (
                  <div className="space-y-5 mt-4">
                    {card.subSections.map((sub, sIdx) => (
                      <div key={sIdx}>
                        <h4 className="font-bold text-[#292522] text-sm border-b border-[#E5D9C8] pb-2 mb-3">{sub.title}</h4>
                        {sub.description && (
                          <p className="text-sm text-[#6B5E55] mb-2 whitespace-pre-line">{sub.description}</p>
                        )}
                        {sub.points && sub.points.length > 0 && (
                          <ul className="text-sm text-[#6B5E55] space-y-1 list-disc pl-5">
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

        {data.bottomNote && (
          <div className="text-center bg-[#EDE4D5] border border-[#E5D9C8] p-6 rounded-3xl max-w-2xl mx-auto">
            <p className="text-sm font-semibold text-[#713B32] flex items-center justify-center gap-2">
              <Info size={16} /> {data.bottomNote}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
