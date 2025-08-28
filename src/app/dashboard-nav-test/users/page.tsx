'use client'

import { Mail, MoreVertical } from 'lucide-react'

export default function UsersListTestPage() {
  const users = [
    { id: 1, name: 'Steve Arntz', email: 'steve@getcampfire.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'John Doe', email: 'john@example.com', role: 'Member', status: 'Active' },
    { id: 3, name: 'Jane Smith', email: 'jane@example.com', role: 'Participant', status: 'Invited' },
    { id: 4, name: 'Bob Johnson', email: 'bob@example.com', role: 'Participant', status: 'Active' },
    { id: 5, name: 'Alice Williams', email: 'alice@example.com', role: 'Member', status: 'Active' },
  ]
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Team Members</h1>
        <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
          Add Users
        </button>
      </div>
      
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 text-sm text-white">
                  {user.name}
                </td>
                <td className="px-6 py-4">
                  <button className="flex items-center gap-2 px-3 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-full text-sm transition-colors">
                    <Mail className="w-3 h-3" />
                    {user.email}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    user.role === 'Admin' 
                      ? 'bg-purple-500/20 text-purple-300' 
                      : user.role === 'Member' 
                      ? 'bg-blue-500/20 text-blue-300' 
                      : 'bg-gray-500/20 text-gray-300'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    user.status === 'Active' 
                      ? 'bg-green-500/20 text-green-300' 
                      : 'bg-yellow-500/20 text-yellow-300'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="p-1 hover:bg-white/10 rounded transition-colors">
                    <MoreVertical className="w-4 h-4 text-white/50" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}