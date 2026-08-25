import React from 'react';
import type { ModuleType } from './Sidebar';
import { Activity, ShieldCheck, Key } from 'lucide-react';

interface HeaderProps {
  activeModule: ModuleType;
  hasApiKey: boolean;
  openSettings: () => void;
}

const moduleTitles: Record<ModuleType, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard Overview', subtitle: 'Unified Generative AI, RAG & Computer Vision Suite' },
  chat: { title: 'AI Conversational Assistant', subtitle: '' },
  rag: { title: 'Knowledge Base / RAG', subtitle: 'Upload documents to build custom document search and question answering' },
  writing: { title: 'AI Content & Essay Writer', subtitle: 'Generate, summarize, improve, and rewrite text with custom templates' },
  'image-gen': { title: 'AI Image Generation', subtitle: 'Transform text prompts into high-resolution visuals' },
  'video-gen': { title: 'AI Video Generation', subtitle: 'Create dynamic video clips from text prompts' },
  'image-analysis': { title: 'Multimodal Image Analysis', subtitle: 'Analyze uploaded photos, detect objects, hands, face features & scenes' },
  'live-camera': { title: 'Real-Time Camera Detection', subtitle: 'Live 60fps computer vision for hands, eyes, and mouth tracking via MediaPipe' },
  'voice-chat': { title: 'Interactive Live Voice Chat', subtitle: 'Hands-free voice conversation with real-time speech recognition & speech synthesis' },
};

export const Header: React.FC<HeaderProps> = ({ activeModule, hasApiKey, openSettings }) => {
  const current = moduleTitles[activeModule] || { title: 'MultiHubAI Assistant', subtitle: 'AI Powerhouse' };

  return (
    <header className="h-20 glass-panel border-b border-slate-800/80 px-8 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          {current.title}
        </h2>
        {current.subtitle && <p className="text-xs text-slate-400 mt-0.5">{current.subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* API Status Badge */}
        <button
          onClick={openSettings}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            hasApiKey
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20 animate-pulse'
          }`}
        >
          {hasApiKey ? <ShieldCheck className="w-3.5 h-3.5" /> : <Key className="w-3.5 h-3.5" />}
          <span>{hasApiKey ? 'API Key Configured' : 'Configure Gemini API Key'}</span>
        </button>

        {/* Real-time Engine Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-900/80 text-slate-300 border border-slate-800">
          <Activity className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
          <span>System Online</span>
        </div>
      </div>
    </header>
  );
};
