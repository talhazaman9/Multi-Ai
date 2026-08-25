import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 120000, // 120 sec timeout for AI generation tasks
});

// Interceptor to handle network errors gracefully across the application
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK' || !error.response) {
      console.error('Network Connection Error:', error);
      return Promise.reject({
        response: {
          data: {
            detail: 'Unable to connect to MultiHubAI backend server. Please ensure backend is running on http://127.0.0.1:8000.',
          },
        },
        message: 'Network Error: Backend server is offline or unreachable.',
      });
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Settings
  getSettings: () => apiClient.get('/settings'),
  updateSettings: (gemini_api_key: string) => apiClient.post('/settings', { gemini_api_key }),

  // AI Chat
  sendChatMessage: (message: string, conversation_id?: string, system_prompt?: string) =>
    apiClient.post('/chat', { message, conversation_id, system_prompt }),
  getConversations: () => apiClient.get('/chat/conversations'),
  getConversation: (id: string) => apiClient.get(`/chat/conversations/${id}`),
  deleteConversation: (id: string) => apiClient.delete(`/chat/conversations/${id}`),

  // RAG / Knowledge Base
  uploadDocuments: (formData: FormData) =>
    apiClient.post('/rag/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getDocuments: () => apiClient.get('/rag/documents'),
  deleteDocument: (id: string) => apiClient.delete(`/rag/documents/${id}`),
  queryRAG: (question: string) => apiClient.post('/rag/query', { question }),

  // AI Writing
  generateWriting: (type: string, prompt: string, tone?: string, length?: string) =>
    apiClient.post('/writing/generate', { type, prompt, tone, length }),

  // Image Generation & Analysis
  generateImage: (prompt: string, aspect_ratio: string = '1:1') =>
    apiClient.post('/image/generate', { prompt, aspect_ratio }),
  analyzeImage: (formData: FormData) =>
    apiClient.post('/image-analysis/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Video Generation
  generateVideo: (prompt: string) => apiClient.post('/video/generate', { prompt }),
};
