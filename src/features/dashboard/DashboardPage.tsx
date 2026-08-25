import React from 'react';
import type { ModuleType } from '../../components/layout/Sidebar';
import {
  MessageSquare,
  FileText,
  PenTool,
  Image as ImageIcon,
  Video,
  Eye,
  Camera,
  Mic,
  ArrowRight,
  Sparkles,
  Zap,
  Cpu
} from 'lucide-react';

interface DashboardPageProps {
  setActiveModule: (module: ModuleType) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ setActiveModule }) => {
  const cards = [
    {
      id: 'chat',
      title: 'AI Chat',
      desc: 'Interactive text conversations with memory and knowledge context.',
      icon: MessageSquare,
      color: 'from-cyan-500 to-blue-600',
      badge: 'Conversational LLM',
    },
    {
      id: 'rag',
      title: 'Document Knowledge Base (RAG)',
      desc: 'Upload PDFs, DOCXs, or TXT files. AI retrieves answers exclusively from your files.',
      icon: FileText,
      color: 'from-purple-500 to-indigo-600',
      badge: 'FAISS + LangChain',
    },
    {
      id: 'writing',
      title: 'AI Content & Essay Generator',
      desc: 'Create essays, creative stories, blog articles, summaries, and rewrites in seconds.',
      icon: PenTool,
      color: 'from-pink-500 to-rose-600',
      badge: 'Templates',
    },
    {
      id: 'image-gen',
      title: 'AI Image Generation',
      desc: 'Turn imaginative prompts into high-resolution visual artwork.',
      icon: ImageIcon,
      color: 'from-amber-500 to-orange-600',
      badge: 'Image AI',
    },
    {
      id: 'video-gen',
      title: 'AI Video Generation',
      desc: 'Generate dynamic video content from text descriptions.',
      icon: Video,
      color: 'from-emerald-500 to-teal-600',
      badge: 'Video AI',
    },
    {
      id: 'image-analysis',
      title: 'Multimodal Image Analysis',
      desc: 'Upload images to detect objects, analyze facial expressions, and understand scenes.',
      icon: Eye,
      color: 'from-blue-500 to-cyan-600',
      badge: 'Vision AI',
    },
    {
      id: 'live-camera',
      title: 'Live Camera Detection',
      desc: 'Real-time 60fps computer vision for hands, eyes, and mouth tracking via MediaPipe.',
      icon: Camera,
      color: 'from-violet-500 to-purple-600',
      badge: 'Real-Time CV',
    },
    {
      id: 'voice-chat',
      title: 'Live Voice Conversation',
      desc: 'Continuous hands-free spoken conversation with live speech-to-text and AI voice.',
      icon: Mic,
      color: 'from-red-500 to-pink-600',
      badge: 'Speech STT/TTS',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-8 border border-slate-700/60 bg-gradient-to-r from-slate-900/90 via-purple-950/40 to-cyan-950/40">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Generation Multimodal AI Platform</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-3">
            Welcome to <span className="gradient-text">MultiHubAI Assistant</span>
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            A comprehensive AI workspace unifying Conversational LLMs, Retrieval-Augmented Generation (RAG), Content Generation, Image & Video Synthesis, Real-time Computer Vision, and Hands-Free Voice Chat.
          </p>

          <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-300">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Gemini 2.0 Flash Engine</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>In-Browser 60FPS MediaPipe</span>
            </div>
          </div>
        </div>
      </div>

      {/* Module Grid */}
      <div>
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <span>Core AI Modules</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => setActiveModule(card.id as ModuleType)}
                className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between cursor-pointer group hover:border-cyan-500/40"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-lg`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-slate-800/80 text-cyan-300 border border-slate-700">
                      {card.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-100 text-base mb-1.5 group-hover:text-cyan-400 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {card.desc}
                  </p>
                </div>

                <div className="flex items-center text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
                  <span>Launch Module</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
