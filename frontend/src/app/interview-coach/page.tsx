'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { interviewAPI } from '@/lib/api';
import { InterviewQuestion } from '@/types';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Sparkles, 
  MessageSquare, 
  Zap, 
  ChevronRight, 
  ArrowRight, 
  User, 
  Bot, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mic
} from 'lucide-react';

export default function InterviewCoach() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('general');

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin?redirect=/interview-coach')
    }
  }, [isAuthenticated, router])

  const categories = [
    { value: 'general', label: 'General', icon: MessageSquare },
    { value: 'technical', label: 'Technical', icon: Zap },
    { value: 'behavioral', label: 'Behavioral', icon: User },
    { value: 'leadership', label: 'Leadership', icon: Sparkles },
  ];

  useEffect(() => {
    if (category) {
      loadQuestions();
    }
  }, [category]);

  const [sessionId, setSessionId] = useState<string | null>(null);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      // Use category as jobRole for now
      const response = await interviewAPI.startSession({ 
        jobRole: category,
        questionCount: 5 
      });
      const data = response.data.data?.questions || response.data.data || [];
      const sessId = response.data.data?.sessionId;
      
      setQuestions(data);
      setSessionId(sessId);
      setCurrentQuestion(data[0] || null);
      setFeedback(null);
      setUserAnswer('');
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentQuestion || !userAnswer.trim() || !sessionId) return;

    setLoading(true);
    try {
      const currentIndex = questions.findIndex(q => (q._id || q.id) === (currentQuestion?._id || currentQuestion?.id));
      
      const response = await interviewAPI.submitAnswer({
        sessionId: sessionId,
        questionIndex: currentIndex,
        answer: userAnswer,
        question: currentQuestion.question
      });
      
      const feedbackData = response.data.data?.feedback;
      setFeedback(feedbackData);
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    const currentIndex = questions.findIndex(q => q.question === currentQuestion?.question);
    const nextIndex = (currentIndex + 1) % questions.length;
    setCurrentQuestion(questions[nextIndex]);
    setUserAnswer('');
    setFeedback(null);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex items-center space-x-2 mb-2">
          <Bot className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-primary uppercase tracking-widest">AI Simulation</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
          Interview <span className="text-gradient">Coach</span>
        </h1>
        <p className="text-gray-400 text-base sm:text-lg max-w-2xl">
          Sharpen your skills with personalized interview simulations. Get instant AI feedback and master the art of the interview.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Category Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider px-2">Focus Areas</h2>
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 scrollbar-hide">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <motion.button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center space-x-3 min-w-[140px] lg:w-full p-3 sm:p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden shrink-0 ${
                    category === cat.value 
                      ? 'bg-primary/20 border-primary text-white shadow-lg shadow-primary/10' 
                      : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/10'
                  }`}
                >
                  {category === cat.value && (
                    <motion.div
                      layoutId="activeCategory"
                      className="absolute inset-0 bg-gradient-to-r from-primary/20 to-cyan-500/10"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  <Icon className={`h-4 w-4 sm:h-5 sm:w-5 relative z-10 ${category === cat.value ? 'text-primary' : ''} transition-transform ${category === cat.value ? 'scale-110' : ''}`} />
                  <span className="font-semibold text-sm sm:text-base relative z-10">{cat.label}</span>
                </motion.button>
              );
            })}
          </div>

          <Card className="glass-card mt-8 border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-primary uppercase">Pro Tip</span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                Be specific in your technical answers. Mention frameworks and libraries you've used to solve problems.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Interface */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3"
        >
          <Card className="glass-card border-white/10 overflow-hidden min-h-[600px] flex flex-col">
            <CardHeader className="border-b border-white/5 bg-white/[0.02] p-4 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Mic className="h-5 w-5 text-green-400" />
                  </div>
                  <span className="text-xs font-bold text-green-400 uppercase">Session Active</span>
                </div>
                {questions.length > 0 && (
                  <Badge variant="outline" className="border-white/10 text-gray-400">
                    Question {questions.findIndex(q => (q._id || q.id) === (currentQuestion?._id || currentQuestion?.id)) + 1} of {questions.length}
                  </Badge>
                )}
              </div>
              
              <AnimatePresence mode="wait">
                {currentQuestion ? (
                  <motion.div
                    key={currentQuestion._id || currentQuestion.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <h2 className="text-2xl font-bold text-white leading-tight">
                      {currentQuestion.question}
                    </h2>
                  </motion.div>
                ) : (
                  <div className="h-8 w-3/4 bg-white/5 animate-pulse rounded" />
                )}
              </AnimatePresence>
            </CardHeader>

            <CardContent className="p-4 sm:p-8 flex-1 flex flex-col space-y-8">
              {currentQuestion ? (
                <>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                       <label className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Your Response
                      </label>
                      <span className="text-xs text-gray-600">Minimum 50 words recommended</span>
                    </div>
                    <textarea
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Start typing your answer..."
                      className="w-full h-48 p-6 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-600 focus:ring-2 focus:ring-primary focus:border-primary/50 focus:bg-white/10 transition-all overflow-y-auto resize-none"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={loading || !userAnswer.trim()}
                      className="flex-1 h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold ai-glow shadow-lg shadow-primary/20 transition-all text-lg group"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Analyzing Response...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                          Get Expert Feedback
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleNextQuestion}
                      className="flex-1 h-14 rounded-2xl border-white/10 hover:bg-white/5 text-white font-semibold text-lg flex items-center justify-center space-x-2 group"
                    >
                      <span>Skip Question</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>

                  <AnimatePresence>
                    {feedback && (
                      <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="p-8 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-3xl relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-6 opacity-10">
                          <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                          >
                            <CheckCircle2 className="h-24 w-24 text-blue-400" />
                          </motion.div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent" />
                        <div className="flex items-center space-x-3 mb-4 relative z-10">
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Bot className="h-6 w-6 text-blue-400" />
                          </motion.div>
                          <h3 className="text-xl font-bold text-white">AI Coach Insights</h3>
                        </div>
                        <div className="prose prose-invert max-w-none relative z-10">
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-blue-100/80 text-lg leading-relaxed italic"
                          >
                            "{feedback}"
                          </motion.p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 py-12 text-center">
                  <div className="p-6 bg-white/5 rounded-full mb-6">
                    <Clock className="h-12 w-12 text-gray-600 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Preparing your interview...</h3>
                  <p className="text-gray-500 max-w-sm">
                    {loading ? 'Decrypting specialized question bank...' : 'Select a category to begin your simulated interview session.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

