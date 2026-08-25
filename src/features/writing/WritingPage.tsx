import React, { useState } from 'react';
import { PenTool, Copy, Check, Sparkles, FileText, BookOpen, Newspaper, RefreshCw, FileCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { api } from '../../services/api';

type WritingType = 'essay' | 'story' | 'article' | 'summary' | 'rewrite';

export const WritingPage: React.FC = () => {
  const [type, setType] = useState<WritingType>('essay');
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('medium');
  const [generating, setGenerating] = useState(false);
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const tools: Array<{ id: WritingType; label: string; icon: any; placeholder: string }> = [
    { id: 'essay', label: 'Essay Generator', icon: FileText, placeholder: 'Enter essay topic or thesis statement...' },
    { id: 'story', label: 'Story Generator', icon: BookOpen, placeholder: 'Enter story premise, characters, or plot line...' },
    { id: 'article', label: 'Article / Blog', icon: Newspaper, placeholder: 'Enter article topic or target keywords...' },
    { id: 'summary', label: 'Text Summarizer', icon: FileCheck, placeholder: 'Paste text to summarize into key points...' },
    { id: 'rewrite', label: 'Rewrite & Improve', icon: RefreshCw, placeholder: 'Paste text to rewrite, fix grammar, and enhance tone...' },
  ];

  const currentTool = tools.find((t) => t.id === type)!;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || generating) return;

    setGenerating(true);
    try {
      const res = await api.generateWriting(type, prompt, tone, length);
      setOutput(res.data.content);
    } catch (err: any) {
      setOutput(`Error generating text: ${err.response?.data?.detail || err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Tool Selector Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {tools.map((t) => {
          const Icon = t.icon;
          const isActive = type === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setType(t.id)}
              className={`p-3.5 rounded-2xl glass-card border flex items-center gap-3 transition text-left ${
                isActive
                  ? 'border-pink-500/50 bg-pink-500/10 text-pink-300 shadow-lg shadow-pink-500/10'
                  : 'border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                isActive ? 'bg-pink-500 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Generator Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls Form */}
        <div className="glass-panel rounded-2xl border border-slate-800 p-6 flex flex-col justify-between">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <PenTool className="w-5 h-5 text-pink-400" />
              <h3 className="font-bold text-slate-100 text-base">{currentTool.label} Configuration</h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Prompt / Text Input</label>
              <textarea
                rows={6}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={currentTool.placeholder}
                className="w-full p-4 rounded-xl glass-input text-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tone of Voice</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-input text-xs"
                >
                  <option value="professional">Professional</option>
                  <option value="creative">Creative & Expressive</option>
                  <option value="academic">Academic & Analytical</option>
                  <option value="casual">Casual & Friendly</option>
                  <option value="persuasive">Persuasive & Powerful</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Length</label>
                <select
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-input text-xs"
                >
                  <option value="short">Short (~200 words)</option>
                  <option value="medium">Medium (~500 words)</option>
                  <option value="long">Long (~1000+ words)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={generating || !prompt.trim()}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-pink-500/20 hover:opacity-90 disabled:opacity-40 transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{generating ? 'Crafting Content...' : `Generate ${currentTool.label}`}</span>
            </button>
          </form>
        </div>

        {/* Output Panel */}
        <div className="glass-panel rounded-2xl border border-slate-800 p-6 flex flex-col justify-between min-h-[400px]">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                <span>Generated Result</span>
              </h3>
              {output && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 hover:text-white transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              )}
            </div>

            {output ? (
              <div className="prose prose-invert prose-sm max-w-none overflow-y-auto max-h-[450px] pr-2">
                <ReactMarkdown>{output}</ReactMarkdown>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500 text-xs">
                <PenTool className="w-10 h-10 mb-2 opacity-40" />
                <span>Config prompt and click generate to see AI writing output</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
