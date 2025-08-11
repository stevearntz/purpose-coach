# Security Implementation Guide

## Overview
This document outlines the security measures implemented in the Purpose Coach application to address authentication, data validation, and protection against common vulnerabilities.

## 1. Authentication (NextAuth.js)

### Implementation
- **Library**: NextAuth.js v5 (Auth.js) - Industry standard, battle-tested authentication library
- **Location**: `/src/auth.ts`
- **Session Strategy**: JWT with secure HTTP-only cookies
- **Password Hashing**: bcrypt with proper salt rounds

### Features
- Secure session management with 30-day expiry
- Automatic CSRF protection built into NextAuth
- Secure password requirements (8+ chars, uppercase, lowercase, number)
- Session validation on every request

## 2. Input Validation & Sanitization

### Zod Schema Validation
- **Library**: Zod - Type-safe schema validation
- **Location**: `/src/lib/validation.ts`

### Protected Against
- **SQL Injection**: All database queries use Prisma ORM with parameterized queries
- **XSS Attacks**: Input sanitization for HTML-sensitive characters
- **Invalid Data Types**: Strict type validation before processing

### Example Usage
```typescript
import { createCampaignSchema, validateAndSanitize } from '@/lib/validation';

const validation = validateAndSanitize(createCampaignSchema, untrustedInput);
if (!validation.success) {
  return { error: validation.errors };
}
// validation.data is now safe to use
```

## 3. Rate Limiting

### Implementation
- Per-endpoint rate limiting to prevent abuse
- Example: 5 campaign creations per minute per user
- Prevents brute force attacks and API abuse

## 4. Security Headers

### Headers Implemented
- **Strict-Transport-Security**: Forces HTTPS connections
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **Content-Security-Policy**: Controls resource loading
- **X-XSS-Protection**: Additional XSS protection
- **Referrer-Policy**: Controls referrer information

## 5. Database Security

### Prisma ORM Benefits
- **Parameterized Queries**: Automatic SQL injection prevention
- **Type Safety**: Compile-time query validation
- **Transaction Support**: Atomic operations for data consistency

### No Raw SQL
- All queries use Prisma's query builder
- No string concatenation in queries
- No `$queryRaw` or `$executeRaw` usage

## 6. API Security Best Practices

### Authentication Required
```typescript
const session = await auth();
if (!session?.user?.email) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### Input Validation
```typescript
const validation = validateAndSanitize(schema, body);
if (!validation.success) {
  return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
}
```

### Error Handling
- Never expose internal error details to clients
- Log detailed errors server-side only
- Return generic error messages to users

## 7. Environment Variables

### Required Security Variables
```env
NEXTAUTH_SECRET=<strong-random-string>
NEXTAUTH_URL=https://yourdomain.com
```

### Generate Secret
```bash
openssl rand -base64 32
```

## 8. OWASP Top 10 Protection

| Vulnerability | Protection Implemented |
|--------------|------------------------|
| Injection | Prisma ORM, Zod validation |
| Broken Authentication | NextAuth.js, bcrypt |
| Sensitive Data Exposure | HTTPS only, secure cookies |
| XML External Entities | Not applicable (JSON only) |
| Broken Access Control | Session validation, auth middleware |
| Security Misconfiguration | Security headers, CSP |
| XSS | Input sanitization, CSP |
| Insecure Deserialization | Zod validation |
| Using Components with Known Vulnerabilities | Regular updates, npm audit |
| Insufficient Logging | Comprehensive error logging |

## 9. Migration Guide

### From Custom JWT to NextAuth

1. Update authentication endpoints:
```typescript
// Old (custom JWT)
import { signToken } from '@/lib/auth'

// New (NextAuth)
import { signIn } from '@/auth'
```

2. Update middleware:
```typescript
// Use NextAuth's built-in middleware
export { auth as middleware } from "@/auth"
```

3. Update client-side auth checks:
```typescript
import { useSession } from "next-auth/react"

const { data: session, status } = useSession()
if (status === "authenticated") {
  // User is logged in
}
```

## 10. Testing Security

### Automated Security Checks
```bash
# Check for vulnerable dependencies
npm audit

# Fix vulnerabilities
npm audit fix

# Check TypeScript types
npm run build
```

### Manual Testing Checklist
- [ ] Test SQL injection attempts in all forms
- [ ] Test XSS attempts in user inputs
- [ ] Verify rate limiting works
- [ ] Check security headers in browser DevTools
- [ ] Test authentication flow
- [ ] Verify password requirements
- [ ] Test session expiry

## 11. Monitoring & Logging

### What to Log
- Failed authentication attempts
- Rate limit violations
- Invalid input attempts
- Database errors
- Email sending failures

### What NOT to Log
- Passwords (even hashed)
- Full credit card numbers
- Sensitive personal data
- API keys or secrets

## 12. Regular Security Maintenance

### Weekly
- Review error logs for suspicious patterns
- Check for npm security updates: `npm audit`

### Monthly
- Update dependencies: `npm update`
- Review user access logs
- Check for unusual API usage patterns

### Quarterly
- Full security audit
- Penetration testing (if applicable)
- Review and update security policies

## Compliance Considerations

### GDPR
- User consent for data processing
- Right to erasure implementation
- Data portability features
- Privacy policy compliance

### Best Practices
- Regular security training for team
- Incident response plan
- Security documentation updates
- Code review for security issues

## Contact

For security concerns or vulnerability reports, please contact:
- Security Team: security@getcampfire.com
- Use PGP encryption for sensitive reports