#!/bin/bash

API_URL="http://localhost:3000/api/v1"
TIMESTAMP=$(date +%s)
TEST_EMAIL="test.user+${TIMESTAMP}@gmail.com"
TEST_PASSWORD="TestPassword123!"

echo "=== Testing Backend API ==="
echo

# Test 1: Health Check
echo "1. Testing Health Check..."
curl -s "${API_URL}/health" | python3 -m json.tool
echo

# Test 2: Sign Up
echo "2. Testing Sign Up..."
SIGNUP_RESPONSE=$(curl -s -X POST "${API_URL}/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASSWORD}\",
    \"username\": \"testuser${TIMESTAMP}\"
  }")
echo "$SIGNUP_RESPONSE" | python3 -m json.tool
echo

# Test 3: Sign In
echo "3. Testing Sign In..."
SIGNIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/signin" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASSWORD}\"
  }")
echo "$SIGNIN_RESPONSE" | python3 -m json.tool

# Extract access token
ACCESS_TOKEN=$(echo "$SIGNIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('session', {}).get('access_token', ''))")

if [ -z "$ACCESS_TOKEN" ]; then
  echo "Failed to get access token"
  exit 1
fi

echo
echo "Got access token: ${ACCESS_TOKEN:0:20}..."
echo

# Test 4: Create Cat
echo "4. Testing Create Cat..."
CREATE_CAT_RESPONSE=$(curl -s -X POST "${API_URL}/cats" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -d '{
    "name": "Whiskers",
    "gender": "male",
    "skill": "hunting",
    "trait": "brave"
  }')
echo "$CREATE_CAT_RESPONSE" | python3 -m json.tool
echo

# Test 5: Get All Cats
echo "5. Testing Get All Cats..."
curl -s -X GET "${API_URL}/cats" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" | python3 -m json.tool
echo

echo "=== Tests Complete ==="