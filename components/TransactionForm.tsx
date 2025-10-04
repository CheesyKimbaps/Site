'use client'

import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'

interface TransactionFormProps {
  onSubmit: (transaction: {
    cost: number
    paid_to_me: number
    method: 'CashApp' | 'Zelle' | 'ApplePay' | 'PayPal' | 'Crypto'
    profit: number
  }) => void
}

export default function TransactionForm({ onSubmit }: TransactionFormProps) {
  const [cost, setCost] = useState('')
  const [paidToMe, setPaidToMe] = useState('')
  const [method, setMethod] = useState<'CashApp' | 'Zelle' | 'ApplePay' | 'PayPal' | 'Crypto'>('CashApp')

  const paymentMethods = [
    { key: 'CashApp', label: 'Cash App' },
    { key: 'Zelle', label: 'Zelle' },
    { key: 'ApplePay', label: 'Apple Pay' },
    { key: 'PayPal', label: 'PayPal' },
    { key: 'Crypto', label: 'Crypto' },
  ]

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const costNum = parseFloat(cost)
    const paidToMeNum = parseFloat(paidToMe)
    
    if (isNaN(costNum) || isNaN(paidToMeNum) || costNum < 0 || paidToMeNum < 0) {
      alert('Please enter valid positive numbers')
      return
    }

    const profit = paidToMeNum - costNum

    onSubmit({
      cost: costNum,
      paid_to_me: paidToMeNum,
      method,
      profit
    })

    // Reset form
    setCost('')
    setPaidToMe('')
    setMethod('CashApp')
  }

  return (
    <motion.div
      whileHover={{ scale: 1.015, boxShadow: '0 8px 32px 0 rgba(99,102,241,0.25)' }}
      whileFocus={{ scale: 1.015, boxShadow: '0 8px 32px 0 rgba(99,102,241,0.25)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6"
      tabIndex={0}
    >
      <div className="flex items-center mb-6">
        <Plus className="h-5 w-5 text-indigo-600 mr-2" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Add Transaction
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Cost
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500 dark:text-gray-400">$</span>
            <input
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="0.00"
              step="0.01"
              className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Paid to Me
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500 dark:text-gray-400">$</span>
            <input
              type="number"
              value={paidToMe}
              onChange={(e) => setPaidToMe(e.target.value)}
              placeholder="0.00"
              step="0.01"
              className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Center the payment method toggle buttons */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-center">
            Payment Method
          </label>
          <div className="flex gap-2 justify-center items-center">
            {paymentMethods.map((methodObj) => (
              <motion.button
                key={methodObj.key}
                type="button"
                className={`px-2 py-1 rounded-lg border font-semibold text-sm focus:outline-none transition-colors shadow ${
                  method === methodObj.key
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_8px_2px_#6366f1]' // active: solid color + glow
                    : 'bg-gray-800 text-white border-gray-600 hover:bg-indigo-700 hover:border-indigo-500'
                }`}
                onClick={() => setMethod(methodObj.key as typeof method)}
                whileHover={{ scale: 1.06, boxShadow: '0 0 8px 2px #6366f1', filter: 'brightness(1.08)' }}
                whileTap={{ scale: 0.97, boxShadow: '0 0 4px 1px #6366f1' }}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              >
                {methodObj.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Profit Display */}
        {cost && paidToMe && (
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Calculated Profit
            </div>
            <div className={`text-lg font-bold ${
              (parseFloat(paidToMe) - parseFloat(cost)) >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              ${((parseFloat(paidToMe || '0') - parseFloat(cost || '0')).toFixed(2))}
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Add Transaction
        </button>
      </form>
    </motion.div>
  )
}
