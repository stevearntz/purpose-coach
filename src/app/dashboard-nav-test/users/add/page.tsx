'use client'

import { Plus, X, Upload } from 'lucide-react'
import { useState } from 'react'

export default function AddUsersTestPage() {
  const [rows, setRows] = useState([
    { id: 1, name: '', email: '', role: 'participant' }
  ])
  
  const addRow = () => {
    setRows([...rows, { id: Date.now(), name: '', email: '', role: 'participant' }])
  }
  
  const removeRow = (id: number) => {
    if (rows.length > 1) {
      setRows(rows.filter(row => row.id !== id))
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Add Users</h1>
          <p className="text-white/60 mt-1">Invite team members to your organization</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg transition-colors flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
        </div>
      </div>
      
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="space-y-3">
          {rows.map((row, index) => (
            <div key={row.id} className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Name"
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/40"
              />
              <input
                type="email"
                placeholder="Email"
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/40"
              />
              <select 
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
              >
                <option value="participant" className="bg-gray-900">Participant</option>
                <option value="member" className="bg-gray-900">Member</option>
                <option value="admin" className="bg-gray-900">Admin</option>
              </select>
              {rows.length > 1 && (
                <button
                  onClick={() => removeRow(row.id)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-white/50" />
                </button>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={addRow}
            className="flex items-center gap-2 px-4 py-2 text-purple-400 hover:text-purple-300 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Another
          </button>
          
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg transition-colors">
              Cancel
            </button>
            <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
              Send Invites ({rows.length})
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <p className="text-blue-300 text-sm">
          <strong>Role Guide:</strong><br />
          • <strong>Participant</strong> - Can take assessments only<br />
          • <strong>Member</strong> - Can access platform and take assessments<br />
          • <strong>Admin</strong> - Full dashboard access and management
        </p>
      </div>
    </div>
  )
}