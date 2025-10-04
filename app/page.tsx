'use client'

import React from 'react'
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs'
import { DollarSign, Mail, CreditCard, Link } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Home() {
  // Auth is handled by Clerk's SignedIn/SignedOut wrappers

  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center justify-center mb-6"
              >
                <DollarSign className="h-16 w-16 text-indigo-400 drop-shadow-lg" style={{ filter: 'drop-shadow(0 0 8px #7c3aed)' }} />
              </motion.div>
              <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                Welcome to Your Tools
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Choose which tool you'd like to use
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Profit Tracker Card */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-800"
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-6">
                    <DollarSign className="h-8 w-8 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Profit Tracker
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Track your profits, manage transactions, and view detailed analytics
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={() => (window.location.href = '/dashboard')}
                      className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Open Profit Tracker
                    </button>
                    <a
                      href="/dashboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors text-center"
                    >
                      Open in New Tab
                    </a>
                  </div>
                </div>
              </motion.div>

              {/* Uber Tools Card */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-800"
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full mb-6">
                    <Link className="h-8 w-8 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Uber Tools
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Manage emails, VCC cards, and generate Uber links
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={() => (window.location.href = '/uber-tools')}
                      className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Open Uber Tools
                    </button>
                    <a
                      href="/uber-tools"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors text-center"
                    >
                      Open in New Tab
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-12 text-center"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Quick Actions
              </p>
              <div className="flex justify-center space-x-4">
                <a
                  href="/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Profit Tracker
                </a>
                <a
                  href="/uber-tools"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Link className="h-4 w-4 mr-2" />
                  Uber Tools
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </SignedIn>
    </>
  )
}
