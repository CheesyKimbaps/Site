'use client'

import React, { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import { format, startOfDay, endOfDay, eachDayOfInterval, subDays } from 'date-fns'
import { AppData } from '../app/dashboard/page'
import { motion } from 'framer-motion'

interface ChartsProps {
  data: AppData
}

export default function Charts({ data }: ChartsProps) {
  // Toggle state for chart type
  const [chartType, setChartType] = useState<'profit' | 'orders'>('profit')

  // Prepare profit and orders over time data
  const profitOverTime = data.transactions.reduce((acc, transaction) => {
    const date = format(new Date(transaction.timestamp), 'MMM dd')
    const existing = acc.find(item => item.date === date)
    if (existing) {
      existing.profit += transaction.profit
      existing.orders += 1
      existing.cumulative = (acc[acc.indexOf(existing) - 1]?.cumulative || 0) + existing.profit
    } else {
      const cumulative = (acc[acc.length - 1]?.cumulative || 0) + transaction.profit
      acc.push({ date, profit: transaction.profit, orders: 1, cumulative })
    }
    return acc
  }, [] as { date: string; profit: number; orders: number; cumulative: number }[])

  // Prepare method breakdown data for all five payment methods
  const paymentMethods = [
    { key: 'CashApp', label: 'Cash App', color: '#3B82F6' },
    { key: 'Zelle', label: 'Zelle', color: '#8B5CF6' },
    { key: 'ApplePay', label: 'Apple Pay', color: '#F472B6' },
    { key: 'PayPal', label: 'PayPal', color: '#F59E0B' },
    { key: 'Crypto', label: 'Crypto', color: '#10B981' },
  ]
  const methodBreakdown = paymentMethods.map(method => ({
    name: method.label,
    value: data.transactions.filter(t => t.method === method.key).length,
    color: method.color
  }))

  // Prepare daily earnings data for the last 7 days, broken down by method
  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date()
  })
  const dailyEarnings = last7Days.map(day => {
    const dayStart = startOfDay(day)
    const dayEnd = endOfDay(day)
    // Explicitly type dayData to allow dynamic keys
    const dayData: Record<string, number | string> = { date: format(day, 'EEE') }
    paymentMethods.forEach(method => {
      const methodProfit = data.transactions.filter(t => {
      const transactionDate = new Date(t.timestamp)
        return t.method === method.key && transactionDate >= dayStart && transactionDate <= dayEnd
      }).reduce((sum, t) => sum + t.profit, 0)
      dayData[method.key] = methodProfit
    })
    return dayData
  })
  const COLORS = paymentMethods.map(m => m.color)

  return (
    <div className="space-y-6">
      {/* Toggle for Profit/Orders Over Time */}
      <div className="flex gap-2 mb-2">
        <motion.button
          type="button"
          className={`px-3 py-1 rounded-lg font-semibold text-sm focus:outline-none transition-colors shadow ${chartType === 'profit' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200'}`}
          onClick={() => setChartType('profit')}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.96 }}
        >
          Profit Over Time
        </motion.button>
        <motion.button
          type="button"
          className={`px-3 py-1 rounded-lg font-semibold text-sm focus:outline-none transition-colors shadow ${chartType === 'orders' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200'}`}
          onClick={() => setChartType('orders')}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.96 }}
        >
          Orders Over Time
        </motion.button>
      </div>
      {/* Profit/Orders Over Time Chart */}
      <motion.div
        whileHover={{ scale: 1.015, boxShadow: '0 8px 32px 0 rgba(99,102,241,0.25)' }}
        whileFocus={{ scale: 1.015, boxShadow: '0 8px 32px 0 rgba(99,102,241,0.25)' }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6"
        tabIndex={0}
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {chartType === 'profit' ? 'Profit Over Time' : 'Orders Over Time'}
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={profitOverTime}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="date"
                className="text-xs"
                tick={{ fill: '#e5e7eb' }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: '#e5e7eb' }}
                tickFormatter={chartType === 'profit' ? (value) => `$${value}` : (value) => value}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  chartType === 'profit' ? `$${value.toFixed(2)}` : value,
                  chartType === 'profit' ? 'Profit' : 'Orders'
                ]}
                labelStyle={{ color: '#e5e7eb' }}
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#e5e7eb'
                }}
              />
              <Line
                type="monotone"
                dataKey={chartType === 'profit' ? 'cumulative' : 'orders'}
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Method Usage Breakdown */}
        <motion.div
          whileHover={{ scale: 1.015, boxShadow: '0 8px 32px 0 rgba(99,102,241,0.25)' }}
          whileFocus={{ scale: 1.015, boxShadow: '0 8px 32px 0 rgba(99,102,241,0.25)' }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6"
          tabIndex={0}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Payment Method Usage
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={methodBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  label={false}
                >
                  {methodBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string, props: any) => [
                    `${value} transactions`,
                    name
                  ]}
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#e5e7eb'
                  }}
                  labelStyle={{ color: '#e5e7eb' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Custom legend below the chart */}
          <div className="mt-4 flex flex-wrap gap-4 justify-center">
            {methodBreakdown.map((method, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <span
                  className="w-3 h-3 rounded-full inline-block"
                  style={{ backgroundColor: method.color }}
                ></span>
                <span className="text-gray-200">{method.name}</span>
                <span className="text-gray-400">({method.value})</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Daily Earnings */}
        <motion.div
          whileHover={{ scale: 1.015, boxShadow: '0 8px 32px 0 rgba(99,102,241,0.25)' }}
          whileFocus={{ scale: 1.015, boxShadow: '0 8px 32px 0 rgba(99,102,241,0.25)' }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6"
          tabIndex={0}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Daily Earnings (Last 7 Days)
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyEarnings}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fill: '#e5e7eb' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: '#e5e7eb' }}
                  tickFormatter={(value: number) => `$${value}`}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'profit' ? `$${value.toFixed(2)}` : value,
                    name === 'profit' ? 'Profit' : 'Transactions'
                  ]}
                  labelStyle={{ color: '#e5e7eb' }}
                  contentStyle={{ 
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#e5e7eb'
                  }}
                />
                {paymentMethods.map((method, idx) => (
                <Bar 
                    key={method.key}
                    dataKey={method.key}
                    stackId="a"
                    fill={method.color}
                    radius={idx === paymentMethods.length - 1 ? [4, 4, 0, 0] : 0}
                />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
