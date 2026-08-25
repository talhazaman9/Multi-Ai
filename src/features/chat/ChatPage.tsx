import React, { useState, useEffect, useRef } from 'react';
import { Send, Plus, Trash2, MessageSquare, Bot, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { api } from '../../services/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

export const ChatPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const loadConversations = async () => {
    try {
      const res = await api.getConversations();
      setConversations(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadConversationMessages = async (id: string) => {
    setActiveConvId(id);
    try {
      const res = await api.getConversation(id);
      setMessages(res.data.messages || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleNewChat = () => {
    setActiveConvId(null);
    setMessages([]);
  };

  const handleDeleteConv = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await api.deleteConversation(id);
      if (activeConvId === id) handleNewChat();
      loadConversations();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    // Optimistic user message
    const tempUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await api.sendChatMessage(userMessage, activeConvId || undefined);
      const { conversation_id, reply } = res.data;

      if (!activeConvId) {
        setActiveConvId(conversation_id);
        loadConversations();
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${err.response?.data?.detail || err.message || 'Failed to get response.'}`,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex gap-6 max-w-7xl mx-auto">
      {/* Sidebar - History */}
      <div className="w-72 glass-panel rounded-2xl border border-slate-800 flex flex-col p-4">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold text-sm shadow-md shadow-cyan-500/20 hover:opacity-90 transition mb-4"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>

        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
          Chat History
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {conversations.length === 0 ? (
            <div className="text-xs text-slate-500 px-2 py-4 text-center">No previous conversations</div>
          ) : (
            conversations.map((c) => (
              <div
                key={c.id}
                onClick={() => loadConversationMessages(c.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium cursor-pointer transition ${
                  activeConvId === c.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{c.title || 'Conversation'}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteConv(e, c.id)}
                  className="text-slate-500 hover:text-rose-400 p-1 transition"
                  title="Delete chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 glass-panel rounded-2xl border border-slate-800 flex flex-col justify-between overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 animate-pulse">
                <Bot className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-200 mb-1">MultiHubAI Chat Assistant</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Ask anything for multi-turn intelligent text conversations.
              </p>
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-4 max-w-3xl ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    m.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  }`}
                >
                  {m.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>

                <div
                  className={`rounded-2xl p-4 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-purple-600 text-white rounded-tr-none'
                      : 'bg-slate-800/80 border border-slate-700 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex gap-4 max-w-3xl">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div className="rounded-2xl p-4 bg-slate-800/80 border border-slate-700 text-slate-300 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span className="text-xs font-medium">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 rounded-xl glass-input text-sm"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/20 hover:opacity-90 disabled:opacity-40 transition shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
