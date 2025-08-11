import { z } from 'zod'

// Email validation
export const emailSchema = z.string()
  .email("Invalid email format")
  .toLowerCase()
  .transform(val => val.trim())

// Common ID validation (for database IDs)
export const idSchema = z.string()
  .min(1, "ID is required")
  .regex(/^[a-zA-Z0-9_-]+$/, "Invalid ID format")

// Campaign validation schemas
export const createCampaignSchema = z.object({
  toolId: z.string().min(1),
  toolName: z.string().min(1).max(100),
  toolPath: z.string().regex(/^\/[a-z0-9-\/]*$/, "Invalid path format"),
  campaignName: z.string().min(1).max(200),
  customMessage: z.string().max(1000).optional(),
  startDate: z.string().datetime().optional(),
  deadline: z.string().datetime().optional(),
  participants: z.array(z.object({
    email: emailSchema,
    name: z.string().max(100).optional()
  })).min(1, "At least one participant required"),
  senderEmail: emailSchema,
  companyName: z.string().max(100).optional()
})

// Invitation validation schemas
export const createInvitationSchema = z.object({
  email: emailSchema,
  name: z.string().max(100).optional(),
  personalMessage: z.string().max(1000).optional(),
  role: z.string().max(50).optional()
})

export const completeInvitationSchema = z.object({
  inviteCode: z.string()
    .min(1)
    .regex(/^[a-zA-Z0-9_-]+$/, "Invalid invite code"),
  assessmentType: z.string().max(100).optional()
})

// User/Admin validation schemas
export const createAdminSchema = z.object({
  email: emailSchema,
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase, and number"),
  name: z.string().max(100).optional(),
  companyName: z.string().max(100).optional()
})

export const setupPasswordSchema = z.object({
  inviteCode: z.string()
    .min(1)
    .regex(/^[a-zA-Z0-9_-]+$/, "Invalid invite code"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase, and number")
})

// Search/Query validation
export const searchParamsSchema = z.object({
  email: emailSchema.optional(),
  campaignId: idSchema.optional(),
  companyId: idSchema.optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0)
})

// Sanitize HTML/Text input to prevent XSS
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
}

// Validate and sanitize user input
export function validateAndSanitize<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data)
  
  if (!result.success) {
    return { success: false, errors: result.error }
  }
  
  return { success: true, data: result.data }
}