import React, { useState } from 'react';
import { Eye, Upload, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { api } from '../../services/api';

export const ImageAnalysisPage: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('Analyze this image in full detail. Detect any hands (open/closed), eyes (open/closed), mouth (open/closed), facial expressions, people, and objects.');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setAnalysisResult(null);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage || analyzing) return;

    const formData = new FormData();
    formData.append('file', selectedImage);
    formData.append('prompt', prompt);

    setAnalyzing(true);
    setAnalysisResult(null);

    try {
      const res = await api.analyzeImage(formData);
      setAnalysisResult(res.data.analysis);
    } catch (err: any) {
      setAnalysisResult(`Error analyzing image: ${err.response?.data?.detail || err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload & Controls */}
        <div className="glass-panel rounded-2xl border border-slate-800 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-slate-100 text-base">Multimodal Image Understanding</h3>
            </div>

            {/* Image Dropzone */}
            <label className="block border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-2xl p-6 text-center cursor-pointer transition bg-slate-900/40 mb-4 relative overflow-hidden group">
              {imagePreview ? (
                <div className="relative h-64 w-full flex items-center justify-center bg-black/40 rounded-xl overflow-hidden">
                  <img src={imagePreview} alt="Selected Preview" className="max-h-full max-w-full object-contain" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-xs font-semibold text-white">
                    Click to Change Image
                  </div>
                </div>
              ) : (
                <div className="py-8">
                  <Upload className="w-10 h-10 text-cyan-400 mx-auto mb-2" />
                  <span className="text-xs font-semibold text-slate-300 block">Click to Upload Image for Computer Vision</span>
                  <span className="text-[11px] text-slate-500 block mt-1">Supports PNG, JPG, WEBP</span>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Analysis Prompt / Question</label>
              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full p-3.5 rounded-xl glass-input text-xs resize-none"
              />
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={analyzing || !selectedImage}
            className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 hover:opacity-90 disabled:opacity-40 transition flex items-center justify-center gap-2"
          >
            {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{analyzing ? 'Analyzing Image...' : 'Analyze Image with AI'}</span>
          </button>
        </div>

        {/* Results Panel */}
        <div className="glass-panel rounded-2xl border border-slate-800 p-6 flex flex-col justify-between min-h-[400px]">
          <div>
            <div className="border-b border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-slate-100 text-base">Computer Vision & AI Report</h3>
            </div>

            {analysisResult ? (
              <div className="prose prose-invert prose-sm max-w-none overflow-y-auto max-h-[450px] pr-2">
                <ReactMarkdown>{analysisResult}</ReactMarkdown>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500 text-xs">
                <Eye className="w-10 h-10 mb-2 opacity-40" />
                <span>Upload an image and click analyze to see computer vision report</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
