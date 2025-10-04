'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DollarSign, TrendingUp, Calendar, Settings, Moon, Sun, Download, RotateCcw, Mail, CreditCard, Link, Plus, Trash2, Eye, Copy, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import { RedirectToSignIn, SignOutButton, useAuth } from '@clerk/nextjs'

// Import existing components and add new ones
import EmailPromoManager from '@/components/uber-tools/EmailPromoManager'
import VCCManager from '@/components/uber-tools/VCCManager'
import LinkGenerator from '@/components/uber-tools/LinkGenerator'

export interface UberEmail {
  id: string
  email: string
  promo: string
  useByDate?: string
  additionalInfo?: string
  timestamp: string
  // New usage tracking fields
  accountType?: string
  promos?: Array<{
    title: string
    expiration: string
    status: string
    usage_count: string
    eyebrow: string
    expiration_info: {
      subtitle_date: string
      subtitle_text: string
      bottom_sheet_date: string
    }
  }>
  tokens?: {
    access_token: string
    refresh_token: string
    user_uuid: string
  }
  usageCount?: string
  isUsed?: boolean
  isPartiallyUsed?: boolean
  usedDate?: string
}

export interface VCCCard {
  id: string
  cardNumber: string
  expiryMonth: string
  expiryYear: string
  cvv: string
  zip: string
  email: string
  isUsed: boolean
  isPartiallyUsed?: boolean
  usedDate?: string
  timestamp: string
}

export interface GeneratedLink {
  id: string
  uberLink: string
  generatedLink: string
  cardNumber: string
  email: string
  linkStyle: 'potato' | 'wool'
  generatedAt: string
  usedAt?: string
}

export interface UberToolsData {
  emails: UberEmail[]
  vccCards: VCCCard[]
  usedCards: VCCCard[]
  linkHistory: GeneratedLink[]
}

export default function UberTools() {
  const { isLoaded, isSignedIn } = useAuth()
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(false)
  const [data, setData] = useState<UberToolsData>({
    emails: [],
    vccCards: [],
    usedCards: [],
    linkHistory: []
  })
  // Split loading into initialLoading (first fetch) and saving (background saves)
  const [initialLoading, setInitialLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeSection, setActiveSection] = useState<'emails' | 'vcc' | 'generator'>('generator')
  
  // Add generated link state to parent component
  const [generatedLink, setGeneratedLink] = useState('')
  const [generatedAt, setGeneratedAt] = useState<string>('')
  const [showUsagePrompt, setShowUsagePrompt] = useState(false)
  const [lastUsedEmail, setLastUsedEmail] = useState<UberEmail | null>(null)
  const [lastUsedCard, setLastUsedCard] = useState<VCCCard | null>(null)

  // Initialize dark mode immediately before any rendering
  useEffect(() => {
    // Apply dark mode immediately to prevent flash
    const savedDarkMode = localStorage.getItem('profit_tracker_dark_mode')
    const isDark = savedDarkMode === null ? true : JSON.parse(savedDarkMode)
    setDarkMode(isDark)
    
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  // Fetch data when signed in
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return

    // Prefetch the dashboard route to reduce delay
    router.prefetch('/dashboard')

    // Fetch Uber Tools data from backend
    const fetchData = async () => {
      try {
        const res = await fetch('/api/uber-tools')
        const backendData = await res.json()
        setData({
          emails: backendData.emails || [],
          vccCards: backendData.vccCards || [],
          usedCards: backendData.usedCards || [],
          linkHistory: backendData.linkHistory || []
        })
      } catch (error) {
        console.error('Error fetching Uber Tools data:', error)
        setData({
          emails: [],
          vccCards: [],
          usedCards: [],
          linkHistory: []
        })
      } finally {
        setInitialLoading(false)
      }
    }
    fetchData()
  }, [router, isLoaded, isSignedIn])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('profit_tracker_dark_mode', JSON.stringify(newDarkMode))
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const saveData = async (newData: Partial<UberToolsData>) => {
    // Do not gate the entire page during saves; just mark as saving
    setSaving(true)
    try {
      await fetch('/api/uber-tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, ...newData })
      })
      setData({ ...data, ...newData })
    } catch (error) {
      console.error('Failed to save Uber Tools data:', error)
    } finally {
      setSaving(false)
    }
  }

  // Logout handled by Clerk's SignOutButton

  // Auth/loading gating
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 transition-colors">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 transition-colors">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading Uber Tools...</p>
        </div>
      </div>
    )
  }

  return (
    <>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <motion.span
                className="inline-flex items-center justify-center mr-2"
                initial={{ scale: 1, rotate: 0 }}
                animate={{ scale: [1, 1.15, 1], rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              >
                <DollarSign className="h-8 w-8 text-indigo-400 drop-shadow-lg" style={{ filter: 'drop-shadow(0 0 8px #7c3aed)' }} />
              </motion.span>
              <span
                className="text-2xl font-extrabold bg-gradient-to-r from-indigo-400 via-indigo-600 to-indigo-900 bg-clip-text text-transparent drop-shadow-lg tracking-wide"
                style={{
                  backgroundSize: '200% auto',
                  animation: 'shimmer 3s linear infinite',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundImage: 'linear-gradient(90deg, #6366f1 0%, #a5b4fc 50%, #6366f1 100%)',
                }}
              >
                Uber Tools
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <a
                href="/dashboard"
                onClick={(e) => {
                  e.preventDefault()
                  router.push('/dashboard')
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
              >
                Profit Tracker
              </a>
              
              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              
              <SignOutButton>
                <button
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </SignOutButton>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveSection('generator')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeSection === 'generator'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Link className="inline h-4 w-4 mr-2" />
              Link Generator
            </button>
            <button
              onClick={() => setActiveSection('emails')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeSection === 'emails'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Mail className="inline h-4 w-4 mr-2" />
              Email & Promo Manager
            </button>
            <button
              onClick={() => setActiveSection('vcc')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeSection === 'vcc'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <CreditCard className="inline h-4 w-4 mr-2" />
              VCC Manager
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeSection === 'emails' && (
          <EmailPromoManager 
            data={data} 
            onSave={saveData}
            loading={saving}
          />
        )}
        {activeSection === 'vcc' && (
          <VCCManager 
            data={data} 
            onSave={saveData}
            loading={saving}
          />
        )}
        {activeSection === 'generator' && (
          <LinkGenerator 
            data={data} 
            onSave={saveData}
            loading={saving}
            generatedLink={generatedLink}
            setGeneratedLink={setGeneratedLink}
            generatedAt={generatedAt}
            setGeneratedAt={setGeneratedAt}
            showUsagePrompt={showUsagePrompt}
            setShowUsagePrompt={setShowUsagePrompt}
            lastUsedEmail={lastUsedEmail}
            setLastUsedEmail={setLastUsedEmail}
            lastUsedCard={lastUsedCard}
            setLastUsedCard={setLastUsedCard}
          />
        )}
      </main>
    </div>
    </>
  )
}