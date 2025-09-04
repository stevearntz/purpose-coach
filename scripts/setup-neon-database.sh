#!/bin/bash

# Setup script for Neon database
# Run this after you have your Neon connection strings

echo "🚀 Neon Database Setup Script"
echo "============================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found!"
    echo "Please copy .env.neon.template to .env.local and add your Neon connection strings"
    exit 1
fi

# Check if .env exists (Prisma reads this)
if [ ! -f .env ]; then
    echo "📝 Creating .env file (copy of .env.local for Prisma)"
    cp .env.local .env
else
    echo "⚠️  .env file exists. Updating with .env.local content..."
    cp .env.local .env
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔧 Generating Prisma Client..."
npx prisma generate

echo ""
echo "🗄️  Pushing schema to database..."
npx prisma db push --skip-generate

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Run 'npm run dev' to start the development server"
echo "2. The database is now ready with all tables created"
echo "3. You can view your database at: https://console.neon.tech"
echo ""
echo "For production deployment:"
echo "1. Use the 'main' branch connection string in Vercel/production"
echo "2. Use the 'development' branch locally"