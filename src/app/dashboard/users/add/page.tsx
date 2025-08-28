'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useOrganization, useUser } from '@clerk/nextjs'
import { ArrowLeft, Plus, X, Upload, Download, Loader2, AlertCircle, Users, UserPlus, Mail, ChevronDown, Check, Copy, Rocket, User, Info } from 'lucide-react'

interface UserRow {
  id: string
  name: string
  email: string
  role: 'member' | 'admin'
  nameError: boolean
  emailError: boolean
  sendEmail?: boolean  // Track who gets welcome emails
}

export default function AddUsersPage() {
  const router = useRouter()
  const { organization } = useOrganization()
  const { user } = useUser()
  const [currentStep, setCurrentStep] = useState<'add' | 'review' | 'send'>('add')
  const [addMode, setAddMode] = useState<'single' | 'bulk'>('single')
  const [isAdding, setIsAdding] = useState(false)
  const [userRows, setUserRows] = useState<UserRow[]>([{
    id: Date.now().toString(),
    name: '',
    email: '',
    role: 'member',
    nameError: false,
    emailError: false
  }])
  const nameInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const [isMounted, setIsMounted] = useState(false)
  const [pendingUsers, setPendingUsers] = useState<UserRow[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [invitationLinks, setInvitationLinks] = useState<Record<string, string>>({})
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [focusedOptionIndex, setFocusedOptionIndex] = useState(0)
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set())

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Close dropdown when clicking outside or scrolling
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId && dropdownRefs.current[openDropdownId]) {
        const target = event.target as Node
        const dropdownEl = dropdownRefs.current[openDropdownId]
        const isDropdownButton = dropdownEl?.contains(target)
        const isDropdownMenu = (target as HTMLElement)?.closest('.dropdown-menu-portal')
        
        if (!isDropdownButton && !isDropdownMenu) {
          setOpenDropdownId(null)
          setFocusedOptionIndex(0)
        }
      }
    }
    
    const handleScroll = () => {
      if (openDropdownId) {
        setOpenDropdownId(null)
        setFocusedOptionIndex(0)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('scroll', handleScroll, true)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [openDropdownId])

  const addRow = () => {
    const newRow: UserRow = {
      id: Date.now().toString(),
      name: '',
      email: '',
      role: 'member',
      nameError: false,
      emailError: false
    }
    setUserRows([...userRows, newRow])
    
    setTimeout(() => {
      nameInputRefs.current[newRow.id]?.focus()
    }, 50)
  }

  const removeRow = (id: string) => {
    if (userRows.length > 1) {
      setUserRows(userRows.filter(row => row.id !== id))
    }
  }

  const updateRow = (id: string, field: keyof UserRow, value: any) => {
    setUserRows(userRows.map(row => {
      if (row.id === id) {
        const updated = { ...row, [field]: value }
        if (field === 'name' && value) updated.nameError = false
        if (field === 'email' && value) updated.emailError = false
        return updated
      }
      return row
    }))
  }

  const handleKeyDown = (e: React.KeyboardEvent, rowId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const currentRow = userRows.find(row => row.id === rowId)
      
      if (!currentRow) return
      
      if (currentRow.name && currentRow.email) {
        addRow()
      } else {
        setUserRows(userRows.map(row => {
          if (row.id === rowId) {
            return {
              ...row,
              nameError: !row.name,
              emailError: !row.email
            }
          }
          return row
        }))
      }
    }
  }

  const handleBulkImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const lines = text.split('\n')
      const newRows: UserRow[] = []
      
      lines.forEach((line, index) => {
        if (index === 0 || !line.trim()) return
        
        const [name, email, role] = line.split(',').map(s => s.trim())
        if (name && email) {
          let normalizedRole: 'member' | 'admin' = 'member'
          if (role) {
            const lowerRole = role.toLowerCase()
            if (lowerRole === 'admin') {
              normalizedRole = 'admin'
            }
            // Default to 'member' for any other role value
          }
          
          newRows.push({
            id: `import-${Date.now()}-${index}`,
            name,
            email,
            role: normalizedRole,
            nameError: false,
            emailError: false
          })
        }
      })
      
      if (newRows.length > 0) {
        if (userRows.length === 1 && !userRows[0].name && !userRows[0].email) {
          setUserRows(newRows)
        } else {
          setUserRows([...userRows, ...newRows])
        }
      }
    }
    reader.readAsText(file)
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const downloadTemplate = () => {
    const csvContent = `Name,Email,Role
John Doe,john@example.com,admin
Jane Smith,jane@example.com,member
Bob Johnson,bob@example.com,member`
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', 'users_template.csv')
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCopyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  const handleReviewContinue = () => {
    const validUsers = userRows.filter(row => row.name && row.email)
    
    if (validUsers.length === 0) {
      alert('Please fill in at least one user with name and email')
      return
    }
    
    setPendingUsers(validUsers)
    setCurrentStep('review')
  }

  const generateInvitationLinks = async () => {
    setIsAdding(true)
    
    // Here we would normally create the invitations in the backend
    // For now, we'll generate mock invitation codes
    const links: Record<string, string> = {}
    
    // By default, select all users to receive emails
    const emailsToSelect = new Set<string>()
    for (const user of pendingUsers) {
      const inviteCode = Math.random().toString(36).substring(2, 15)
      links[user.email] = `https://tools.getcampfire.com/invite/${inviteCode}`
      emailsToSelect.add(user.email)
    }
    
    setSelectedEmails(emailsToSelect)
    setInvitationLinks(links)
    setIsAdding(false)
    setCurrentStep('send')
  }

  const getDropdownPosition = (rowId: string) => {
    const buttonEl = dropdownRefs.current[rowId]
    if (!buttonEl) return { top: 0, left: 0, width: 0 }
    
    const rect = buttonEl.getBoundingClientRect()
    return {
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width
    }
  }

  // Step indicator component
  const StepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3 flex-1">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
          currentStep === 'add' ? 'bg-purple-600 text-white' : 'bg-purple-600/20 text-purple-400'
        }`}>
          {currentStep !== 'add' ? <Check className="w-5 h-5" /> : '1'}
        </div>
        <div className="flex-1 h-1 bg-white/10 rounded">
          <div className={`h-full bg-purple-600 rounded transition-all ${
            currentStep === 'add' ? 'w-0' : 'w-full'
          }`} />
        </div>
      </div>
      
      <div className="flex items-center gap-3 flex-1">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
          currentStep === 'review' ? 'bg-purple-600 text-white' : 
          currentStep === 'send' ? 'bg-purple-600/20 text-purple-400' : 'bg-white/10 text-white/40'
        }`}>
          {currentStep === 'send' ? <Check className="w-5 h-5" /> : '2'}
        </div>
        <div className="flex-1 h-1 bg-white/10 rounded">
          <div className={`h-full bg-purple-600 rounded transition-all ${
            currentStep === 'send' ? 'w-full' : 'w-0'
          }`} />
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
          currentStep === 'send' ? 'bg-purple-600 text-white' : 'bg-white/10 text-white/40'
        }`}>
          3
        </div>
      </div>
    </div>
  )

  if (currentStep === 'review') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentStep('add')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h2 className="text-3xl font-bold text-white">Invite Team Members</h2>
              <p className="text-white/60 mt-1">Step 2 of 3</p>
            </div>
          </div>
        </div>

        <StepIndicator />

        {/* Review Card */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
          <h3 className="text-2xl font-bold text-white mb-2">Review & Invite</h3>
          <p className="text-white/60 mb-8">Review your team invitation details before sending.</p>

          {/* Team member summary */}
          <div className="bg-white/5 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-purple-400" />
              <span className="text-white font-medium">Team Members ({pendingUsers.length})</span>
            </div>
            
            <div className="space-y-2">
              {pendingUsers.map((user, idx) => (
                <div key={idx} className="flex items-center gap-3 py-2">
                  <User className="w-4 h-4 text-white/40" />
                  <span className="text-white flex-1">{user.name}</span>
                  <span className="text-white/60 text-sm">({user.email})</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.role === 'admin' ? 'bg-purple-500/20 text-purple-300' :
                    user.role === 'member' ? 'bg-blue-500/20 text-blue-300' :
                    'bg-gray-500/20 text-gray-300'
                  }`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-8">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-200/80">
                <p className="font-medium mb-1">Ready to invite?</p>
                <p>Click continue to prepare your invitation emails. You'll be able to copy email addresses and a template to send via your email client.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep('add')}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              onClick={generateInvitationLinks}
              disabled={isAdding}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              {isAdding ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Preparing...
                </>
              ) : (
                <>
                  Continue to Email Setup
                  <ArrowLeft className="w-5 h-5 rotate-180" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (currentStep === 'send') {
    // Get list of users who are selected for emails
    const usersToEmail = pendingUsers.filter(u => selectedEmails.has(u.email))
    const usersNotEmailed = pendingUsers.filter(u => !selectedEmails.has(u.email))
    
    const emailList = usersToEmail.map(u => u.email).join(', ')
    const emailSubject = `You're invited to join ${organization?.name || 'our team'} on Campfire`
    const emailTemplate = `Hi team,

You've been invited to join ${organization?.name || 'our organization'} on Campfire, where we're building better teams through data-driven insights.

Click here to accept your invitation and set up your account:
https://tools.getcampfire.com/sign-in

This invitation expires in 7 days.

Welcome aboard!
${user?.firstName || 'Your Team Admin'}`

    const toggleEmailSelection = (email: string) => {
      const newSelection = new Set(selectedEmails)
      if (newSelection.has(email)) {
        newSelection.delete(email)
      } else {
        newSelection.add(email)
      }
      setSelectedEmails(newSelection)
    }

    const selectAll = () => {
      setSelectedEmails(new Set(pendingUsers.map(u => u.email)))
    }

    const selectNone = () => {
      setSelectedEmails(new Set())
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentStep('review')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h2 className="text-3xl font-bold text-white">Send Team Invitations</h2>
              <p className="text-white/60 mt-1">Step 3 of 3</p>
            </div>
          </div>
        </div>

        <StepIndicator />

        {/* Send Card */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
          <h3 className="text-2xl font-bold text-white mb-2">Select Who Gets Welcome Emails</h3>
          <p className="text-white/60 mb-8">Choose which team members should receive welcome emails. Unchecked members will be added silently for assessment campaigns only.</p>

          {/* Email Selection */}
          <div className="bg-white/5 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-medium">Select Recipients</span>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white/80 rounded-lg text-sm transition-colors"
                >
                  Select All
                </button>
                <button
                  onClick={selectNone}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white/80 rounded-lg text-sm transition-colors"
                >
                  Select None
                </button>
              </div>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {pendingUsers.map((user) => (
                <label 
                  key={user.email} 
                  className="flex items-center gap-3 py-2 px-3 hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedEmails.has(user.email)}
                    onChange={() => toggleEmailSelection(user.email)}
                    className="w-4 h-4 rounded text-purple-600 bg-white/10 border-white/30 focus:ring-purple-500 focus:ring-offset-0"
                  />
                  <div className="flex-1 flex items-center gap-3">
                    <User className="w-4 h-4 text-white/40" />
                    <span className="text-white">{user.name}</span>
                    <span className="text-white/60 text-sm">({user.email})</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.role === 'admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </label>
              ))}
            </div>

            {usersNotEmailed.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-sm text-white/60">
                  <span className="font-medium">{usersNotEmailed.length} member{usersNotEmailed.length > 1 ? 's' : ''}</span> will be added without welcome emails
                </p>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-8">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <div className="text-sm text-blue-200/80">
                <p className="font-medium mb-2">How to send invitations:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Copy the email addresses below</li>
                  <li>Copy the email template</li>
                  <li>Open your email client (Gmail, Outlook, etc.)</li>
                  <li>Paste the addresses in the "To" or "BCC" field</li>
                  <li>Paste and customize the template</li>
                  <li>Send!</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Email addresses */}
          <div className="space-y-6">
            {usersToEmail.length > 0 ? (
            <>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-white/80">Team Member Email Addresses</label>
                  <button
                    onClick={() => handleCopyToClipboard(emailList, 'emails')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      copiedField === 'emails'
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    <Copy className="w-3 h-3" />
                    {copiedField === 'emails' ? 'Copied!' : 'Copy Emails'}
                  </button>
                </div>
                <div className="bg-black/20 rounded-lg p-4 font-mono text-sm text-white/80">
                  {emailList || 'No recipients selected'}
                </div>
              </div>

              {/* Email subject */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-white/80">Email Subject</label>
                  <button
                    onClick={() => handleCopyToClipboard(emailSubject, 'subject')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      copiedField === 'subject'
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    <Copy className="w-3 h-3" />
                    {copiedField === 'subject' ? 'Copied!' : 'Copy Subject'}
                  </button>
                </div>
                <div className="bg-black/20 rounded-lg p-4 font-mono text-sm text-white/80">
                  {emailSubject}
                </div>
              </div>

              {/* Email template */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-white/80">Email Template</label>
                  <button
                    onClick={() => handleCopyToClipboard(emailTemplate, 'template')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      copiedField === 'template'
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    <Copy className="w-3 h-3" />
                    {copiedField === 'template' ? 'Copied!' : 'Copy Template'}
                  </button>
                </div>
                <div className="bg-black/20 rounded-lg p-4 font-mono text-sm text-white/80 whitespace-pre-wrap">
                  {emailTemplate}
                </div>
              </div>
            </>
            ) : (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6 text-center">
                <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                <p className="text-white font-medium mb-2">No Recipients Selected</p>
                <p className="text-sm text-white/60">
                  Select at least one team member above to send welcome emails, or click Done to add members without emails.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={() => setCurrentStep('review')}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => router.push('/dashboard/users')}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Check className="w-5 h-5" />
              Done
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Original Add Users UI (Step 1)
  return (
    <>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard/users')}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h2 className="text-3xl font-bold text-white">Add Users</h2>
            <p className="text-white/60 mt-1">Step 1 of 3</p>
          </div>
        </div>
      </div>

      <StepIndicator />

      {/* Add Users Form */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-visible">
        {/* Tab Buttons */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setAddMode('single')}
            className={`px-6 py-3 font-medium transition-colors ${
              addMode === 'single'
                ? 'text-white bg-white/10 border-b-2 border-purple-500'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            Add Users
          </button>
          <button
            onClick={() => setAddMode('bulk')}
            className={`px-6 py-3 font-medium transition-colors ${
              addMode === 'bulk'
                ? 'text-white bg-white/10 border-b-2 border-purple-500'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            Upload CSV
          </button>
        </div>

        <div className="p-6">
          {addMode === 'bulk' ? (
            /* CSV Upload Mode */
            <div className="space-y-6">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleBulkImport}
                className="hidden"
              />
              
              <div className="flex flex-col items-center justify-center py-12 px-6 border-2 border-dashed border-white/20 rounded-lg">
                <Upload className="w-12 h-12 text-white/40 mb-4" />
                <p className="text-white/80 text-center mb-6">Upload a CSV file with user information</p>
                
                <div className="flex gap-4">
                  <button
                    onClick={downloadTemplate}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Template
                  </button>
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    Choose File
                  </button>
                </div>
              </div>
              
              <div className="text-sm text-white/60">
                <p>CSV should have the following columns: Name, Email, Role</p>
                <p className="mt-1">Supported roles: admin, member</p>
              </div>
            </div>
          ) : (
            /* Single Add Mode */
            <>
              {/* Header row with labels */}
              <div className="grid grid-cols-12 gap-4 mb-2">
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-white/80">Name *</label>
                </div>
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-white/80">Email *</label>
                </div>
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-white/80">Role</label>
                </div>
                <div className="col-span-1"></div>
              </div>

              {/* User rows */}
              <div className="space-y-2 relative" style={{ zIndex: 1 }}>
                {userRows.map((row, index) => (
                  <div key={row.id} className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-4">
                      <input
                        ref={(el) => { nameInputRefs.current[row.id] = el }}
                        type="text"
                        value={row.name}
                        onChange={(e) => updateRow(row.id, 'name', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, row.id)}
                        placeholder="John Doe"
                        className={`w-full px-4 py-2 bg-white/10 border ${
                          row.nameError ? 'border-red-500' : 'border-white/20'
                        } rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all`}
                      />
                    </div>
                    <div className="col-span-4">
                      <input
                        type="email"
                        value={row.email}
                        onChange={(e) => updateRow(row.id, 'email', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, row.id)}
                        placeholder="john@example.com"
                        className={`w-full px-4 py-2 bg-white/10 border ${
                          row.emailError ? 'border-red-500' : 'border-white/20'
                        } rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all`}
                      />
                    </div>
                    <div className="col-span-3" ref={el => { dropdownRefs.current[row.id] = el }}>
                      <button
                        type="button"
                        onClick={() => {
                          setOpenDropdownId(openDropdownId === row.id ? null : row.id)
                          setFocusedOptionIndex(row.role === 'member' ? 0 : 1)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (openDropdownId === row.id) {
                              setOpenDropdownId(null)
                            }
                            handleKeyDown(e, row.id)
                          } else if (e.key === ' ' || e.key === 'ArrowDown') {
                            e.preventDefault()
                            setOpenDropdownId(openDropdownId === row.id ? null : row.id)
                            setFocusedOptionIndex(row.role === 'member' ? 0 : 1)
                          }
                        }}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all hover:bg-white/20"
                      >
                        <span className="capitalize">
                          {row.role === 'member' ? 'Member' : 'Admin'}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-white/60 transition-transform ${
                          openDropdownId === row.id ? 'rotate-180' : ''
                        }`} />
                      </button>
                      
                      {/* Custom Dropdown Menu Portal */}
                      {openDropdownId === row.id && isMounted && createPortal(
                        <div 
                          className="dropdown-menu-portal fixed z-[9999] bg-gray-900/95 backdrop-blur-sm border border-white/20 rounded-lg shadow-xl overflow-hidden"
                          style={{
                            top: getDropdownPosition(row.id).top,
                            left: getDropdownPosition(row.id).left,
                            width: getDropdownPosition(row.id).width,
                            maxHeight: '300px'
                          }}
                          tabIndex={-1}
                          ref={(el) => {
                            if (el && openDropdownId === row.id) {
                              setTimeout(() => el.focus(), 0)
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'ArrowDown') {
                              e.preventDefault()
                              setFocusedOptionIndex(prev => (prev + 1) % 2)
                            } else if (e.key === 'ArrowUp') {
                              e.preventDefault()
                              setFocusedOptionIndex(prev => (prev - 1 + 2) % 2)
                            } else if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              const roles: ('member' | 'admin')[] = ['member', 'admin']
                              updateRow(row.id, 'role', roles[focusedOptionIndex])
                              setOpenDropdownId(null)
                              // Return focus to the button
                              dropdownRefs.current[row.id]?.querySelector('button')?.focus()
                            } else if (e.key === 'Escape') {
                              setOpenDropdownId(null)
                              // Return focus to the button
                              dropdownRefs.current[row.id]?.querySelector('button')?.focus()
                            }
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              updateRow(row.id, 'role', 'member')
                              setOpenDropdownId(null)
                            }}
                            onMouseEnter={() => setFocusedOptionIndex(0)}
                            className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center justify-between ${
                              focusedOptionIndex === 0 ? 'bg-white/10' : row.role === 'member' ? 'bg-white/5' : ''
                            }`}
                          >
                            <div>
                              <div className="text-white font-medium">Member</div>
                              <div className="text-white/60 text-xs mt-0.5">Team member with platform access</div>
                            </div>
                            {row.role === 'member' && (
                              <Check className="w-4 h-4 text-purple-400" />
                            )}
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => {
                              updateRow(row.id, 'role', 'admin')
                              setOpenDropdownId(null)
                            }}
                            onMouseEnter={() => setFocusedOptionIndex(1)}
                            className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center justify-between ${
                              focusedOptionIndex === 1 ? 'bg-white/10' : row.role === 'admin' ? 'bg-white/5' : ''
                            }`}
                          >
                            <div>
                              <div className="text-white font-medium">Admin</div>
                              <div className="text-white/60 text-xs mt-0.5">Full access and management</div>
                            </div>
                            {row.role === 'admin' && (
                              <Check className="w-4 h-4 text-purple-400" />
                            )}
                          </button>
                        </div>,
                        document.body
                      )}
                    </div>
                    <div className="col-span-1 flex justify-center">
                      {index === userRows.length - 1 ? (
                        <button
                          onClick={addRow}
                          className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                          title="Add another user"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => removeRow(row.id)}
                          className="p-2 bg-white/10 text-white/60 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-colors"
                          title="Remove this user"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Help text */}
              <div className="text-sm text-white/60 mt-4 space-y-1">
                <p>Populate required fields and hit Enter to add a new row, or click the + button</p>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-end">
                <button
                  onClick={handleReviewContinue}
                  disabled={userRows.every(r => !r.name || !r.email)}
                  className={`px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 ${
                    userRows.every(r => !r.name || !r.email) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Review & Invite
                  <ArrowLeft className="w-5 h-5 rotate-180" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
    </>
  )
}