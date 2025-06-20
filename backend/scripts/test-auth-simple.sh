#!/bin/bash

echo "🔐 Testing Auth System"
echo "====================="

# Generate unique email
TIMESTAMP=$(date +%s)
EMAIL="testuser${TIMESTAMP}@example.com"
PASSWORD="password123"
USERNAME="testuser${TIMESTAMP}"

echo "📧 Test email: $EMAIL"
echo

# Test 1: Health check
echo "1. Testing backend health..."
HEALTH=$(curl -s http://localhost:3000/api/v1/health)
if echo "$HEALTH" | grep -q "healthy"; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend is not healthy"
    echo "Response: $HEALTH"
    exit 1
fi
echo

# Test 2: Try signup
echo "2. Testing signup..."
SIGNUP_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/signup \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"username\":\"$USERNAME\"}")

echo "Signup response: $SIGNUP_RESPONSE"

if echo "$SIGNUP_RESPONSE" | grep -q "\"success\":true"; then
    echo "✅ Signup successful!"
    
    # Test 3: Try signin
    echo
    echo "3. Testing signin..."
    SIGNIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/signin \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
    
    echo "Signin response: $SIGNIN_RESPONSE"
    
    if echo "$SIGNIN_RESPONSE" | grep -q "\"success\":true"; then
        echo "✅ Signin successful!"
        echo
        echo "🎉 Auth system is working!"
        echo "You can now test the frontend at: http://localhost:5173"
    else
        echo "❌ Signin failed"
    fi
else
    echo "❌ Signup failed"
    echo
    if echo "$SIGNUP_RESPONSE" | grep -q "Email signups are disabled"; then
        echo "💡 You need to enable email signups in Supabase:"
        echo "   1. Go to: https://supabase.com/dashboard/project/njbbmbnortshicuwzybd"
        echo "   2. Click Authentication > Providers"
        echo "   3. Enable Email signup"
        echo "   4. Make sure 'Confirm email' is OFF"
    fi
fi