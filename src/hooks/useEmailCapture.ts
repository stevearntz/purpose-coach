import { useState, useEffect } from 'react';

export function useEmailCapture() {
  const [email, setEmail] = useState('');
  const [hasStoredEmail, setHasStoredEmail] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    // Check for stored email on mount
    const storedEmail = localStorage.getItem('campfire_user_email');
    const storedName = localStorage.getItem('campfire_user_name');
    const storedRole = localStorage.getItem('campfire_user_role');
    
    if (storedEmail) {
      setEmail(storedEmail);
      setHasStoredEmail(true);
    }
    if (storedName) {
      setUserName(storedName);
    }
    if (storedRole) {
      setUserRole(storedRole);
    }
  }, []);

  const saveEmail = (newEmail: string) => {
    setEmail(newEmail);
    localStorage.setItem('campfire_user_email', newEmail);
    setHasStoredEmail(true);
  };

  const saveUserInfo = (email: string, name?: string, role?: string) => {
    saveEmail(email);
    if (name) {
      setUserName(name);
      localStorage.setItem('campfire_user_name', name);
    }
    if (role) {
      setUserRole(role);
      localStorage.setItem('campfire_user_role', role);
    }
  };

  const captureEmailForTool = async (email: string, toolName: string, toolId: string) => {
    // Save to localStorage
    saveEmail(email);
    
    // Send to API with name and role if available
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: userName || undefined,
          source: 'tool',
          metadata: {
            toolName,
            toolId,
            userRole: userRole || undefined
          }
        })
      });
    } catch (error) {
      console.error('Failed to capture lead:', error);
    }
  };

  return {
    email,
    hasStoredEmail,
    userName,
    userRole,
    saveEmail,
    saveUserInfo,
    captureEmailForTool
  };
}