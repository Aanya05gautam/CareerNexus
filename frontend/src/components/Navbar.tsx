'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { LucideLayoutDashboard, FileText, MessageSquare, Briefcase, Zap as ZapIcon, Menu, X, LogOut, User, Sparkles } from 'lucide-react'
import { Button } from './ui/button'
import { useAuth } from '@/contexts/AuthContext'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LucideLayoutDashboard },
  { name: 'Resume Builder', href: '/resume-builder', icon: FileText },
  { name: 'Interview Coach', href: '/interview-coach', icon: MessageSquare },
  { name: 'Job Matching', href: '/job-matching', icon: Briefcase },
]

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, logout, isAuthenticated } = useAuth()
  const pathname = usePathname()

  return (
    <nav className="glass-navbar border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group relative">
              <motion.div 
                className="p-2.5 bg-primary/20 rounded-xl group-hover:bg-primary/30 transition-all shadow-lg shadow-primary/10"
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <ZapIcon className="h-6 w-6 text-primary" />
              </motion.div>
              <div className="flex flex-col -space-y-1 text-left">
                <span className="font-black text-2xl tracking-tighter text-gradient">
                  CareerNexus
                </span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] pl-0.5">Career Intelligence</span>
              </div>
              <motion.div 
                className="absolute -top-1 -right-4"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="h-3 w-3 text-primary" />
              </motion.div>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-1">
              {navItems.map((item, index) => {
                const NavIcon = item.icon
                const isActive = pathname === item.href
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      className={`relative px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center space-x-2.5 group ${
                        isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="navActive"
                          className="absolute inset-0 bg-white/5 border border-white/10 rounded-xl"
                          initial={false}
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <div className={`relative z-10 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-primary' : ''}`}>
                        <NavIcon className="h-4 w-4" />
                      </div>
                      <span className="relative z-10">{item.name}</span>
                      {isActive && (
                        <motion.div 
                          className="absolute bottom-1 left-5 right-5 h-0.5 bg-primary rounded-full"
                          layoutId="navUnderline"
                        />
                      )}
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                <div className="hidden sm:flex items-center space-x-3 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                  <div className="p-1.5 bg-primary/20 rounded-lg">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400">Signed in as</span>
                    <span className="text-sm font-semibold text-white">{user.name}</span>
                  </div>
                </div>
                <Button
                  onClick={logout}
                  variant="ghost"
                  className="text-gray-300 hover:text-white hidden sm:flex"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button variant="ghost" className="text-gray-300 hover:text-white hidden sm:flex">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 ai-glow hidden sm:flex">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/5 py-4 space-y-2 overflow-hidden"
            >
              {navItems.map((item) => {
                const NavIcon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all group"
                  >
                    <NavIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                )
              })}
              <div className="pt-4 space-y-2 border-t border-white/5">
                {isAuthenticated && user ? (
                  <>
                    <div className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 mb-2 mx-2">
                      <div className="flex items-center space-x-3">
                        <div className="p-1.5 bg-primary/20 rounded-lg">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-xs text-gray-400">Signed in as</span>
                          <span className="text-sm font-semibold text-white truncate">{user.name}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        logout()
                        setMobileMenuOpen(false)
                      }}
                      variant="ghost"
                      className="w-full justify-start text-gray-300 hover:text-white px-4"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <div className="px-2 space-y-2">
                    <Link href="/auth/signin" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/signup" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white ai-glow">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}
