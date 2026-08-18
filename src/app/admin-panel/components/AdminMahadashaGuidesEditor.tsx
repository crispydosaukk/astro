'use client';

import React, { useState, useEffect } from 'react';
import { getAllMahadashaGuides, updateMahadashaGuide, MahadashaGuide } from '@/lib/mahadasha';
import { Save, Loader2, FileText, Upload, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminMahadashaGuidesEditor() {
  const [guides, setGuides] = useState<MahadashaGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadGuides() {
      setLoading(true);
      const data = await getAllMahadashaGuides();
      setGuides(data);
      setLoading(false);
    }
    loadGuides();
  }, []);

  const handleChange = (id: string, field: keyof MahadashaGuide, value: any) => {
    setGuides((prev) =>
      prev.map((g) => (g.id === id ? { ...g, [field]: value } : g))
    );
  };

  const handleSaveGuide = async (guide: MahadashaGuide) => {
    setSavingId(guide.id);
    try {
      await updateMahadashaGuide(guide.id, {
        title: guide.title,
        price: Number(guide.price),
        priceUSD: Number(guide.priceUSD),
        pdfUrl: guide.pdfUrl,
        subtitle: guide.subtitle,
        description: guide.description,
      });
      toast.success(`Saved settings for ${guide.title}!`);
    } catch (err: any) {
      console.error('Error saving guide:', err);
      toast.error('Failed to save settings.');
    } finally {
      setSavingId(null);
    }
  };

  const handlePdfUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingId(id);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.url) {
        handleChange(id, 'pdfUrl', data.url);
        toast.success(`PDF uploaded successfully! URL set.`);
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err: any) {
      console.error('PDF upload error:', err);
      toast.error(err.message || 'PDF upload failed.');
    } finally {
      setUploadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="animate-spin text-[#C9952B]" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-card border border-border space-y-1">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <FileText className="text-accent" size={22} /> Mahadasha PDF Guides Management
        </h2>
        <p className="text-xs text-muted-foreground">
          Dynamically manage prices (₹ INR / $ USD) and upload PDF files for Rahu & Sani Mahadasha Guides.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guides.map((g) => (
          <div key={g.id} className="p-6 rounded-2xl bg-card border border-border space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2.5 py-0.5 rounded-full">
                  {g.badge}
                </span>
                <h3 className="font-bold text-foreground text-base mt-1">{g.title}</h3>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-muted-foreground block mb-1">Guide Title</label>
                <input
                  type="text"
                  value={g.title}
                  onChange={(e) => handleChange(g.id, 'title', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    value={g.price}
                    onChange={(e) => handleChange(g.id, 'price', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground font-mono font-bold outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Price ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={g.priceUSD}
                    onChange={(e) => handleChange(g.id, 'priceUSD', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground font-mono font-bold outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">PDF File URL / Upload</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={g.pdfUrl}
                    onChange={(e) => handleChange(g.id, 'pdfUrl', e.target.value)}
                    placeholder="/assets/pdfs/guide.pdf or https://..."
                    className="flex-1 px-3 py-2 rounded-xl bg-background border border-border text-foreground font-mono outline-none focus:border-accent"
                  />
                  <label className="px-3 py-2 rounded-xl bg-accent text-white font-bold cursor-pointer hover:opacity-90 flex items-center gap-1.5 shrink-0">
                    <Upload size={14} />
                    <span>{uploadingId === g.id ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => handlePdfUpload(g.id, e)}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">Subtitle / Summary</label>
                <textarea
                  rows={2}
                  value={g.subtitle}
                  onChange={(e) => handleChange(g.id, 'subtitle', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-border flex justify-end">
              <button
                onClick={() => handleSaveGuide(g)}
                disabled={savingId === g.id}
                className="px-5 py-2 rounded-xl gold-gradient-bg text-white font-bold text-xs flex items-center gap-2 hover:opacity-90 transition-opacity shadow"
              >
                {savingId === g.id ? (
                  <>
                    <Loader2 className="animate-spin" size={14} /> Saving...
                  </>
                ) : (
                  <>
                    <Save size={14} /> Save Guide Changes
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
