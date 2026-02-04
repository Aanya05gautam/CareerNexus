import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://careernexus-backend-5u5m.onrender.com',
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (email: string, password: string) => 
    api.post('/api/auth/login', { email, password }),  // ✅ added /api
  register: (name: string, email: string, password: string) => 
    api.post('/api/auth/register', { name, email, password }), // ✅ added /api
  getProfile: () => api.get('/api/auth/profile'), // ✅ added /api
  updateProfile: (data: any) => api.put('/api/auth/profile', data), // ✅ added /api
};

export const resumeAPI = {
  create: (data: { title?: string, content: string }) => api.post('/api/resumes', data), // ✅ added /api
  upload: (formData: FormData) => api.post('/api/resumes/upload', formData, { // ✅ added /api
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  analyze: (id: string) => api.post(`/api/resumes/${id}/analyze`), // ✅ added /api
  getById: (id: string) => api.get(`/api/resumes/${id}`), // ✅ added /api
  getAll: () => api.get('/api/resumes'), // ✅ added /api
};

export const interviewAPI = {
  generateQuestions: (data: { jobRole: string, experienceLevel?: string, questionCount?: number }) => 
    api.post('/api/interview/generate-questions', data), // ✅ added /api
  getFeedback: (data: { question: string, answer: string, jobRole?: string }) => 
    api.post('/api/interview/feedback', data), // ✅ added /api
  startSession: (data: { jobRole: string, experienceLevel?: string, questionCount?: number }) => 
    api.post('/api/interview/practice-session', data), // ✅ added /api
  submitAnswer: (data: { sessionId: string, questionIndex: number, answer: string, question: string }) => 
    api.post('/api/interview/submit-answer', data), // ✅ added /api
};

export const jobAPI = {
  match: (resumeId: string) => api.post(`/api/jobs/match/${resumeId}`), // ✅ added /api
  getAll: () => api.get('/api/jobs'), // ✅ added /api
  search: (params: any) => api.get('/api/jobs/search', { params }), // ✅ added /api
};

export const dashboardAPI = {
  getStats: () => api.get('/api/dashboard/stats'), // ✅ added /api
};

export default api;
