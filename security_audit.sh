#!/bin/bash

echo "=== SECURITY AUDIT REPORT ==="
echo

echo "1. SECURITY HEADERS CHECK:"
echo "----------------------------"
curl -s -I http://localhost:3000 | grep -E "(Content-Security-Policy|X-Frame-Options|Strict-Transport-Security|X-Content-Type-Options)"

echo
echo "2. CORS CONFIGURATION:"
echo "----------------------"
echo "✅ Allowed origin (localhost:3000):"
curl -s -H "Origin: http://localhost:3000" -I http://localhost:3000 | grep "Access-Control-Allow-Origin" || echo "❌ CORS not working"

echo "✅ Blocked origin (malicious.com):"
curl -s -H "Origin: http://malicious.com" -I http://localhost:3000 | grep "Access-Control-Allow-Origin" || echo "✅ Correctly blocked"

echo
echo "3. RATE LIMITING STATUS:"
echo "------------------------"
curl -s -I http://localhost:3000 | grep -E "RateLimit-(Limit|Remaining|Reset)"

echo
echo "4. X-POWERED-BY HEADER REMOVAL:"
echo "--------------------------------"
curl -s -I http://localhost:3000 | grep "X-Powered-By" || echo "✅ X-Powered-By header successfully removed"

echo
echo "=== END AUDIT ==="