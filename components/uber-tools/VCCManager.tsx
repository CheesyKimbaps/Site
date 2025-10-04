'use client'

import React, { useState, useEffect } from 'react'
import { CreditCard, Download, Upload, Trash2, Plus, Copy, Eye, CheckCircle, XCircle, Pencil, Link, RefreshCw, Calendar, DollarSign } from 'lucide-react'
import { UberToolsData, VCCCard, UberEmail } from '../../app/uber-tools/page'
import { motion } from 'framer-motion'

interface VCCManagerProps {
  data: UberToolsData
  onSave: (newData: Partial<UberToolsData>) => void
  loading: boolean
}

export default function VCCManager({ data, onSave, loading }: VCCManagerProps) {
  const [importMethod, setImportMethod] = useState<'file' | 'text'>('text')
  const [vccInput, setVccInput] = useState('')
  const [showDetails, setShowDetails] = useState(false)
  const [selectedCards, setSelectedCards] = useState<string[]>([])
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null)
  const [filterType, setFilterType] = useState<'all' | 'active' | 'used'>('all')
  const [editingCard, setEditingCard] = useState<string | null>(null)
  const [editingEmail, setEditingEmail] = useState('')
  const [editingStatus, setEditingStatus] = useState<string | null>(null)
  const [editingStatusValue, setEditingStatusValue] = useState<string>('')
  
  // Generate Link states
  const [selectedCardForLink, setSelectedCardForLink] = useState<VCCCard | null>(null)
  const [selectedEmailForLink, setSelectedEmailForLink] = useState<UberEmail | null>(null)
  const [uberLink, setUberLink] = useState('')
  const [linkStyle, setLinkStyle] = useState<'potato' | 'wool'>('potato')
  const [generatedLink, setGeneratedLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [showUsagePrompt, setShowUsagePrompt] = useState(false)
  const [lastUsedEmail, setLastUsedEmail] = useState<UberEmail | null>(null)
  const [lastUsedCard, setLastUsedCard] = useState<VCCCard | null>(null)

  // Persistent link state to survive re-renders
  useEffect(() => {
    const savedLink = localStorage.getItem('profit_tracker_vcc_generated_link')
    const savedLinkStyle = localStorage.getItem('profit_tracker_vcc_link_style')
    
    if (savedLink) {
      setGeneratedLink(savedLink)
      setLinkStyle((savedLinkStyle as 'potato' | 'wool') || 'potato')
    }
  }, [])

  // Save link state to localStorage whenever it changes
  useEffect(() => {
    if (generatedLink) {
      localStorage.setItem('profit_tracker_vcc_generated_link', generatedLink)
      localStorage.setItem('profit_tracker_vcc_link_style', linkStyle)
    } else {
      localStorage.removeItem('profit_tracker_vcc_generated_link')
      localStorage.removeItem('profit_tracker_vcc_link_style')
    }
  }, [generatedLink, linkStyle])

  const handleImportVCC = () => {
    try {
      const lines = vccInput.trim().split('\n').filter(line => line.trim())
      const newCards: VCCCard[] = lines.map((line, index) => {
        const parts = line.split(',').map(part => part.trim())
        
        // Handle new CSV format with headers
        if (parts.length >= 12) {
          // New format: Category,Provider,Provider Credentials,Card Description,Name on Card,Card Number,Expiration Month,Expiration Year,Card CVV,Card Type,Website,Source
          const [category, provider, providerCredentials, cardDescription, nameOnCard, cardNumber, expiryMonth, expiryYear, cvv, cardType, website, source] = parts
          
          return {
            id: Date.now().toString() + index.toString() + Math.random().toString(36).substr(2, 5),
            cardNumber: cardNumber.replace(/\s/g, ''), // Remove spaces from card number
            expiryMonth: expiryMonth?.padStart(2, '0') || '01',
            expiryYear: expiryYear || '25',
            cvv: cvv,
            zip: '07801', // Auto-set for security
            email: '', // Will be manually assigned later
            isUsed: false,
            timestamp: new Date().toISOString()
          }
        } else if (parts.length >= 4) {
          // Old format: cardNumber,expiry,cvv,zip
          const [cardNumber, expiry, cvv, zip] = parts
          // Parse expiry (assuming format like "06/27" or "06,27")
          const expiryParts = expiry.includes('/') ? expiry.split('/') : expiry.split(',')
          const expiryMonth = expiryParts[0]?.padStart(2, '0') || '01'
          const expiryYear = expiryParts[1] || '25'
          
          return {
            id: Date.now().toString() + index.toString() + Math.random().toString(36).substr(2, 5),
            cardNumber: cardNumber.replace(/\s/g, ''), // Remove spaces from card number
            expiryMonth: expiryMonth,
            expiryYear: expiryYear,
            cvv: cvv,
            zip: '07801', // Auto-set for security
            email: '', // Will be manually assigned later
            isUsed: false,
            timestamp: new Date().toISOString()
          }
        }
        return null
      }).filter(card => card !== null) as VCCCard[]
      
      // Check for duplicates
      const existingCardNumbers = new Set([
        ...data.vccCards.map(card => card.cardNumber),
        ...data.usedCards.map(card => card.cardNumber)
      ])
      
      const duplicates = newCards.filter(card => existingCardNumbers.has(card.cardNumber))
      const uniqueCards = newCards.filter(card => !existingCardNumbers.has(card.cardNumber))
      
      if (duplicates.length > 0) {
        const duplicateCount = duplicates.length
        const uniqueCount = uniqueCards.length
        const totalCount = newCards.length
        
        let message = `Import completed with duplicate detection:\n\n`
        message += `✅ ${uniqueCount} new cards added\n`
        message += `⚠️ ${duplicateCount} duplicates skipped\n`
        message += `📊 Total processed: ${totalCount} cards`
        
        if (duplicateCount > 0) {
          message += `\n\nDuplicate card numbers found:\n`
          duplicates.slice(0, 5).forEach(card => {
            message += `• ${card.cardNumber.slice(-4)} (last 4 digits)\n`
          })
          if (duplicates.length > 5) {
            message += `• ... and ${duplicates.length - 5} more\n`
          }
        }
        
        alert(message)
      } else if (uniqueCards.length > 0) {
        // Success message when all cards are unique
        alert(`✅ Import successful!\n\n${uniqueCards.length} new cards added to your VCC database.`)
      }
      
      if (uniqueCards.length > 0) {
        onSave({ vccCards: [...data.vccCards, ...uniqueCards] })
      }
      
      setVccInput('')
    } catch (error) {
      alert('Invalid VCC format. Please use the new CSV format or the old format: cardNumber,expiry,cvv,zip')
    }
  }

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const lines = content.trim().split('\n').filter(line => line.trim())
        const newCards: VCCCard[] = lines.map((line, index) => {
          const parts = line.split(',').map(part => part.trim())
          
          // Handle new CSV format with headers
          if (parts.length >= 12) {
            // New format: Category,Provider,Provider Credentials,Card Description,Name on Card,Card Number,Expiration Month,Expiration Year,Card CVV,Card Type,Website,Source
            const [category, provider, providerCredentials, cardDescription, nameOnCard, cardNumber, expiryMonth, expiryYear, cvv, cardType, website, source] = parts
            
            return {
              id: Date.now().toString() + index.toString() + Math.random().toString(36).substr(2, 5),
              cardNumber: cardNumber.replace(/\s/g, ''), // Remove spaces from card number
              expiryMonth: expiryMonth?.padStart(2, '0') || '01',
              expiryYear: expiryYear || '25',
              cvv: cvv,
              zip: '07801', // Auto-set for security
              email: '', // Will be manually assigned later
              isUsed: false,
              timestamp: new Date().toISOString()
            }
          } else if (parts.length >= 4) {
            // Old format: cardNumber,expiry,cvv,zip
            const [cardNumber, expiry, cvv, zip] = parts
            // Parse expiry (assuming format like "06/27" or "06,27")
            const expiryParts = expiry.includes('/') ? expiry.split('/') : expiry.split(',')
            const expiryMonth = expiryParts[0]?.padStart(2, '0') || '01'
            const expiryYear = expiryParts[1] || '25'
            
            return {
              id: Date.now().toString() + index.toString() + Math.random().toString(36).substr(2, 5),
              cardNumber: cardNumber.replace(/\s/g, ''), // Remove spaces from card number
              expiryMonth: expiryMonth,
              expiryYear: expiryYear,
              cvv: cvv,
              zip: '07801', // Auto-set for security
              email: '', // Will be manually assigned later
              isUsed: false,
              timestamp: new Date().toISOString()
            }
          }
          return null
        }).filter(card => card !== null) as VCCCard[]
        
        // Check for duplicates
        const existingCardNumbers = new Set([
          ...data.vccCards.map(card => card.cardNumber),
          ...data.usedCards.map(card => card.cardNumber)
        ])
        
        const duplicates = newCards.filter(card => existingCardNumbers.has(card.cardNumber))
        const uniqueCards = newCards.filter(card => !existingCardNumbers.has(card.cardNumber))
        
        if (duplicates.length > 0) {
          const duplicateCount = duplicates.length
          const uniqueCount = uniqueCards.length
          const totalCount = newCards.length
          
          let message = `Import completed with duplicate detection:\n\n`
          message += `✅ ${uniqueCount} new cards added\n`
          message += `⚠️ ${duplicateCount} duplicates skipped\n`
          message += `📊 Total processed: ${totalCount} cards`
          
          if (duplicateCount > 0) {
            message += `\n\nDuplicate card numbers found:\n`
            duplicates.slice(0, 5).forEach(card => {
              message += `• ${card.cardNumber.slice(-4)} (last 4 digits)\n`
            })
            if (duplicates.length > 5) {
              message += `• ... and ${duplicates.length - 5} more\n`
            }
          }
          
          alert(message)
        } else if (uniqueCards.length > 0) {
          // Success message when all cards are unique
          alert(`✅ Import successful!\n\n${uniqueCards.length} new cards added to your VCC database.`)
        }
        
        if (uniqueCards.length > 0) {
          onSave({ vccCards: [...data.vccCards, ...uniqueCards] })
        }
      } catch (error) {
        alert('Invalid file format. Please use the new CSV format or the old format: cardNumber,expiry,cvv,zip')
      }
    }
    reader.readAsText(file)
  }

  const handleAssignEmail = (cardId: string) => {
    const card = data.vccCards.find(c => c.id === cardId)
    if (!card) return

    const updatedCard: VCCCard = {
      ...card,
      email: editingEmail
    }

    const updatedCards = data.vccCards.map(c => c.id === cardId ? updatedCard : c)
    onSave({ vccCards: updatedCards })
    setEditingCard(null)
    setEditingEmail('')
  }

  const handleStartEditEmail = (card: VCCCard) => {
    setEditingCard(card.id)
    setEditingEmail(card.email)
  }

  const handleCancelEdit = () => {
    setEditingCard(null)
    setEditingEmail('')
  }

  const handleStatusEdit = (cardId: string) => {
    const card = data.vccCards.find(c => c.id === cardId) || data.usedCards.find(c => c.id === cardId)
    if (!card) return
    
    setEditingStatus(cardId)
    if (card.isUsed) {
      setEditingStatusValue('used')
    } else if (card.isPartiallyUsed) {
      setEditingStatusValue('partially')
    } else {
      setEditingStatusValue('active')
    }
  }

  const handleStatusSave = (cardId: string) => {
    const card = data.vccCards.find(c => c.id === cardId) || data.usedCards.find(c => c.id === cardId)
    if (!card) return

    const newStatus = editingStatusValue
    const updatedCard = {
      ...card,
      isUsed: newStatus === 'used',
      isPartiallyUsed: newStatus === 'partially',
      usedDate: newStatus === 'active' ? undefined : (card.usedDate || new Date().toISOString())
    }

    if (newStatus === 'active') {
      // Move back to active cards
      const updatedVccCards = [...data.vccCards, updatedCard]
      const updatedUsedCards = data.usedCards.filter(c => c.id !== cardId)
      onSave({ vccCards: updatedVccCards, usedCards: updatedUsedCards })
    } else {
      // Move to used cards
      const updatedVccCards = data.vccCards.filter(c => c.id !== cardId)
      const updatedUsedCards = [...data.usedCards.filter(c => c.id !== cardId), updatedCard]
      onSave({ vccCards: updatedVccCards, usedCards: updatedUsedCards })
    }
    
    setEditingStatus(null)
    setEditingStatusValue('')
  }

  const handleStatusCancel = () => {
    setEditingStatus(null)
    setEditingStatusValue('')
  }

  const handleMarkAsUsed = (cardId: string) => {
    const card = data.vccCards.find(c => c.id === cardId)
    if (!card) return

    const updatedCard: VCCCard = {
      ...card,
      isUsed: true,
      usedDate: new Date().toISOString()
    }

    const updatedCards = data.vccCards.filter(c => c.id !== cardId)
    const updatedUsedCards = [...data.usedCards, updatedCard]

    onSave({ 
      vccCards: updatedCards,
      usedCards: updatedUsedCards
    })
  }

  const handleDeleteCard = (cardId: string, isUsed: boolean = false) => {
    if (isUsed) {
      onSave({ usedCards: data.usedCards.filter(card => card.id !== cardId) })
    } else {
      onSave({ vccCards: data.vccCards.filter(card => card.id !== cardId) })
    }
  }

  const handleSelectCard = (id: string) => {
    setSelectedCards(prev => 
      prev.includes(id) 
        ? prev.filter(cardId => cardId !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    const currentCards = filterType === 'used' ? data.usedCards : data.vccCards
    setSelectedCards(currentCards.map(card => card.id))
    setLastSelectedIndex(null)
  }

  const handleDeselectAll = () => {
    setSelectedCards([])
    setLastSelectedIndex(null)
  }

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all VCC cards?')) {
      onSave({ vccCards: [] })
    }
  }

  // Generate Link functions
  const handleGenerateLink = () => {
    if (!selectedCardForLink || !selectedEmailForLink || !uberLink) {
      alert('Please select a card, email, and enter the Uber link')
      return
    }

    // Format the year to 2 digits (e.g., 2027 -> 27, 2030 -> 30)
    const formatYear = (year: string) => {
      if (year.length === 4) {
        return year.slice(-2) // Get last 2 digits
      }
      return year // Already 2 digits
    }

    // Generate link based on style
    let generatedLinkText = ''
    if (linkStyle === 'potato') {
      generatedLinkText = `${uberLink},${selectedCardForLink.cardNumber},${selectedCardForLink.expiryMonth},${formatYear(selectedCardForLink.expiryYear)},${selectedCardForLink.cvv},${selectedCardForLink.zip}`
    } else {
      generatedLinkText = `${uberLink},${selectedCardForLink.cardNumber},${selectedCardForLink.expiryMonth}/${formatYear(selectedCardForLink.expiryYear)},${selectedCardForLink.cvv},${selectedCardForLink.zip},${selectedEmailForLink.email}`
    }

    setGeneratedLink(generatedLinkText)
    
    // Show usage prompt
    setLastUsedEmail(selectedEmailForLink)
    setLastUsedCard(selectedCardForLink)
    setShowUsagePrompt(true)
  }

  const handleUsageAction = (action: 'used' | 'partially' | 'skip') => {
    if (!lastUsedEmail || !lastUsedCard) return

    // Close the usage prompt first
    setShowUsagePrompt(false)

    if (action === 'used') {
      // Mark email as used
      const updatedEmails = data.emails.map(email => 
        email.id === lastUsedEmail.id 
          ? { ...email, isUsed: true, usedDate: new Date().toISOString() }
          : email
      )
      
      // Move card to usedCards array and remove from vccCards
      const updatedVccCards = data.vccCards.filter(card => card.id !== lastUsedCard.id)
      const updatedUsedCards = [...data.usedCards, { ...lastUsedCard, isUsed: true, usedDate: new Date().toISOString() }]

      // Save the data
      onSave({ emails: updatedEmails, vccCards: updatedVccCards, usedCards: updatedUsedCards })
      
    } else if (action === 'partially') {
      // Mark email as partially used
      const updatedEmails = data.emails.map(email => 
        email.id === lastUsedEmail.id 
          ? { ...email, isPartiallyUsed: true, usedDate: new Date().toISOString() }
          : email
      )
      
      // Move card to usedCards array and remove from vccCards
      const updatedVccCards = data.vccCards.filter(card => card.id !== lastUsedCard.id)
      const updatedUsedCards = [...data.usedCards, { ...lastUsedCard, isPartiallyUsed: true, usedDate: new Date().toISOString() }]

      // Save the data
      onSave({ emails: updatedEmails, vccCards: updatedVccCards, usedCards: updatedUsedCards })
    }
    // Skip action - no changes needed

    // Clear the usage tracking state
    setLastUsedEmail(null)
    setLastUsedCard(null)
    
    // Note: Link state is automatically preserved through localStorage
  }

  const handleCopyLink = async () => {
    if (generatedLink) {
      try {
        await navigator.clipboard.writeText(generatedLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        console.error('Failed to copy link:', error)
      }
    }
  }

  const maskCardNumber = (cardNumber: string) => {
    return cardNumber.replace(/(\d{4})(\d{8})(\d{4})/, '$1********$3')
  }

  const maskEmail = (email: string) => {
    const [local, domain] = email.split('@')
    if (local.length <= 2) return email
    return `${local[0]}***${local[local.length - 1]}@${domain}`
  }

  const getFilteredCards = () => {
    switch (filterType) {
      case 'active':
        return data.vccCards.filter(card => !card.isUsed)
      case 'used':
        return data.usedCards
      default:
        return [...data.vccCards, ...data.usedCards]
    }
  }

  const getDailyUsage = () => {
    const today = new Date().toDateString()
    return data.usedCards.filter(card => 
      card.usedDate && new Date(card.usedDate).toDateString() === today
    ).length
  }

  const filteredCards = getFilteredCards()

  // Row selection with Shift-click support
  const handleRowSelection = (e: React.MouseEvent<HTMLElement>, index: number, id: string) => {
    if (e.shiftKey && lastSelectedIndex !== null) {
      const start = Math.min(lastSelectedIndex, index)
      const end = Math.max(lastSelectedIndex, index)
      const rangeIds = filteredCards.slice(start, end + 1).map(c => c.id)
      const isSelecting = !selectedCards.includes(id)

      setSelectedCards(prev => {
        if (isSelecting) {
          const set = new Set(prev)
          rangeIds.forEach(rid => set.add(rid))
          return Array.from(set)
        } else {
          return prev.filter(rid => !rangeIds.includes(rid))
        }
      })
    } else {
      setSelectedCards(prev => 
        prev.includes(id) 
          ? prev.filter(cardId => cardId !== id)
          : [...prev, id]
      )
    }
    setLastSelectedIndex(index)
  }

  const handleExport = (format: 'json' | 'csv') => {
    const cardsToExport = selectedCards.length > 0 
      ? filteredCards.filter(card => selectedCards.includes(card.id))
      : filteredCards

    if (format === 'json') {
      const dataStr = JSON.stringify(cardsToExport, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `vcc-cards-${new Date().toISOString().split('T')[0]}.json`
      link.click()
    } else {
      const csvHeaders = 'CardNumber,Expiry,CVV,ZIP,Email,Status,UsedDate\n'
      const csvData = cardsToExport.map(card => 
        `${card.cardNumber},${card.expiryMonth}/${card.expiryYear},${card.cvv},${card.zip},${card.email || ''},${card.isUsed ? 'Used' : 'Active'},${card.usedDate || ''}`
      ).join('\n')
      
      const csvBlob = new Blob([csvHeaders + csvData], { type: 'text/csv' })
      const url = URL.createObjectURL(csvBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `vcc-cards-${new Date().toISOString().split('T')[0]}.csv`
      link.click()
    }
  }

  const handleMassDelete = () => {
    if (selectedCards.length === 0) {
      alert('Please select cards to delete')
      return
    }
    
    if (confirm(`Are you sure you want to delete ${selectedCards.length} selected cards?`)) {
      const cardsToDelete = filteredCards.filter(card => selectedCards.includes(card.id))
      const usedCardsToDelete = cardsToDelete.filter(card => card.isUsed)
      const activeCardsToDelete = cardsToDelete.filter(card => !card.isUsed)
      
      const updatedVccCards = data.vccCards.filter(card => !activeCardsToDelete.some(d => d.id === card.id))
      const updatedUsedCards = data.usedCards.filter(card => !usedCardsToDelete.some(d => d.id === card.id))
      
      onSave({ 
        vccCards: updatedVccCards,
        usedCards: updatedUsedCards
      })
      setSelectedCards([])
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-800"
        >
          <div className="flex items-center">
            <CreditCard className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Cards</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.vccCards.length + data.usedCards.length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-800"
        >
          <div className="flex items-center">
            <RefreshCw className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Cards</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.vccCards.length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-800"
        >
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Used Cards</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.usedCards.length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-800"
        >
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Today's Usage</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {getDailyUsage()}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Import VCC Section */}
      <motion.div
        whileHover={{ scale: 1.015, boxShadow: '0 8px 32px 0 rgba(99,102,241,0.25)' }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center mb-6">
          <Upload className="h-5 w-5 text-purple-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Import VCC Cards
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
                onChange={(e) => setImportMethod(e.target.value as 'file' | 'text')}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">File</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="text"
                checked={importMethod === 'text'}
                onChange={(e) => setImportMethod(e.target.value as 'file' | 'text')}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Paste</span>
            </label>
          </div>

          {/* Format Info */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <strong>New CSV Format:</strong> Supports the full CSV format with all fields. ZIP code is automatically set to 07801 for security. 
              <br />
              <strong>Format:</strong> Category,Provider,Provider Credentials,Card Description,Name on Card,Card Number,Expiration Month,Expiration Year,Card CVV,Card Type,Website,Source
            </div>
          </div>

          {importMethod === 'text' ? (
            <div>
              <textarea
                value={vccInput}
                onChange={(e) => setVccInput(e.target.value)}
                placeholder="Paste your VCC list here (one per line): Category,Provider,Provider Credentials,Card Description,Name on Card,Card Number,Expiration Month,Expiration Year,Card CVV,Card Type,Website,Source"
                className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                onClick={handleImportVCC}
                disabled={!vccInput.trim() || loading}
                className="mt-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                Import VCC Cards
              </button>
            </div>
          ) : (
            <div>
              <input
                type="file"
                accept=".txt,.csv"
                onChange={handleFileImport}
                className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900 dark:file:text-indigo-300"
              />
            </div>
          )}
        </div>
      </motion.div>

      {/* Generate Link Section */}
      <motion.div
        whileHover={{ scale: 1.015, boxShadow: '0 8px 32px 0 rgba(99,102,241,0.25)' }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link className="h-5 w-5 text-green-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Reuse Cards & Emails
            </h2>
          </div>
        </div>

        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Reuse Feature:</strong> Generate links using previously used cards and emails. This allows you to reuse them for additional orders.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Selection */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Used Card for Reuse:
            </label>
            <select
              value={selectedCardForLink?.id || ''}
              onChange={(e) => {
                const card = data.usedCards.find(c => c.id === e.target.value)
                setSelectedCardForLink(card || null)
                
                // Auto-select corresponding email if card has an email assigned
                if (card && card.email) {
                  const correspondingEmail = data.emails.find(em => em.email === card.email)
                  if (correspondingEmail) {
                    setSelectedEmailForLink(correspondingEmail)
                  }
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">-- Select a used card --</option>
              {data.usedCards.map((card) => (
                <option key={card.id} value={card.id}>
                  {maskCardNumber(card.cardNumber)} - {card.expiryMonth}/{card.expiryYear} {card.email ? `(${maskEmail(card.email)})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Email Selection */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Used Email for Reuse:
            </label>
            <select
              value={selectedEmailForLink?.id || ''}
              onChange={(e) => {
                const email = data.emails.find(em => em.id === e.target.value)
                setSelectedEmailForLink(email || null)
                
                // Auto-select corresponding card if email is linked to a card
                if (email) {
                  const correspondingCard = data.usedCards.find(card => card.email === email.email)
                  if (correspondingCard) {
                    setSelectedCardForLink(correspondingCard)
                  }
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">-- Select a used email --</option>
              {data.emails.filter(email => email.isUsed || email.isPartiallyUsed).map((email) => (
                <option key={email.id} value={email.id}>
                  {maskEmail(email.email)} - {email.promo} ({email.isPartiallyUsed ? 'Partially Used' : 'Used'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Uber Link Input */}
        <div className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Uber Group Order Link:
          </label>
          <input
            type="url"
            value={uberLink}
            onChange={(e) => setUberLink(e.target.value)}
            placeholder="https://eats.uber.com/group-orders/7283438c-0207-48af-a4c5-179ca1d55ffb/join"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Link Style Selection */}
        <div className="mt-4 flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="potato"
              checked={linkStyle === 'potato'}
              onChange={(e) => setLinkStyle(e.target.value as 'potato' | 'wool')}
              className="mr-2"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Potato Style</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="wool"
              checked={linkStyle === 'wool'}
              onChange={(e) => setLinkStyle(e.target.value as 'potato' | 'wool')}
              className="mr-2"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Wool Style</span>
          </label>
        </div>

        {/* Generate Button */}
        <div className="mt-6">
          <button
            onClick={handleGenerateLink}
            disabled={!selectedCardForLink || !selectedEmailForLink || !uberLink.trim() || loading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center"
          >
            <Link className="h-4 w-4 mr-2" />
            Generate Link
          </button>
        </div>

        {/* Generated Link Display */}
        {generatedLink && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Generated Link ({linkStyle} style):
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyLink}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors flex items-center ${
                    copied
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-600 hover:bg-gray-700 text-white'
                  }`}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={() => {
                    setGeneratedLink('')
                    setUberLink('')
                    localStorage.removeItem('profit_tracker_vcc_generated_link')
                    localStorage.removeItem('profit_tracker_vcc_link_style')
                  }}
                  className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Clear Link
                </button>
              </div>
            </div>
            <div className="font-mono text-sm text-gray-900 dark:text-white break-all">
              {generatedLink}
            </div>
            
            {/* Email Copy Section for Potato Style */}
            {linkStyle === 'potato' && lastUsedEmail && (
              <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">
                    📧 Email for Potato Style (not included in link)
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={async () => {
                        try {
                          const combinedText = `${generatedLink}\n\nEmail: ${lastUsedEmail.email}\nPromo: ${lastUsedEmail.promo}`
                          await navigator.clipboard.writeText(combinedText)
                        } catch (error) {
                          console.error('Failed to copy link and email:', error)
                        }
                      }}
                      className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy Link + Email
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(lastUsedEmail.email)
                        } catch (error) {
                          console.error('Failed to copy email:', error)
                        }
                      }}
                      className="px-3 py-1 text-sm bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors flex items-center"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy Email
                    </button>
                  </div>
                </div>
                <div className="font-mono text-sm text-yellow-800 dark:text-yellow-200 break-all">
                  {lastUsedEmail.email}
                </div>
                <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  Promo: {lastUsedEmail.promo}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Cards List */}
      <motion.div
        whileHover={{ scale: 1.015, boxShadow: '0 8px 32px 0 rgba(99,102,241,0.25)' }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <CreditCard className="h-5 w-5 text-indigo-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              VCC Cards ({filteredCards.length})
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'active' | 'used')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Cards</option>
              <option value="active">Active Cards</option>
              <option value="used">Used Cards</option>
            </select>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Eye className="h-4 w-4 mr-2" />
              Show Details
            </button>
            {selectedCards.length > 0 && (
              <button
                onClick={handleMassDelete}
                className="flex items-center px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedCards.length})
              </button>
            )}
            <button
              onClick={handleClearAll}
              className="flex items-center px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Cards
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
        </div>

        {/* Cards Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedCards.length === filteredCards.length && filteredCards.length > 0}
                    onChange={(e) => e.target.checked ? handleSelectAll() : handleDeselectAll()}
                    className="rounded border-gray-300 dark:border-gray-700"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  CARD NUMBER
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  EXPIRY
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  CVV
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  ZIP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  EMAIL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  STATUS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {filteredCards.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No cards found
                  </td>
                </tr>
              ) : (
                filteredCards.map((card, index) => (
                  <tr 
                    key={card.id} 
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-150 ${
                      selectedCards.includes(card.id) 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' 
                        : ''
                    }`}
                    onClick={(e) => {
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
                      handleRowSelection(e, index, card.id)
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedCards.includes(card.id)}
                        onClick={(e) => { e.stopPropagation(); handleRowSelection(e as unknown as React.MouseEvent<HTMLElement>, index, card.id) }}
                        className="rounded border-gray-300 dark:border-gray-700"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {showDetails ? card.cardNumber : maskCardNumber(card.cardNumber)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {card.expiryMonth}/{card.expiryYear}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {showDetails ? card.cvv : '***'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {card.zip}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {editingCard === card.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={editingEmail}
                            onChange={(e) => setEditingEmail(e.target.value)}
                            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                          />
                          <button
                            onClick={() => handleAssignEmail(card.id)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-200"
                            title="Save Email"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"
                            title="Cancel Edit"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span>{card.email || 'Not assigned'}</span>
                          <button
                            onClick={() => handleStartEditEmail(card)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200"
                            title="Edit Email"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingStatus === card.id ? (
                        <div className="flex items-center space-x-2">
                          <select
                            value={editingStatusValue}
                            onChange={(e) => setEditingStatusValue(e.target.value)}
                            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-xs"
                          >
                            <option value="active">Active</option>
                            <option value="partially">Partially Used</option>
                            <option value="used">Used</option>
                          </select>
                          <button
                            onClick={() => handleStatusSave(card.id)}
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
                            card.isUsed
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : card.isPartiallyUsed
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }`}>
                            {card.isUsed ? 'Used' : card.isPartiallyUsed ? 'Partially Used' : 'Active'}
                          </span>
                          <button
                            onClick={() => handleStatusEdit(card.id)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200"
                            title="Edit Status"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        {!card.isUsed && (
                          <button
                            onClick={() => handleMarkAsUsed(card.id)}
                            className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-200"
                            title="Mark as Used"
                          >
                            <Calendar className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteCard(card.id, card.isUsed)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"
                          title="Delete Card"
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

      {/* Usage Prompt Modal */}
      {showUsagePrompt && lastUsedEmail && lastUsedCard && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Mark Usage
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Would you like to mark the email and card as used?
            </p>
            <div className="space-y-2 mb-4">
              <div className="text-sm">
                <strong>Email:</strong> {maskEmail(lastUsedEmail.email)}
              </div>
              <div className="text-sm">
                <strong>Card:</strong> {maskCardNumber(lastUsedCard.cardNumber)}
              </div>
              <div className="text-sm">
                <strong>Usage:</strong> {lastUsedEmail.usageCount || 'N/A'}
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleUsageAction('used')}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Mark as Used
              </button>
              {lastUsedEmail.usageCount === '2x' && (
                <button
                  onClick={() => handleUsageAction('partially')}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Partially Used
                </button>
              )}
              <button
                onClick={() => handleUsageAction('skip')}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Skip
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

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
            <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option>JSON Format</option>
              <option>CSV Format</option>
            </select>
            <input
              type="number"
              value={selectedCards.length || filteredCards.length}
              onChange={() => {}} // Add empty onChange to prevent warning
              className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              onClick={() => handleExport('json')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Export ({selectedCards.length || filteredCards.length} cards)
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 