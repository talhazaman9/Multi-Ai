import React, { useState, useEffect } from 'react';
import { Upload, FileText, Trash2, Send, Database, CheckCircle, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { api } from '../../services/api';

interface DocItem {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  chunks_count: number;
  uploaded_at: string;
}

interface RAGMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ source: string; snippet: string }>;
}

export const RAGPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [messages, setMessages] = useState<RAGMessage[]>([]);
  const [question, setQuestion] = useState('');
  const [querying, setQuerying] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    try {
      const res = await api.getDocuments();
      setDocuments(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));

    setUploading(true);
    setUploadStatus(null);
    try {
      await api.uploadDocuments(formData);
      setUploadStatus('Document(s) successfully processed & indexed into FAISS Vector Store!');
      loadDocs();
    } catch (err: any) {
      setUploadStatus(`Upload error: ${err.response?.data?.detail || err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDoc = async (id: string) => {
    try {
      await api.deleteDocument(id);
      loadDocs();
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || querying) return;

    const q = question.trim();
    setQuestion('');

    const userMsg: RAGMessage = { id: Date.now().toString(), role: 'user', content: q };
    setMessages((prev) => [...prev, userMsg]);
    setQuerying(true);

    try {
      const res = await api.queryRAG(q);
      const { answer, sources } = res.data;

      const aiMsg: RAGMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: answer,
        sources: sources,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const aiMsg: RAGMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error querying documents: ${err.response?.data?.detail || err.message}`,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setQuerying(false);
    }
  };

  return (
    <div className="h-[calc(100vh-7rem)] grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
      {/* Document Uploader & Index List */}
      <div className="lg:col-span-1 glass-panel rounded-2xl border border-slate-800 p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-slate-100 text-base">Knowledge Base Documents</h3>
          </div>

          {/* Upload Area */}
          <label className="block border-2 border-dashed border-slate-700 hover:border-purple-500/50 rounded-2xl p-6 text-center cursor-pointer transition bg-slate-900/40 mb-4">
            <Upload className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <span className="text-xs font-semibold text-slate-300 block">
              {uploading ? 'Processing Documents...' : 'Click to Upload PDF, DOCX, TXT, CSV, XLSX'}
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">Automatic Text & Tabular Data Chunking (Pandas Engine)</span>
            <input
              type="file"
              multiple
              accept=".pdf,.docx,.doc,.txt,.md,.csv,.tsv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>

          {uploadStatus && (
            <div className="mb-4 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{uploadStatus}</span>
            </div>
          )}

          {/* Document List */}
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Indexed Files ({documents.length})
          </div>

          <div className="space-y-2 overflow-y-auto max-h-60 pr-1">
            {documents.length === 0 ? (
              <div className="text-xs text-slate-500 text-center py-4">No documents uploaded yet</div>
            ) : (
              documents.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <div className="font-medium text-slate-200 truncate max-w-[150px]">{d.filename}</div>
                      <div className="text-[10px] text-slate-500">{d.chunks_count} vector chunks</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteDoc(d.id)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 leading-relaxed">
          💡 RAG answers strictly from your uploaded files. If an answer isn't found, it returns an explicit fallback.
        </div>
      </div>

      {/* RAG Query & Chat */}
      <div className="lg:col-span-2 glass-panel rounded-2xl border border-slate-800 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <Database className="w-12 h-12 text-purple-400 mb-3 animate-bounce" />
              <h3 className="text-base font-bold text-slate-200">Knowledge Base Query</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Ask questions about your uploaded documents. Answers are derived strictly from your vector index.
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
                    m.role === 'user' ? 'bg-purple-600 text-white' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  }`}
                >
                  {m.role === 'user' ? 'U' : 'AI'}
                </div>

                <div
                  className={`rounded-2xl p-4 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-purple-600 text-white rounded-tr-none'
                      : 'bg-slate-800/80 border border-slate-700 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <ReactMarkdown>{m.content}</ReactMarkdown>

                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-700/60 text-xs">
                      <span className="font-semibold text-cyan-400 block mb-1">Retrieved Sources:</span>
                      <div className="space-y-1">
                        {m.sources.map((s, idx) => (
                          <div key={idx} className="bg-slate-900/80 p-2 rounded-lg text-[11px] text-slate-300 border border-slate-800">
                            <span className="font-semibold text-purple-300">{s.source}</span>: "{s.snippet}..."
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {querying && (
            <div className="flex gap-3 items-center text-xs text-purple-300 bg-slate-800/60 p-3 rounded-xl max-w-xs">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Retrieving vectors & generating answer...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleQuery} className="p-4 border-t border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask anything about uploaded documents..."
              className="flex-1 px-4 py-3 rounded-xl glass-input text-sm"
              disabled={querying}
            />
            <button
              type="submit"
              disabled={querying || !question.trim()}
              className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/20 hover:opacity-90 disabled:opacity-40 transition shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
