/**
 * Production-grade API validation schemas
 * All API inputs must be validated through these schemas
 */

import { z } from 'zod';

// ============================================
// BASE SCHEMAS - Reusable field definitions
// ============================================

export const EmailSchema = z
  .string()
  .email('Invalid email format')
  .toLowerCase()
  .transform(val => val.trim())
  .refine(val => val.length <= 255, 'Email too long');

export const PasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .refine(
    val => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(val),
    'Password must contain uppercase, lowercase, and number'
  );

export const NameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name too long')
  .transform(val => val.trim())
  .refine(
    val => /^[a-zA-Z\s\-']+$/.test(val),
    'Name contains invalid characters'
  );

export const CompanyNameSchema = z
  .string()
  .min(1, 'Company name is required')
  .max(100, 'Company name too long')
  .transform(val => val.trim());

export const UUIDSchema = z
  .string()
  .uuid('Invalid ID format');

export const InviteCodeSchema = z
  .string()
  .min(8, 'Invalid invite code')
  .max(20, 'Invalid invite code')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid invite code format');

export const URLSchema = z
  .string()
  .url('Invalid URL format')
  .refine(
    val => val.startsWith('https://') || val.startsWith('http://localhost'),
    'URL must use HTTPS'
  );

export const DateTimeSchema = z
  .string()
  .datetime('Invalid date format');

// ============================================
// CAMPAIGN SCHEMAS
// ============================================

export const CreateCampaignSchema = z.object({
  toolId: z.string().min(1).max(50),
  toolName: z.string().min(1).max(100),
  toolPath: z.string().regex(/^\/[a-z0-9-\/]*$/, 'Invalid path format'),
  campaignName: z.string().min(1).max(200).transform(val => val.trim()),
  customMessage: z.string().max(1000).optional(),
  startDate: DateTimeSchema.optional(),
  deadline: DateTimeSchema.optional(),
  participants: z.array(z.object({
    email: EmailSchema,
    name: NameSchema.optional()
  })).min(1).max(500, 'Too many participants'),
  senderEmail: EmailSchema,
  companyName: CompanyNameSchema.optional()
}).refine(
  data => !data.deadline || !data.startDate || new Date(data.deadline) > new Date(data.startDate),
  'Deadline must be after start date'
);

export const GetCampaignsSchema = z.object({
  email: EmailSchema.optional(),
  campaignId: UUIDSchema.optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0)
});

// ============================================
// INVITATION SCHEMAS
// ============================================

export const CreateInvitationSchema = z.object({
  emails: z.array(EmailSchema).min(1).max(100),
  message: z.string().max(1000).optional(),
  senderEmail: EmailSchema,
  company: CompanyNameSchema.optional(),
  role: z.string().max(50).optional()
});

export const CompleteInvitationSchema = z.object({
  inviteCode: InviteCodeSchema,
  assessmentType: z.string().max(100).optional()
});

export const ResendInvitationSchema = z.object({
  invitationId: UUIDSchema
});

// ============================================
// USER/ADMIN SCHEMAS
// ============================================

export const CreateAdminSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  name: NameSchema.optional(),
  companyName: CompanyNameSchema.optional()
});

export const LoginSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema
});

export const SetupPasswordSchema = z.object({
  inviteCode: InviteCodeSchema,
  password: PasswordSchema
});

export const UpdateProfileSchema = z.object({
  name: NameSchema.optional(),
  email: EmailSchema.optional(),
  currentPassword: PasswordSchema.optional(),
  newPassword: PasswordSchema.optional()
}).refine(
  data => !data.newPassword || data.currentPassword,
  'Current password required to change password'
);

// ============================================
// ASSESSMENT SCHEMAS
// ============================================

export const SaveAssessmentSchema = z.object({
  assessmentType: z.string().min(1).max(100),
  data: z.record(z.unknown()).refine(
    val => Object.keys(val).length > 0,
    'Assessment data cannot be empty'
  ),
  campaignId: UUIDSchema.optional(),
  inviteCode: InviteCodeSchema.optional()
});

export const GetAssessmentResultsSchema = z.object({
  campaignId: UUIDSchema.optional(),
  assessmentType: z.string().max(100).optional(),
  startDate: DateTimeSchema.optional(),
  endDate: DateTimeSchema.optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0)
});

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate request body against schema
 */
export async function validateRequestBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; errors: string[] }> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);
    
    if (!result.success) {
      const errors = result.error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      );
      return { success: false, errors };
    }
    
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, errors: ['Invalid JSON body'] };
  }
}

/**
 * Validate query parameters against schema
 */
export function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; errors: string[] } {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  
  const result = schema.safeParse(params);
  
  if (!result.success) {
    const errors = result.error.errors.map(err => 
      `${err.path.join('.')}: ${err.message}`
    );
    return { success: false, errors };
  }
  
  return { success: true, data: result.data };
}

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate and sanitize file uploads
 */
export const FileUploadSchema = z.object({
  filename: z.string().max(255),
  mimetype: z.enum([
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]),
  size: z.number().max(10 * 1024 * 1024, 'File too large (max 10MB)')
});

/**
 * IP Address validation
 */
export const IPAddressSchema = z.string().ip();

/**
 * Pagination schema
 */
export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});