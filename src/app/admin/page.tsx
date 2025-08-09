'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Send, Copy, ExternalLink, User, Clock, CheckCircle, AlertCircle, RefreshCw, Mail, Users, X, Search, Building2, Check } from 'lucide-react';
import ViewportContainer from '@/components/ViewportContainer';
import Modal from '@/components/Modal';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/useToast';

interface Invitation {
  id: string;
  email: string;
  name?: string;
  company?: string;
  inviteCode: string;
  inviteUrl: string;
  status: 'pending' | 'sent' | 'opened' | 'started' | 'completed';
  createdAt: string;
  sentAt?: string;
  openedAt?: string;
  startedAt?: string;
  completedAt?: string;
  currentStage?: string;
  metadata?: {
    role?: string;
    challenges?: string[];
    toolsAccessed?: string[];
  };
}

export default function AdminPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true); // Add initial data loading state
  const [selectedInvite, setSelectedInvite] = useState<Invitation | null>(null);
  const { showSuccess, showError, showInfo } = useToast();
  
  // Form state
  const [formData, setFormData] = useState({
    company: '',
    companyLogo: '',
    personalMessage: '',
    sendImmediately: true
  });
  const [currentUser, setCurrentUser] = useState({ email: '', name: '' });
  const [usersList, setUsersList] = useState<{ email: string; name: string }[]>([]);
  const [duplicateUsers, setDuplicateUsers] = useState<{email: string; name: string; invitation: Invitation}[]>([]);
  
  // Company typeahead state
  const [companySearch, setCompanySearch] = useState('');
  const [companies, setCompanies] = useState<{id: string; name: string; logo?: string}[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<{id: string; name: string; logo?: string} | null>(null);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [isNewCompany, setIsNewCompany] = useState(false);

  // Load invitations on mount
  useEffect(() => {
    loadInvitations();
  }, []);
  
  // Search for companies when user types
  useEffect(() => {
    const searchCompanies = async () => {
      if (companySearch.length < 1) {
        setCompanies([]);
        setShowCompanyDropdown(false);
        return;
      }
      
      try {
        const response = await fetch(`/api/companies/search?q=${encodeURIComponent(companySearch)}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Search results for', companySearch, ':', data.companies);
          setCompanies(data.companies);
          // Always show dropdown when typing, even if no results (to show "Create" option)
          setShowCompanyDropdown(true);
        } else {
          console.error('Search failed with status:', response.status);
        }
      } catch (error) {
        console.error('Failed to search companies:', error);
      }
    };
    
    const debounceTimer = setTimeout(searchCompanies, 200);
    return () => clearTimeout(debounceTimer);
  }, [companySearch]);

  const loadInvitations = async () => {
    try {
      const response = await fetch('/api/admin/invitations');
      if (response.ok) {
        const data = await response.json();
        setInvitations(data.invitations || []);
      }
    } catch (error) {
      console.error('Failed to load invitations:', error);
    } finally {
      setDataLoading(false); // Mark data as loaded
    }
  };

  const addUser = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!currentUser.email.trim()) {
      showError('Please enter an email address');
      return;
    }
    
    if (!emailRegex.test(currentUser.email.trim())) {
      showError('Please enter a valid email address');
      return;
    }
    
    // Check if already in the current lists
    if (usersList.some(u => u.email === currentUser.email.trim()) || 
        duplicateUsers.some(u => u.email === currentUser.email.trim())) {
      showError('This email has already been added');
      return;
    }
    
    // Check if user already has an invitation for the selected company
    const companyName = selectedCompany?.name || companySearch;
    const existingInvite = invitations.find(inv => 
      inv.email === currentUser.email.trim() && 
      inv.company === companyName
    );
    
    if (existingInvite) {
      // Add to duplicate users list with the existing invitation
      setDuplicateUsers([...duplicateUsers, {
        email: currentUser.email.trim(),
        name: currentUser.name.trim() || existingInvite.name || '',
        invitation: existingInvite
      }]);
    } else {
      // Add to regular users list for new invitation
      setUsersList([...usersList, { 
        email: currentUser.email.trim(), 
        name: currentUser.name.trim() 
      }]);
    }
    
    setCurrentUser({ email: '', name: '' });
    showSuccess(`Added ${currentUser.name || currentUser.email}`);
  };

  const removeUser = (index: number) => {
    setUsersList(usersList.filter((_, i) => i !== index));
  };
  
  const removeDuplicateUser = (index: number) => {
    setDuplicateUsers(duplicateUsers.filter((_, i) => i !== index));
  };

  const handleCompanySelect = (company: {id: string; name: string; logo?: string}) => {
    setSelectedCompany(company);
    setCompanySearch(company.name);
    setIsNewCompany(false);
    setShowCompanyDropdown(false);
    if (company.logo) {
      setFormData({ ...formData, companyLogo: company.logo });
    }
  };
  
  const handleCreateNewCompany = () => {
    setSelectedCompany(null);
    setIsNewCompany(true);
    setShowCompanyDropdown(false);
  };
  
  const handleCreateInvitation = async () => {
    if (!companySearch.trim()) {
      showError('Please enter a company name');
      return;
    }
    
    if (usersList.length === 0 && duplicateUsers.length === 0) {
      showError('Please add at least one user');
      return;
    }
    
    // Only proceed if there are new users to invite
    if (usersList.length === 0) {
      showInfo('All selected users already have invitations. Use the resend or copy link options.');
      return;
    }
    
    setLoading(true);
    try {
      // Create or get company
      let companyId = selectedCompany?.id;
      let companyName = selectedCompany?.name || companySearch;
      
      // If no company selected, treat as new company
      if (!selectedCompany) {
        // Create new company
        const companyResponse = await fetch('/api/companies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name: companySearch,
            logo: formData.companyLogo || undefined
          })
        });
        
        if (!companyResponse.ok) {
          const error = await companyResponse.json();
          if (error.company) {
            // Company already exists, use it
            companyId = error.company.id;
            companyName = error.company.name;
          } else {
            throw new Error('Failed to create company');
          }
        } else {
          const { company } = await companyResponse.json();
          companyId = company.id;
          companyName = company.name;
        }
      }
      
      // Create invitations for each user using the database API
      const invitationPromises = usersList.map(async (user) => {
        const response = await fetch('/api/admin/invitations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            name: user.name || undefined,
            companyId,
            personalMessage: formData.personalMessage,
            sendImmediately: formData.sendImmediately
          })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          if (data.duplicate) {
            // Handle duplicate invitation
            showError(`${user.email} already has an invitation. Use the existing invitation link or resend from the dashboard.`);
            return null;
          }
          throw new Error(`Failed to create invitation for ${user.email}`);
        }
        return data;
      });
      
      const newInvitations = await Promise.all(invitationPromises);
      
      // Filter out null values (duplicates)
      const successfulInvitations = newInvitations.filter(inv => inv !== null);
      
      // Refresh the list
      await loadInvitations();
      
      // Reset form and close modal
      setFormData({
        company: '',
        companyLogo: '',
        personalMessage: '',
        sendImmediately: true
      });
      setUsersList([]);
      setDuplicateUsers([]);
      setCurrentUser({ email: '', name: '' });
      setCompanySearch('');
      setSelectedCompany(null);
      setIsNewCompany(false);
      setShowCompanyDropdown(false);
      setShowCreateModal(false);
      
      // Show success message with details
      const successCount = successfulInvitations.length;
      const duplicateCount = usersList.length - successCount;
      
      if (successCount > 0) {
        const userText = successCount === 1 ? '1 invitation' : `${successCount} invitations`;
        showSuccess(
          `Successfully created ${userText} for ${companyName}! ${
            formData.sendImmediately ? 'Emails have been sent.' : 'Ready to send when you are.'
          }`
        );
      }
      
      if (duplicateCount > 0) {
        const dupText = duplicateCount === 1 ? '1 user already had' : `${duplicateCount} users already had`;
        showInfo(`${dupText} an invitation.`);
      }
    } catch (error) {
      console.error('Failed to create invitations:', error);
      showError('Failed to create invitations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendInvitation = async (invitation: Invitation) => {
    try {
      const response = await fetch(`/api/admin/invitations/${invitation.id}/resend`, {
        method: 'POST'
      });
      
      if (response.ok) {
        await loadInvitations();
        showSuccess(`Invitation resent to ${invitation.email}`);
      }
    } catch (error) {
      console.error('Failed to resend invitation:', error);
      showError('Failed to resend invitation');
    }
  };

  const copyInviteLink = (url: string) => {
    navigator.clipboard.writeText(url);
    showInfo('Invite link copied to clipboard! 📋');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-500" />;
      case 'sent':
        return <Mail className="w-4 h-4 text-blue-500" />;
      case 'opened':
        return <ExternalLink className="w-4 h-4 text-purple-500" />;
      case 'started':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-700';
      case 'sent':
        return 'bg-blue-100 text-blue-700';
      case 'opened':
        return 'bg-purple-100 text-purple-700';
      case 'started':
        return 'bg-orange-100 text-orange-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <>
      <ViewportContainer className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Onboarding Admin</h1>
              <p className="text-gray-600 mt-1">Manage customer invitations and track onboarding progress</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              disabled={dataLoading}
              className="flex items-center gap-2 px-6 py-3 bg-iris-500 text-white rounded-lg hover:bg-iris-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
              Create Invitation
            </button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Invitations</p>
                  <p className="text-2xl font-bold text-gray-900">{invitations.length}</p>
                </div>
                <Users className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Sent</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {invitations.filter(i => i.status !== 'pending').length}
                  </p>
                </div>
                <Mail className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {invitations.filter(i => i.status === 'started').length}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-orange-400" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {invitations.filter(i => i.status === 'completed').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>
          </div>

          {/* Invitations Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">All Invitations</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recipient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dataLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex justify-center items-center gap-3">
                          <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
                          <span className="text-gray-500">Loading invitations...</span>
                        </div>
                      </td>
                    </tr>
                  ) : invitations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        No invitations yet. Create your first invitation to get started.
                      </td>
                    </tr>
                  ) : (
                    invitations.map((invitation) => (
                      <tr key={invitation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-purple-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {invitation.name || 'Unknown'}
                              </div>
                              <div className="text-sm text-gray-500">{invitation.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {invitation.company || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(invitation.status)}`}>
                            {getStatusIcon(invitation.status)}
                            {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(invitation.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {invitation.currentStage || 'Not started'}
                          </div>
                          {invitation.metadata?.toolsAccessed && invitation.metadata.toolsAccessed.length > 0 && (
                            <div className="text-xs text-gray-500">
                              {invitation.metadata.toolsAccessed.length} tools accessed
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => copyInviteLink(invitation.inviteUrl)}
                              className="text-gray-400 hover:text-gray-600"
                              title="Copy invite link"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleResendInvitation(invitation)}
                              className="text-gray-400 hover:text-gray-600"
                              title="Resend invitation"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setSelectedInvite(invitation)}
                              className="text-iris-600 hover:text-iris-900"
                            >
                              View Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </ViewportContainer>

      {/* Create Invitation Modal */}
      <Modal isOpen={showCreateModal && !dataLoading} onClose={() => {
        setShowCreateModal(false);
        setFormData({ company: '', companyLogo: '', personalMessage: '', sendImmediately: true });
        setUsersList([]);
        setDuplicateUsers([]);
        setCurrentUser({ email: '', name: '' });
        setCompanySearch('');
        setSelectedCompany(null);
        setIsNewCompany(false);
        setShowCompanyDropdown(false);
      }}>
        <div className="p-6 max-w-2xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Invitation</h2>
          
          <div className="space-y-5">
            {/* Company Fields - First and Required */}
            <div className="space-y-3">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={companySearch}
                    onChange={(e) => {
                      setCompanySearch(e.target.value);
                      setSelectedCompany(null);
                      setIsNewCompany(false);
                    }}
                    onFocus={() => {
                      // Show dropdown if there's any text or if we have companies
                      if (companySearch.length >= 1) {
                        setShowCompanyDropdown(true);
                      }
                    }}
                    onBlur={() => {
                      // Delay to allow click on dropdown items
                      setTimeout(() => setShowCompanyDropdown(false), 200);
                    }}
                    placeholder="Start typing to search or create new..."
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-iris-500"
                    autoFocus
                  />
                  <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
                </div>
                
                {/* Company Dropdown */}
                {showCompanyDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {companies.length > 0 ? (
                      <>
                        <div className="p-2 border-b border-gray-100">
                          <p className="text-xs text-gray-500 uppercase tracking-wider px-2">
                            Existing Companies
                          </p>
                        </div>
                        {companies.map((company) => (
                          <button
                            key={company.id}
                            type="button"
                            onClick={() => handleCompanySelect(company)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3"
                          >
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-900">{company.name}</span>
                          </button>
                        ))}
                      </>
                    ) : null}
                    
                    {companySearch.length >= 1 && (
                      <button
                        type="button"
                        onClick={handleCreateNewCompany}
                        className="w-full text-left px-4 py-3 border-t border-gray-100 hover:bg-purple-50 flex items-center gap-3"
                      >
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <Plus className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            Create "{companySearch}"
                          </div>
                          <div className="text-xs text-gray-500">
                            Set up a new company
                          </div>
                        </div>
                      </button>
                    )}
                  </div>
                )}
                
                {/* Selected Company Badge */}
                {(selectedCompany || isNewCompany) && (
                  <div className="mt-2 p-2 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-purple-600" />
                      <span className="text-sm text-purple-900">
                        {isNewCompany ? (
                          <>Creating new company: <strong>{companySearch}</strong></>
                        ) : (
                          <>Selected: <strong>{selectedCompany?.name}</strong></>
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Logo URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.companyLogo}
                  onChange={(e) => setFormData({ ...formData, companyLogo: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-iris-500"
                />
                <p className="text-xs text-gray-500 mt-1">Provide a URL to your company logo for a personalized welcome experience</p>
                {formData.companyLogo && (
                  <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Preview:</p>
                    <img 
                      src={formData.companyLogo} 
                      alt="Company logo preview" 
                      className="h-12 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Users Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Users to Invite
              </label>
              
              {/* Add User Input Row */}
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={currentUser.email}
                  onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addUser();
                    }
                  }}
                  placeholder="Email address"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-iris-500"
                />
                <input
                  type="text"
                  value={currentUser.name}
                  onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addUser();
                    }
                  }}
                  placeholder="Name (optional)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-iris-500"
                />
                <button
                  onClick={addUser}
                  className="px-4 py-2 bg-iris-500 text-white rounded-lg hover:bg-iris-600 transition-colors"
                  title="Add user"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              
              {/* Users Lists */}
              {usersList.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                    {usersList.length} new invitation{usersList.length !== 1 ? 's' : ''} to create
                  </p>
                  {usersList.map((user, index) => (
                    <div key={index} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Plus className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.name || 'No name'}
                          </div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeUser(index)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {duplicateUsers.length > 0 && (
                <div className="bg-amber-50 rounded-lg p-3 space-y-2">
                  <p className="text-xs text-amber-700 font-medium uppercase tracking-wider">
                    {duplicateUsers.length} existing invitation{duplicateUsers.length !== 1 ? 's' : ''}
                  </p>
                  {duplicateUsers.map((user, index) => (
                    <div key={index} className="bg-white rounded-lg px-3 py-2 border border-amber-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.name || 'No name'}
                            </div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                            <div className="text-xs text-amber-600 mt-0.5">
                              Already invited • {user.invitation.status}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeDuplicateUser(index)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex gap-2 mt-2 pl-11">
                        <button
                          onClick={() => handleResendInvitation(user.invitation)}
                          className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition-colors flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Resend
                        </button>
                        <button
                          onClick={() => copyInviteLink(user.invitation.inviteUrl)}
                          className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition-colors flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          Copy Link
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {usersList.length === 0 && duplicateUsers.length === 0 && (
                <p className="text-xs text-gray-500 italic">No users added yet. Add users above to send invitations.</p>
              )}
            </div>

            {/* Personal Message - Last and Optional */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Personal Message (Optional)
              </label>
              <textarea
                value={formData.personalMessage}
                onChange={(e) => setFormData({ ...formData, personalMessage: e.target.value })}
                placeholder="Add a personal message to the invitation email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-iris-500"
                rows={3}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="sendImmediately"
                checked={formData.sendImmediately}
                onChange={(e) => setFormData({ ...formData, sendImmediately: e.target.checked })}
                className="h-4 w-4 text-iris-600 focus:ring-iris-500 border-gray-300 rounded"
              />
              <label htmlFor="sendImmediately" className="ml-2 block text-sm text-gray-900">
                Send invitation email immediately
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => {
                setShowCreateModal(false);
                setFormData({ company: '', companyLogo: '', personalMessage: '', sendImmediately: true });
                setUsersList([]);
                setDuplicateUsers([]);
                setCurrentUser({ email: '', name: '' });
                setCompanySearch('');
                setSelectedCompany(null);
                setIsNewCompany(false);
                setShowCompanyDropdown(false);
              }}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateInvitation}
              disabled={!companySearch.trim() || (usersList.length === 0 && duplicateUsers.length === 0) || loading}
              className="flex items-center gap-2 px-6 py-2 bg-iris-500 text-white rounded-lg hover:bg-iris-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {usersList.length > 0 ? 'Create & Send' : 'Continue'}
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Invitation Details Modal */}
      {selectedInvite && (
        <Modal isOpen={!!selectedInvite} onClose={() => setSelectedInvite(null)}>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Invitation Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Recipient</label>
                <p className="text-lg font-medium text-gray-900">{selectedInvite.name || 'Unknown'}</p>
                <p className="text-sm text-gray-600">{selectedInvite.email}</p>
              </div>

              {selectedInvite.company && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Company</label>
                  <p className="text-lg text-gray-900">{selectedInvite.company}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-500">Invite Link</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={selectedInvite.inviteUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    onClick={() => copyInviteLink(selectedInvite.inviteUrl)}
                    className="px-3 py-2 text-gray-600 hover:text-gray-900"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Timeline</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Created: {new Date(selectedInvite.createdAt).toLocaleString()}</span>
                  </div>
                  {selectedInvite.sentAt && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">Sent: {new Date(selectedInvite.sentAt).toLocaleString()}</span>
                    </div>
                  )}
                  {selectedInvite.openedAt && (
                    <div className="flex items-center gap-3">
                      <ExternalLink className="w-4 h-4 text-purple-500" />
                      <span className="text-sm">Opened: {new Date(selectedInvite.openedAt).toLocaleString()}</span>
                    </div>
                  )}
                  {selectedInvite.startedAt && (
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                      <span className="text-sm">Started: {new Date(selectedInvite.startedAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedInvite.metadata && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Progress Details</label>
                  {selectedInvite.metadata.role && (
                    <p className="text-sm text-gray-600">Role: {selectedInvite.metadata.role}</p>
                  )}
                  {selectedInvite.metadata.challenges && selectedInvite.metadata.challenges.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Selected Challenges:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedInvite.metadata.challenges.map((challenge, index) => (
                          <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                            {challenge}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedInvite.metadata.toolsAccessed && selectedInvite.metadata.toolsAccessed.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Tools Accessed:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedInvite.metadata.toolsAccessed.map((tool, index) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedInvite(null)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      <Footer />
    </>
  );
}