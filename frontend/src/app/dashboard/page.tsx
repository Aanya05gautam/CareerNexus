'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  FileText, 
  MessageSquare, 
  Briefcase, 
  TrendingUp, 
  Award, 
  Clock, 
  Plus, 
  ArrowUpRight,
  Sparkles,
  Zap as ZapIcon,
  Search,
  Zap,
  ArrowRight
} from 'lucide-react'
import { dashboardAPI } from '@/lib/api'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
}

export default function Dashboard() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [stats, setStats] = useState({
    resumesCreated: 0,
    interviewsPracticed: 0,
    jobsApplied: 0,
    profileCompleteness: 0
  })
  const [chartData, setChartData] = useState<any[]>([])
  const [skillStats, setSkillStats] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin?redirect=/dashboard')
    } else {
      fetchDashboardData()
    }
  }, [isAuthenticated, router])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const response = await dashboardAPI.getStats()
      if (response.data.success) {
        setStats(response.data.data.stats)
        setRecentActivity(response.data.data.recentActivity)
        setChartData(response.data.data.chartData || [])
        setSkillStats(response.data.data.skillStats || [])
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="container mx-auto px-4 py-12"
    >
      <motion.div variants={itemVariants} className="mb-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-gradient-to-br from-white/[0.03] to-white/[0.01] p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -mr-32 -mt-32" />
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm font-bold text-primary uppercase tracking-[0.3em]">Command Center</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white mb-3 tracking-tighter">
            Control your <span className="text-gradient">Career Destiny</span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-xl font-medium leading-relaxed">
            Welcome back, <span className="text-white font-bold">{user?.name}</span>. Your AI assistant has analyzed 12 new job market shifts since your last visit.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 relative z-10 w-full sm:w-auto">
          <Link href="/resume-builder" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-8 py-6 sm:py-7 rounded-2xl shadow-2xl shadow-primary/20 ai-glow text-base sm:text-lg font-black group overflow-hidden">
              <span className="relative z-10 flex items-center justify-center">
                <Plus className="mr-2 h-5 w-5 sm:h-6 sm:w-6 group-hover:rotate-90 transition-transform" />
                CREATE RESUME
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </Button>
          </Link>
          <Link href="/interview-coach" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/10 hover:border-primary/50 text-white px-8 py-6 sm:py-7 rounded-2xl bg-white/5 hover:bg-white/10 transition-all text-base sm:text-lg font-black group">
              <Zap className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-primary group-hover:scale-125 transition-transform" />
              TRAIN AI
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-12 gap-8 mb-12">
        {/* Left Column: Stats & Charts */}
        <div className="lg:col-span-8 space-y-8">
          {/* Quick Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Analyses', value: stats.resumesCreated, icon: FileText, color: 'text-blue-400' },
              { label: 'Sessions', value: stats.resumesCreated > 0 ? (stats.resumesCreated * 4.2).toFixed(1) : 0, icon: MessageSquare, color: 'text-purple-400' },
              { label: 'Matches', value: (stats.resumesCreated * 12), icon: Briefcase, color: 'text-cyan-400' },
              { label: 'Ready', value: `${stats.profileCompleteness}%`, icon: Award, color: 'text-indigo-400' },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-white/[0.03] border border-white/5 p-6 rounded-2xl hover:border-white/10 transition-all group"
              >
                <div className={`${stat.color} mb-3 group-hover:scale-110 transition-transform`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div className="text-2xl font-black text-white">{stat.value}</div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Activity Trend Chart */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white/[0.03] border-white/5 rounded-3xl overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-white font-black">Performance Analytics</CardTitle>
                    <CardDescription className="text-gray-500">Career growth and activity metrics</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className="bg-primary/20 text-primary border-none">Active Growth</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-[300px] mt-4 pl-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorResumes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorInterviews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="resumes" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorResumes)" />
                    <Area type="monotone" dataKey="interviews" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorInterviews)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column: Skills & Recent */}
        <div className="lg:col-span-4 space-y-8">
          {/* Skill Radar */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white/[0.03] border-white/5 rounded-3xl h-full">
              <CardHeader>
                <CardTitle className="text-lg text-white font-black flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                  Expertise Index
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center -mt-4">
                <div className="w-full h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillStats}>
                      <PolarGrid stroke="#ffffff10" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 700 }} />
                      <Radar
                        name="Skills"
                        dataKey="A"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.5}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Activity Feed */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white/[0.03] border-white/5 rounded-3xl h-full">
              <CardHeader className="pb-0">
                <CardTitle className="text-lg text-white font-black flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-primary" />
                  Live Feed
                </CardTitle>
              </CardHeader>
              <CardContent className="mt-6">
                <div className="space-y-6">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, i) => (
                      <div key={i} className="flex gap-4 group">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${
                            activity.type === 'resume' ? 'bg-blue-500' : 'bg-purple-500'
                          } shadow-[0_0_10px_rgba(59,130,246,0.5)]`} />
                          <div className="w-0.5 h-full bg-white/[0.05] mt-2 group-last:hidden" />
                        </div>
                        <div className="flex-1 pb-6 group-last:pb-0">
                          <p className="text-sm font-bold text-white group-hover:text-primary transition-colors leading-none">
                            {activity.title}
                          </p>
                          <p className="text-xs font-semibold text-gray-500 mt-2 uppercase tracking-tighter">
                            {new Date(activity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(activity.time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-white/10">
                        <Search className="h-6 w-6 text-gray-600" />
                      </div>
                      <p className="text-sm font-bold text-gray-500">NO RECENT INTEL</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Recommended Jobs Snippet */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-black text-white tracking-tight">Market <span className="text-gradient">Opportunities</span></h3>
          <Link href="/job-matching">
            <Button variant="ghost" className="text-primary font-bold hover:bg-primary/10">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { company: 'Google', role: 'Senior UX Engineer', match: 98, location: 'Mountain View' },
            { company: 'Meta', role: 'Product Manager', match: 92, location: 'Remote' },
            { company: 'Stripe', role: 'Full Stack Developer', match: 89, location: 'San Francisco' },
          ].map((job, i) => (
            <motion.div 
              key={i}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-white/[0.03] border border-white/5 p-6 rounded-2xl relative overflow-hidden group cursor-pointer"
            >
              <div className="absolute top-0 right-0 p-4">
                <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center font-black text-xs text-primary border border-primary/20">
                  {job.match}%
                </div>
              </div>
              <h4 className="font-black text-white text-lg mb-1 group-hover:text-primary transition-colors">{job.role}</h4>
              <p className="text-sm font-bold text-gray-400 mb-4">{job.company} • {job.location}</p>
              <div className="flex gap-2">
                <Badge className="bg-white/5 text-gray-400 border-none font-bold text-[10px]">AI MATCHED</Badge>
                <Badge className="bg-primary/10 text-primary border-none font-bold text-[10px]">URGENT</Badge>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}


