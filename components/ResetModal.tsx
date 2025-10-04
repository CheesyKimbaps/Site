'use client'

import { AlertTriangle, X } from 'lucide-react'
import { AppData } from '@/app/dashboard/page'
import { motion } from 'framer-motion'

interface ResetModalProps {
  data: AppData
  onConfirm: () => void
  onCancel: () => void
}

export default function ResetModal({ data, onConfirm, onCancel }: ResetModalProps) {
  // Calculate fees for display
  const cashappProfit = data.transactions
    .filter(t => t.method === 'CashApp')
    .reduce((sum, t) => sum + t.profit, 0)
  const otherProfit = data.transactions
    .filter(t => t.method !== 'CashApp')
    .reduce((sum, t) => sum + t.profit, 0)
  
  const cashappFee = cashappProfit * 0.025
  const otherFee = otherProfit * 0.03
  const totalFees = cashappFee + otherFee

  const handleConfirm = () => {
    onConfirm()
  }
  return (
    <motion.div
      whileHover={{ scale: 1.015, boxShadow: '0 8px 32px 0 rgba(99,102,241,0.25)' }}
      whileFocus={{ scale: 1.015, boxShadow: '0 8px 32px 0 rgba(99,102,241,0.25)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
      tabIndex={0}
    >
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Reset All Data
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            This action cannot be undone. All transaction data will be permanently deleted.
          </p>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Total Transactions:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {data.transactions.length}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Total Profit:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              ${data.total_profit.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">CashApp Fee (2.5%):</span>
            <span className="font-medium text-gray-900 dark:text-white">
              ${cashappFee.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Other Fee (3%):</span>
            <span className="font-medium text-gray-900 dark:text-white">
              ${otherFee.toFixed(2)}
            </span>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-gray-900 dark:text-white">Total Fees:</span>
              <span className="text-gray-900 dark:text-white">
                ${totalFees.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Reset Data
          </button>
        </div>
      </div>
    </motion.div>
  )
}
