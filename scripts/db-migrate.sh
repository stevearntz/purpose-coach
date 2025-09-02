#!/bin/bash

echo "🔄 Starting database migration..."

# Check if we're using the correct environment
if [ -z "$DIRECT_URL" ]; then
    echo "❌ DIRECT_URL not set. Loading from .env.local..."
    export $(grep DIRECT_URL .env.local | xargs)
fi

# Run migration with timeout and retry logic
MAX_RETRIES=3
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    echo "Attempt $((RETRY_COUNT + 1)) of $MAX_RETRIES..."
    
    # Try to run the migration
    if timeout 30 npx prisma migrate deploy; then
        echo "✅ Migration successful!"
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
            echo "⚠️  Migration failed. Retrying in 5 seconds..."
            sleep 5
        else
            echo "❌ Migration failed after $MAX_RETRIES attempts"
            exit 1
        fi
    fi
done

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

echo "✨ Database migration complete!"