#!/bin/bash

echo "🔍 Checking Production Environment Configuration"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PROD_URL="https://tools.getcampfire.com"

echo "Testing: $PROD_URL"
echo ""

# 1. Check if site is accessible
echo "1. Site Accessibility:"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $PROD_URL)
if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "   ${GREEN}✅ Site is accessible (HTTP $HTTP_STATUS)${NC}"
else
    echo -e "   ${RED}❌ Site returned HTTP $HTTP_STATUS${NC}"
fi

# 2. Check if API endpoints respond
echo ""
echo "2. API Endpoints:"

# Test webhooks endpoint (should return 400 without proper headers)
WEBHOOK_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $PROD_URL/api/webhooks/clerk -X POST)
if [ "$WEBHOOK_STATUS" = "400" ]; then
    echo -e "   ${GREEN}✅ Webhook endpoint exists (returns 400 as expected without headers)${NC}"
else
    echo -e "   ${YELLOW}⚠️  Webhook endpoint returned $WEBHOOK_STATUS${NC}"
fi

# 3. Check for Clerk configuration
echo ""
echo "3. Authentication Pages:"

AUTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $PROD_URL/auth)
if [ "$AUTH_STATUS" = "200" ]; then
    echo -e "   ${GREEN}✅ Auth page accessible${NC}"
else
    echo -e "   ${RED}❌ Auth page returned $AUTH_STATUS${NC}"
fi

# 4. Check if page contains expected production elements
echo ""
echo "4. Production Configuration Indicators:"

# Check if using production Clerk key
PAGE_CONTENT=$(curl -s $PROD_URL)
if echo "$PAGE_CONTENT" | grep -q "pk_live"; then
    echo -e "   ${GREEN}✅ Production Clerk key detected${NC}"
elif echo "$PAGE_CONTENT" | grep -q "pk_test"; then
    echo -e "   ${YELLOW}⚠️  Test Clerk key detected (should be production)${NC}"
else
    echo -e "   ${YELLOW}⚠️  Could not detect Clerk key type${NC}"
fi

# Check for Campfire branding
if echo "$PAGE_CONTENT" | grep -q "Campfire"; then
    echo -e "   ${GREEN}✅ Campfire branding present${NC}"
else
    echo -e "   ${YELLOW}⚠️  Campfire branding not found${NC}"
fi

echo ""
echo "================================================"
echo ""
echo "📝 Manual Verification Steps:"
echo ""
echo "1. Sign in to your Vercel dashboard"
echo "2. Check Environment Variables for:"
echo "   - DATABASE_URL (should point to Neon main branch)"
echo "   - CLERK_SECRET_KEY (should start with sk_live_)"
echo "   - CLERK_WEBHOOK_SECRET (should match Clerk dashboard)"
echo "   - OPENAI_API_KEY (should be set)"
echo ""
echo "3. In Clerk Dashboard:"
echo "   - Verify webhook endpoint: $PROD_URL/api/webhooks/clerk"
echo "   - Check webhook logs for successful deliveries"
echo "   - Ensure using production instance"
echo ""
echo "4. Test Sign-up Flow:"
echo "   - Try signing up with a @getcampfire.com email"
echo "   - Should auto-assign to Campfire organization"
echo "   - Should redirect to dashboard after sign-up"
echo ""
echo "================================================"