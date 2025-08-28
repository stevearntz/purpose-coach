'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOrganization, useUser } from '@clerk/nextjs'
import { ArrowLeft, Plus, X, Upload, Loader2, AlertCircle, Users, UserPlus, Mail } from 'lucide-react'

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
  const [step, setStep] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [userRows, setUserRows] = useState<UserRow[]>([{
    id: Date.now().toString(),
    name: '',
    email: '',
    role: 'participant',
    nameError: false,
    emailError: false
  }])

  const addRow = () => {
    setUserRows([...userRows, {
      id: Date.now().toString(),
      name: '',
      email: '',
      role: 'participant',
      nameError: false,
      emailError: false
    }])
  }

  const removeRow = (id: string) => {
    if (userRows.length > 1) {
      setUserRows(userRows.filter(row => row.id !== id))
    }
  }

  const updateRow = (id: string, field: keyof UserRow, value: any) => {
    setUserRows(userRows.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ))
  }

  const handleSubmit = async () => {
    // Validate all rows
    const validRows = userRows.filter(row => row.name && row.email)
    if (validRows.length === 0) {
      alert('Please fill in at least one user with name and email')
      return
    }

    setIsAdding(true)
    try {
      // Add users logic here
      console.log('Adding users:', validRows)
      
      // Navigate back to users page
      router.push('/dashboard/users')
    } catch (error) {
      console.error('Error adding users:', error)
      alert('Failed to add users')
    } finally {
      setIsAdding(false)
    }
  }

  return (
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
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        {/* CSV Import Option */}
        <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10 border-dashed">
          <button className="w-full flex items-center justify-center gap-2 py-3 text-white/60 hover:text-white transition-colors">
            <Upload className="w-5 h-5" />
            Import from CSV
          </button>
        </div>

        {/* Manual Entry */}
        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-white/80">
            <div className="col-span-4">Name *</div>
            <div className="col-span-4">Email *</div>
            <div className="col-span-3">Role</div>
            <div className="col-span-1"></div>
          </div>

          {userRows.map((row) => (
            <div key={row.id} className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-4">
                <input
                  type="text"
                  value={row.name}
                  onChange={(e) => updateRow(row.id, 'name', e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/40"
                />
              </div>
              <div className="col-span-4">
                <input
                  type="email"
                  value={row.email}
                  onChange={(e) => updateRow(row.id, 'email', e.target.value)}
                  placeholder="john@example.com"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/40"
                />
              </div>
              <div className="col-span-3">
                <select
                  value={row.role}
                  onChange={(e) => updateRow(row.id, 'role', e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                >
                  <option value="participant" className="bg-gray-900">Participant</option>
                  <option value="member" className="bg-gray-900">Member</option>
                  <option value="admin" className="bg-gray-900">Admin</option>
                </select>
              </div>
              <div className="col-span-1">
                {userRows.length > 1 && (
                  <button
                    onClick={() => removeRow(row.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-white/60" />
                  </button>
                )}
              </div>
            </div>
          ))}

          <button
            onClick={addRow}
            className="flex items-center gap-2 px-4 py-2 text-purple-400 hover:text-purple-300 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Another
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-blue-300 text-sm">
            <AlertCircle className="w-4 h-4 inline mr-2" />
            <strong>Role Guide:</strong>
          </p>
          <ul className="mt-2 text-sm text-blue-300/80 space-y-1 ml-6">
            <li>• <strong>Participant:</strong> Can take assessments only (no welcome email)</li>
            <li>• <strong>Member:</strong> Can access platform and take assessments (receives welcome email)</li>
            <li>• <strong>Admin:</strong> Full dashboard access and management (receives welcome email)</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard/users')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isAdding}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isAdding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Add {userRows.filter(r => r.name && r.email).length} User{userRows.filter(r => r.name && r.email).length !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}