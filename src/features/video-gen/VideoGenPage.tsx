import React, { useState } from 'react';
import { Video, Sparkles, Loader2, Play } from 'lucide-react';
import { api } from '../../services/api';

export const VideoGenPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || generating) return;

    setGenerating(true);
    setStatusMsg(null);
    try {
      const res = await api.generateVideo(prompt.trim());
      if (res.data.success) {
        setStatusMsg(`Video generation request submitted! ${res.data.message || ''}`);
        if (res.data.video_url) {
          setVideoUrl(res.data.video_url);
        }
      } else {
        setStatusMsg(`Note: ${res.data.error || 'Video generation initiated.'}`);
      }
    } catch (err: any) {
      setStatusMsg(`Notice: ${err.response?.data?.detail || err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Video Generation Prompt */}
      <div className="glass-panel rounded-2xl border border-slate-800 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Video className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-slate-100 text-base">AI Video Generation</h3>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the video animation to generate (e.g., 'A majestic eagle soaring over snow-capped mountain peaks at golden hour')..."
              className="flex-1 px-4 py-3 rounded-xl glass-input text-sm"
              disabled={generating}
            />

            <button
              type="submit"
              disabled={generating || !prompt.trim()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 hover:opacity-90 disabled:opacity-40 transition flex items-center justify-center gap-2 shrink-0"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{generating ? 'Processing...' : 'Generate Video'}</span>
            </button>
          </div>
        </form>

        {statusMsg && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
            {statusMsg}
          </div>
        )}
      </div>

      {/* Video Preview Container */}
      <div className="glass-panel rounded-2xl border border-slate-800 p-8 flex flex-col items-center justify-center text-center">
        {videoUrl ? (
          <div className="w-full max-w-3xl space-y-4">
            {videoUrl.includes('.mp4') || videoUrl.includes('/file/') ? (
              <video
                src={videoUrl}
                controls
                autoPlay
                loop
                className="w-full rounded-2xl border border-emerald-500/30 shadow-2xl shadow-emerald-500/10"
              />
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-emerald-500/30 shadow-2xl group">
                <img
                  src={videoUrl}
                  alt={prompt}
                  className="w-full aspect-video object-cover group-hover:scale-102 transition duration-500"
                />
                <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[11px] font-semibold text-emerald-300">
                  ✨ AI Video Render
                </div>
              </div>
            )}
            <p className="text-xs text-emerald-400 font-semibold">AI Video Render Stream Completed for "{prompt}"</p>
          </div>
        ) : (
          <>
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 animate-pulse">
              <Play className="w-8 h-8 ml-1" />
            </div>
            <h4 className="text-base font-bold text-slate-200 mb-1">AI Video Generator</h4>
            <p className="text-xs text-slate-400 max-w-md">
              Generates cinematic video clips from natural text prompts.
            </p>
          </>
        )}
      </div>
    </div>
  );
};
