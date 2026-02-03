import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
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
    api.post('/auth/login', { email, password }),
  register: (name: string, email: string, password: string) => 
    api.post('/auth/register', { name, email, password }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
};

export const resumeAPI = {
  create: (data: { title?: string, content: string }) => api.post('/resumes', data),
  upload: (formData: FormData) => api.post('/resumes/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  analyze: (id: string) => api.post(`/resumes/${id}/analyze`),
  getById: (id: string) => api.get(`/resumes/${id}`),
  getAll: () => api.get('/resumes'),
};

export const interviewAPI = {
  generateQuestions: (data: { jobRole: string, experienceLevel?: string, questionCount?: number }) => 
    api.post('/interview/generate-questions', data),
  getFeedback: (data: { question: string, answer: string, jobRole?: string }) => 
    api.post('/interview/feedback', data),
  startSession: (data: { jobRole: string, experienceLevel?: string, questionCount?: number }) => 
    api.post('/interview/practice-session', data),
  submitAnswer: (data: { sessionId: string, questionIndex: number, answer: string, question: string }) => 
    api.post('/interview/submit-answer', data),
};

export const jobAPI = {
  match: (resumeId: string) => api.post(`/jobs/match/${resumeId}`),
  getAll: () => api.get('/jobs'),
  search: (params: any) => api.get('/jobs/search', { params }),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

export default api;
