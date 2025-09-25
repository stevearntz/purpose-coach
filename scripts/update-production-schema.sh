#!/bin/bash

echo "🔄 Updating Production Database Schema..."
echo "This will add the campaignId field to the Invitation table"
echo ""

# Production database URL for Neon
PROD_DB_URL="postgresql://neondb_owner:npg_UuDl9B4rOgLN@ep-dawn-river-adge7l6h-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Run prisma db push on production
echo "📦 Pushing schema changes to production database..."
DATABASE_URL="$PROD_DB_URL" npx prisma db push --accept-data-loss

if [ $? -eq 0 ]; then
    echo "✅ Production database schema updated successfully!"
    echo ""
    echo "The campaignId field has been added to the Invitation table."
    echo "Campaign creation should now work properly."
else
    echo "❌ Failed to update production database schema"
    exit 1
fi