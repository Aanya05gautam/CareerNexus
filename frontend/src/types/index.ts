export interface User {
  id: string
  name: string
  email: string
  createdAt: Date
}

export interface Resume {
  id: string
  userId: string
  title: string
  content: string
  analysis?: ResumeAnalysis
  _id?: string
  createdAt: Date
  updatedAt: Date
}

export interface ResumeAnalysis {
  score: number
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
  keywords: string[]
}

export interface Job {
  id: string
  title: string
  company: string
  location: string
  description: string
  requirements: string[]
  salary?: string
  type: 'full-time' | 'part-time' | 'contract' | 'freelance'
  postedDate: Date
}

export interface InterviewSession {
  id: string
  userId: string
  jobRole: string
  questions: InterviewQuestion[]
  currentQuestionIndex: number
  status: 'active' | 'completed'
  createdAt: Date
}

export interface InterviewQuestion {
  id: string
  _id?: string
  question: string
  answer?: string
  feedback?: string
  score?: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}
