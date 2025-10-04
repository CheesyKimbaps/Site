'use client'

import React, { useState } from 'react'
import { Mail, Download, Upload, Trash2, Plus, Copy, Eye, Calendar, RefreshCw, CheckCircle, XCircle, Pencil } from 'lucide-react'
import { UberToolsData, UberEmail } from '../../app/uber-tools/page'
import { motion } from 'framer-motion'

interface EmailPromoManagerProps {
  data: UberToolsData
  onSave: (newData: Partial<UberToolsData>) => void
  loading: boolean
}

export default function EmailPromoManager({ data, onSave, loading }: EmailPromoManagerProps) {
  const [importMethod, setImportMethod] = useState<'file' | 'json'>('json')
  const [jsonInput, setJsonInput] = useState('')
  const [showDetails, setShowDetails] = useState(false)
  const [selectedEmails, setSelectedEmails] = useState<string[]>([])
  const [editingStatus, setEditingStatus] = useState<string | null>(null)
  const [editingStatusValue, setEditingStatusValue] = useState<string>('')
  const [sortBy, setSortBy] = useState<'promo' | 'email' | 'status' | 'date'>('promo')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [exportSelection, setExportSelection] = useState<'selected' | 'all'>('selected')
  const [massStatusEdit, setMassStatusEdit] = useState<string>('')

  const handleImportJSON = () => {
    try {
      let emails: any[] = []
      
      // Check if it's a single JSON object or array
      try {
        const parsed = JSON.parse(jsonInput)
        if (Array.isArray(parsed)) {
          emails = parsed
        } else {
          emails = [parsed]
        }
      } catch {
        // If single JSON fails, try line-by-line JSON parsing
        const lines = jsonInput.trim().split('\n').filter(line => line.trim())
        emails = lines.map(line => {
          try {
            return JSON.parse(line.trim())
          } catch {
            // If JSON parsing fails, try colon-separated format first (since it has higher priority)
            const colonParts = line.split(':').map(part => part.trim())
            if (colonParts.length >= 3) {
              return {
                email: colonParts[0],
                promo: colonParts[1] || '$25 off 1x',
                usageCount: colonParts[2] || '1x',
                useByDate: colonParts.slice(3).join(':') || '',
                additionalInfo: '',
                timestamp: new Date().toISOString()
              }
            }
            // If colon-separated fails, try comma-separated format
            const parts = line.split(',').map(part => part.trim())
            if (parts.length >= 1) {
              return {
                email: parts[0],
                promo: parts[1] || '$25 off 1x',
                useByDate: parts[2] || '',
                additionalInfo: parts.slice(3).join(',') || '',
                timestamp: new Date().toISOString()
              }
            }
            return null
          }
        }).filter(email => email !== null)
      }

      const newEmails: UberEmail[] = emails.map((email: any) => {
        // Handle the new comprehensive JSON structure
        if (email.email && email.title) {
          // New format with title, usage_count, expiration, etc.
          return {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            email: email.email,
            promo: email.title || '$25 off 1x',
            useByDate: email.expiration || '',
            additionalInfo: email.expiration_info?.subtitle_text || '',
            accountType: email.account_type || '',
            promos: email.promos || [{
              title: email.title,
              expiration: email.expiration,
              status: email.status,
              usage_count: email.usage_count,
              eyebrow: email.eyebrow,
              expiration_info: email.expiration_info
            }],
            tokens: email.tokens,
            usageCount: email.usage_count || '1x',
            isUsed: false,
            isPartiallyUsed: false,
            timestamp: new Date().toISOString()
          }
        } else if (email.email && email.account_type) {
          // Full JSON structure with usage tracking
          const firstPromo = email.promos && email.promos.length > 0 ? email.promos[0] : null
          return {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            email: email.email,
            promo: firstPromo?.title || '$25 off 1x',
            useByDate: firstPromo?.expiration || '',
            additionalInfo: firstPromo?.expiration_info?.subtitle_text || '',
            accountType: email.account_type,
            promos: email.promos,
            tokens: email.tokens,
            usageCount: firstPromo?.usage_count || '0x',
            isUsed: false,
            isPartiallyUsed: false,
            timestamp: new Date().toISOString()
          }
        } else {
          // Simple format (backward compatibility)
          return {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            email: email.email || email,
            promo: email.promo || '$25 off 1x',
            useByDate: email.useByDate || '',
            additionalInfo: email.additionalInfo || '',
            usageCount: email.usageCount || '1x',
            isUsed: false,
            isPartiallyUsed: false,
            timestamp: new Date().toISOString()
          }
        }
      })
      
      onSave({ emails: [...data.emails, ...newEmails] })
      setJsonInput('')
    } catch (error) {
      alert('Invalid format. Please use JSON or comma-separated format.')
    }
  }

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        let emails: any[] = []
        
        // Try single JSON first
        try {
          const parsed = JSON.parse(content)
          if (Array.isArray(parsed)) {
            emails = parsed
          } else {
            emails = [parsed]
          }
        } catch {
          // If single JSON fails, try line-by-line JSON parsing
          const lines = content.trim().split('\n').filter(line => line.trim())
          emails = lines.map(line => {
            try {
              return JSON.parse(line.trim())
            } catch {
              // If JSON parsing fails, try colon-separated format first (since it has higher priority)
              const colonParts = line.split(':').map(part => part.trim())
              if (colonParts.length >= 3) {
                return {
                  email: colonParts[0],
                  promo: colonParts[1] || '$25 off 1x',
                  usageCount: colonParts[2] || '1x',
                  useByDate: colonParts.slice(3).join(':') || '',
                  additionalInfo: '',
                  timestamp: new Date().toISOString()
                }
              }
              // If colon-separated fails, try comma-separated format
              const parts = line.split(',').map(part => part.trim())
              if (parts.length >= 1) {
                return {
                  email: parts[0],
                  promo: parts[1] || '$25 off 1x',
                  useByDate: parts[2] || '',
                  additionalInfo: parts.slice(3).join(',') || '',
                  timestamp: new Date().toISOString()
                }
              }
              return null
            }
          }).filter(email => email !== null)
        }

        const newEmails: UberEmail[] = emails.map((email: any) => {
          // Handle comprehensive JSON structure
          if (email.email && email.title) {
            // New format with title, usage_count, expiration, etc.
            return {
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              email: email.email,
              promo: email.title || '$25 off 1x',
              useByDate: email.expiration || '',
              additionalInfo: email.expiration_info?.subtitle_text || '',
              accountType: email.account_type || '',
              promos: email.promos || [{
                title: email.title,
                expiration: email.expiration,
                status: email.status,
                usage_count: email.usage_count,
                eyebrow: email.eyebrow,
                expiration_info: email.expiration_info
              }],
              tokens: email.tokens,
              usageCount: email.usage_count || '1x',
              isUsed: false,
              isPartiallyUsed: false,
              timestamp: new Date().toISOString()
            }
          } else if (email.email && email.account_type) {
            // Full JSON structure with usage tracking
            const firstPromo = email.promos && email.promos.length > 0 ? email.promos[0] : null
            return {
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              email: email.email,
              promo: firstPromo?.title || '$25 off 1x',
              useByDate: firstPromo?.expiration || '',
              additionalInfo: firstPromo?.expiration_info?.subtitle_text || '',
              accountType: email.account_type,
              promos: email.promos,
              tokens: email.tokens,
              usageCount: firstPromo?.usage_count || '0x',
              isUsed: false,
              isPartiallyUsed: false,
              timestamp: new Date().toISOString()
            }
          } else {
            // Simple format (backward compatibility)
            return {
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              email: email.email || email,
              promo: email.promo || '$25 off 1x',
              useByDate: email.useByDate || '',
              additionalInfo: email.additionalInfo || '',
              usageCount: email.usageCount || '1x',
              isUsed: false,
              isPartiallyUsed: false,
              timestamp: new Date().toISOString()
            }
          }
        })
        
        onSave({ emails: [...data.emails, ...newEmails] })
      } catch (error) {
        alert('Invalid file format. Please use JSON or comma-separated format.')
      }
    }
    reader.readAsText(file)
  }

  const handleGenerateAccount = () => {
    // Only generate if there are emails in the database
    if (data.emails.length === 0) {
      alert('Please import emails first before generating accounts')
      return
    }
    
    // Use a random email from the existing database
    const randomEmail = data.emails[Math.floor(Math.random() * data.emails.length)]
    const newEmail: UberEmail = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      email: randomEmail.email,
      promo: randomEmail.promo || '$25 off 1x',
      useByDate: randomEmail.useByDate || '',
      additionalInfo: randomEmail.additionalInfo || '',
      accountType: randomEmail.accountType,
      promos: randomEmail.promos,
      tokens: randomEmail.tokens,
      usageCount: randomEmail.usageCount,
      isUsed: false,
      isPartiallyUsed: false,
      timestamp: new Date().toISOString()
    }
    
    onSave({ emails: [...data.emails, newEmail] })
  }

  const handleMarkAsUsed = (emailId: string) => {
    const updatedEmails = data.emails.map(email => 
      email.id === emailId 
        ? { ...email, isUsed: true, usedDate: new Date().toISOString() }
        : email
    )
    onSave({ emails: updatedEmails })
  }

  const handleMarkAsUnused = (emailId: string) => {
    const updatedEmails = data.emails.map(email => 
      email.id === emailId 
        ? { ...email, isUsed: false, usedDate: undefined }
        : email
    )
    onSave({ emails: updatedEmails })
  }

  const handleMarkAsPartiallyUsed = (emailId: string) => {
    const updatedEmails = data.emails.map(email => 
      email.id === emailId 
        ? { ...email, isPartiallyUsed: true, usedDate: new Date().toISOString() }
        : email
    )
    onSave({ emails: updatedEmails })
  }

  const getUsageStatus = (email: UberEmail) => {
    if (!email.usageCount) return 'Active'
    
    const usageCount = parseInt(email.usageCount.replace('x', ''))
    
    if (email.isUsed) {
      return 'Used'
    } else if (email.isPartiallyUsed) {
      return 'Partially Used'
    } else {
      return 'Active'
    }
  }

  const getUsageStatusColor = (email: UberEmail) => {
    if (!email.usageCount) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    
    if (email.isUsed) {
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    } else if (email.isPartiallyUsed) {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    } else {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    }
  }

  const handleUsageAction = (email: UberEmail) => {
    if (!email.usageCount) return
    
    const usageCount = parseInt(email.usageCount.replace('x', ''))
    
    if (usageCount === 1) {
      // For 1x usage, ask to mark as used
      if (confirm(`Mark "${email.email}" as used?`)) {
        handleMarkAsUsed(email.id)
      }
    } else if (usageCount === 2) {
      // For 2x usage, ask if partially used or fully used
      const choice = confirm(`Mark "${email.email}" as used?\n\nClick OK for "Fully Used"\nClick Cancel for "Partially Used"`)
      if (choice) {
        handleMarkAsUsed(email.id)
      } else {
        handleMarkAsPartiallyUsed(email.id)
      }
    }
  }

  const handleMassDelete = () => {
    if (selectedEmails.length === 0) {
      alert('Please select emails to delete')
      return
    }
    
    if (confirm(`Are you sure you want to delete ${selectedEmails.length} selected emails?`)) {
      const updatedEmails = data.emails.filter(email => !selectedEmails.includes(email.id))
      onSave({ emails: updatedEmails })
      setSelectedEmails([])
    }
  }

  const handleExport = (format: 'json' | 'csv') => {
    let emailsToExport: UberEmail[]
    
    if (exportSelection === 'selected') {
      emailsToExport = selectedEmails.length > 0 
        ? data.emails.filter(email => selectedEmails.includes(email.id))
        : []
    } else {
      emailsToExport = data.emails
    }

    if (emailsToExport.length === 0) {
      alert(exportSelection === 'selected' 
        ? 'Please select emails to export' 
        : 'No emails to export')
      return
    }

    if (format === 'json') {
      const dataStr = JSON.stringify(emailsToExport, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `uber-emails-${new Date().toISOString().split('T')[0]}.json`
      link.click()
    } else {
      const csvHeaders = 'Email,Promo,Usage Count,Status,Date\n'
      const csvData = emailsToExport.map(email => 
        `${email.email},${email.promo},${email.usageCount || 'N/A'},${getUsageStatus(email)},${new Date(email.timestamp).toLocaleDateString()}`
      ).join('\n')
      
      const csvBlob = new Blob([csvHeaders + csvData], { type: 'text/csv' })
      const url = URL.createObjectURL(csvBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `uber-emails-${new Date().toISOString().split('T')[0]}.csv`
      link.click()
    }
  }

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all emails?')) {
      onSave({ emails: [] })
    }
  }

  const handleDeleteEmail = (id: string) => {
    onSave({ emails: data.emails.filter(email => email.id !== id) })
  }

  const handleSelectEmail = (id: string) => {
    setSelectedEmails(prev => 
      prev.includes(id) 
        ? prev.filter(emailId => emailId !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    setSelectedEmails(data.emails.map(email => email.id))
  }

  const handleDeselectAll = () => {
    setSelectedEmails([])
  }

  const maskEmail = (email: string) => {
    const [local, domain] = email.split('@')
    if (local.length <= 2) return email
    return `${local[0]}***${local[local.length - 1]}@${domain}`
  }

  const handleStatusEdit = (emailId: string) => {
    const email = data.emails.find(e => e.id === emailId)
    if (!email) return
    
    setEditingStatus(emailId)
    if (email.isUsed) {
      setEditingStatusValue('used')
    } else if (email.isPartiallyUsed) {
      setEditingStatusValue('partially')
    } else {
      setEditingStatusValue('active')
    }
  }

  const handleStatusSave = (emailId: string) => {
    const updatedEmails = data.emails.map(email => {
      if (email.id === emailId) {
        const newStatus = editingStatusValue
        return {
          ...email,
          isUsed: newStatus === 'used',
          isPartiallyUsed: newStatus === 'partially',
          usedDate: newStatus === 'active' ? undefined : (email.usedDate || new Date().toISOString())
        }
      }
      return email
    })
    
    onSave({ emails: updatedEmails })
    setEditingStatus(null)
    setEditingStatusValue('')
  }

  const handleStatusCancel = () => {
    setEditingStatus(null)
    setEditingStatusValue('')
  }

  const handleMassStatusEdit = () => {
    if (selectedEmails.length === 0) {
      alert('Please select emails to edit')
      return
    }

    if (!massStatusEdit) {
      alert('Please select a status to apply')
      return
    }

    if (confirm(`Are you sure you want to mark ${selectedEmails.length} selected emails as ${massStatusEdit}?`)) {
      const updatedEmails = data.emails.map(email => {
        if (selectedEmails.includes(email.id)) {
          return {
            ...email,
            isUsed: massStatusEdit === 'used',
            isPartiallyUsed: massStatusEdit === 'partially',
            usedDate: massStatusEdit === 'active' ? undefined : (email.usedDate || new Date().toISOString())
          }
        }
        return email
      })
      
      onSave({ emails: updatedEmails })
      setMassStatusEdit('')
      setSelectedEmails([])
    }
  }

  // Sort emails function
  const getSortedEmails = () => {
    const sorted = [...data.emails].sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortBy) {
        case 'promo':
          aValue = a.promo || ''
          bValue = b.promo || ''
          break
        case 'email':
          aValue = a.email || ''
          bValue = b.email || ''
          break
        case 'status':
          aValue = getUsageStatus(a)
          bValue = getUsageStatus(b)
          break
        case 'date':
          aValue = new Date(a.timestamp || 0)
          bValue = new Date(b.timestamp || 0)
          break
        default:
          aValue = a.promo || ''
          bValue = b.promo || ''
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      } else {
        return sortOrder === 'asc'
          ? aValue - bValue
          : bValue - aValue
      }
    })
    
    return sorted
  }

  // Calculate promo summary
  const getPromoSummary = () => {
    const summary: { [key: string]: { total: number; active: number; used: number; partially: number } } = {}
    
    data.emails.forEach(email => {
      const promo = email.promo || 'Unknown'
      if (!summary[promo]) {
        summary[promo] = { total: 0, active: 0, used: 0, partially: 0 }
      }
      
      // Count all statuses for breakdown
      if (email.isUsed) {
        summary[promo].used++
      } else if (email.isPartiallyUsed) {
        summary[promo].partially++
      } else {
        summary[promo].active++
      }
    })
    
    // Set total to only active emails
    Object.keys(summary).forEach(promo => {
      summary[promo].total = summary[promo].active
    })
    
    return summary
  }

  return (
    <div className="space-y-6">
      {/* Generate Account Section */}
      <motion.div
        whileHover={{ scale: 1.015, boxShadow: '0 8px 32px 0 rgba(99,102,241,0.25)' }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Plus className="h-5 w-5 text-purple-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Generate Account
            </h2>
          </div>
          <button
            onClick={handleGenerateAccount}
            disabled={loading || data.emails.length === 0}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center disabled:opacity-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Generate 1 ({data.emails.length} emails available)
          </button>
        </div>
      </motion.div>

      {/* Main Content with Promo Summary */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Main Content - 4 columns */}
        <div className="xl:col-span-4 space-y-6">
          {/* Import Section */}
          <motion.div
            whileHover={{ scale: 1.015, boxShadow: '0 8px 32px 0 rgba(99,102,241,0.25)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center mb-6">
              <Upload className="h-5 w-5 text-indigo-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Import Accounts
              </h2>
            </div>

            <div className="space-y-4">
              {/* Import Method Selection */}
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="file"
                    checked={importMethod === 'file'}
                    onChange={(e) => setImportMethod(e.target.value as 'file' | 'json')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">File</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="json"
                    checked={importMethod === 'json'}
                    onChange={(e) => setImportMethod(e.target.value as 'file' | 'json')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">JSON Paste</span>
                </label>
              </div>

              {importMethod === 'json' ? (
                <div>
                  <textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder="Paste your JSON objects here (one per line)... or use comma-separated format: email,promo,date"
                    className="w-full h-32 p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    onClick={handleImportJSON}
                    disabled={!jsonInput.trim() || loading}
                    className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Import JSON/CSV
                  </button>
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    accept=".json,.txt,.csv"
                    onChange={handleFileImport}
                    className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900 dark:file:text-indigo-300"
                  />
                </div>
              )}
            </div>
          </motion.div>

          {/* Emails List */}
          <motion.div
            whileHover={{ scale: 1.015, boxShadow: '0 8px 32px 0 rgba(99,102,241,0.25)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-indigo-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Uber Accounts ({data.emails.length})
                </h2>
              </div>
              <div className="flex items-center space-x-4">
                {/* Sorting Controls */}
                <div className="flex items-center space-x-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'promo' | 'email' | 'status' | 'date')}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="promo">Sort by Promo</option>
                    <option value="email">Sort by Email</option>
                    <option value="status">Sort by Status</option>
                    <option value="date">Sort by Date</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Show Details
                </button>
                {selectedEmails.length > 0 && (
                  <button
                    onClick={handleMassDelete}
                    className="flex items-center px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected ({selectedEmails.length})
                  </button>
                )}
                <button
                  onClick={handleClearAll}
                  className="flex items-center px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Accounts
                </button>
              </div>
            </div>

            {/* Selection Controls */}
            <div className="mb-4 flex items-center space-x-4">
              <button
                onClick={handleSelectAll}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200"
              >
                Select All
              </button>
              <button
                onClick={handleDeselectAll}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Deselect All
              </button>
              {selectedEmails.length > 0 && (
                <div className="flex items-center space-x-2">
                  <select
                    value={massStatusEdit}
                    onChange={(e) => setMassStatusEdit(e.target.value)}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Status</option>
                    <option value="active">Active</option>
                    <option value="partially">Partially Used</option>
                    <option value="used">Used</option>
                  </select>
                  <button
                    onClick={handleMassStatusEdit}
                    disabled={!massStatusEdit}
                    className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Apply to {selectedEmails.length} Selected
                  </button>
                </div>
              )}
            </div>

            {/* Emails Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-8">
                      <input
                        type="checkbox"
                        checked={selectedEmails.length === data.emails.length && data.emails.length > 0}
                        onChange={(e) => e.target.checked ? handleSelectAll() : handleDeselectAll()}
                        className="rounded border-gray-300 dark:border-gray-700"
                      />
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/4">
                      EMAIL
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/4">
                      USE BY DATE
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/6">
                      PROMOS
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-16">
                      USAGE
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-24">
                      STATUS
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-20">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {data.emails.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                        No emails found
                      </td>
                    </tr>
                  ) : (
                    getSortedEmails().map((email) => (
                      <tr 
                        key={email.id} 
                        className={`hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-150 ${
                          selectedEmails.includes(email.id) 
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' 
                            : ''
                        }`}
                        onClick={(e) => {
                          // Prevent row click when clicking on interactive elements
                          const target = e.target as HTMLElement
                          if (
                            e.target instanceof HTMLInputElement ||
                            e.target instanceof HTMLButtonElement ||
                            e.target instanceof HTMLSelectElement ||
                            target.closest('button') ||
                            target.closest('input') ||
                            target.closest('select')
                          ) {
                            return
                          }
                          handleSelectEmail(email.id)
                        }}
                      >
                        <td className="px-3 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedEmails.includes(email.id)}
                            onChange={(e) => {
                              e.stopPropagation()
                              handleSelectEmail(email.id)
                            }}
                            className="rounded border-gray-300 dark:border-gray-700"
                          />
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {showDetails ? email.email : maskEmail(email.email)}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {email.useByDate || 'Not specified'}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {email.promo || '$25 off 1x'}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {email.usageCount || 'N/A'}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          {editingStatus === email.id ? (
                            <div className="flex items-center space-x-2">
                              <select
                                value={editingStatusValue}
                                onChange={(e) => setEditingStatusValue(e.target.value)}
                                className="px-2 py-1 border border-gray-300 dark:border-gray-700 rounded-md text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              >
                                <option value="active">Active</option>
                                <option value="partially">Partially Used</option>
                                <option value="used">Used</option>
                              </select>
                              <button
                                onClick={() => handleStatusSave(email.id)}
                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-200"
                                title="Save Status"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={handleStatusCancel}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"
                                title="Cancel Edit"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                getUsageStatusColor(email)
                              }`}>
                                {getUsageStatus(email)}
                              </span>
                              <button
                                onClick={() => handleStatusEdit(email.id)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200"
                                title="Edit Status"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            {getUsageStatus(email) === 'Active' && (
                              <button
                                onClick={() => handleUsageAction(email)}
                                className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-200"
                                title="Mark as Used"
                              >
                                <Calendar className="h-4 w-4" />
                              </button>
                            )}
                            {!email.isUsed && !email.isPartiallyUsed && (
                              <button
                                onClick={() => handleMarkAsUsed(email.id)}
                                className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-200"
                                title="Mark as Used"
                              >
                                <Calendar className="h-4 w-4" />
                              </button>
                            )}
                            {email.isUsed && (
                              <button
                                onClick={() => handleMarkAsUnused(email.id)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200"
                                title="Mark as Active"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </button>
                            )}
                            {email.isPartiallyUsed && (
                              <button
                                onClick={() => handleMarkAsUnused(email.id)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200"
                                title="Mark as Active"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteEmail(email.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"
                              title="Delete Email"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Export Section */}
          <motion.div
            whileHover={{ scale: 1.015, boxShadow: '0 8px 32px 0 rgba(99,102,241,0.25)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Download className="h-5 w-5 text-green-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Export Options
                </h2>
              </div>
              <div className="flex items-center space-x-4">
                <select 
                  value={exportSelection} 
                  onChange={(e) => setExportSelection(e.target.value as 'selected' | 'all')}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="selected">Selected Emails</option>
                  <option value="all">All Emails</option>
                </select>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {exportSelection === 'selected' ? selectedEmails.length : data.emails.length} accounts
                </div>
                <button
                  onClick={() => handleExport('json')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Export JSON
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Export CSV
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Promo Summary Sidebar - Mobile: Full width, Desktop: Sidebar */}
        <div className="xl:col-span-1">
          <motion.div
            whileHover={{ scale: 1.015, boxShadow: '0 8px 32px 0 rgba(99,102,241,0.25)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center mb-4">
              <Copy className="h-5 w-5 text-purple-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Available Promos
              </h2>
            </div>

            <div className="space-y-4">
              {Object.keys(getPromoSummary()).length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No promos found
                  </p>
                </div>
              ) : (
                Object.entries(getPromoSummary()).map(([promo, stats]) => (
                  <div key={promo} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {promo}
                      </h3>
                      <span className="text-xs font-bold text-green-600 dark:text-green-400">
                        {stats.total} available
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-green-600 dark:text-green-400">Active</span>
                        <span className="font-medium text-gray-900 dark:text-white">{stats.active}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-yellow-600 dark:text-yellow-400">Partially Used</span>
                        <span className="font-medium text-gray-900 dark:text-white">{stats.partially}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-red-600 dark:text-red-400">Used</span>
                        <span className="font-medium text-gray-900 dark:text-white">{stats.used}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 