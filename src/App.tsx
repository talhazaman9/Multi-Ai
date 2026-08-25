import { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import type { ModuleType } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { SettingsModal } from './components/shared/SettingsModal';
import { api } from './services/api';

// Module Feature Pages
import { DashboardPage } from './features/dashboard/DashboardPage';
import { ChatPage } from './features/chat/ChatPage';
import { RAGPage } from './features/rag/RAGPage';
import { WritingPage } from './features/writing/WritingPage';
import { ImageGenPage } from './features/image-gen/ImageGenPage';
import { VideoGenPage } from './features/video-gen/VideoGenPage';
import { ImageAnalysisPage } from './features/image-analysis/ImageAnalysisPage';
import { LiveCameraPage } from './features/live-camera/LiveCameraPage';
import { VoiceChatPage } from './features/voice-chat/VoiceChatPage';

export function App() {
  const [activeModule, setActiveModule] = useState<ModuleType>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [maskedKey, setMaskedKey] = useState<string | undefined>(undefined);

  useEffect(() => {
    checkSettings();
  }, []);

  const checkSettings = async () => {
    try {
      const res = await api.getSettings();
      setHasApiKey(res.data.has_api_key);
      setMaskedKey(res.data.masked_key);
    } catch (e) {
      console.error('Failed to fetch settings:', e);
    }
  };

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardPage setActiveModule={setActiveModule} />;
      case 'chat':
        return <ChatPage />;
      case 'rag':
        return <RAGPage />;
      case 'writing':
        return <WritingPage />;
      case 'image-gen':
        return <ImageGenPage />;
      case 'video-gen':
        return <VideoGenPage />;
      case 'image-analysis':
        return <ImageAnalysisPage />;
      case 'live-camera':
        return <LiveCameraPage />;
      case 'voice-chat':
        return <VoiceChatPage />;
      default:
        return <DashboardPage setActiveModule={setActiveModule} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex">
      {/* Sidebar */}
      <Sidebar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        openSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-w-0">
        <Header
          activeModule={activeModule}
          hasApiKey={hasApiKey}
          openSettings={() => setIsSettingsOpen(true)}
        />

        <main className="p-8 flex-1 overflow-x-hidden">
          {renderModule()}
        </main>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaved={checkSettings}
        currentMaskedKey={maskedKey}
      />
    </div>
  );
}

export default App;
