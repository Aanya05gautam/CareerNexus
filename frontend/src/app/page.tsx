'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  MessageSquare, 
  Briefcase, 
  Sparkles, 
  Zap, 
  ChevronRight, 
  TrendingUp, 
  ShieldCheck,
  Star
} from 'lucide-react'

import { useAuth } from '@/contexts/AuthContext'

export default function Home() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-widest">Next-Gen Career Platform</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8 }}
              className="text-5xl sm:text-7xl md:text-8xl font-black text-white mb-8 leading-[1.1] tracking-tighter"
            >
              Master Your Career with <br />
              <span className="text-gradient">CareerNexus</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-lg sm:text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed px-4"
            >
              The all-in-one AI career powerhouse. Build resumes that beat ATS, crush every interview, and land your dream job.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button className="h-16 px-10 text-lg font-bold bg-primary hover:bg-primary/90 text-white rounded-2xl ai-glow shadow-2xl shadow-primary/40 group">
                    Go to Dashboard
                    <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/signup">
                    <Button className="h-16 px-10 text-lg font-bold bg-primary hover:bg-primary/90 text-white rounded-2xl ai-glow shadow-2xl shadow-primary/40 group">
                      Start Your Journey
                      <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="outline" className="h-16 px-10 text-lg font-bold border-white/10 text-white hover:bg-white/5 rounded-2xl backdrop-blur-md">
                      View Demo Dashboard
                    </Button>
                  </Link>
                </>
              )}
            </motion.div>
          </div>
        </div>

        {/* Floating Background Decorations */}
        <motion.div 
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 blur-[120px] rounded-full pointer-events-none"
        />
        <motion.div 
          animate={{ 
            y: [0, 20, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none"
        />
      </section>

      {/* Features Grid */}
      <section className="py-32 bg-black/[0.02] border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Built For Tomorrow's Talent</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">Our AI suite covers every step of your professional growth with surgical precision.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Resume Architect',
                desc: 'Generate high-impact resumes tailored to specific job descriptions with real-time ATS scoring.',
                icon: FileText,
                color: 'text-blue-400',
                bg: 'bg-blue-500/10',
                href: '/resume-builder'
              },
              {
                title: 'Interview Simulator',
                desc: 'Practice with realistic AI-driven interviewers. Get instant constructive feedback on every answer.',
                icon: MessageSquare,
                color: 'text-purple-400',
                bg: 'bg-purple-500/10',
                href: '/interview-coach'
              },
              {
                title: 'Job Matcher',
                desc: 'Let our algorithms find the perfect roles for you across top companies based on your unique skills.',
                icon: Briefcase,
                color: 'text-cyan-400',
                bg: 'bg-cyan-500/10',
                href: '/job-matching'
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <Card className="glass-card h-full border-white/10 group">
                  <CardContent className="p-10">
                    <div className={`p-4 rounded-2xl ${feature.bg} w-fit mb-8 group-hover:scale-110 transition-transform`}>
                      <feature.icon className={`h-8 w-8 ${feature.color}`} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed mb-8">{feature.desc}</p>
                    <Link href={feature.href} className="flex items-center text-primary font-bold group">
                      Explore Feature
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats/Proof Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'AI Responses', value: '1.2M+', icon: Zap },
              { label: 'Job Success Rate', value: '94%', icon: TrendingUp },
              { label: 'ATS Approval', value: '99%', icon: ShieldCheck },
              { label: 'User Rating', value: '4.9/5', icon: Star },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="text-center p-8 rounded-3xl bg-white/[0.02] border border-white/5"
              >
                <stat.icon className="h-6 w-6 text-primary mx-auto mb-4 opacity-50" />
                <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                <div className="text-sm font-medium text-gray-500 uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto rounded-[3rem] bg-gradient-to-br from-primary/20 via-blue-500/10 to-transparent p-12 md:p-24 border border-white/10 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <Sparkles className="h-64 w-64 text-white" />
            </div>
            
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-8">Ready to evolve?</h2>
            <p className="text-lg sm:text-xl text-gray-400 mb-12 max-w-xl mx-auto">Join thousands of professionals using CareerNexus to skyrocket their career trajectory.</p>
            
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button className="h-16 px-12 text-xl font-bold bg-white text-black hover:bg-gray-100 rounded-2xl shadow-2xl transition-all">
                  Back to Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/auth/signup">
                <Button className="h-16 px-12 text-xl font-bold bg-white text-black hover:bg-gray-100 rounded-2xl shadow-2xl transition-all">
                  Create Free Account
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

function ArrowRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}
