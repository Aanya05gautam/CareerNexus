'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { resumeAPI } from '@/lib/api';
import { Resume, ResumeAnalysis } from '@/types';
import { 
  FileText, 
  Sparkles, 
  Zap as ZapIcon, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Loader2,
  Upload,
  FileCheck
} from 'lucide-react';

export default function ResumeBuilder() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('My Resume');
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin?redirect=/resume-builder');
    }
  }, [isAuthenticated, router]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    setUploading(true);
    setError('');
    
    try {
      const response = await resumeAPI.upload(formData);
      if (response.data.success) {
        setContent(response.data.data.content);
        setFileName(response.data.data.fileName);
        if (!title || title === 'My Resume') {
          setTitle(response.data.data.fileName.split('.')[0]);
        }
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      setError(error.response?.data?.message || 'Failed to upload/parse resume file');
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async () => {
    // Check authentication first
    if (!isAuthenticated) {
      setError('Please sign in to analyze your resume');
      router.push('/auth/signin?redirect=/resume-builder');
      return;
    }

    if (!content.trim()) {
      setError('Please enter resume content to analyze');
      return;
    }

    if (content.trim().length < 10) {
      setError('Resume content must be at least 10 characters long');
      return;
    }

    setLoading(true);
    setError('');
    setAnalysis(null);
    
    try {
      // Create resume first with title
      const createResponse = await resumeAPI.create({ 
        title: title.trim() || 'My Resume',
        content: content.trim()
      });
      
      const resumeData = createResponse.data?.data || createResponse.data;
      const resumeId = resumeData?._id || resumeData?.id;

      if (!resumeId) {
        throw new Error('Failed to create resume. Please try again.');
      }

      // Analyze the resume
      const analysisResponse = await resumeAPI.analyze(resumeId);
      const analysisData = analysisResponse.data?.data || analysisResponse.data;
      const analysisResult = analysisData?.analysis || analysisData;
      
      // Ensure the analysis has the expected structure
      if (analysisResult && typeof analysisResult === 'object') {
        setAnalysis({
          score: analysisResult.score || 0,
          strengths: analysisResult.strengths || [],
          weaknesses: analysisResult.improvements || analysisResult.weaknesses || [],
          suggestions: analysisResult.improvements || analysisResult.suggestions || analysisResult.weaknesses || [],
          keywords: analysisResult.keywords || []
        });
      } else {
        throw new Error('Invalid analysis response from server');
      }
    } catch (error: any) {
      console.error('Error analyzing resume:', error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        setError('Your session has expired. Please sign in again.');
        setTimeout(() => {
          router.push('/auth/signin?redirect=/resume-builder');
        }, 2000);
      } else if (error.response?.status === 400) {
        setError(error.response.data?.message || 'Invalid resume data. Please check your input.');
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('Failed to analyze resume. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading state if checking authentication
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <p className="text-gray-400">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex items-center space-x-2 mb-2">
          <ZapIcon className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-primary uppercase tracking-widest">AI Optimization</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
          Resume <span className="text-gradient">Analyzer</span>
        </h1>
        <p className="text-gray-400 text-base sm:text-lg max-w-2xl">
          Get instant, AI-powered feedback on your resume. Improve your ATS score and stand out to recruiters.
        </p>
        {user && (
          <p className="text-gray-500 text-sm mt-2">
            Analyzing as: <span className="text-primary">{user.name}</span>
          </p>
        )}
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Editor Area */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center">
                <FileText className="mr-2 h-5 w-5 text-blue-400" />
                Raw Content
              </CardTitle>
              <CardDescription className="text-gray-400">Paste your resume text below for analysis</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-300 mb-2 block">Resume Title (Optional)</label>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="My Resume"
                  className="bg-white/5 border-white/10 focus:border-primary/50 focus:bg-white/10 text-white"
                />
              </div>

              <div className="mb-6">
                <label className="text-sm font-medium text-gray-300 mb-2 block">Upload Resume (PDF/TXT)</label>
                <div className="relative group/upload">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    accept=".pdf,.txt"
                    className="hidden"
                    id="resume-upload"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="resume-upload"
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
                      uploading ? 'bg-white/5 border-primary/20 cursor-not-allowed' : 
                      fileName ? 'bg-primary/5 border-primary/50' : 'bg-white/5 border-white/10 hover:border-primary/50 hover:bg-white/10'
                    }`}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                        <span className="text-xs font-medium text-gray-400">Extracting content...</span>
                      </>
                    ) : fileName ? (
                      <>
                        <FileCheck className="h-8 w-8 text-green-400 mb-2" />
                        <span className="text-sm font-semibold text-green-400 truncate max-w-[200px]">{fileName}</span>
                        <span className="text-[10px] text-gray-500 mt-1 uppercase">Click to change</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-gray-500 group-hover/upload:text-primary transition-colors mb-2" />
                        <span className="text-sm font-semibold text-gray-400 group-hover/upload:text-white transition-colors">Drop file or click to upload</span>
                        <span className="text-[10px] text-gray-600 mt-1 uppercase">PDF, TXT up to 5MB</span>
                      </>
                    )}
                  </label>
                </div>
              </div>
              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setError('');
                }}
                placeholder="Experience: Senior Developer at TechCorp...
Education: BS Computer Science...
Skills: React, Node.js, AWS..."
                className="w-full h-[300px] sm:h-[400px] p-4 sm:p-6 bg-white/5 border border-white/10 rounded-xl text-gray-200 focus:ring-2 focus:ring-primary focus:border-primary/50 transition-all resize-none placeholder:text-gray-600 focus:bg-white/10"
              />
              <Button
                onClick={handleAnalyze}
                disabled={loading || !content.trim() || !isAuthenticated}
                className="mt-6 w-full py-5 sm:py-6 text-base sm:text-lg font-bold bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 ai-glow group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                    Start AI Analysis
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
              {!isAuthenticated && (
                <p className="mt-2 text-sm text-yellow-400 text-center">
                  Please sign in to use this feature
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Area */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card border-white/10 h-full">
            <CardHeader className="border-b border-white/5 pb-6">
              <CardTitle className="text-xl text-white flex items-center">
                <Sparkles className="mr-2 h-5 w-5 text-primary" />
                AI Insights
              </CardTitle>
              <CardDescription className="text-gray-400">Your resume optimization results</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-8">
              {analysis ? (
                <div className="space-y-8">
                  {/* Score */}
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="relative flex flex-col items-center justify-center p-8 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-3xl border border-white/5 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-cyan-500/10 opacity-50" />
                    <div className="absolute top-0 right-0 p-4">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      >
                        <TrendingUp className="h-6 w-6 text-primary opacity-50" />
                      </motion.div>
                    </div>
                    <span className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-widest relative z-10">ATS Match Score</span>
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      className={`text-7xl font-black tracking-tighter relative z-10 ${
                        analysis.score >= 80 ? 'text-green-400' :
                        analysis.score >= 60 ? 'text-yellow-400' : 'text-red-400'
                      }`}
                    >
                      {analysis.score}<span className="text-2xl text-gray-600">/100</span>
                    </motion.span>
                    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${
                      analysis.score >= 80 ? 'from-green-400 to-green-600' :
                      analysis.score >= 60 ? 'from-yellow-400 to-yellow-600' : 'from-red-400 to-red-600'
                    }`} style={{ width: `${analysis.score}%` }} />
                  </motion.div>

                  {/* Suggestions */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <Sparkles className="mr-2 h-5 w-5 text-primary" />
                      Smart Improvements
                    </h3>
                    <div className="space-y-3">
                      {analysis.suggestions.map((suggestion, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start p-4 bg-white/5 rounded-xl border border-white/5 hover:border-primary/30 hover:bg-white/10 transition-all group"
                        >
                          <motion.div
                            whileHover={{ scale: 1.2, rotate: 360 }}
                            transition={{ duration: 0.5 }}
                          >
                            <CheckCircle2 className="mr-3 h-5 w-5 text-primary shrink-0 mt-0.5" />
                          </motion.div>
                          <p className="text-gray-300 text-sm leading-relaxed group-hover:text-white transition-colors">{suggestion}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Keywords */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <ZapIcon className="mr-2 h-5 w-5 text-blue-400" />
                      Detected Keywords
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.keywords.map((keyword, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05, type: "spring" }}
                          whileHover={{ scale: 1.1 }}
                        >
                          <Badge
                            variant="secondary"
                            className="px-3 py-1.5 bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40 transition-all cursor-default"
                          >
                            {keyword}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="p-6 bg-white/5 rounded-full">
                    <FileText className="h-12 w-12 text-gray-600 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-white text-lg font-medium">Ready for Scan</p>
                    <p className="text-gray-500 text-sm max-w-[280px] mx-auto mt-2">
                      {loading ? 'Decrypting content and matching with market standards...' : 'Paste your resume in the editor to get a detailed AI analysis.'}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

