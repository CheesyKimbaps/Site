'use client'

import React, { useState } from 'react'
import { format } from 'date-fns'
import { Download, Search, Filter, Edit2, Save, X, Trash2 } from 'lucide-react'
import { Transaction } from '../app/dashboard/page'
import { motion } from 'framer-motion'

interface TransactionHistoryProps {
  transactions: Transaction[]
  onExportCSV: () => void
  onDelete: (id: string) => void
}

export default function TransactionHistory({ transactions, onExportCSV, onDelete }: TransactionHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [methodFilter, setMethodFilter] = useState<'All' | 'CashApp' | 'Zelle' | 'ApplePay' | 'PayPal' | 'Crypto'>('All')
  const [dateFilter, setDateFilter] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<Transaction>>({})
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<'date' | 'profit' | 'method'>('date')

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction: Transaction) => {
    const matchesSearch = searchTerm === '' || 
      transaction.cost.toString().includes(searchTerm) ||
      transaction.paid_to_me.toString().includes(searchTerm) ||
      transaction.profit.toString().includes(searchTerm)
    
    const matchesMethod = methodFilter === 'All' || transaction.method === methodFilter
    
    const matchesDate = dateFilter === '' || 
      format(new Date(transaction.timestamp), 'yyyy-MM-dd') === dateFilter
    
    return matchesSearch && matchesMethod && matchesDate
  }).sort((a: Transaction, b: Transaction) => {
    if (sortBy === 'date') {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    } else if (sortBy === 'profit') {
      return b.profit - a.profit
    } else { // method
      return a.method.localeCompare(b.method)
    }
  })

  const startEdit = (transaction: Transaction) => {
    setEditingId(transaction.id)
    setEditValues({
      cost: transaction.cost,
      paid_to_me: transaction.paid_to_me,
      method: transaction.method
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditValues({})
  }

  const saveEdit = () => {
    // In a real app, you'd update the transaction here
    // For now, we'll just cancel the edit
    setEditingId(null)
    setEditValues({})
  }

  return (
    <motion.div
      whileHover={{ scale: 1.015, boxShadow: '0 8px 32px 0 rgba(99,102,241,0.25)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6"
      tabIndex={0}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Transaction History
        </h3>
        <button
          onClick={onExportCSV}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value as 'All' | 'CashApp' | 'Zelle' | 'ApplePay' | 'PayPal' | 'Crypto')}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="All">All Methods</option>
          <option value="CashApp">Cash App</option>
          <option value="Zelle">Zelle</option>
          <option value="ApplePay">Apple Pay</option>
          <option value="PayPal">PayPal</option>
          <option value="Crypto">Crypto</option>
        </select>

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Transaction Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Cost
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Paid to Me
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Method
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Profit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No transactions found
                </td>
              </tr>
            ) : (
              filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {format(new Date(transaction.timestamp), 'MMM dd, yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {editingId === transaction.id ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editValues.cost || ''}
                        onChange={(e) => setEditValues({...editValues, cost: parseFloat(e.target.value)})}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                      />
                    ) : (
                      `$${transaction.cost.toFixed(2)}`
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {editingId === transaction.id ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editValues.paid_to_me || ''}
                        onChange={(e) => setEditValues({...editValues, paid_to_me: parseFloat(e.target.value)})}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                      />
                    ) : (
                      `$${transaction.paid_to_me.toFixed(2)}`
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {editingId === transaction.id ? (
                      <select
                        value={editValues.method || transaction.method}
                        onChange={(e) => setEditValues({...editValues, method: e.target.value as 'CashApp' | 'Zelle' | 'ApplePay' | 'PayPal' | 'Crypto'})}
                        className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                      >
                        <option value="CashApp">Cash App</option>
                        <option value="Zelle">Zelle</option>
                        <option value="ApplePay">Apple Pay</option>
                        <option value="PayPal">PayPal</option>
                        <option value="Crypto">Crypto</option>
                      </select>
                    ) : (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.method === 'CashApp'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      }`}>
                        {transaction.method}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-medium ${
                      transaction.profit >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      ${transaction.profit.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingId === transaction.id ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={saveEdit}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-200"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEdit(transaction)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDelete(transaction.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"
                          title="Delete Transaction"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      {filteredTransactions.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Total Transactions:</span>
              <div className="font-medium text-gray-900 dark:text-white">
                {filteredTransactions.length}
              </div>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Total Cost:</span>
              <div className="font-medium text-gray-900 dark:text-white">
                ${filteredTransactions.reduce((sum, t) => sum + t.cost, 0).toFixed(2)}
              </div>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Total Received:</span>
              <div className="font-medium text-gray-900 dark:text-white">
                ${filteredTransactions.reduce((sum, t) => sum + t.paid_to_me, 0).toFixed(2)}
              </div>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Total Profit:</span>
              <div className={`font-medium ${
                filteredTransactions.reduce((sum, t) => sum + t.profit, 0) >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                ${filteredTransactions.reduce((sum, t) => sum + t.profit, 0).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
