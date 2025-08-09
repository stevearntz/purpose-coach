'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Eye, EyeOff, Check, X, Lock, User, Mail, Building, ArrowRight } from 'lucide-react';
import ViewportContainer from '@/components/ViewportContainer';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/useToast';
import { ToastProvider } from '@/hooks/useToast';

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

interface InviteData {
  name?: string;
  email?: string;
  company?: string;
  companyLogo?: string;
}

function ClaimAccountContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form fields
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Password validation
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    label: '',
    color: ''
  });
  
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecial: false
  });
  
  // Load invitation data on mount
  useEffect(() => {
    const inviteCode = searchParams.get('invite');
    console.log('[claim-account] URL params:', {
      inviteCode,
      fullURL: window.location.href,
      searchParams: searchParams.toString()
    });
    
    if (inviteCode) {
      loadInviteData(inviteCode);
    } else {
      console.log('[claim-account] No invite code in URL');
      setLoading(false);
    }
  }, [searchParams]);
  
  const loadInviteData = async (inviteCode: string) => {
    try {
      console.log('[claim-account] Loading invite data for code:', inviteCode);
      const response = await fetch(`/api/invitations/${inviteCode}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('[claim-account] Received invite data:', data);
        setInviteData(data);
        
        // Pre-fill form with invitation data
        if (data.name && data.name.trim()) {
          const names = data.name.trim().split(' ');
          const firstName = names[0] || '';
          const lastName = names.slice(1).join(' ') || '';
          
          console.log('[claim-account] Pre-filling with name:', { firstName, lastName, email: data.email });
          
          setFormData(prev => ({
            ...prev,
            firstName: firstName,
            lastName: lastName,
            email: data.email || ''
          }));
        } else if (data.email && data.email.trim()) {
          console.log('[claim-account] Pre-filling with email only:', data.email);
          setFormData(prev => ({
            ...prev,
            email: data.email
          }));
        } else {
          console.log('[claim-account] No data to pre-fill');
        }
      } else {
        console.error('[claim-account] Failed to load invite - status:', response.status);
      }
    } catch (error) {
      console.error('[claim-account] Failed to load invite data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Check password requirements
  useEffect(() => {
    const password = formData.password;
    
    const requirements = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    setPasswordRequirements(requirements);
    
    // Calculate password strength
    const metRequirements = Object.values(requirements).filter(Boolean).length;
    
    if (password.length === 0) {
      setPasswordStrength({ score: 0, label: '', color: '' });
    } else if (metRequirements <= 2) {
      setPasswordStrength({ score: 1, label: 'Weak', color: 'bg-red-500' });
    } else if (metRequirements === 3) {
      setPasswordStrength({ score: 2, label: 'Fair', color: 'bg-yellow-500' });
    } else if (metRequirements === 4) {
      setPasswordStrength({ score: 3, label: 'Good', color: 'bg-blue-500' });
    } else {
      setPasswordStrength({ score: 4, label: 'Strong', color: 'bg-green-500' });
    }
  }, [formData.password]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName.trim()) {
      showError('Please enter your first name');
      return;
    }
    
    if (!formData.email.trim()) {
      showError('Please enter your email address');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showError('Please enter a valid email address');
      return;
    }
    
    if (formData.password.length < 8) {
      showError('Password must be at least 8 characters long');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      showError('Passwords do not match');
      return;
    }
    
    if (passwordStrength.score < 2) {
      showError('Please choose a stronger password');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const inviteCode = searchParams.get('invite');
      
      // First, set up the password and create/update the admin account
      const authResponse = await fetch('/api/auth/setup-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inviteCode,
          email: formData.email,
          password: formData.password,
          name: `${formData.firstName} ${formData.lastName}`.trim()
        })
      });
      
      if (!authResponse.ok) {
        const errorData = await authResponse.json();
        console.error('Account setup failed:', errorData);
        throw new Error(errorData.error || 'Failed to set up account');
      }
      
      const authResult = await authResponse.json();
      
      // Also call the original claim-account API to handle any additional setup
      const response = await fetch('/api/claim-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          inviteCode,
          company: inviteData?.company
        })
      });
      
      const result = response.ok ? await response.json() : null;
      
      // Track account creation
      if (inviteCode) {
        await fetch('/api/invitations/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            inviteCode,
            event: 'completed',
            timestamp: new Date().toISOString(),
            metadata: {
              accountCreated: true,
              email: formData.email
            }
          })
        });
      }
      
      showSuccess('Account created successfully! Redirecting...');
      
      // Store user info
      localStorage.setItem('campfire_user_email', formData.email);
      localStorage.setItem('campfire_user_name', `${formData.firstName} ${formData.lastName}`.trim());
      if (inviteData?.company) {
        localStorage.setItem('campfire_user_company', inviteData.company);
      }
      
      // Redirect to dashboard after a brief delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
      
    } catch (error) {
      console.error('Failed to create account:', error);
      showError(error instanceof Error ? error.message : 'Failed to create account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <ViewportContainer className="bg-gradient-to-br from-purple-100 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </ViewportContainer>
    );
  }
  
  return (
    <>
      <ViewportContainer className="bg-gradient-to-br from-purple-100 via-pink-50 to-purple-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Header with company branding */}
            <div className="text-center mb-8">
              {inviteData?.companyLogo ? (
                <div className="flex flex-col items-center gap-4 mb-6">
                  <img 
                    src={inviteData.companyLogo}
                    alt={`${inviteData.company} Logo`}
                    className="h-16 object-contain"
                  />
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>powered by</span>
                    <img 
                      src="/campfire-logo-new.png"
                      alt="Campfire Logo"
                      className="h-6"
                    />
                  </div>
                </div>
              ) : (
                <img 
                  src="/campfire-logo-new.png"
                  alt="Campfire Logo"
                  className="h-12 mx-auto mb-6"
                />
              )}
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Create Your Account
              </h1>
              <p className="text-gray-600">
                {inviteData?.company ? 
                  `Join your ${inviteData.company} team on Campfire` : 
                  'Get started with your leadership development journey'}
              </p>
            </div>
            
            {/* Account Creation Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-iris-500 focus:border-transparent"
                        placeholder="John"
                      />
                      <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-iris-500 focus:border-transparent"
                        placeholder="Doe"
                      />
                      <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
                
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-iris-500 focus:border-transparent"
                      placeholder="john.doe@company.com"
                    />
                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  </div>
                </div>
                
                {/* Company Field (if provided) */}
                {inviteData?.company && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={inviteData.company}
                        disabled
                        className="w-full px-4 py-3 pl-10 bg-gray-50 border border-gray-300 rounded-lg text-gray-600"
                      />
                      <Building className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                )}
                
                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3 pl-10 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-iris-500 focus:border-transparent"
                      placeholder="Enter a strong password"
                    />
                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">Password strength</span>
                        <span className={`text-xs font-medium ${
                          passwordStrength.score === 1 ? 'text-red-500' :
                          passwordStrength.score === 2 ? 'text-yellow-500' :
                          passwordStrength.score === 3 ? 'text-blue-500' :
                          passwordStrength.score === 4 ? 'text-green-500' : ''
                        }`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${passwordStrength.score * 25}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Password Requirements */}
                  {formData.password && (
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        {passwordRequirements.minLength ? 
                          <Check className="w-3 h-3 text-green-500" /> : 
                          <X className="w-3 h-3 text-gray-300" />
                        }
                        <span className={passwordRequirements.minLength ? 'text-green-600' : 'text-gray-500'}>
                          At least 8 characters
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {passwordRequirements.hasUpperCase ? 
                          <Check className="w-3 h-3 text-green-500" /> : 
                          <X className="w-3 h-3 text-gray-300" />
                        }
                        <span className={passwordRequirements.hasUpperCase ? 'text-green-600' : 'text-gray-500'}>
                          One uppercase letter
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {passwordRequirements.hasLowerCase ? 
                          <Check className="w-3 h-3 text-green-500" /> : 
                          <X className="w-3 h-3 text-gray-300" />
                        }
                        <span className={passwordRequirements.hasLowerCase ? 'text-green-600' : 'text-gray-500'}>
                          One lowercase letter
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {passwordRequirements.hasNumber ? 
                          <Check className="w-3 h-3 text-green-500" /> : 
                          <X className="w-3 h-3 text-gray-300" />
                        }
                        <span className={passwordRequirements.hasNumber ? 'text-green-600' : 'text-gray-500'}>
                          One number
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {passwordRequirements.hasSpecial ? 
                          <Check className="w-3 h-3 text-green-500" /> : 
                          <X className="w-3 h-3 text-gray-300" />
                        }
                        <span className={passwordRequirements.hasSpecial ? 'text-green-600' : 'text-gray-500'}>
                          One special character
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Confirm Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 pl-10 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-iris-500 focus:border-transparent"
                      placeholder="Re-enter your password"
                    />
                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {/* Password Match Indicator */}
                  {formData.confirmPassword && (
                    <div className="mt-2 flex items-center gap-2">
                      {formData.password === formData.confirmPassword ? (
                        <>
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-xs text-green-600">Passwords match</span>
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4 text-red-500" />
                          <span className="text-xs text-red-600">Passwords do not match</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-iris-500 text-white rounded-lg font-semibold hover:bg-iris-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>Creating Account...</>
                  ) : (
                    <>
                      Create Account & Continue
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
                
                {/* Terms Text */}
                <p className="text-xs text-center text-gray-500">
                  By creating an account, you agree to our Terms of Service and Privacy Policy
                </p>
              </form>
            </div>
          </div>
        </div>
      </ViewportContainer>
      <Footer />
    </>
  );
}

export default function ClaimAccountPage() {
  return (
    <ToastProvider>
      <Suspense fallback={
        <ViewportContainer className="bg-gradient-to-br from-purple-100 via-pink-50 to-purple-50 flex items-center justify-center">
          <div className="text-gray-600">Loading...</div>
        </ViewportContainer>
      }>
        <ClaimAccountContent />
      </Suspense>
    </ToastProvider>
  );
}