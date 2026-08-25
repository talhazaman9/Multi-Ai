import React, { useState, useEffect, useRef } from 'react';
import { Mic, Volume2, VolumeX } from 'lucide-react';
import { api } from '../../services/api';

interface VoiceMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

export const VoiceChatPage: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [status, setStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Web Speech API SpeechRecognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setStatus('listening');
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let current = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          current += event.results[i][0].transcript;
        }
        setTranscript(current);

        // If final result
        if (event.results[0].isFinal) {
          handleUserSpeech(current);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setStatus('idle');
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported by your browser (Google Chrome or Edge recommended).');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setStatus('idle');
    } else {
      setTranscript('');
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleUserSpeech = async (spokenText: string) => {
    if (!spokenText.trim()) return;

    const userMsg: VoiceMessage = { id: Date.now().toString(), role: 'user', text: spokenText };
    setMessages((prev) => [...prev, userMsg]);
    setStatus('thinking');

    try {
      const res = await api.sendChatMessage(spokenText, undefined, 'You are MultiHubAI Voice Assistant. Keep responses concise, natural, and friendly (1-3 sentences max) for spoken response.');
      const aiReply = res.data.reply;

      const aiMsg: VoiceMessage = { id: (Date.now() + 1).toString(), role: 'assistant', text: aiReply };
      setMessages((prev) => [...prev, aiMsg]);

      // Speak response
      if (!isMuted) {
        speakResponse(aiReply);
      } else {
        setStatus('idle');
      }
    } catch (e) {
      console.error(e);
      setStatus('idle');
    }
  };

  const speakResponse = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setStatus('speaking');
    utterance.onend = () => setStatus('idle');
    utterance.onerror = () => setStatus('idle');

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Central Visualizer Interface */}
      <div className="glass-panel rounded-3xl border border-slate-800 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
        {/* Animated Glow Rings */}
        <div
          className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 border ${
            status === 'listening'
              ? 'bg-rose-500/20 border-rose-500/50 shadow-[0_0_60px_rgba(244,63,94,0.4)] scale-110'
              : status === 'thinking'
              ? 'bg-cyan-500/20 border-cyan-500/50 shadow-[0_0_60px_rgba(0,243,255,0.4)] animate-pulse'
              : status === 'speaking'
              ? 'bg-purple-500/20 border-purple-500/50 shadow-[0_0_60px_rgba(157,78,221,0.4)] scale-105'
              : 'bg-slate-900 border-slate-800'
          }`}
        >
          <button
            onClick={toggleMic}
            className={`w-32 h-32 rounded-full flex items-center justify-center text-white shadow-2xl transition transform hover:scale-105 ${
              status === 'listening'
                ? 'bg-gradient-to-r from-rose-500 to-red-600'
                : 'bg-gradient-to-r from-cyan-500 to-purple-600'
            }`}
          >
            {isListening ? <Mic className="w-12 h-12 animate-pulse" /> : <Mic className="w-12 h-12" />}
          </button>
        </div>

        {/* Dynamic Status Text */}
        <div className="mt-6">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 block mb-1">
            {status === 'listening' && 'Listening... Speak now'}
            {status === 'thinking' && 'AI Thinking & Processing...'}
            {status === 'speaking' && 'AI Speaking...'}
            {status === 'idle' && 'Click Microphone to Start Voice Chat'}
          </span>

          {transcript && (
            <p className="text-sm font-medium text-slate-300 italic max-w-md mx-auto mt-2">
              "{transcript}"
            </p>
          )}
        </div>

        {/* Audio Controls */}
        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3 rounded-full border text-xs font-semibold flex items-center gap-2 transition ${
              isMuted
                ? 'bg-slate-800 text-rose-400 border-rose-500/30'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isMuted ? 'Muted' : 'Audio On'}</span>
          </button>
        </div>
      </div>

      {/* Voice Conversation History Transcript */}
      <div className="glass-panel rounded-2xl border border-slate-800 p-6">
        <h4 className="font-bold text-slate-200 text-sm mb-4 border-b border-slate-800 pb-3">
          Voice Transcript History
        </h4>

        <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
          {messages.length === 0 ? (
            <div className="text-xs text-slate-500 text-center py-6">
              Start speaking to see real-time voice transcripts
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 text-xs ${m.role === 'user' ? 'justify-end' : ''}`}
              >
                <div
                  className={`p-3 rounded-xl max-w-md ${
                    m.role === 'user'
                      ? 'bg-purple-600 text-white rounded-tr-none'
                      : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                  }`}
                >
                  <span className="font-bold block text-[10px] opacity-75 mb-0.5">
                    {m.role === 'user' ? 'You' : 'MultiHubAI'}
                  </span>
                  <span>{m.text}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
