'use client';
import React, { useEffect, useState } from 'react';
import {
  getServicePageContent,
  updateServicePageContent,
  HomaServiceContent, defaultHomaContent,
  GemstoneServiceContent, defaultGemstoneContent,
  MantraServiceContent, defaultMantraContent,
  YantraServiceContent, defaultYantraContent,
  IshtaDevataServiceContent, defaultIshtaDevataContent,
  MuhurthamServiceContent, defaultMuhurthamContent,
  VastuServiceContent, defaultVastuContent,
  CharityServiceContent, defaultCharityContent
} from '@/lib/cms';
import { Save, Loader2, Info } from 'lucide-react';

export default function AdminServicePagesEditor() {
  const [selectedService, setSelectedService] = useState('homa');
  
  const [homa, setHoma] = useState<HomaServiceContent>(defaultHomaContent);
  const [gemstone, setGemstone] = useState<GemstoneServiceContent>(defaultGemstoneContent);
  const [mantra, setMantra] = useState<MantraServiceContent>(defaultMantraContent);
  const [yantra, setYantra] = useState<YantraServiceContent>(defaultYantraContent);
  const [ishta, setIshta] = useState<IshtaDevataServiceContent>(defaultIshtaDevataContent);
  const [muhurtham, setMuhurtham] = useState<MuhurthamServiceContent>(defaultMuhurthamContent);
  const [vastu, setVastu] = useState<VastuServiceContent>(defaultVastuContent);
  const [charity, setCharity] = useState<CharityServiceContent>(defaultCharityContent);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const resHoma = await getServicePageContent('homa', defaultHomaContent);
      const resGemstone = await getServicePageContent('gemstone', defaultGemstoneContent);
      const resMantra = await getServicePageContent('mantra', defaultMantraContent);
      const resYantra = await getServicePageContent('yantra', defaultYantraContent);
      const resIshta = await getServicePageContent('ishta-devata', defaultIshtaDevataContent);
      const resMuhurtham = await getServicePageContent('muhurtham', defaultMuhurthamContent);
      const resVastu = await getServicePageContent('vastu', defaultVastuContent);
      const resCharity = await getServicePageContent('charity', defaultCharityContent);

      setHoma(resHoma);
      setGemstone(resGemstone);
      setMantra(resMantra);
      setYantra(resYantra);
      setIshta(resIshta);
      setMuhurtham(resMuhurtham);
      setVastu(resVastu);
      setCharity(resCharity);
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      if (selectedService === 'homa') await updateServicePageContent('homa', homa);
      else if (selectedService === 'gemstone') await updateServicePageContent('gemstone', gemstone);
      else if (selectedService === 'mantra') await updateServicePageContent('mantra', mantra);
      else if (selectedService === 'yantra') await updateServicePageContent('yantra', yantra);
      else if (selectedService === 'ishta-devata') await updateServicePageContent('ishta-devata', ishta);
      else if (selectedService === 'muhurtham') await updateServicePageContent('muhurtham', muhurtham);
      else if (selectedService === 'vastu') await updateServicePageContent('vastu', vastu);
      else if (selectedService === 'charity') await updateServicePageContent('charity', charity);

      setMessage({ type: 'success', text: `Page content updated successfully!` });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save content. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const renderHeroEditor = (hero: any, updateHero: (field: string, val: string) => void) => (
    <>
      <h3 className="text-lg font-bold text-foreground border-b border-border pb-4">Hero Section</h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Tag</label>
          <input type="text" value={hero.tag} onChange={(e) => updateHero('tag', e.target.value)} className="w-full px-4 py-2 rounded-xl bg-background border border-border text-sm" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Title Line 1</label>
          <input type="text" value={hero.titleLine1} onChange={(e) => updateHero('titleLine1', e.target.value)} className="w-full px-4 py-2 rounded-xl bg-background border border-border text-sm" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-foreground">Title Line 2 (Gold)</label>
          <input type="text" value={hero.titleLine2} onChange={(e) => updateHero('titleLine2', e.target.value)} className="w-full px-4 py-2 rounded-xl bg-background border border-border text-sm" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-foreground">Description</label>
          <textarea rows={3} value={hero.description} onChange={(e) => updateHero('description', e.target.value)} className="w-full px-4 py-2 rounded-xl bg-background border border-border text-sm resize-none" />
        </div>
      </div>
    </>
  );

  const renderBenefitsEditor = (title: string, benefits: string[], updateTitle: (val: string) => void, updateBenefits: (val: string[]) => void) => (
    <>
      <h3 className="text-lg font-bold text-foreground border-b border-border pb-4 mt-8">Benefits Section</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Benefits Title</label>
          <input type="text" value={title} onChange={(e) => updateTitle(e.target.value)} className="w-full px-4 py-2 rounded-xl bg-background border border-border text-sm" />
        </div>
        <label className="text-sm font-medium text-foreground block">Benefit Items</label>
        {benefits.map((benefit, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <input type="text" value={benefit} onChange={(e) => {
              const newBenefits = [...benefits];
              newBenefits[idx] = e.target.value;
              updateBenefits(newBenefits);
            }} className="w-full px-4 py-2 rounded-xl bg-background border border-border text-sm" />
          </div>
        ))}
      </div>
    </>
  );

  const renderFaqEditor = (faqs: any[], updateFaqs: (val: any[]) => void) => (
    <>
      <h3 className="text-lg font-bold text-foreground border-b border-border pb-4 mt-8">FAQs</h3>
      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="p-4 border border-border rounded-xl bg-muted/20 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Question</label>
              <input type="text" value={faq.q} onChange={(e) => {
                const newFaqs = [...faqs];
                newFaqs[idx].q = e.target.value;
                updateFaqs(newFaqs);
              }} className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Answer</label>
              <textarea rows={2} value={faq.a} onChange={(e) => {
                const newFaqs = [...faqs];
                newFaqs[idx].a = e.target.value;
                updateFaqs(newFaqs);
              }} className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm resize-none" />
            </div>
          </div>
        ))}
      </div>
    </>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <label className="text-sm font-semibold text-foreground whitespace-nowrap">Select Page:</label>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-background border border-border text-foreground focus:ring-2 focus:ring-accent focus:border-accent outline-none text-sm"
          >
            <option value="homa">Homam & Puja</option>
            <option value="gemstone">Gemstone Advice</option>
            <option value="mantra">Mantra Guidance</option>
            <option value="yantra">Yantra Recommendations</option>
            <option value="ishta-devata">Ishta Devata</option>
            <option value="muhurtham">Muhurtham Generator</option>
            <option value="vastu">Interactive Vastu</option>
            <option value="charity">Charity Planner</option>
          </select>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          type="button"
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-accent text-white font-semibold hover:bg-accent/90 transition-all disabled:opacity-70 text-sm w-full sm:w-auto"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-start gap-3 border ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
          <Info size={20} className="flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8 bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm">
        
        {/* HOMAM */}
        {selectedService === 'homa' && (
          <>
            {renderHeroEditor(homa.hero, (f, v) => setHoma({ ...homa, hero: { ...homa.hero, [f]: v } }))}
            {renderBenefitsEditor(homa.benefitsTitle, homa.benefits, (v) => setHoma({ ...homa, benefitsTitle: v }), (v) => setHoma({ ...homa, benefits: v }))}
            <h3 className="text-lg font-bold text-foreground border-b border-border pb-4 mt-8">Homam Types</h3>
            {homa.homams.map((h, idx) => (
              <div key={idx} className="p-4 border border-border rounded-xl bg-muted/20 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {['name', 'purpose', 'day', 'duration'].map((field) => (
                    <div key={field} className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground capitalize">{field}</label>
                      <input type="text" value={(h as any)[field]} onChange={(e) => {
                        const arr = [...homa.homams];
                        (arr[idx] as any)[field] = e.target.value;
                        setHoma({ ...homa, homams: arr });
                      }} className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {/* GEMSTONE */}
        {selectedService === 'gemstone' && (
          <>
            {renderHeroEditor(gemstone.hero, (f, v) => setGemstone({ ...gemstone, hero: { ...gemstone.hero, [f]: v } }))}
            {renderBenefitsEditor(gemstone.benefitsTitle, gemstone.benefits, (v) => setGemstone({ ...gemstone, benefitsTitle: v }), (v) => setGemstone({ ...gemstone, benefits: v }))}
            <h3 className="text-lg font-bold text-foreground border-b border-border pb-4 mt-8">Gemstones</h3>
            {gemstone.gemstones.map((g, idx) => (
              <div key={idx} className="p-4 border border-border rounded-xl bg-muted/20 grid md:grid-cols-4 gap-4">
                {['planet', 'gem', 'metal', 'finger'].map((field) => (
                  <div key={field} className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground capitalize">{field}</label>
                    <input type="text" value={(g as any)[field]} onChange={(e) => {
                      const arr = [...gemstone.gemstones];
                      (arr[idx] as any)[field] = e.target.value;
                      setGemstone({ ...gemstone, gemstones: arr });
                    }} className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm" />
                  </div>
                ))}
              </div>
            ))}
            {renderFaqEditor(gemstone.faqs, (v) => setGemstone({ ...gemstone, faqs: v }))}
          </>
        )}

        {/* MANTRA */}
        {selectedService === 'mantra' && (
          <>
            {renderHeroEditor(mantra.hero, (f, v) => setMantra({ ...mantra, hero: { ...mantra.hero, [f]: v } }))}
            {renderBenefitsEditor(mantra.benefitsTitle, mantra.benefits, (v) => setMantra({ ...mantra, benefitsTitle: v }), (v) => setMantra({ ...mantra, benefits: v }))}
            <h3 className="text-lg font-bold text-foreground border-b border-border pb-4 mt-8">Mantras</h3>
            {mantra.mantras.map((m, idx) => (
              <div key={idx} className="p-4 border border-border rounded-xl bg-muted/20 grid md:grid-cols-2 gap-4">
                {['planet', 'mantra', 'count', 'time'].map((field) => (
                  <div key={field} className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground capitalize">{field}</label>
                    <input type="text" value={(m as any)[field]} onChange={(e) => {
                      const arr = [...mantra.mantras];
                      (arr[idx] as any)[field] = e.target.value;
                      setMantra({ ...mantra, mantras: arr });
                    }} className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm" />
                  </div>
                ))}
              </div>
            ))}
            {renderFaqEditor(mantra.faqs, (v) => setMantra({ ...mantra, faqs: v }))}
          </>
        )}

        {/* YANTRA */}
        {selectedService === 'yantra' && (
          <>
            {renderHeroEditor(yantra.hero, (f, v) => setYantra({ ...yantra, hero: { ...yantra.hero, [f]: v } }))}
            {renderBenefitsEditor(yantra.benefitsTitle, yantra.benefits, (v) => setYantra({ ...yantra, benefitsTitle: v }), (v) => setYantra({ ...yantra, benefits: v }))}
            <h3 className="text-lg font-bold text-foreground border-b border-border pb-4 mt-8">Yantras</h3>
            {yantra.yantras.map((y, idx) => (
              <div key={idx} className="p-4 border border-border rounded-xl bg-muted/20 grid md:grid-cols-2 gap-4">
                {['name', 'planet', 'purpose', 'placement'].map((field) => (
                  <div key={field} className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground capitalize">{field}</label>
                    <input type="text" value={(y as any)[field]} onChange={(e) => {
                      const arr = [...yantra.yantras];
                      (arr[idx] as any)[field] = e.target.value;
                      setYantra({ ...yantra, yantras: arr });
                    }} className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm" />
                  </div>
                ))}
              </div>
            ))}
          </>
        )}

        {/* ISHTA DEVATA */}
        {selectedService === 'ishta-devata' && (
          <>
            {renderHeroEditor(ishta.hero, (f, v) => setIshta({ ...ishta, hero: { ...ishta.hero, [f]: v } }))}
            {renderBenefitsEditor(ishta.benefitsTitle, ishta.benefits, (v) => setIshta({ ...ishta, benefitsTitle: v }), (v) => setIshta({ ...ishta, benefits: v }))}
            <h3 className="text-lg font-bold text-foreground border-b border-border pb-4 mt-8">Deities</h3>
            {ishta.deities.map((d, idx) => (
              <div key={idx} className="p-4 border border-border rounded-xl bg-muted/20 grid md:grid-cols-2 gap-4">
                {['name', 'indicator', 'worship', 'stotra'].map((field) => (
                  <div key={field} className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground capitalize">{field}</label>
                    <input type="text" value={(d as any)[field]} onChange={(e) => {
                      const arr = [...ishta.deities];
                      (arr[idx] as any)[field] = e.target.value;
                      setIshta({ ...ishta, deities: arr });
                    }} className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm" />
                  </div>
                ))}
              </div>
            ))}
          </>
        )}

        {/* MUHURTHAM */}
        {selectedService === 'muhurtham' && (
          <>
            {renderHeroEditor(muhurtham.hero, (f, v) => setMuhurtham({ ...muhurtham, hero: { ...muhurtham.hero, [f]: v } }))}
            {renderBenefitsEditor(muhurtham.benefitsTitle, muhurtham.benefits, (v) => setMuhurtham({ ...muhurtham, benefitsTitle: v }), (v) => setMuhurtham({ ...muhurtham, benefits: v }))}
            <h3 className="text-lg font-bold text-foreground border-b border-border pb-4 mt-8">Events</h3>
            {muhurtham.events.map((ev, idx) => (
              <div key={idx} className="p-4 border border-border rounded-xl bg-muted/20 grid md:grid-cols-3 gap-4">
                {['name', 'icon', 'desc'].map((field) => (
                  <div key={field} className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground capitalize">{field}</label>
                    <input type="text" value={(ev as any)[field]} onChange={(e) => {
                      const arr = [...muhurtham.events];
                      (arr[idx] as any)[field] = e.target.value;
                      setMuhurtham({ ...muhurtham, events: arr });
                    }} className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm" />
                  </div>
                ))}
              </div>
            ))}
          </>
        )}

        {/* VASTU */}
        {selectedService === 'vastu' && (
          <>
            {renderHeroEditor(vastu.hero, (f, v) => setVastu({ ...vastu, hero: { ...vastu.hero, [f]: v } }))}
            {renderBenefitsEditor(vastu.benefitsTitle, vastu.benefits, (v) => setVastu({ ...vastu, benefitsTitle: v }), (v) => setVastu({ ...vastu, benefits: v }))}
            <h3 className="text-lg font-bold text-foreground border-b border-border pb-4 mt-8">Directions</h3>
            {vastu.directions.map((dir, idx) => (
              <div key={idx} className="p-4 border border-border rounded-xl bg-muted/20 grid md:grid-cols-2 gap-4">
                {['dir', 'deity', 'element', 'purpose', 'remedy'].map((field) => (
                  <div key={field} className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground capitalize">{field}</label>
                    <input type="text" value={(dir as any)[field]} onChange={(e) => {
                      const arr = [...vastu.directions];
                      (arr[idx] as any)[field] = e.target.value;
                      setVastu({ ...vastu, directions: arr });
                    }} className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm" />
                  </div>
                ))}
              </div>
            ))}
          </>
        )}

        {/* CHARITY */}
        {selectedService === 'charity' && (
          <>
            {renderHeroEditor(charity.hero, (f, v) => setCharity({ ...charity, hero: { ...charity.hero, [f]: v } }))}
            {renderBenefitsEditor(charity.benefitsTitle, charity.benefits, (v) => setCharity({ ...charity, benefitsTitle: v }), (v) => setCharity({ ...charity, benefits: v }))}
            <h3 className="text-lg font-bold text-foreground border-b border-border pb-4 mt-8">Charity Items</h3>
            {charity.charityItems.map((c, idx) => (
              <div key={idx} className="p-4 border border-border rounded-xl bg-muted/20 grid md:grid-cols-2 gap-4">
                {['planet', 'item', 'day', 'recipient'].map((field) => (
                  <div key={field} className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground capitalize">{field}</label>
                    <input type="text" value={(c as any)[field]} onChange={(e) => {
                      const arr = [...charity.charityItems];
                      (arr[idx] as any)[field] = e.target.value;
                      setCharity({ ...charity, charityItems: arr });
                    }} className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm" />
                  </div>
                ))}
              </div>
            ))}
          </>
        )}

      </form>
    </div>
  );
}
