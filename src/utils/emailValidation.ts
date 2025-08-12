// Email validation utilities to prevent fake and invalid emails

// Common disposable email domains to block
const DISPOSABLE_EMAIL_DOMAINS = [
  '10minutemail.com',
  'tempmail.org',
  'guerrillamail.com',
  'mailinator.com',
  'yopmail.com',
  'temp-mail.org',
  'throwaway.email',
  'getnada.com',
  'trashmail.com',
  'maildrop.cc',
  '1secmail.com',
  'emailondeck.com',
  'fakemailgenerator.com',
  'dispostable.com',
  '20minutemail.com',
  'sharklasers.com',
  'grr.la',
  'guerrillamailblock.com',
  'pokemail.net',
  'spam4.me'
];

// Common typos in popular email domains
const DOMAIN_CORRECTIONS: { [key: string]: string } = {
  'gmai.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gamil.com': 'gmail.com',
  'yahooo.com': 'yahoo.com',
  'yaho.com': 'yahoo.com',
  'hotmai.com': 'hotmail.com',
  'hotmial.com': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'outloo.com': 'outlook.com',
};

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
  suggestion?: string;
}

export function validateEmail(email: string): EmailValidationResult {
  // Remove whitespace
  email = email.trim().toLowerCase();

  // Check if empty
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }

  // Basic format validation (more strict than browser default)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  // Extract domain
  const domain = email.split('@')[1];
  
  // Check for domain corrections
  if (DOMAIN_CORRECTIONS[domain]) {
    return { 
      isValid: false, 
      error: `Did you mean ${email.split('@')[0]}@${DOMAIN_CORRECTIONS[domain]}?`,
      suggestion: `${email.split('@')[0]}@${DOMAIN_CORRECTIONS[domain]}`
    };
  }

  // Check for disposable email domains
  if (DISPOSABLE_EMAIL_DOMAINS.includes(domain)) {
    return { 
      isValid: false, 
      error: 'Please use a permanent email address, not a temporary one' 
    };
  }

  // Check for obvious fake patterns
  // NOTE: Disabled for local development - uncomment for production
  // if (email.includes('test@') || email.includes('fake@') || email.includes('example@')) {
  //   return { 
  //     isValid: false, 
  //     error: 'Please enter your real email address' 
  //   };
  // }

  // Check for too many consecutive dots or hyphens (often indicates fake)
  if (domain.includes('..') || domain.includes('--')) {
    return { 
      isValid: false, 
      error: 'Please enter a valid email address' 
    };
  }

  // Check minimum domain length (catch single letter domains which are rarely legitimate)
  if (domain.length < 4) {
    return { 
      isValid: false, 
      error: 'Please enter a valid email address' 
    };
  }

  // All validations passed
  return { isValid: true };
}

// Helper function for real-time validation (less strict for better UX)
export function validateEmailRealtime(email: string): EmailValidationResult {
  email = email.trim().toLowerCase();

  if (!email) {
    return { isValid: true }; // Don't show error for empty field while typing
  }

  // Only check basic format while typing
  const hasAtSymbol = email.includes('@');
  const hasValidStructure = hasAtSymbol && email.split('@').length === 2;
  
  if (hasAtSymbol && !hasValidStructure) {
    return { isValid: false, error: 'Invalid email format' };
  }

  if (hasValidStructure) {
    const domain = email.split('@')[1];
    
    // Check for domain corrections while typing
    if (DOMAIN_CORRECTIONS[domain]) {
      return { 
        isValid: false, 
        error: `Did you mean ${email.split('@')[0]}@${DOMAIN_CORRECTIONS[domain]}?`,
        suggestion: `${email.split('@')[0]}@${DOMAIN_CORRECTIONS[domain]}`
      };
    }
  }

  return { isValid: true };
}