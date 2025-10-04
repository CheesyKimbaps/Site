'use client'

import React, { useState, useEffect, useRef } from 'react'
import { CreditCard, Mail, Link, Copy, Eye, Calendar, RefreshCw, Trash2 } from 'lucide-react'
import { UberToolsData, UberEmail, VCCCard } from '../../app/uber-tools/page'
import { motion } from 'framer-motion'

interface LinkGeneratorProps {
  data: UberToolsData
  onSave: (newData: Partial<UberToolsData>) => void
  loading: boolean
  generatedLink: string
  setGeneratedLink: (link: string) => void
  generatedAt: string
  setGeneratedAt: (time: string) => void
  showUsagePrompt: boolean
  setShowUsagePrompt: (show: boolean) => void
  lastUsedEmail: UberEmail | null
  setLastUsedEmail: (email: UberEmail | null) => void
  lastUsedCard: VCCCard | null
  setLastUsedCard: (card: VCCCard | null) => void
}

export default function LinkGenerator({ 
  data, 
  onSave, 
  loading,
  generatedLink,
  setGeneratedLink,
  generatedAt,
  setGeneratedAt,
  showUsagePrompt,
  setShowUsagePrompt,
  lastUsedEmail,
  setLastUsedEmail,
  lastUsedCard,
  setLastUsedCard
}: LinkGeneratorProps) {
  const [selectedCard, setSelectedCard] = useState<VCCCard | null>(null)
  const [selectedEmail, setSelectedEmail] = useState<string>('')
  const [tempEmailSelection, setTempEmailSelection] = useState<string>('')
  const [uberLink, setUberLink] = useState('')
  const [linkStyle, setLinkStyle] = useState<'potato' | 'wool'>('potato')
  const [copied, setCopied] = useState(false)
  const [showCardDetails, setShowCardDetails] = useState(false)
  const [showEmailDetails, setShowEmailDetails] = useState(false)
  const [selectedEmailForLink, setSelectedEmailForLink] = useState<UberEmail | null>(null)
  const [activeTab, setActiveTab] = useState<'generator' | 'history'>('generator')
  
  // Reuse Cards & Emails state variables
  const [selectedCardForReuse, setSelectedCardForReuse] = useState<VCCCard | null>(null)
  const [selectedEmailForReuse, setSelectedEmailForReuse] = useState<UberEmail | null>(null)
  const [reuseUberLink, setReuseUberLink] = useState('')
  const [reuseLinkStyle, setReuseLinkStyle] = useState<'potato' | 'wool'>('potato')
  const [reuseGeneratedLink, setReuseGeneratedLink] = useState('')
  const [reuseCopied, setReuseCopied] = useState(false)

  // Refs for reliable scroll and focus
  const linkInputSectionRef = useRef<HTMLDivElement | null>(null)
  const linkInputRef = useRef<HTMLInputElement | null>(null)
  const generatedSectionRef = useRef<HTMLDivElement | null>(null)
  const copyButtonRef = useRef<HTMLButtonElement | null>(null)

  // Persistent link state to survive re-renders
  useEffect(() => {
    // No longer using localStorage - links are stored in database
  }, [])

  // Save link state to localStorage whenever it changes
  useEffect(() => {
    // No longer using localStorage - links are stored in database
  }, [generatedLink, linkStyle, generatedAt, selectedEmailForLink])

  // Enhanced auto-selection logic to handle partially used emails
  useEffect(() => {
    // Find cards with emails (including partially used)
    const cardsWithEmails = data.vccCards.filter(card => {
      if (card.isUsed || !card.email) return false
      
      const correspondingEmail = data.emails.find(em => em.email === card.email)
      // Include cards with unused or partially used emails
      return correspondingEmail && !correspondingEmail.isUsed
    })
    
    if (cardsWithEmails.length > 0 && !selectedCard) {
      const firstCard = cardsWithEmails[0]
      setSelectedCard(firstCard)
      setSelectedEmail(firstCard.email)
      setTempEmailSelection(firstCard.email)
      
      // Auto-select corresponding email object for link generation
      const correspondingEmail = data.emails.find(em => em.email === firstCard.email)
      if (correspondingEmail) {
        setSelectedEmailForLink(correspondingEmail)
      }
    }
  }, [data.vccCards, selectedCard, data.emails])

  // Enhanced card selection logic to handle partially used emails
  const handleCardSelect = (card: VCCCard) => {
    setSelectedCard(card)
    setSelectedEmail(card.email || '')
    setTempEmailSelection(card.email || '')
    
    // Auto-select corresponding email if card has an email assigned
    if (card.email) {
      const correspondingEmail = data.emails.find(em => em.email === card.email)
      if (correspondingEmail) {
        setSelectedEmailForLink(correspondingEmail)
        
        // If the email is partially used, we can skip the email assignment step
        // and go directly to the Uber link input
        if (correspondingEmail.isPartiallyUsed) {
          // Auto-scroll to Uber link input section after a short delay
          setTimeout(() => {
            const linkInputSection = linkInputSectionRef.current
            if (linkInputSection) {
              linkInputSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
              })
              
              // Add a brief highlight effect
              linkInputSection.classList.add('ring-2', 'ring-indigo-500', 'ring-opacity-50')
              setTimeout(() => {
                linkInputSection.classList.remove('ring-2', 'ring-indigo-500', 'ring-opacity-50')
              }, 2000)

              // Auto-focus the Uber link input field
              const linkInput = linkInputRef.current
              if (linkInput) {
                setTimeout(() => {
                  linkInput.focus()
                }, 300)
              }
            }
          }, 100)
          return // Skip the email assignment section scroll
        }
      } else {
        setSelectedEmailForLink(null)
      }
    } else {
      setSelectedEmailForLink(null)
    }

    // Auto-scroll to email assignment section after a short delay
    setTimeout(() => {
      const emailSection = document.getElementById('email-assignment-section')
      if (emailSection) {
        emailSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        })
        
        // Add a brief highlight effect
        emailSection.classList.add('ring-2', 'ring-indigo-500', 'ring-opacity-50')
        setTimeout(() => {
          emailSection.classList.remove('ring-2', 'ring-indigo-500', 'ring-opacity-50')
        }, 2000)
      }
    }, 100)
  }

  const handleAssignEmail = async () => {
    if (!selectedCard || !tempEmailSelection) {
      return
    }

    // Update the card with the new email
    const updatedCard = { ...selectedCard, email: tempEmailSelection }
    setSelectedCard(updatedCard)
    setSelectedEmail(tempEmailSelection)
    
    // Auto-select corresponding email object for link generation
    const correspondingEmail = data.emails.find(em => em.email === tempEmailSelection)
    if (correspondingEmail) {
      setSelectedEmailForLink(correspondingEmail)
    } else {
      setSelectedEmailForLink(null)
    }
    
    // Update the card in the database
    const updatedCards = data.vccCards.map(c => 
      c.id === selectedCard.id ? updatedCard : c
    )
    await Promise.resolve(onSave({ vccCards: updatedCards }))

    // After save completes and UI settles, scroll to the Uber link input section and focus
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

    const linkInputSection = linkInputSectionRef.current
    if (linkInputSection) {
      linkInputSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      })
      
      // Add a brief highlight effect
      linkInputSection.classList.add('ring-2', 'ring-indigo-500', 'ring-opacity-50')
      setTimeout(() => {
        linkInputSection.classList.remove('ring-2', 'ring-indigo-500', 'ring-opacity-50')
      }, 2000)

      // Auto-focus the Uber link input field
      const linkInput = linkInputRef.current
      if (linkInput) {
        setTimeout(() => {
          linkInput.focus()
        }, 300)
      }
    }
  }

  const handleGenerateLink = async (styleOverride?: 'potato' | 'wool') => {
    if (!selectedCard || !uberLink.trim()) {
      return
    }

    // Determine the style up-front to decide validations
    const effectiveStyle = styleOverride ?? linkStyle

    // Find the corresponding email object (fallback to the card's email string or selectedEmailForLink)
    const lookupEmail = selectedCard.email || selectedEmailForLink?.email || ''
    const correspondingEmail = data.emails.find(em => em.email === lookupEmail) || null
    const emailStr = selectedCard.email || correspondingEmail?.email || selectedEmailForLink?.email || ''

    // Format the year to 2 digits (e.g., 2027 -> 27, 2030 -> 30)
    const formatYear = (year: string) => {
      if (year.length === 4) {
        return year.slice(-2) // Get last 2 digits
      }
      return year // Already 2 digits
    }

    // For wool style, require an email; for potato, email is not required
    if (effectiveStyle === 'wool' && !emailStr) {
      // Can't generate a wool-style link without an email
      return
    }

    // Sanitize base link to avoid double query strings
    const baseLink = uberLink.split('?')[0]

    // Generate link based on style
    let generatedLinkText = ''
    if (effectiveStyle === 'potato') {
      generatedLinkText = `${baseLink}?source=quickActionCopy,${selectedCard.cardNumber},${selectedCard.expiryMonth},${formatYear(selectedCard.expiryYear)},${selectedCard.cvv},${selectedCard.zip}`
    } else {
      generatedLinkText = `${baseLink}?source=quickActionCopy,${selectedCard.cardNumber},${selectedCard.expiryMonth}/${formatYear(selectedCard.expiryYear)},${selectedCard.cvv},${selectedCard.zip},${emailStr}`
    }

    // Set local state immediately for better UX
    setGeneratedLink(generatedLinkText)
    setGeneratedAt(new Date().toLocaleTimeString())

    // Show usage prompt immediately
    if (correspondingEmail) setLastUsedEmail(correspondingEmail)
    else if (selectedEmailForLink) setLastUsedEmail(selectedEmailForLink)
    setLastUsedCard(selectedCard)
    setShowUsagePrompt(true)

    // Create the new generated link object
    const newGeneratedLink = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      uberLink: uberLink,
      generatedLink: generatedLinkText,
      cardNumber: selectedCard.cardNumber,
      email: emailStr,
      linkStyle: effectiveStyle,
      generatedAt: new Date().toISOString()
    }
    
    // Save to database in the background
    try {
      await onSave({ 
        linkHistory: [...data.linkHistory, newGeneratedLink]
      })
    } catch (error) {
      console.error('Failed to save generated link:', error)
    }

    // After render, scroll to generated section and focus Copy button
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const sectionEl = generatedSectionRef.current
        if (sectionEl) {
          sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
          sectionEl.classList.add('ring-2', 'ring-emerald-500', 'ring-opacity-50')
          setTimeout(() => {
            sectionEl.classList.remove('ring-2', 'ring-emerald-500', 'ring-opacity-50')
          }, 1200)
        }
        copyButtonRef.current?.focus()
      })
    })
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
      // Mark email as partially used and keep the card available for a second use
      const updatedEmails = data.emails.map(email => 
        email.id === lastUsedEmail.id 
          ? { ...email, isPartiallyUsed: true, usedDate: new Date().toISOString() }
          : email
      )
      
      // Keep the card in vccCards but mark it as partially used
      const updatedVccCards = data.vccCards.map(card =>
        card.id === lastUsedCard.id
          ? { ...card, isPartiallyUsed: true, usedDate: new Date().toISOString() }
          : card
      )

      // Do not move to usedCards yet; it still has 1x use left
      onSave({ emails: updatedEmails, vccCards: updatedVccCards })
    }
    // Skip action - no changes needed

    // Clear the usage tracking state
    setLastUsedEmail(null)
    setLastUsedCard(null)
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

  // Reuse Cards & Emails functions
  const handleReuseGenerateLink = () => {
    if (!selectedCardForReuse || !selectedEmailForReuse || !reuseUberLink) {
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
    if (reuseLinkStyle === 'potato') {
      generatedLinkText = `${reuseUberLink}?source=quickActionCopy,${selectedCardForReuse.cardNumber},${selectedCardForReuse.expiryMonth},${formatYear(selectedCardForReuse.expiryYear)},${selectedCardForReuse.cvv},${selectedCardForReuse.zip}`
    } else {
      generatedLinkText = `${reuseUberLink}?source=quickActionCopy,${selectedCardForReuse.cardNumber},${selectedCardForReuse.expiryMonth}/${formatYear(selectedCardForReuse.expiryYear)},${selectedCardForReuse.cvv},${selectedCardForReuse.zip},${selectedEmailForReuse.email}`
    }

    setReuseGeneratedLink(generatedLinkText)
  }

  const handleReuseCopyLink = async () => {
    if (reuseGeneratedLink) {
      try {
        await navigator.clipboard.writeText(reuseGeneratedLink)
        setReuseCopied(true)
        setTimeout(() => setReuseCopied(false), 2000)
      } catch (error) {
        console.error('Failed to copy link:', error)
      }
    }
  }

  const handleSwapStyle = () => {
    const newStyle: 'potato' | 'wool' = linkStyle === 'potato' ? 'wool' : 'potato'
    setLinkStyle(newStyle)
    // Always regenerate the actual generated link using the canonical generator
    handleGenerateLink(newStyle)
  }

  // Enhanced available cards logic to include cards linked to partially used emails
  const availableCards = data.vccCards.filter(card => {
    // Include cards that are not used
    if (card.isUsed) return false
    
    // If card has an email assigned, check if that email is partially used
    if (card.email) {
      const correspondingEmail = data.emails.find(em => em.email === card.email)
      if (correspondingEmail && correspondingEmail.isPartiallyUsed) {
        // Include cards linked to partially used emails
        return true
      }
    }
    
    // Include cards without emails or with unused emails
    return true
  }).sort((a, b) => {
    // Bubble partially used cards (or cards linked to partially used emails) to the top for easy reuse
    const aEmailPartial = a.email ? (data.emails.find(em => em.email === a.email)?.isPartiallyUsed ? 1 : 0) : 0
    const bEmailPartial = b.email ? (data.emails.find(em => em.email === b.email)?.isPartiallyUsed ? 1 : 0) : 0
    const aPartial = (a.isPartiallyUsed ? 1 : 0) || aEmailPartial
    const bPartial = (b.isPartiallyUsed ? 1 : 0) || bEmailPartial
    return bPartial - aPartial
  })
  
  // Enhanced available emails logic to include partially used emails
  const availableEmails = data.emails.filter(email => !email.isUsed)

  const maskCardNumber = (cardNumber: string) => {
    return cardNumber.replace(/(\d{4})(\d{8})(\d{4})/, '$1********$3')
  }

  const maskEmail = (email: string) => {
    const [local, domain] = email.split('@')
    if (local.length <= 2) return email
    return `${local[0]}***${local[local.length - 1]}@${domain}`
  }

  const formatYear = (year: string) => {
    if (year.length === 4) {
      return year.slice(-2) // Get last 2 digits
    }
    return year // Already 2 digits
  }

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      <motion.div
        whileHover={{ scale: 1.015, boxShadow: '0 8px 32px 0 rgba(99,102,241,0.25)' }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center mb-4">
          <Link className="h-5 w-5 text-indigo-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Link Generator Stats
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <CreditCard className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Available Cards</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {availableCards.length}
              </p>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <Mail className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Available Emails</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {availableEmails.length}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('generator')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'generator'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Generator
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'history'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          History ({data.linkHistory.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'generator' ? (
        <>
          {/* Generated Link Section */}
          {generatedLink && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.015, boxShadow: '0 8px 32px 0 rgba(99,102,241,0.25)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl shadow-lg p-6 border-2 border-green-200 dark:border-green-800"
              ref={generatedSectionRef}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    <Link className="h-5 w-5 text-green-600 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Generated Link ({linkStyle} style)
                    </h2>
                    {generatedAt && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        Generated at {generatedAt}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      // Clear the current output but KEEP the same card and email/account selection
                      setGeneratedLink('')
                      setUberLink('')
                      setGeneratedAt('')
                      // Keep selectedEmailForLink and selectedCard intact for reuse
                      // Smooth-scroll and focus the Uber link input so a new base link can be provided
                      setTimeout(() => {
                        const section = linkInputSectionRef.current
                        if (section) {
                          section.scrollIntoView({ behavior: 'smooth', block: 'start' })
                          section.classList.add('ring-2', 'ring-indigo-500', 'ring-opacity-50')
                          setTimeout(() => {
                            section.classList.remove('ring-2', 'ring-indigo-500', 'ring-opacity-50')
                          }, 1500)
                        }
                        const input = linkInputRef.current
                        if (input) input.focus()
                      }, 0)
                    }}
                    className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Generate New Link
                  </button>
                  <button
                    onClick={handleSwapStyle}
                    className="px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    Swap to {linkStyle === 'potato' ? 'Wool' : 'Potato'}
                  </button>
                  <button
                    ref={copyButtonRef}
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
                      setGeneratedAt('')
                      setSelectedEmailForLink(null)
                    }}
                    className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Clear Link
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Generated Link:
                </div>
                <div className="font-mono text-sm text-gray-900 dark:text-white break-all">
                  {generatedLink}
                </div>
                
                {/* Link Preview */}
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                    Link Preview:
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">
                    {linkStyle === 'potato' ? (
                      <>
                        <strong>Potato Style:</strong> baseUrl,cardNumber,expiryMonth,expiryYear,cvv,zip
                        <br />
                        Example: https://eats.uber.com/group-orders/29eb1601-7adf-4fd6-b4fc-3bb0860aef1c/join?source=quickActionCopy,5443176684041017,08,30,671,85041
                        <br />
                        <span className="text-yellow-600 dark:text-yellow-400">Note: Email is not included in Potato style links. Use the email copy section below.</span>
                      </>
                    ) : (
                      <>
                        <strong>Wool Style:</strong> baseUrl,cardNumber,expiryMonth/expiryYear,cvv,zip,email
                        <br />
                        Example: https://eats.uber.com/group-orders/9806a430-35d3-472a-a818-86c61e2e9814/join?source=quickActionCopy,4246426763908624,07/30,227,10303,x2p1vcvo8y25w8k@ptod6a.bigbackbobs.com
                      </>
                    )}
                  </div>
                </div>
                
                {/* Email Copy Section for Potato Style */}
                {linkStyle === 'potato' && selectedEmailForLink && (
                  <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">
                        📧 Email for Potato Style (not included in link)
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={async () => {
                            try {
                              const emailToUse = selectedEmailForLink
                              const combinedText = `${generatedLink}\n\nEmail: ${emailToUse.email}\nPromo: ${emailToUse.promo}`
                              await navigator.clipboard.writeText(combinedText)
                              setCopied(true)
                              setTimeout(() => setCopied(false), 2000)
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
                              await navigator.clipboard.writeText(selectedEmailForLink.email)
                              setCopied(true)
                              setTimeout(() => setCopied(false), 2000)
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
                      {selectedEmailForLink.email}
                    </div>
                    <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                      Promo: {selectedEmailForLink.promo}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Available Cards Section */}
          <motion.div
            whileHover={{ scale: 1.015, boxShadow: '0 8px 32px 0 rgba(99,102,241,0.25)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Available Cards ({availableCards.length})
                </h2>
              </div>
              <button
                onClick={() => setShowCardDetails(!showCardDetails)}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Eye className="h-4 w-4 mr-2" />
                Show Details
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableCards.map((card) => (
                <motion.div
                  key={card.id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedCard?.id === card.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => handleCardSelect(card)}
                >
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Card Number: {showCardDetails ? card.cardNumber : maskCardNumber(card.cardNumber)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Expires: {card.expiryMonth}/{card.expiryYear} ({card.expiryYear.length === 2 ? '20' + card.expiryYear : card.expiryYear})
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      CVV: {showCardDetails ? card.cvv : '***'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      ZIP: {card.zip}
                    </div>

                    {/* Enhanced card display with partially used email indicator */}
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Email: {card.email || 'Not assigned'}
                      {(() => {
                        const correspondingEmail = card.email ? data.emails.find(em => em.email === card.email) : undefined
                        const isPartial = card.isPartiallyUsed || !!correspondingEmail?.isPartiallyUsed
                        if (isPartial) {
                          return (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                              🔄 2x Available
                            </span>
                          )
                        }
                        return null
                      })()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Assign Email to Card Section */}
          {selectedCard && (
            <motion.div
              whileHover={{ scale: 1.015, boxShadow: '0 8px 32px 0 rgba(99,102,241,0.25)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6"
              id="email-assignment-section"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-purple-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Assign Email to Card
                  </h2>
                </div>
                <button
                  onClick={() => setShowEmailDetails(!showEmailDetails)}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Show Details
                </button>
              </div>

              <div className="space-y-4">
                {/* Selected Card Info */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Selected Card:
                  </div>
                  <div className="text-sm text-gray-900 dark:text-white">
                    {showCardDetails ? selectedCard.cardNumber : maskCardNumber(selectedCard.cardNumber)} - {selectedCard.expiryMonth}/{formatYear(selectedCard.expiryYear)} ({selectedCard.expiryYear})
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Current Email: {selectedCard.email || 'Not assigned'}
                  </div>
                </div>

                {/* Email Selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select Email to Assign:
                  </label>
                  <select
                    value={tempEmailSelection}
                    onChange={(e) => setTempEmailSelection(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">-- Select an email --</option>
                    {availableEmails.map((email) => (
                      <option key={email.id} value={email.email}>
                        {showEmailDetails ? email.email : maskEmail(email.email)} - {email.promo} {email.isUsed ? '(Used)' : ''} {email.isPartiallyUsed ? '(Partially Used)' : ''}
                      </option>
                    ))}
                  </select>
                  {tempEmailSelection && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Selected: {tempEmailSelection}
                    </div>
                  )}
                </div>

                {/* Assign Button */}
                <button
                  onClick={handleAssignEmail}
                  disabled={!tempEmailSelection || loading}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Assign Email to Card
                </button>

                {/* Current Assignment Status */}
                {selectedEmail && (
                  <div className={`p-3 rounded-lg ${
                    selectedEmailForLink?.isPartiallyUsed 
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' 
                      : 'bg-green-50 dark:bg-green-900/20'
                  }`}>
                    <div className={`text-sm font-medium ${
                      selectedEmailForLink?.isPartiallyUsed 
                        ? 'text-yellow-700 dark:text-yellow-300' 
                        : 'text-green-700 dark:text-green-300'
                    }`}>
                      {selectedEmailForLink?.isPartiallyUsed ? '🔄 Partially Used Email' : '✓ Email Assigned'}
                    </div>
                    <div className={`text-xs ${
                      selectedEmailForLink?.isPartiallyUsed 
                        ? 'text-yellow-600 dark:text-yellow-400' 
                        : 'text-green-600 dark:text-green-400'
                    }`}>
                      {showEmailDetails ? selectedEmail : maskEmail(selectedEmail)}
                    </div>
                    <div className={`text-xs mt-1 ${
                      selectedEmailForLink?.isPartiallyUsed 
                        ? 'text-yellow-600 dark:text-yellow-400' 
                        : 'text-green-600 dark:text-green-400'
                    }`}>
                      {selectedEmailForLink?.isPartiallyUsed 
                        ? `Ready for second use (${selectedEmailForLink.usageCount || '2x'})`
                        : 'Ready for link generation'
                      }
                    </div>
                    {selectedEmailForLink?.isPartiallyUsed && (
                      <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                        ⚡ Skip email assignment - go directly to Uber link input
                      </div>
                    )}
                  </div>
                )}
                
                {selectedCard && !selectedEmail && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">
                      ⚠ Card Selected but No Email Assigned
                    </div>
                    <div className="text-xs text-yellow-600 dark:text-yellow-400">
                      Please assign an email to proceed with link generation
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Uber Group Order Link Section */}
          <motion.div
            whileHover={{ scale: 1.015, boxShadow: '0 8px 32px 0 rgba(99,102,241,0.25)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6"
            ref={linkInputSectionRef}
          >
            <div className="flex items-center mb-6">
              <Link className="h-5 w-5 text-green-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Uber Group Order Link
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Paste your Uber group order link:
                </label>
                <input
                  ref={linkInputRef}
                  type="url"
                  value={uberLink}
                  onChange={(e) => setUberLink(e.target.value)}
                  placeholder="https://eats.uber.com/group-orders/7283438c-0207-48af-a4c5-179ca1d55ffb/join"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center space-x-4">
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

              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleGenerateLink()}
                  disabled={!selectedCard || !selectedCard.email || !uberLink.trim() || loading}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center"
                >
                  <Link className="h-4 w-4 mr-2" />
                  {!selectedCard ? 'Select a Card' :
                   !selectedCard.email ? 'Assign Email First' :
                   'Generate Link'}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Instructions */}
          <motion.div
            whileHover={{ scale: 1.015, boxShadow: '0 8px 32px 0 rgba(99,102,241,0.25)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              How to Use
            </h3>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-start">
                <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">
                  1
                </span>
                <span>Select an available card from your VCC database</span>
              </div>
              <div className="flex items-start">
                <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">
                  2
                </span>
                <span>Choose an email from the dropdown and click "Assign Email to Card" to confirm</span>
              </div>
              <div className="flex items-start">
                <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">
                  3
                </span>
                <span>Paste the Uber group order link you want to convert</span>
              </div>
              <div className="flex items-start">
                <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">
                  4
                </span>
                <span>Choose between Potato or Wool style formatting (years are automatically formatted to 2 digits)</span>
              </div>
              <div className="flex items-start">
                <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">
                  5
                </span>
                <span>Generate and copy the formatted link for use</span>
              </div>
            </div>
          </motion.div>
        </>
      ) : (
        /* History Tab */
        <motion.div
          whileHover={{ scale: 1.015, boxShadow: '0 8px 32px 0 rgba(99,102,241,0.25)' }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Link className="h-5 w-5 text-indigo-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Generated Links History
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {data.linkHistory.length} links generated
              </div>
              {data.linkHistory.length > 0 && (
                <button
                  onClick={async () => {
                    if (confirm('Are you sure you want to clear all generated link history? This action cannot be undone.')) {
                      try {
                        await onSave({ linkHistory: [] })
                      } catch (error) {
                        console.error('Failed to clear link history:', error)
                      }
                    }
                  }}
                  className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear History
                </button>
              )}
            </div>
          </div>

          {/* Reuse Cards & Emails Section */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-200 dark:border-green-800"
          >
            <div className="flex items-center mb-4">
              <Link className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Reuse Cards & Emails
              </h3>
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
                  value={selectedCardForReuse?.id || ''}
                  onChange={(e) => {
                    const card = data.usedCards.find(c => c.id === e.target.value)
                    setSelectedCardForReuse(card || null)
                    
                    // Auto-select corresponding email if card has an email assigned
                    if (card && card.email) {
                      const correspondingEmail = data.emails.find(em => em.email === card.email)
                      if (correspondingEmail) {
                        setSelectedEmailForReuse(correspondingEmail)
                      }
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">-- Select a used card --</option>
                  {data.usedCards.map((card) => (
                    <option key={card.id} value={card.id}>
                      {card.cardNumber} - {card.expiryMonth}/{card.expiryYear} {card.email ? `(${card.email})` : ''}
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
                  value={selectedEmailForReuse?.id || ''}
                  onChange={(e) => {
                    const email = data.emails.find(em => em.id === e.target.value)
                    setSelectedEmailForReuse(email || null)
                    
                    // Auto-select corresponding card if email is linked to a card
                    if (email) {
                      const correspondingCard = data.usedCards.find(card => card.email === email.email)
                      if (correspondingCard) {
                        setSelectedCardForReuse(correspondingCard)
                      }
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">-- Select a used email --</option>
                  {data.emails.filter(email => email.isUsed || email.isPartiallyUsed).map((email) => (
                    <option key={email.id} value={email.id}>
                      {email.email} - {email.promo} ({email.isPartiallyUsed ? 'Partially Used' : 'Used'})
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
                value={reuseUberLink}
                onChange={(e) => setReuseUberLink(e.target.value)}
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
                  checked={reuseLinkStyle === 'potato'}
                  onChange={(e) => setReuseLinkStyle(e.target.value as 'potato' | 'wool')}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Potato Style</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="wool"
                  checked={reuseLinkStyle === 'wool'}
                  onChange={(e) => setReuseLinkStyle(e.target.value as 'potato' | 'wool')}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Wool Style</span>
              </label>
            </div>

            {/* Generate Button */}
            <div className="mt-6">
              <button
                onClick={handleReuseGenerateLink}
                disabled={!selectedCardForReuse || !selectedEmailForReuse || !reuseUberLink.trim() || loading}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center"
              >
                <Link className="h-4 w-4 mr-2" />
                Generate Link
              </button>
            </div>

            {/* Generated Link Display */}
            {reuseGeneratedLink && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Generated Link ({reuseLinkStyle} style):
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleReuseCopyLink}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors flex items-center ${
                        reuseCopied
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-600 hover:bg-gray-700 text-white'
                      }`}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      {reuseCopied ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      onClick={() => {
                        setReuseGeneratedLink('')
                        setReuseUberLink('')
                      }}
                      className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      Clear Link
                    </button>
                  </div>
                </div>
                <div className="font-mono text-sm text-gray-900 dark:text-white break-all">
                  {reuseGeneratedLink}
                </div>
                
                {/* Email Copy Section for Potato Style */}
                {reuseLinkStyle === 'potato' && selectedEmailForReuse && (
                  <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">
                        📧 Email for Potato Style (not included in link)
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={async () => {
                            try {
                              const combinedText = `${reuseGeneratedLink}\n\nEmail: ${selectedEmailForReuse.email}\nPromo: ${selectedEmailForReuse.promo}`
                              await navigator.clipboard.writeText(combinedText)
                              setReuseCopied(true)
                              setTimeout(() => setReuseCopied(false), 2000)
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
                              await navigator.clipboard.writeText(selectedEmailForReuse.email)
                              setReuseCopied(true)
                              setTimeout(() => setReuseCopied(false), 2000)
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
                      {selectedEmailForReuse.email}
                    </div>
                    <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                      Promo: {selectedEmailForReuse.promo}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {data.linkHistory.length === 0 ? (
            <div className="text-center py-8">
              <Link className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No links generated yet. Generate your first link to see it here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.linkHistory.slice().reverse().map((link) => (
                <motion.div
                  key={link.id}
                  whileHover={{ scale: 1.01 }}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        link.linkStyle === 'potato' 
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      }`}>
                        {link.linkStyle} style
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(link.generatedAt).toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(link.generatedLink)
                          setCopied(true)
                          setTimeout(() => setCopied(false), 2000)
                        } catch (error) {
                          console.error('Failed to copy link:', error)
                        }
                      }}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200"
                      title="Copy Link"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Card:</strong> {maskCardNumber(link.cardNumber)}
                    </div>
                    <div>
                      <strong>Email:</strong> {maskEmail(link.email)}
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded font-mono text-xs break-all">
                      {link.generatedLink}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

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
                Would you like to mark the email and card as used? The generated link will remain available for copying.
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
        )
      }
    </div>
  )
} 