'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  Users, Plus, ChevronDown, ChevronUp, Upload, Download,
  Search, Filter, Link, Trash2, Edit3, Mail,
  CheckCircle, Clock, X, Loader2
} from 'lucide-react'
import { useOrganization, useUser } from '@clerk/nextjs'

interface Participant {
  id: string
  name: string
  email: string
  status: 'active' | 'invited' | 'inactive'
  department?: string
  lastActive?: string
  joinedDate: string
}

interface ParticipantRow {
  id: string
  name: string
  email: string
  department: string
  nameError: boolean
  emailError: boolean
}

export default function ParticipantsTab() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddSection, setShowAddSection] = useState(false)
  const [addMode, setAddMode] = useState<'single' | 'bulk'>('single')
  const [copiedParticipantId, setCopiedParticipantId] = useState<string | null>(null)
  
  // Get organization context from Clerk
  const { organization } = useOrganization()
  const { user } = useUser()
  
  // Form state for multiple participants
  const [participantRows, setParticipantRows] = useState<ParticipantRow[]>([{
    id: Date.now().toString(),
    name: '',
    email: '',
    department: '',
    nameError: false,
    emailError: false
  }])
  const nameInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})
  
  // CSV upload state
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadParticipants()
  }, [])

  const loadParticipants = async () => {
    setLoading(true)
    try {
      // Fetch participants from API - filtered by organization
      const response = await fetch('/api/company/users/v2')
      if (!response.ok) {
        throw new Error('Failed to fetch participants')
      }
      
      const data = await response.json()
      
      // Transform API response to match our Participant interface
      const transformedParticipants: Participant[] = data.users?.map((user: any) => {
        // Combine firstName and lastName, but if they're both empty or the same, just use one
        let displayName = '';
        if (user.firstName && user.lastName && user.firstName !== user.lastName) {
          displayName = `${user.firstName} ${user.lastName}`.trim();
        } else if (user.firstName) {
          displayName = user.firstName;
        } else {
          displayName = user.email.split('@')[0];
        }
        
        return {
          id: user.email, // Use email as ID since we don't have a separate ID
          name: displayName,
          email: user.email,
          status: user.status || 'invited',
          department: user.department || '',
          lastActive: user.lastSignIn ? new Date(user.lastSignIn).toLocaleDateString() : undefined,
          joinedDate: new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })
        };
      }) || []
      
      setParticipants(transformedParticipants)
    } catch (error) {
      console.error('Failed to load participants:', error)
      // Set empty array on error to show no participants rather than stale data
      setParticipants([])
    } finally {
      setLoading(false)
    }
  }

  const addParticipantRow = () => {
    const newId = Date.now().toString()
    setParticipantRows([...participantRows, {
      id: newId,
      name: '',
      email: '',
      department: '',
      nameError: false,
      emailError: false
    }])
    
    // Focus on the new row's name field after a short delay
    setTimeout(() => {
      nameInputRefs.current[newId]?.focus()
    }, 50)
  }

  const removeParticipantRow = (id: string) => {
    if (participantRows.length > 1) {
      setParticipantRows(participantRows.filter(row => row.id !== id))
    }
  }

  const updateParticipantRow = (id: string, field: string, value: string) => {
    setParticipantRows(participantRows.map(row => {
      if (row.id === id) {
        const updated = { ...row, [field]: value }
        // Clear error when user types
        if (field === 'name' && value) updated.nameError = false
        if (field === 'email' && value) updated.emailError = false
        return updated
      }
      return row
    }))
  }

  const handleKeyDown = (e: React.KeyboardEvent, rowId: string, field: string) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const currentRow = participantRows.find(row => row.id === rowId)
      
      if (!currentRow) return
      
      // Check if required fields are filled
      if (currentRow.name && currentRow.email) {
        // Add a new row
        addParticipantRow()
      } else {
        // Show validation errors for empty required fields
        setParticipantRows(participantRows.map(row => {
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

  const handleAddParticipants = async () => {
    // Filter out empty rows and validate
    const validParticipants = participantRows.filter(row => row.name && row.email)
    
    if (validParticipants.length === 0) {
      alert('Please fill in at least one participant with name and email')
      return
    }
    
    try {
      // Add all participants
      for (const participant of validParticipants) {
        const response = await fetch('/api/company/invite', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            emails: [participant.email],
            name: participant.name,
            department: participant.department,
            senderEmail: user?.primaryEmailAddress?.emailAddress || '',
            company: organization?.name || user?.primaryEmailAddress?.emailAddress?.split('@')[1] || '',
            message: `You've been invited to join ${organization?.name || 'our team'} on Campfire`
          })
        })
        
        if (!response.ok) {
          const error = await response.json()
          console.error(`Failed to add participant ${participant.email}:`, error)
        }
      }
      
      // Reload participants to show the new additions
      await loadParticipants()
      
      // Reset form
      setParticipantRows([{
        id: Date.now().toString(),
        name: '',
        email: '',
        department: '',
        nameError: false,
        emailError: false
      }])
      setShowAddSection(false)
    } catch (error) {
      console.error('Failed to add participants:', error)
      alert('Failed to add some participants. Please try again.')
    }
  }

  const handleCSVUpload = async () => {
    if (!csvFile) return
    
    setUploading(true)
    try {
      // TODO: Process CSV file
      console.log('Uploading CSV:', csvFile.name)
      
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setCsvFile(null)
      setShowAddSection(false)
      loadParticipants()
    } catch (error) {
      console.error('Failed to upload CSV:', error)
    } finally {
      setUploading(false)
    }
  }

  const downloadTemplate = () => {
    const template = 'Name,Email,Department,Role\nJohn Doe,john@example.com,Engineering,Member\n'
    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'campfire_participants_template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const copyParticipantInviteLink = (participantId: string, participantEmail: string) => {
    // Create a participant-specific assessment link
    const link = `${window.location.origin}/assessment?participant=${participantId}&email=${encodeURIComponent(participantEmail)}`
    navigator.clipboard.writeText(link)
    setCopiedParticipantId(participantId)
    setTimeout(() => setCopiedParticipantId(null), 1500)
  }

  const filteredParticipants = participants.filter(participant => 
    searchTerm === '' ||
    participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    participant.department?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'invited':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'inactive':
        return 'bg-gray-100 text-gray-600 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-3 h-3 inline mr-1" />
      case 'invited':
        return <Mail className="w-3 h-3 inline mr-1" />
      default:
        return <Clock className="w-3 h-3 inline mr-1" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin h-8 w-8 text-purple-600 mr-3" />
        <span className="text-white/60">Loading participants...</span>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-3">
          Participants
        </h2>
        <p className="text-lg text-white/80">
          Manage assessment participants and send them assessment links
        </p>
      </div>

      {/* Add Users Section - Collapsible */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 mb-6">
        <button
          onClick={() => setShowAddSection(!showAddSection)}
          className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Plus className="w-5 h-5 text-purple-400" />
            <span className="font-medium text-white">Add Participants</span>
          </div>
          {showAddSection ? (
            <ChevronUp className="w-5 h-5 text-white/40" />
          ) : (
            <ChevronDown className="w-5 h-5 text-white/40" />
          )}
        </button>

        {showAddSection && (
          <div className="border-t border-white/10 p-6">
            {/* Mode Toggle */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setAddMode('single')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  addMode === 'single'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                Add Participants
              </button>
              <button
                onClick={() => setAddMode('bulk')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  addMode === 'bulk'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                Upload CSV
              </button>
            </div>

            {addMode === 'single' ? (
              /* Multiple Participants Form */
              <div className="space-y-4">
                {/* Header row with labels */}
                <div className="grid grid-cols-12 gap-4 mb-2">
                  <div className="col-span-4">
                    <label className="block text-sm font-medium text-white/80">
                      Name *
                    </label>
                  </div>
                  <div className="col-span-4">
                    <label className="block text-sm font-medium text-white/80">
                      Email *
                    </label>
                  </div>
                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-white/80">
                      Department
                    </label>
                  </div>
                  <div className="col-span-1"></div>
                </div>
                
                {/* Participant rows */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {participantRows.map((row, index) => (
                    <div key={row.id} className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-4">
                        <input
                          ref={(el) => { nameInputRefs.current[row.id] = el }}
                          type="text"
                          value={row.name}
                          onChange={(e) => updateParticipantRow(row.id, 'name', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, row.id, 'name')}
                          placeholder={row.nameError ? 'Name required' : 'John Doe'}
                          className={`w-full px-4 py-2 bg-white/10 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                            row.nameError 
                              ? 'border-red-500 placeholder-red-400' 
                              : 'border-white/20 placeholder-white/40'
                          }`}
                        />
                      </div>
                      <div className="col-span-4">
                        <input
                          type="email"
                          value={row.email}
                          onChange={(e) => updateParticipantRow(row.id, 'email', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, row.id, 'email')}
                          onBlur={(e) => {
                            // Validate email on blur
                            if (e.target.value && !validateEmail(e.target.value)) {
                              updateParticipantRow(row.id, 'emailError', 'true')
                            }
                          }}
                          placeholder={row.emailError ? 'Email required' : 'john@example.com'}
                          className={`w-full px-4 py-2 bg-white/10 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                            row.emailError 
                              ? 'border-red-500 placeholder-red-400' 
                              : 'border-white/20 placeholder-white/40'
                          }`}
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="text"
                          value={row.department}
                          onChange={(e) => updateParticipantRow(row.id, 'department', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, row.id, 'department')}
                          placeholder="Engineering"
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div className="col-span-1 flex gap-1">
                        {index === participantRows.length - 1 ? (
                          <button
                            onClick={addParticipantRow}
                            className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            title="Add another participant"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => removeParticipantRow(row.id)}
                            className="p-2 bg-white/10 text-white/60 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-colors"
                            title="Remove this participant"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Help text */}
                <p className="text-sm text-white/60">
                  Populate required fields and hit Enter to add a new row, or click the + button
                </p>
                
                {/* Submit button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleAddParticipants}
                    disabled={!participantRows.some(row => row.name && row.email)}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {(() => {
                      const validCount = participantRows.filter(row => row.name && row.email).length
                      return validCount > 1 
                        ? `Add ${validCount} Participants`
                        : validCount === 1
                        ? 'Add Participant'
                        : 'Add Participants'
                    })()}
                  </button>
                </div>
              </div>
            ) : (
              /* CSV Upload */
              <div className="space-y-4">
                <div className="bg-white/5 border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-white/40 mx-auto mb-4" />
                  <p className="text-white/80 mb-4">
                    Upload a CSV file with participant information
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={downloadTemplate}
                      className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download Template
                    </button>
                    <label className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer">
                      <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      Choose File
                    </label>
                  </div>
                  {csvFile && (
                    <p className="mt-4 text-sm text-white/60">
                      Selected: {csvFile.name}
                    </p>
                  )}
                </div>
                {csvFile && (
                  <div className="flex justify-end">
                    <button
                      onClick={handleCSVUpload}
                      disabled={uploading}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="animate-spin h-4 w-4" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Upload CSV
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name, email, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <span className="text-sm text-gray-600">
            {filteredParticipants.length} participants
          </span>
        </div>
      </div>

      {/* Users Table or Empty State */}
      {filteredParticipants.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12">
          <div className="max-w-md mx-auto text-center">
            {/* Icon */}
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-purple-600" />
            </div>
            
            {/* Title */}
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No participants yet
            </h3>
            
            {/* Description */}
            <p className="text-gray-600 mb-8">
              Get started by adding your first participants. They'll receive invitations to complete assessments and provide valuable insights.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  setShowAddSection(true)
                  setAddMode('single')
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                Add Participants
              </button>
              <button
                onClick={() => {
                  setShowAddSection(true)
                  setAddMode('bulk')
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-purple-600 border-2 border-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium"
              >
                <Upload className="w-5 h-5" />
                Upload CSV
              </button>
            </div>
            
            {/* Help text */}
            <p className="text-sm text-gray-500 mt-8">
              Tip: You can bulk import participants using a CSV file with names and email addresses
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invite
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredParticipants.map((participant) => (
                <tr key={participant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                        {participant.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{participant.name}</div>
                        <div className="text-sm text-gray-500">{participant.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex">
                      <span className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full border ${getStatusColor(participant.status)}`}>
                        {getStatusIcon(participant.status)}
                        {participant.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {participant.department || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {participant.lastActive || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {participant.status !== 'active' && (
                      <button
                        onClick={() => copyParticipantInviteLink(participant.id, participant.email)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                        title="Copy invite link"
                      >
                        {copiedParticipantId === participant.id ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Link className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}