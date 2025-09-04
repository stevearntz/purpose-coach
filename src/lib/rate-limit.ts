/**
 * Rate limiting utilities for API endpoints
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (consider Redis for production)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

export interface RateLimitConfig {
  windowMs?: number;  // Time window in milliseconds (default: 1 minute)
  maxRequests?: number; // Max requests per window (default: 10)
  keyPrefix?: string;  // Prefix for the rate limit key
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (e.g., userId, IP, email)
 * @param config - Rate limit configuration
 * @returns Object with allowed status and retry-after time if limited
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = {}
): { allowed: boolean; retryAfter?: number; remaining: number } {
  const {
    windowMs = 60000, // 1 minute default
    maxRequests = 10, // 10 requests per minute default
    keyPrefix = 'default'
  } = config;

  const key = `${keyPrefix}:${identifier}`;
  const now = Date.now();
  const resetTime = now + windowMs;

  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetTime < now) {
    // New window or expired entry
    rateLimitStore.set(key, { count: 1, resetTime });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (entry.count >= maxRequests) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000); // seconds
    return { 
      allowed: false, 
      retryAfter,
      remaining: 0 
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);
  
  return { 
    allowed: true,
    remaining: maxRequests - entry.count 
  };
}

/**
 * Rate limiting specifically for OpenAI API calls
 * More restrictive limits to protect against abuse
 */
export function checkOpenAIRateLimit(userId: string) {
  return checkRateLimit(userId, {
    windowMs: 300000, // 5 minutes
    maxRequests: 5, // 5 requests per 5 minutes
    keyPrefix: 'openai'
  });
}

/**
 * Rate limiting for general API endpoints
 */
export function checkAPIRateLimit(identifier: string) {
  return checkRateLimit(identifier, {
    windowMs: 60000, // 1 minute
    maxRequests: 30, // 30 requests per minute
    keyPrefix: 'api'
  });
}