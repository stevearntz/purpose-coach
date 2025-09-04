# Domain-Based Auto Organization Assignment

## How It Works

The system automatically assigns users to organizations based on their email domain. This works for **ANY domain** configured in the system, not just specific ones.

### The Flow:

1. **Admin configures domains** in `/admin/organizations`
   - Add domains with `@` prefix (e.g., `@example.com`, `@acme.org`)
   - Multiple domains can be assigned to one organization
   - Each organization must have a Clerk Org ID for auto-assignment to work

2. **User signs up** with their work email
   - Example: `john@acme.com`

3. **Webhook processes the signup** (`/api/webhooks/clerk`)
   - Extracts domain: `@acme.com`
   - Searches database for ANY company with that domain
   - If found, automatically:
     - Adds user to that Clerk organization
     - Updates user metadata with organization info
     - Sets proper role (default: `org:member`)

4. **User is automatically part of their organization**
   - No manual assignment needed
   - Works on first login
   - Applies to both new signups and existing users

## Configuration

### Setting Up a New Organization

1. Go to `/admin/organizations`
2. Click "Create Organization"
3. Fill in:
   - **Name**: Company name
   - **Domains**: Comma-separated list with `@` prefix
     - Example: `@acme.com, @acme.org, @acme.co.uk`
4. Save the organization
5. Ensure it has a Clerk Org ID (syncs automatically)

### Domain Format Requirements

- Must start with `@`
- Valid examples:
  - `@company.com`
  - `@team.company.io`
  - `@corp.example.org`
- Invalid examples:
  - `company.com` (missing @)
  - `john@company.com` (full email, not domain)
  - `@` (incomplete)

## Testing

### Check Domain Configuration
```bash
npx tsx scripts/test-domain-assignment.ts
```

This shows:
- All configured companies and their domains
- Which organization each email would be assigned to
- Any configuration issues (missing Clerk IDs, duplicate domains, etc.)

### Manual Assignment Test
If a user wasn't auto-assigned (e.g., webhook was down), visit:
```
http://localhost:3001/api/test-org-assignment
```
(Must be logged in as the user)

## Important Notes

1. **One domain = One organization**
   - Each domain can only belong to one organization
   - Prevents conflicts in assignment

2. **Clerk Org ID Required**
   - Organization must exist in Clerk
   - Sync happens automatically when creating via admin panel

3. **Webhook Must Be Active**
   - Configure in Clerk Dashboard
   - Events needed: `user.created`, `user.updated`, `session.created`
   - URL: `https://yourdomain.com/api/webhooks/clerk`

4. **Works for ANY Domain**
   - Not hardcoded to specific domains
   - Completely flexible based on database configuration
   - Add/remove domains anytime via admin panel

## Troubleshooting

### User not auto-assigned?
1. Check domain is configured: `npx tsx scripts/test-domain-assignment.ts`
2. Verify Clerk Org ID exists for the company
3. Check webhook is receiving events (check logs)
4. Use manual assignment endpoint as fallback

### Domain conflicts?
- Run the test script to find duplicate domains
- Each domain should only belong to one organization

### Webhook not working?
1. Check `CLERK_WEBHOOK_SECRET` is set in `.env.local`
2. Verify webhook URL in Clerk Dashboard
3. For local testing, use ngrok to expose localhost