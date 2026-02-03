import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

import { Navbar } from '@/components/Navbar'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CareerNexus | AI-Powered Smart Resume & Career Coach',
  description: 'Elevate your career with CareerNexus-powered resume builder and coaching',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AuthProvider>
          <div className="mesh-bg" />
          <div className="relative min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <footer className="border-t border-white/5 py-8 text-center text-sm text-gray-500 mt-auto">
              <div className="container mx-auto px-4">
                <p className="mb-2">© 2026 CareerNexus. All rights reserved.</p>
                <p className="text-xs text-gray-600">Powered by AI • Built with Next.js</p>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}

