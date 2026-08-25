import React, { useState } from 'react';
import { Image as ImageIcon, Sparkles, Download, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

interface GeneratedImageItem {
  id: string;
  url: string;
  prompt: string;
  aspect_ratio: string;
}

export const ImageGenPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [generating, setGenerating] = useState(false);
  const [gallery, setGallery] = useState<GeneratedImageItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || generating) return;

    setGenerating(true);
    setErrorMsg(null);
    try {
      const res = await api.generateImage(prompt.trim(), aspectRatio);
      const imgUrl = res.data.image_b64 || res.data.image_url;
      if (res.data.success && imgUrl) {
        const newItem: GeneratedImageItem = {
          id: Date.now().toString(),
          url: imgUrl,
          prompt: prompt.trim(),
          aspect_ratio: aspectRatio,
        };
        setGallery((prev) => [newItem, ...prev]);
        setPrompt('');
      } else {
        setErrorMsg(res.data.error || 'Failed to generate image.');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || err.message || 'Image generation failed.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Prompt Form */}
      <div className="glass-panel rounded-2xl border border-slate-800 p-6">
        <div className="flex items-center gap-2 mb-4">
          <ImageIcon className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-slate-100 text-base">AI Image Generator</h3>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to generate (e.g., 'A cyberpunk neon city with flying cars in rainy night')..."
              className="flex-1 px-4 py-3 rounded-xl glass-input text-sm"
              disabled={generating}
            />

            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="px-4 py-3 rounded-xl glass-input text-xs font-semibold md:w-36"
            >
              <option value="1:1">1:1 Square</option>
              <option value="16:9">16:9 Widescreen</option>
              <option value="4:3">4:3 Standard</option>
              <option value="9:16">9:16 Portrait</option>
            </select>

            <button
              type="submit"
              disabled={generating || !prompt.trim()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 hover:opacity-90 disabled:opacity-40 transition flex items-center justify-center gap-2 shrink-0"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{generating ? 'Generating...' : 'Generate Image'}</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
              {errorMsg}
            </div>
          )}
        </form>
      </div>

      {/* Generated Images Gallery */}
      <div className="glass-panel rounded-2xl border border-slate-800 p-6">
        <h4 className="font-bold text-slate-200 text-sm mb-4">Generated Gallery ({gallery.length})</h4>

        {gallery.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500 text-xs">
            <ImageIcon className="w-12 h-12 mb-2 opacity-30" />
            <span>Enter a prompt above to generate AI artwork</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gallery.map((img) => (
              <div
                key={img.id}
                className="glass-card rounded-2xl overflow-hidden border border-slate-800 group relative flex flex-col"
              >
                <div className="relative overflow-hidden aspect-square bg-slate-900">
                  <img
                    src={img.url}
                    alt={img.prompt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <a
                    href={img.url}
                    download={`multihub-ai-${img.id}.png`}
                    className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 backdrop-blur-md text-white hover:bg-cyan-500 transition opacity-0 group-hover:opacity-100"
                    title="Download Image"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
                <div className="p-4 bg-slate-900/80 border-t border-slate-800/80">
                  <p className="text-xs text-slate-300 font-medium line-clamp-2">{img.prompt}</p>
                  <span className="text-[10px] text-amber-400 font-semibold mt-1 block">
                    Ratio: {img.aspect_ratio}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
