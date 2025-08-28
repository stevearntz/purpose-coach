'use client';

import React from 'react';
import { Building2, Plus } from 'lucide-react';
import AdminGuard from './AdminGuard';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  
  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-3">System Administration</h1>
            <p className="text-lg text-white/70">Manage organizations and platform settings</p>
          </div>
          
          {/* Quick Start Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white mb-2">Organization Management</h2>
                <p className="text-white/70">Create and manage customer organizations with Clerk integration</p>
              </div>
              <Link
                href="/admin/organizations"
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Building2 className="w-5 h-5" />
                Manage Organizations
              </Link>
            </div>
          </div>

          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="text-sm text-white/60 mb-1">Active Organizations</div>
              <div className="text-3xl font-bold text-white">3</div>
              <div className="text-xs text-white/50 mt-2">GoSolo, CNH, BecauseMarket</div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="text-sm text-white/60 mb-1">Total Users</div>
              <div className="text-3xl font-bold text-white">0</div>
              <div className="text-xs text-white/50 mt-2">Across all organizations</div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="text-sm text-white/60 mb-1">System Status</div>
              <div className="text-3xl font-bold text-green-400">Online</div>
              <div className="text-xs text-white/50 mt-2">All services operational</div>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}