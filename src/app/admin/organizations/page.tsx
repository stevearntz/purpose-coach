'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Building2, Globe, Users, Mail, Loader2, Check, X, ExternalLink, ArrowLeft } from 'lucide-react';
import AdminGuard from '../AdminGuard';
import { useToast } from '@/hooks/useToast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Organization {
  id: string | null;
  name: string;
  logo: string | null;
  clerkOrgId: string | null;
  clerkOrgSlug: string | null;
  memberCount: number;
  adminCount: number;
  domains?: string[];
  createdAt: Date;
  hasClerkOrg: boolean;
}

interface InviteUser {
  email: string;
  name: string;
}

export default function AdminOrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  
  // Create org form
  const [orgForm, setOrgForm] = useState({
    name: '',
    logo: '',
    domains: ''
  });
  const [creating, setCreating] = useState(false);
  
  // Invite form
  const [inviteForm, setInviteForm] = useState<InviteUser>({
    email: '',
    name: ''
  });
  const [inviting, setInviting] = useState(false);
  
  useEffect(() => {
    loadOrganizations();
  }, []);
  
  const loadOrganizations = async () => {
    try {
      const response = await fetch('/api/admin/organizations');
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data.organizations);
      } else {
        showError('Failed to load organizations');
      }
    } catch (error) {
      showError('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateOrganization = async () => {
    if (!orgForm.name.trim()) {
      showError('Organization name is required');
      return;
    }
    
    // Parse and validate domains
    const domains = orgForm.domains
      .split(',')
      .map(d => d.trim())
      .filter(d => d.length > 0);
    
    // Validate domain format on client side
    if (domains.length > 0) {
      const domainRegex = /^@[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
      const invalidDomains = domains.filter(d => !domainRegex.test(d));
      
      if (invalidDomains.length > 0) {
        showError(`Invalid domain format: ${invalidDomains.join(', ')}. Use format: @example.com`);
        return;
      }
      
      // Check for duplicates within the same submission
      const uniqueDomains = new Set(domains);
      if (uniqueDomains.size !== domains.length) {
        showError('Please remove duplicate domains from your list');
        return;
      }
    }
    
    setCreating(true);
    try {
      
      const response = await fetch('/api/admin/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: orgForm.name.trim(),
          logo: orgForm.logo.trim() || null,
          domains
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showSuccess(`Organization "${orgForm.name}" created successfully!`);
        setShowCreateModal(false);
        setOrgForm({ name: '', logo: '', domains: '' });
        await loadOrganizations();
      } else {
        showError(data.error || 'Failed to create organization');
      }
    } catch (error) {
      showError('Failed to create organization');
    } finally {
      setCreating(false);
    }
  };
  
  const handleInviteUser = async () => {
    if (!inviteForm.email.trim() || !selectedOrg) {
      showError('Email is required');
      return;
    }
    
    if (!selectedOrg.clerkOrgId) {
      showError('This organization needs to be synced with Clerk first');
      return;
    }
    
    setInviting(true);
    try {
      const response = await fetch('/api/admin/organizations/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteForm.email.trim(),
          name: inviteForm.name.trim() || null,
          organizationId: selectedOrg.id,
          clerkOrgId: selectedOrg.clerkOrgId
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (data.userAdded) {
          showSuccess(`${inviteForm.email} added to ${selectedOrg.name} as admin`);
        } else {
          showSuccess(`Invitation sent to ${inviteForm.email}`);
          navigator.clipboard.writeText(data.inviteUrl);
          showSuccess('Invite link copied to clipboard!');
        }
        setShowInviteModal(false);
        setInviteForm({ email: '', name: '' });
        await loadOrganizations();
      } else {
        showError(data.error || 'Failed to send invitation');
      }
    } catch (error) {
      showError('Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };
  
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
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </Link>
              <div>
                <h1 className="text-4xl font-bold text-white">Organizations</h1>
                <p className="text-white/70 mt-1">Create and manage customer organizations</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Create Organization
            </button>
          </div>
          
          {/* Organizations Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : organizations.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-12 text-center border border-white/20">
              <Building2 className="w-16 h-16 text-white/40 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No organizations yet</h3>
              <p className="text-white/60 mb-6">Create your first organization to get started</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                Create Organization
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {organizations.map((org) => (
                <div key={org.clerkOrgId || org.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    {org.logo ? (
                      <img src={org.logo} alt={org.name} className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-purple-600/20 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-purple-400" />
                      </div>
                    )}
                    {org.hasClerkOrg && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-2">{org.name}</h3>
                  
                  <div className="space-y-2 text-sm text-white/60 mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{org.memberCount} {org.memberCount === 1 ? 'member' : 'members'}</span>
                    </div>
                    {org.adminCount > 0 && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-400" />
                        <span>{org.adminCount} {org.adminCount === 1 ? 'admin' : 'admins'}</span>
                      </div>
                    )}
                    {org.domains && org.domains.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        <span className="truncate">{org.domains.join(', ')}</span>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => {
                      setSelectedOrg(org);
                      setShowInviteModal(true);
                    }}
                    disabled={!org.hasClerkOrg}
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                      org.hasClerkOrg
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-white/10 text-white/40 cursor-not-allowed'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    Invite Admin
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Create Organization Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create Organization</h2>
                <button
                  onClick={() => !creating && setShowCreateModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={creating}
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    value={orgForm.name}
                    onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                    placeholder="e.g., GoSolo"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    disabled={creating}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    value={orgForm.logo}
                    onChange={(e) => setOrgForm({ ...orgForm, logo: e.target.value })}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    disabled={creating}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Allowed Email Domains
                  </label>
                  <input
                    type="text"
                    value={orgForm.domains}
                    onChange={(e) => setOrgForm({ ...orgForm, domains: e.target.value })}
                    placeholder="@gosolo.com, @example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    disabled={creating}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Comma-separated list of email domains (e.g., @company.com). Each domain can only belong to one organization.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateOrganization}
                  disabled={creating || !orgForm.name.trim()}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Create Organization
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Invite Admin Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Invite Admin to {selectedOrg?.name}
                </h2>
                <button
                  onClick={() => !inviting && setShowInviteModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={inviting}
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    placeholder="admin@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    disabled={inviting}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={inviteForm.name}
                    onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    disabled={inviting}
                  />
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    This will send an invitation to join as an organization admin. 
                    They'll have full access to manage users, campaigns, and view results.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowInviteModal(false)}
                  disabled={inviting}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInviteUser}
                  disabled={inviting || !inviteForm.email.trim()}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {inviting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Send Invitation
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}