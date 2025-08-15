#!/bin/bash

# Database Schema Cleanup: Remove NextAuth Remnants
# Run these commands to execute the migration

echo "🔍 Checking current schema differences..."
npx prisma migrate diff --from-schema-datamodel prisma/schema-backup.prisma --to-schema-datamodel prisma/schema.prisma --script

echo ""
echo "📋 Migration will make the following changes:"
echo "  - Drop Admin table entirely"
echo "  - Remove adminId column from Invitation table"
echo "  - Remove foreign key constraints related to Admin"

echo ""
echo "⚠️  WARNING: This will permanently delete all Admin data!"
echo "   Make sure you have backed up any important data before proceeding."

echo ""
read -p "Do you want to proceed with the migration? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Creating and running migration..."
    npx prisma migrate dev --name "remove-nextauth-remnants"
    
    echo "📦 Generating Prisma client..."
    npx prisma generate
    
    echo "✅ Migration completed successfully!"
    echo ""
    echo "🔄 Next steps:"
    echo "  1. Update application code to remove Admin model references"
    echo "  2. Test critical application paths" 
    echo "  3. Clean up unused imports in TypeScript files"
else
    echo "❌ Migration cancelled."
    echo "   You can run this script again when ready."
fi