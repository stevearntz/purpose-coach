'use client'

import React, { useState, useEffect } from 'react'
import { 
  Users, Plus, ChevronDown, ChevronUp, Upload, Download,
  Search, Filter, Link, Trash2, Edit3, Mail,
  CheckCircle, Clock, X, Loader2
} from 'lucide-react'

interface Participant {
  id: string
  name: string
  email: string
  status: 'active' | 'invited' | 'inactive'
  role?: string
  department?: string
  lastActive?: string
  joinedDate: string
}

export default function ParticipantsTab() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddSection, setShowAddSection] = useState(false)
  const [addMode, setAddMode] = useState<'single' | 'bulk'>('single')
  const [copiedParticipantId, setCopiedParticipantId] = useState<string | null>(null)
  
  // Form state for single participant
  const [newParticipantName, setNewParticipantName] = useState('')
  const [newParticipantEmail, setNewParticipantEmail] = useState('')
  const [newParticipantDepartment, setNewParticipantDepartment] = useState('')
  const [newParticipantRole, setNewParticipantRole] = useState('')
  
  // CSV upload state
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadParticipants()
  }, [])

  const loadParticipants = async () => {
    setLoading(true)
    try {
      // In production, this would fetch from API
      // For now, use mock data
      const mockParticipants: Participant[] = [
        {
          id: '1',
          name: 'Steve Arntz',
          email: 'steve@getcampfire.com',
          status: 'active',
          role: 'Admin',
          department: 'Product',
          lastActive: '2 hours ago',
          joinedDate: 'Aug 10, 2025'
        },
        {
          id: '2',
          name: 'Ella Wright',
          email: 'ella@getcampfire.com',
          status: 'invited',
          role: 'Member',
          department: 'Engineering',
          joinedDate: 'Aug 11, 2025'
        },
        {
          id: '3',
          name: 'Test Participant',
          email: 'test@example.com',
          status: 'active',
          role: 'Member',
          department: 'Product',
          lastActive: '1 day ago',
          joinedDate: 'Aug 12, 2025'
        }
      ]
      setParticipants(mockParticipants)
    } catch (error) {
      console.error('Failed to load participants:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSingleParticipant = async () => {
    if (!newParticipantName || !newParticipantEmail) return
    
    // TODO: API call to add participant
    const newParticipant: Participant = {
      id: Date.now().toString(),
      name: newParticipantName,
      email: newParticipantEmail,
      status: 'invited',
      role: newParticipantRole || 'Member',
      department: newParticipantDepartment,
      joinedDate: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }
    
    setParticipants([...participants, newParticipant])
    
    // Reset form
    setNewParticipantName('')
    setNewParticipantEmail('')
    setNewParticipantDepartment('')
    setNewParticipantRole('')
    setShowAddSection(false)
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
                Add Single Participant
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
              /* Single Participant Form */
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={newParticipantName}
                      onChange={(e) => setNewParticipantName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={newParticipantEmail}
                      onChange={(e) => setNewParticipantEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      value={newParticipantDepartment}
                      onChange={(e) => setNewParticipantDepartment(e.target.value)}
                      placeholder="Engineering"
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Role
                    </label>
                    <select
                      value={newParticipantRole}
                      onChange={(e) => setNewParticipantRole(e.target.value)}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select role</option>
                      <option value="Admin">Admin</option>
                      <option value="Member">Member</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleAddSingleParticipant}
                    disabled={!newParticipantName || !newParticipantEmail}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Participant
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

      {/* Users Table */}
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
                Role
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {participant.role || '-'}
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
    </div>
  )
}