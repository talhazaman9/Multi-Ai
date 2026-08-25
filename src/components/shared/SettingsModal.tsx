import React, { useState } from 'react';
import { X, Key, Check, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  currentMaskedKey?: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  currentMaskedKey,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setSaving(true);
    setMsg(null);
    try {
      await api.updateSettings(apiKey.trim());
      setMsg({ text: 'API Key saved successfully!', error: false });
      setApiKey('');
      onSaved();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setMsg({ text: err.response?.data?.detail || 'Failed to update API Key.', error: true });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md glass-panel rounded-2xl border border-slate-700/80 p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">API Key Configuration</h3>
            <p className="text-xs text-slate-400">Enter your Google Gemini API Key</p>
          </div>
        </div>

        {currentMaskedKey && (
          <div className="mb-4 px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-400">Status:</span>
            <span className="font-mono text-cyan-400 font-semibold">{currentMaskedKey}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Gemini API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Obtain your API key for free at Google AI Studio.
            </p>
          </div>

          {msg && (
            <div
              className={`px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 ${
                msg.error
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {msg.error ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
              <span>{msg.text}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !apiKey.trim()}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/25 hover:opacity-90 disabled:opacity-50 transition"
            >
              {saving ? 'Saving...' : 'Save API Key'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
