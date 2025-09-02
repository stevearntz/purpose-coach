#!/bin/bash

# Test script for new API pattern
# Run with: bash test-api-pattern.sh

API_URL="http://localhost:3000/api/test-new-pattern"

echo "======================================"
echo "Testing New API Pattern"
echo "======================================"
echo ""

# Test 1: OPTIONS request (no auth required)
echo "1. Testing OPTIONS (no auth required):"
echo "--------------------------------------"
curl -X OPTIONS $API_URL 2>/dev/null | jq '.'
echo ""

# Test 2: GET without auth (should fail)
echo "2. Testing GET without auth (should fail with 401):"
echo "----------------------------------------------------"
curl -X GET $API_URL 2>/dev/null | jq '.'
echo ""

# Test 3: GET with query params (you'll need to be logged in via browser)
echo "3. Testing GET with query params:"
echo "---------------------------------"
echo "Run in browser console while logged in:"
echo "fetch('/api/test-new-pattern?filter=active&limit=5').then(r => r.json()).then(console.log)"
echo ""

# Test 4: POST with valid data
echo "4. Testing POST with VALID data:"
echo "--------------------------------"
echo "Run in browser console while logged in:"
cat << 'EOF'
fetch('/api/test-new-pattern', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    age: 30,
    email: 'john@example.com',
    tags: ['test', 'demo']
  })
}).then(r => r.json()).then(console.log)
EOF
echo ""

# Test 5: POST with invalid data (validation errors)
echo "5. Testing POST with INVALID data (validation errors):"
echo "------------------------------------------------------"
echo "Run in browser console while logged in:"
cat << 'EOF'
fetch('/api/test-new-pattern', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'J',  // Too short
    age: 200,   // Too high
    email: 'not-an-email',  // Invalid format
  })
}).then(r => r.json()).then(console.log)
EOF
echo ""

# Test 6: POST with missing fields
echo "6. Testing POST with MISSING required fields:"
echo "---------------------------------------------"
echo "Run in browser console while logged in:"
cat << 'EOF'
fetch('/api/test-new-pattern', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John'
    // Missing age and email
  })
}).then(r => r.json()).then(console.log)
EOF
echo ""

# Test 7: DELETE with different error scenarios
echo "7. Testing DELETE with different scenarios:"
echo "-------------------------------------------"
echo "Run in browser console while logged in:"
echo ""
echo "a) Success case:"
echo "fetch('/api/test-new-pattern?id=123', { method: 'DELETE' }).then(r => r.json()).then(console.log)"
echo ""
echo "b) Not found error:"
echo "fetch('/api/test-new-pattern?id=notfound', { method: 'DELETE' }).then(r => r.json()).then(console.log)"
echo ""
echo "c) Forbidden error:"
echo "fetch('/api/test-new-pattern?id=forbidden', { method: 'DELETE' }).then(r => r.json()).then(console.log)"
echo ""
echo "d) Missing ID parameter:"
echo "fetch('/api/test-new-pattern', { method: 'DELETE' }).then(r => r.json()).then(console.log)"
echo ""

# Test 8: Invalid JSON
echo "8. Testing POST with INVALID JSON:"
echo "----------------------------------"
echo "Run in browser console while logged in:"
cat << 'EOF'
fetch('/api/test-new-pattern', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: 'This is not valid JSON!'
}).then(r => r.json()).then(console.log)
EOF
echo ""

echo "======================================"
echo "Expected Response Formats:"
echo "======================================"
echo ""
echo "SUCCESS Response:"
echo '{ "success": true, "data": {...}, "message": "..." }'
echo ""
echo "ERROR Response:"
echo '{ "success": false, "error": { "code": "...", "message": "...", "statusCode": 400, "details": {...} } }'
echo ""