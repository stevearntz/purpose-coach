#!/bin/bash

# Remove console.log and console.error from API routes
# Keep console.warn for important warnings

echo "Removing console.log statements from API routes..."

# Count before
BEFORE=$(grep -r "console\.\(log\|error\)" src/app/api --include="*.ts" | grep -v "// console" | wc -l)
echo "Found $BEFORE console statements"

# Remove console.log lines (simple ones)
find src/app/api -name "*.ts" -type f -exec sed -i '' '/^\s*console\.log(/d' {} \;

# Remove console.error lines that are just logging
find src/app/api -name "*.ts" -type f -exec sed -i '' '/^\s*console\.error([^)]*);$/d' {} \;

# For multi-line console statements, comment them out instead of removing
find src/app/api -name "*.ts" -type f -exec sed -i '' 's/^\(\s*\)console\.log(/\1\/\/ console.log(/g' {} \;
find src/app/api -name "*.ts" -type f -exec sed -i '' 's/^\(\s*\)console\.error(/\1\/\/ console.error(/g' {} \;

# Count after
AFTER=$(grep -r "console\.\(log\|error\)" src/app/api --include="*.ts" | grep -v "// console" | wc -l)
echo "Removed $(($BEFORE - $AFTER)) console statements"
echo "$AFTER console statements remaining (may be multi-line or in complex expressions)"

echo "Done!"