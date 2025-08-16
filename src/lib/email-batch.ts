/**
 * Email Batch Sender with Rate Limiting
 * Handles sending multiple emails with proper concurrency control
 */

import { sendEmail, EmailOptions } from './email';

interface BatchEmailResult {
  email: string;
  success: boolean;
  error?: string;
  emailId?: string;
}

interface BatchEmailOptions {
  maxConcurrent?: number;  // Max emails to send at once
  delayBetweenBatches?: number;  // Delay in ms between batches
  retryFailures?: boolean;  // Whether to retry failed emails
  maxRetries?: number;  // Max number of retries
}

/**
 * Send multiple emails with rate limiting and concurrency control
 */
export async function sendEmailBatch(
  emails: EmailOptions[],
  options: BatchEmailOptions = {}
): Promise<BatchEmailResult[]> {
  const {
    maxConcurrent = 2,  // Resend limit: 2 emails per second
    delayBetweenBatches = 1000,  // 1 second between batches
    retryFailures = true,
    maxRetries = 2
  } = options;

  const results: BatchEmailResult[] = [];
  
  // Split emails into batches
  const batches: EmailOptions[][] = [];
  for (let i = 0; i < emails.length; i += maxConcurrent) {
    batches.push(emails.slice(i, i + maxConcurrent));
  }
  
  console.log(`[email-batch] Sending ${emails.length} emails in ${batches.length} batches of up to ${maxConcurrent} emails each`);
  
  // Process each batch
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    console.log(`[email-batch] Processing batch ${batchIndex + 1}/${batches.length} with ${batch.length} emails`);
    
    // Send emails in parallel within the batch
    const batchPromises = batch.map(async (emailOptions) => {
      let lastError: any = null;
      let attempts = 0;
      
      // Retry logic
      while (attempts <= (retryFailures ? maxRetries : 0)) {
        attempts++;
        
        try {
          console.log(`[email-batch] Sending email to ${emailOptions.to} (attempt ${attempts})`);
          const result = await sendEmail(emailOptions);
          
          if (result.success) {
            console.log(`[email-batch] ✅ Successfully sent to ${emailOptions.to}`);
            return {
              email: Array.isArray(emailOptions.to) ? emailOptions.to[0] : emailOptions.to,
              success: true,
              emailId: (result as any).data?.data?.id
            };
          } else {
            lastError = (result as any).error;
            console.warn(`[email-batch] ⚠️ Failed to send to ${emailOptions.to}:`, (result as any).error);
            
            // If it's a rate limit error, wait before retrying
            if (attempts <= maxRetries && typeof lastError === 'string' && 
                (lastError.includes('rate') || lastError.includes('429'))) {
              console.log(`[email-batch] Rate limited, waiting before retry...`);
              await delay(2000); // Wait 2 seconds before retry
            }
          }
        } catch (error) {
          lastError = error;
          console.error(`[email-batch] ❌ Error sending to ${emailOptions.to}:`, error);
        }
        
        // Add small delay between retries
        if (attempts < (retryFailures ? maxRetries : 0) + 1) {
          await delay(500);
        }
      }
      
      // All attempts failed
      return {
        email: Array.isArray(emailOptions.to) ? emailOptions.to[0] : emailOptions.to,
        success: false,
        error: lastError?.message || String(lastError) || 'Unknown error'
      };
    });
    
    // Wait for all emails in the batch to complete
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Add delay between batches (except for the last batch)
    if (batchIndex < batches.length - 1) {
      console.log(`[email-batch] Waiting ${delayBetweenBatches}ms before next batch...`);
      await delay(delayBetweenBatches);
    }
  }
  
  // Log summary
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`[email-batch] Batch complete: ${successful} successful, ${failed} failed out of ${emails.length} total`);
  
  if (failed > 0) {
    console.log('[email-batch] Failed emails:', results.filter(r => !r.success).map(r => ({
      email: r.email,
      error: r.error
    })));
  }
  
  return results;
}

/**
 * Helper function to create a delay
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Send invitation emails in batch
 */
export async function sendInvitationEmailBatch(
  invitations: Array<{
    to: string;
    userName?: string;
    inviterName?: string;
    companyName: string;
    companyLogo?: string;
    inviteUrl: string;
    personalMessage?: string;
    assessmentName?: string;
    deadline?: string | null;
  }>,
  options?: BatchEmailOptions
): Promise<BatchEmailResult[]> {
  // Import the email template
  const { sendInvitationEmail } = await import('./email');
  
  // Convert invitations to email options
  const emailPromises = invitations.map(async (invitation) => {
    try {
      const result = await sendInvitationEmail(invitation);
      return {
        email: invitation.to,
        success: result.success,
        error: (result as any).error ? String((result as any).error) : undefined,
        emailId: (result as any).data?.data?.id
      };
    } catch (error) {
      return {
        email: invitation.to,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });
  
  // Process with rate limiting
  const emails: EmailOptions[] = [];
  for (const invitation of invitations) {
    // We need to get the actual email options, but since sendInvitationEmail
    // handles the template internally, we'll use the batch processor differently
  }
  
  // For now, let's use controlled concurrency without the batch processor
  const results: BatchEmailResult[] = [];
  const maxConcurrent = options?.maxConcurrent || 3;
  const delayBetweenBatches = options?.delayBetweenBatches || 1000;
  
  // Process invitations in batches
  for (let i = 0; i < invitations.length; i += maxConcurrent) {
    const batch = invitations.slice(i, i + maxConcurrent);
    console.log(`[email-batch] Sending invitation batch ${Math.floor(i / maxConcurrent) + 1}/${Math.ceil(invitations.length / maxConcurrent)}`);
    
    const batchPromises = batch.map(async (invitation) => {
      try {
        const result = await sendInvitationEmail(invitation);
        return {
          email: invitation.to,
          success: result.success,
          error: (result as any).error ? String((result as any).error) : undefined,
          emailId: (result as any).data?.data?.id
        };
      } catch (error) {
        return {
          email: invitation.to,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Delay between batches
    if (i + maxConcurrent < invitations.length) {
      await delay(delayBetweenBatches);
    }
  }
  
  return results;
}