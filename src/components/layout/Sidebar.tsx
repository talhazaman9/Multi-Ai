import React from 'react';
import {
  MessageSquare,
  FileText,
  PenTool,
  Image as ImageIcon,
  Video,
  Eye,
  Camera,
  Mic,
  Bot,
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';

export type ModuleType =
  | 'dashboard'
  | 'chat'
  | 'rag'
  | 'writing'
  | 'image-gen'
  | 'video-gen'
  | 'image-analysis'
  | 'live-camera'
  | 'voice-chat';

interface SidebarProps {
  activeModule: ModuleType;
  setActiveModule: (module: ModuleType) => void;
  openSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeModule, setActiveModule, openSettings }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Bot, badge: 'All-in-One' },
    { id: 'chat', label: 'AI Chat', icon: MessageSquare, badge: 'LLM' },
    { id: 'rag', label: 'Knowledge Base', icon: FileText, badge: 'RAG' },
    { id: 'writing', label: 'AI Writing', icon: PenTool, badge: 'Tools' },
    { id: 'image-gen', label: 'Image Generation', icon: ImageIcon, badge: 'Image AI' },
    { id: 'video-gen', label: 'Video Generation', icon: Video, badge: 'Video AI' },
    { id: 'image-analysis', label: 'Image Analysis', icon: Eye, badge: 'Vision' },
    { id: 'live-camera', label: 'Live Camera CV', icon: Camera, badge: 'MediaPipe' },
    { id: 'voice-chat', label: 'Live Voice Chat', icon: Mic, badge: 'STT/TTS' },
  ];

  return (
    <aside className="w-64 h-screen glass-panel border-r border-slate-800 flex flex-col justify-between p-4 fixed left-0 top-0 z-30">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-slate-800/80">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 animate-pulse-glow">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none gradient-text tracking-wide">MultiHubAI</h1>
            <span className="text-[11px] text-slate-400 font-medium tracking-wider uppercase">Assistant Suite</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id as ModuleType)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Settings */}
      <div className="pt-4 border-t border-slate-800/80">
        <button
          onClick={openSettings}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-cyan-400 hover:bg-slate-800/60 border border-slate-800 transition-all"
        >
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Settings & API Key</span>
          </div>
        </button>
      </div>
    </aside>
  );
};
