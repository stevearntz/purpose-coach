'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useOrganization, useUser } from '@clerk/nextjs'
import { ArrowLeft, Plus, X, Upload, Download, Loader2, AlertCircle, Users, UserPlus, Mail, ChevronDown, Check } from 'lucide-react'

interface UserRow {
  id: string
  name: string
  email: string
  role: 'participant' | 'member' | 'admin'
  nameError: boolean
  emailError: boolean
}

export default function AddUsersPage() {
  const router = useRouter()
  const { organization } = useOrganization()
  const { user } = useUser()
  const [addMode, setAddMode] = useState<'single' | 'bulk'>('single')
  const [isAdding, setIsAdding] = useState(false)
  const [addingProgress, setAddingProgress] = useState({ current: 0, total: 0 })
  const [userRows, setUserRows] = useState<UserRow[]>([{
    id: Date.now().toString(),
    name: '',
    email: '',
    role: 'participant',
    nameError: false,
    emailError: false
  }])
  const nameInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const [isMounted, setIsMounted] = useState(false)
  const [focusedOptionIndex, setFocusedOptionIndex] = useState(0)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingUsers, setPendingUsers] = useState<UserRow[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId && dropdownRefs.current[openDropdownId]) {
        const target = event.target as Node
        const dropdownEl = dropdownRefs.current[openDropdownId]
        const isDropdownButton = dropdownEl?.contains(target)
        const isDropdownMenu = (target as HTMLElement)?.closest('.dropdown-menu-portal')
        
        if (!isDropdownButton && !isDropdownMenu) {
          setOpenDropdownId(null)
        }
      }
    }
    
    const handleScroll = () => {
      if (openDropdownId) {
        setOpenDropdownId(null)
      }
    }
    
    const handleResize = () => {
      if (openDropdownId) {
        setOpenDropdownId(null)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleResize)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleResize)
    }
  }, [openDropdownId])

  const addRow = () => {
    const newRow: UserRow = {
      id: Date.now().toString(),
      name: '',
      email: '',
      role: 'participant',
      nameError: false,
      emailError: false
    }
    setUserRows([...userRows, newRow])
    
    // Focus on the new row's name input after it's added
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

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
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
        if (index === 0 || !line.trim()) return // Skip header and empty lines
        
        const [name, email, role] = line.split(',').map(s => s.trim())
        if (name && email) {
          // Validate and normalize role
          let normalizedRole: 'participant' | 'member' | 'admin' = 'participant'
          if (role) {
            const lowerRole = role.toLowerCase()
            if (lowerRole === 'admin' || lowerRole === 'administrator') {
              normalizedRole = 'admin'
            } else if (lowerRole === 'member') {
              normalizedRole = 'member'
            }
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
        // Replace existing empty rows with imported ones
        if (userRows.length === 1 && !userRows[0].name && !userRows[0].email) {
          setUserRows(newRows)
        } else {
          setUserRows([...userRows, ...newRows])
        }
      }
    }
    reader.readAsText(file)
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const downloadTemplate = () => {
    const csvContent = `Name,Email,Role
John Doe,john@example.com,admin
Jane Smith,jane@example.com,member
Bob Johnson,bob@example.com,participant
Alice Williams,alice@example.com,member
Charlie Brown,charlie@example.com,participant`
    
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

  const handleSubmit = () => {
    const validUsers = userRows.filter(row => row.name && row.email)
    
    if (validUsers.length === 0) {
      alert('Please fill in at least one user with name and email')
      return
    }
    
    // Show confirmation modal
    setPendingUsers(validUsers)
    setShowConfirmModal(true)
  }

  const confirmAddUsers = async () => {
    setShowConfirmModal(false)
    setIsAdding(true)
    setAddingProgress({ current: 0, total: pendingUsers.length })
    
    try {
      let successCount = 0
      
      for (let i = 0; i < pendingUsers.length; i++) {
        const userRow = pendingUsers[i]
        setAddingProgress({ current: i + 1, total: pendingUsers.length })
        
        // Different endpoints based on role
        const endpoint = userRow.role === 'participant' 
          ? '/api/company/invite' 
          : '/api/company/invite-member'
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            emails: [userRow.email],
            name: userRow.name,
            role: userRow.role,
            senderEmail: user?.primaryEmailAddress?.emailAddress || '',
            company: organization?.name || user?.primaryEmailAddress?.emailAddress?.split('@')[1] || '',
            message: userRow.role === 'participant'
              ? undefined  // Participants don't get welcome emails
              : `You've been invited to join ${organization?.name || 'our team'} on Campfire`
          })
        })
        
        if (response.ok) {
          successCount++
        } else {
          console.error(`Failed to add user ${userRow.email}`)
        }
      }
      
      if (successCount > 0) {
        console.log(`Successfully added ${successCount} user(s)`)
        router.push('/dashboard/users')
      }
    } catch (error) {
      console.error('Failed to add users:', error)
      alert('Failed to add some users. Please try again.')
    } finally {
      setIsAdding(false)
      setAddingProgress({ current: 0, total: 0 })
      setPendingUsers([])
    }
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
            <p className="text-white/60 mt-1">Invite team members to your organization</p>
          </div>
        </div>
      </div>

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
            Add Participants
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
                <p className="text-white/80 text-center mb-6">Upload a CSV file with participant information</p>
                
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
                    disabled={isAdding}
                  >
                    Choose File
                  </button>
                </div>
              </div>
              
              <div className="text-sm text-white/60">
                <p>CSV should have the following columns: Name, Email, Role</p>
                <p className="mt-1">Supported roles: admin, member, participant</p>
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
                  disabled={isAdding}
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
                  disabled={isAdding}
                />
              </div>
              <div className="col-span-3" ref={el => { dropdownRefs.current[row.id] = el }}>
                <button
                  type="button"
                  onClick={() => setOpenDropdownId(openDropdownId === row.id ? null : row.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      // Let Enter key add a new row
                      if (openDropdownId === row.id) {
                        setOpenDropdownId(null)
                      }
                      handleKeyDown(e, row.id)
                    } else if (e.key === ' ') {
                      e.preventDefault()
                      setOpenDropdownId(openDropdownId === row.id ? null : row.id)
                    }
                  }}
                  disabled={isAdding}
                  className={`w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all ${
                    isAdding ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/20'
                  }`}
                >
                  <span className="capitalize">
                    {row.role === 'participant' && 'Participant'}
                    {row.role === 'member' && 'Member'}
                    {row.role === 'admin' && 'Admin'}
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
                  >
                    <button
                      type="button"
                      onClick={() => {
                        updateRow(row.id, 'role', 'participant')
                        setOpenDropdownId(null)
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center justify-between ${
                        row.role === 'participant' ? 'bg-white/5' : ''
                      }`}
                    >
                      <div>
                        <div className="text-white font-medium">Participant</div>
                        <div className="text-white/60 text-xs mt-0.5">No welcome email</div>
                      </div>
                      {row.role === 'participant' && (
                        <Check className="w-4 h-4 text-purple-400" />
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        updateRow(row.id, 'role', 'member')
                        setOpenDropdownId(null)
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center justify-between ${
                        row.role === 'member' ? 'bg-white/5' : ''
                      }`}
                    >
                      <div>
                        <div className="text-white font-medium">Member</div>
                        <div className="text-white/60 text-xs mt-0.5">Platform access + welcome email</div>
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
                      className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center justify-between ${
                        row.role === 'admin' ? 'bg-white/5' : ''
                      }`}
                    >
                      <div>
                        <div className="text-white font-medium">Admin</div>
                        <div className="text-white/60 text-xs mt-0.5">Full access + welcome email</div>
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
                    disabled={isAdding}
                    className={`p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors ${isAdding ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Add another user"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => removeRow(row.id)}
                    disabled={isAdding}
                    className={`p-2 bg-white/10 text-white/60 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-colors ${isAdding ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                {userRows.some(r => r.role === 'participant' && r.name && r.email) && (
                  <p className="text-purple-300/80">
                    <span className="font-medium">Participants:</span> Added to assessment pool, no welcome email sent
                  </p>
                )}
                {userRows.some(r => r.role === 'member' && r.name && r.email) && (
                  <p className="text-blue-300/80">
                    <span className="font-medium">Members:</span> Will receive welcome email with platform access
                  </p>
                )}
                {userRows.some(r => r.role === 'admin' && r.name && r.email) && (
                  <p className="text-orange-300/80">
                    <span className="font-medium">Admins:</span> Will receive welcome email with full dashboard access
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-between">
                {isAdding && addingProgress.total > 0 && (
                  <div className="flex items-center gap-3 text-white/60">
                    <Loader2 className="animate-spin h-4 w-4" />
                    <span className="text-sm">
                      Adding user {addingProgress.current} of {addingProgress.total}...
                    </span>
                  </div>
                )}
                {!isAdding && <div />}
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => router.push('/dashboard/users')}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isAdding || userRows.every(r => !r.name || !r.email)}
                    className={`px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 ${
                      isAdding || userRows.every(r => !r.name || !r.email) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isAdding ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        Add {userRows.filter(r => r.name && r.email).length} User{userRows.filter(r => r.name && r.email).length !== 1 ? 's' : ''}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>

    {/* Confirmation Modal */}
    {showConfirmModal && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10000]">
        <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">Confirm User Addition</h3>
          
          <div className="space-y-3 mb-6">
            <p className="text-white/80">You're about to add {pendingUsers.length} user{pendingUsers.length !== 1 ? 's' : ''}:</p>
            
            <div className="bg-white/5 rounded-lg p-3 max-h-48 overflow-y-auto">
              {pendingUsers.map((user, idx) => (
                <div key={idx} className="flex items-center justify-between py-1">
                  <span className="text-white/70 text-sm">{user.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    user.role === 'admin' ? 'bg-purple-500/20 text-purple-300' :
                    user.role === 'member' ? 'bg-blue-500/20 text-blue-300' :
                    'bg-gray-500/20 text-gray-300'
                  }`}>
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="space-y-2 text-sm">
              {pendingUsers.some(u => u.role === 'participant') && (
                <p className="text-purple-300/80">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  Participants will be added to the assessment pool (no email)
                </p>
              )}
              {pendingUsers.some(u => u.role === 'member' || u.role === 'admin') && (
                <p className="text-blue-300/80">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Members and Admins will receive welcome emails
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmAddUsers}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Confirm & Add Users
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}