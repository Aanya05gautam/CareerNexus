'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { 
  Search, 
  MapPin, 
  Clock, 
  DollarSign, 
  Briefcase, 
  Sparkles, 
  ArrowUpRight,
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react'

// Job interface is now inferred from API or kept for reference
interface Job {
  _id?: string
  id?: string
  title: string
  company: string
  location: string
  salary?: string
  jobType?: string
  matchPercentage?: number
  description: string
  requirements?: string[]
  postedDate?: string
  createdAt?: string
}

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

import { jobAPI, resumeAPI } from '@/lib/api'

export default function JobMatching() {
  const [jobs, setJobs] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [matching, setMatching] = useState(false)

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const response = await jobAPI.getAll()
      setJobs(response.data.data || [])
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    setLoading(true)
    try {
      const response = await jobAPI.search({
        q: searchTerm,
        location: locationFilter
      })
      setJobs(response.data.data || [])
    } catch (error) {
      console.error('Error searching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMatchWithResume = async () => {
    // This would typically involve selecting a resume first
    // For now, we'll try to find the latest resume or show a message
    setMatching(true)
    try {
      const resumesRes = await resumeAPI.getAll()
      const resumes = resumesRes.data.data || []
      
      if (resumes.length === 0) {
        alert('Please create a resume first in the Resume Builder')
        return
      }

      const latestResumeId = resumes[0]._id || resumes[0].id
      const matchRes = await jobAPI.match(latestResumeId)
      
      // The match API returns { job, matchScore }
      const matchedJobs = (matchRes.data.data || []).map((m: any) => ({
        ...m.job,
        matchPercentage: m.matchScore
      }))
      
      setJobs(matchedJobs)
    } catch (error) {
      console.error('Error matching with resume:', error)
    } finally {
      setMatching(false)
    }
  }

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesLocation = !locationFilter || job.location.toLowerCase().includes(locationFilter.toLowerCase())
    return matchesSearch && matchesLocation
  })

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex items-center space-x-2 mb-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-primary uppercase tracking-widest">AI Matching</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
          Smart <span className="text-gradient">Job Matching</span>
        </h1>
        <p className="text-gray-400 text-base sm:text-lg max-w-2xl">
          Discover opportunities perfectly aligned with your skill set and career goals, ranked by AI-powered compatibility.
        </p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card mb-12 border-white/5 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Search className="h-32 w-32" />
          </div>
          <CardContent className="pt-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
              <div className="md:col-span-6 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Job title, keywords, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 sm:h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-primary focus:border-primary/50 focus:bg-white/10 transition-all text-white placeholder:text-gray-600"
                />
              </div>
              <div className="md:col-span-4 relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Remote or City..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="pl-12 h-12 sm:h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-primary focus:border-primary/50 focus:bg-white/10 transition-all text-white placeholder:text-gray-600"
                />
              </div>
              <div className="md:col-span-2 flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={handleSearch}
                  className="flex-1 h-12 sm:h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold ai-glow"
                >
                  Search
                </Button>
                <Button 
                  onClick={handleMatchWithResume}
                  disabled={matching}
                  className="flex-1 h-12 sm:h-14 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold flex items-center justify-center space-x-2"
                >
                  <Sparkles className={`h-4 w-4 sm:h-5 sm:w-5 ${matching ? 'animate-spin' : ''}`} />
                  <span className="text-sm sm:text-base">{matching ? 'Matching...' : 'Match'}</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Job Results */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="relative">
              <div className="h-16 w-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary animate-pulse" />
            </div>
            <p className="text-gray-500 animate-pulse font-medium">Scanning global job markets...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <Card className="glass-card border-dashed border-white/10">
            <CardContent className="py-20 flex flex-col items-center text-center">
              <div className="p-4 bg-white/5 rounded-full mb-4">
                <Search className="h-12 w-12 text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No matches found</h3>
              <p className="text-gray-500 max-w-sm">Try broadening your search criteria or uploading a more detailed resume.</p>
            </CardContent>
          </Card>
        ) : (
          filteredJobs.map((job, index) => (
            <motion.div 
              key={job.id} 
              variants={itemVariants}
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="glass-card group hover:border-primary/50 transition-all duration-300 shadow-xl hover:shadow-primary/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-cyan-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -mr-32 -mt-32" />
                <CardContent className="p-4 sm:p-8 relative z-10">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="space-y-1">
                          <motion.h3 
                            className="text-xl sm:text-2xl font-bold text-white group-hover:text-primary transition-colors flex items-center"
                            whileHover={{ x: 5 }}
                          >
                            {job.title}
                            <ArrowUpRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                          </motion.h3>
                          <p className="text-lg text-gray-400 font-medium flex items-center flex-wrap gap-2">
                            {job.company} 
                            <span className="text-gray-700">•</span>
                            <span className="flex items-center text-gray-500 text-sm">
                              <MapPin className="h-4 w-4 mr-1" />
                              {job.location}
                            </span>
                          </p>
                        </div>
                        <motion.div 
                          className="p-1 px-3 sm:px-4 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center group-hover:border-primary/30 group-hover:bg-primary/10 transition-all"
                          whileHover={{ scale: 1.05 }}
                        >
                          <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-tighter">AI Match</span>
                          <span className={`text-xl sm:text-2xl font-black tracking-tighter ${
                            job.matchPercentage >= 90 ? 'text-green-400' : 'text-primary'
                          }`}>
                            {job.matchPercentage}%
                          </span>
                        </motion.div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        {job.salary && (
                          <div className="flex items-center bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                            <DollarSign className="h-4 w-4 mr-1.5 text-primary" />
                            {job.salary}
                          </div>
                        )}
                        <div className="flex items-center bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                          <Briefcase className="h-4 w-4 mr-1.5 text-blue-400" />
                          {job.jobType || 'Full-time'}
                        </div>
                        <div className="flex items-center bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                          <Clock className="h-4 w-4 mr-1.5 text-purple-400" />
                          {job.postedDate || (job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recent')}
                        </div>
                      </div>

                      <p className="text-gray-400 leading-relaxed max-w-3xl line-clamp-2">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {(job.skills || job.requirements || []).map((skill: string, skillIndex: number) => (
                          <motion.div
                            key={skillIndex}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 + skillIndex * 0.05, type: "spring" }}
                            whileHover={{ scale: 1.1 }}
                          >
                            <Badge 
                              variant="secondary" 
                              className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 hover:border-primary/40 transition-all cursor-default px-3 py-1"
                            >
                              {skill}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col gap-4 min-w-[160px] sm:min-w-[200px]">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1 lg:flex-none">
                        <Button className="w-full h-12 sm:h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold ai-glow shadow-lg shadow-primary/20 flex items-center justify-center space-x-2 group">
                          <span className="text-sm sm:text-base">Apply Fast</span>
                          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1 lg:flex-none">
                        <Button variant="outline" className="w-full h-12 sm:h-14 rounded-2xl border-white/10 hover:bg-white/5 hover:border-white/20 text-white font-semibold transition-all text-sm sm:text-base">
                          View Details
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  )
}

