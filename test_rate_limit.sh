#!/bin/bash
echo "Testing rate limiting by making multiple requests..."
echo "Initial request:"
curl -I http://localhost:3000 | grep "RateLimit-Remaining"

echo -e "\nMaking 5 more requests quickly:"
for i in {1..5}; do
    echo "Request $i:"
    curl -I http://localhost:3000 2>/dev/null | grep "RateLimit-Remaining"
done

echo -e "\nChecking if rate limit is decreasing..."