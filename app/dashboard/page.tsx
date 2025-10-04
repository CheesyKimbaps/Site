'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DollarSign, TrendingUp, Calendar, Settings, Moon, Sun, Download, RotateCcw, ShoppingCart } from 'lucide-react'
import TransactionForm from '@/components/TransactionForm'
import StatsCards from '@/components/StatsCards'
import Charts from '@/components/Charts'
import TransactionHistory from '@/components/TransactionHistory'
import ResetModal from '@/components/ResetModal'
import { motion } from 'framer-motion'
import { SignedIn, SignedOut, RedirectToSignIn, SignOutButton, useAuth } from '@clerk/nextjs'

export interface Transaction {
  id: string
  cost: number
  paid_to_me: number
  method: 'CashApp' | 'Zelle' | 'ApplePay' | 'PayPal' | 'Crypto'
  profit: number
  timestamp: string
}

export interface WipeLog {
  id: string
  timestamp: string
  total_profit: number
  cashapp_fee: number
  other_fee: number
  total_fees: number
  transaction_count: number
}

export interface AppData {
  transactions: Transaction[]
  wipe_logs: WipeLog[]
  total_profit: number
}

export default function Dashboard() {
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(true) // Start with dark mode by default
  const [showResetModal, setShowResetModal] = useState(false)
  const [data, setData] = useState<AppData | null>(null)
  const [loading, setLoading] = useState(true)
  const { isLoaded, isSignedIn } = useAuth()

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

    // Prefetch the uber-tools route to reduce delay
    router.prefetch('/uber-tools')

    // Fetch data from backend
    const fetchData = async () => {
      try {
        const res = await fetch('/api/backup')
        const backendData = await res.json()
        setData({
          transactions: backendData.transactions || [],
          wipe_logs: backendData.wipe_logs || [],
          total_profit: backendData.stats?.total_profit || 0,
        })
      } catch (error) {
        console.error('Error fetching backend data:', error)
        setData({
          transactions: [],
          wipe_logs: [],
          total_profit: 0,
        })
      } finally {
        setLoading(false)
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

  const handleNewTransaction = async (transaction: Omit<Transaction, 'id' | 'timestamp'>) => {
    if (!data) return
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    }
    const updatedTransactions = [...data.transactions, newTransaction]
    const updatedStats = {
      total_profit: data.total_profit + transaction.profit,
    }
    setLoading(true)
    try {
      await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactions: updatedTransactions,
          wipe_logs: data.wipe_logs,
          stats: updatedStats
        })
      })
      setData({
        ...data,
        transactions: updatedTransactions,
        ...updatedStats
      })
    } catch (error) {
      console.error('Failed to save transaction to backend:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async () => {
    if (!data) return
    const wipeLog: WipeLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      total_profit: data.total_profit,
      cashapp_fee: 0, // These fields are no longer tracked
      other_fee: 0, // These fields are no longer tracked
      total_fees: 0, // This field is no longer tracked
      transaction_count: data.transactions.length
    }
    setLoading(true)
    // Send wipe log to backend
    try {
      await fetch('/api/log-wipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(wipeLog),
      })
      // Reset backend data
      await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactions: [],
          wipe_logs: [...data.wipe_logs, wipeLog],
          stats: {
            total_profit: 0,
          }
        })
      })
      setData({
        transactions: [],
        wipe_logs: [...data.wipe_logs, wipeLog],
        total_profit: 0,
      })
      setShowResetModal(false)
    } catch (error) {
      console.error('Failed to log wipe or reset backend:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTransaction = async (id: string) => {
    if (!data) return
    const updatedTransactions = data.transactions.filter(t => t.id !== id)
    setLoading(true)
    try {
      await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactions: updatedTransactions,
          wipe_logs: data.wipe_logs,
          stats: { total_profit: updatedTransactions.reduce((sum, t) => sum + t.profit, 0) }
        })
      })
      setData({
        ...data,
        transactions: updatedTransactions,
        total_profit: updatedTransactions.reduce((sum, t) => sum + t.profit, 0)
      })
    } catch (error) {
      console.error('Failed to delete transaction:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportData = (format: 'json' | 'csv') => {
    if (!data) return
    if (format === 'json') {
      const dataStr = JSON.stringify(data, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `profit-tracker-${new Date().toISOString().split('T')[0]}.json`
      link.click()
    } else {
      // CSV export for transactions (includes all payment methods)
      const csvHeaders = 'Date,Cost,Paid to Me,Method,Profit\n'
      const csvData = data.transactions.map(t => 
        `${new Date(t.timestamp).toLocaleDateString()},${t.cost},${t.paid_to_me},${t.method},${t.profit}`
      ).join('\n')
      
      const csvBlob = new Blob([csvHeaders + csvData], { type: 'text/csv' })
      const url = URL.createObjectURL(csvBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`
      link.click()
    }
  }

  // Logout handled by Clerk's SignOutButton

  const dailyGoal = 100
  const todayTransactions = data?.transactions
    .filter((t: Transaction) => new Date(t.timestamp).toDateString() === new Date().toDateString()) || []
  const todayProfit = todayTransactions.reduce((sum: number, t: Transaction) => sum + t.profit, 0)
  const todayOrderCount = todayTransactions.length

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 transition-colors">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-6">
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
                  Profit Tracker
                </span>
              </div>
              
              {/* Orders Today Badge */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg border border-orange-300 dark:border-orange-700"
              >
                <ShoppingCart className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-orange-600 dark:text-orange-400">Orders Today</span>
                  <span className="text-lg font-bold text-orange-700 dark:text-orange-300">{todayOrderCount}</span>
                </div>
              </motion.div>
            </div>
            
            <div className="flex items-center space-x-4">
              <a
                href="/uber-tools"
                onClick={(e) => {
                  e.preventDefault()
                  router.push('/uber-tools')
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
              >
                Uber Tools
              </a>
              
              <button
                onClick={() => exportData('json')}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                title="Export JSON"
              >
                <Download className="h-5 w-5" />
              </button>
              
              <button
                onClick={() => setShowResetModal(true)}
                className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200"
                title="Reset Data"
              >
                <RotateCcw className="h-5 w-5" />
              </button>
              
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form and Stats */}
          <div className="lg:col-span-1 space-y-6">
            <TransactionForm onSubmit={handleNewTransaction} />
            <StatsCards 
              data={data} 
              dailyGoal={dailyGoal} 
              todayProfit={todayProfit}
              todayOrderCount={todayOrderCount}
            />
          </div>

          {/* Right Column - Charts and History */}
          <div className="lg:col-span-2 space-y-6">
            <Charts data={data} />
            <TransactionHistory 
              transactions={data.transactions}
              onExportCSV={() => exportData('csv')}
              onDelete={handleDeleteTransaction}
            />
          </div>
        </div>
      </main>

      {/* Reset Modal */}
      {showResetModal && (
        <ResetModal
          data={data}
          onConfirm={handleReset}
          onCancel={() => setShowResetModal(false)}
        />
      )}
    </div>
      </SignedIn>
    </>
  )
}
