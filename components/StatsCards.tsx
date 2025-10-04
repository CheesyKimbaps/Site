'use client'

import React from 'react'
import { TrendingUp, DollarSign, CreditCard, Target, Calendar, ShoppingCart } from 'lucide-react'
import { AppData } from '../app/dashboard/page'
import { motion } from 'framer-motion'

interface StatsCardsProps {
  data: AppData
  dailyGoal: number
  todayProfit: number
  todayOrderCount: number
}

export default function StatsCards({ data, dailyGoal, todayProfit, todayOrderCount }: StatsCardsProps) {
  const progressPercentage = Math.min((todayProfit / dailyGoal) * 100, 100)

  // Calculate per-method stats
  const paymentMethods = [
    { key: 'CashApp', label: 'Cash App', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
    { key: 'Zelle', label: 'Zelle', color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-50 dark:bg-purple-900/20' },
    { key: 'ApplePay', label: 'Apple Pay', color: 'text-pink-600 dark:text-pink-400', bgColor: 'bg-pink-50 dark:bg-pink-900/20' },
    { key: 'PayPal', label: 'PayPal', color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { key: 'Crypto', label: 'Crypto', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-50 dark:bg-green-900/20' },
  ]

  const methodStats = paymentMethods.map(method => {
    const txs = data.transactions.filter(t => t.method === method.key)
    const totalReceived = txs.reduce((sum, t) => sum + t.paid_to_me, 0)
    const totalProfit = txs.reduce((sum, t) => sum + t.profit, 0)
    return {
      ...method,
      count: txs.length,
      totalReceived,
      totalProfit
    }
  })

  const stats = [
    {
      title: 'Total Profit',
      value: `$${data.total_profit.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    ...methodStats.map(method => ({
      title: `${method.label} (${method.count})`,
      value: `Received: $${method.totalReceived.toFixed(2)} | Profit: $${method.totalProfit.toFixed(2)}`,
      icon: DollarSign,
      color: method.color,
      bgColor: method.bgColor
    }))
  ]

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={index}
              whileHover={{ scale: 1.015, boxShadow: '0 8px 32px 0 rgba(99,102,241,0.25)' }}
              whileFocus={{ scale: 1.015, boxShadow: '0 8px 32px 0 rgba(99,102,241,0.25)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700"
              tabIndex={0}
            >
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
                    {stat.title}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Daily Goal Progress */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-800"
      >
        <div className="flex items-center">
          <Calendar className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Today's Progress</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ${todayProfit.toFixed(2)}
            </p>
            <div className="mt-2">
              <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min((todayProfit / dailyGoal) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {((todayProfit / dailyGoal) * 100).toFixed(1)}% of ${dailyGoal} goal
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Orders Today */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-800"
      >
        <div className="flex items-center">
          <ShoppingCart className="h-8 w-8 text-orange-600 mr-3" />
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Orders Today</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {todayOrderCount}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Total Transactions */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-800"
      >
        <div className="flex items-center">
          <DollarSign className="h-8 w-8 text-purple-600 mr-3" />
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Transactions</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {data?.transactions?.length || 0}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
