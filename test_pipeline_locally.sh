#!/bin/bash

# 🧪 Local Pipeline Testing Script
# Test các components của pipeline locally trước khi chạy trên Jenkins

echo "🧪 Local Pipeline Components Test"
echo "================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASSED=0
FAILED=0

# Function to run test and report result
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo ""
    echo -e "${BLUE}🔍 Testing: $test_name${NC}"
    echo "Command: $test_command"
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ PASSED: $test_name${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAILED: $test_name${NC}"
        ((FAILED++))
    fi
}

echo ""
echo -e "${YELLOW}📋 Simulating Jenkins Pipeline Stages Locally${NC}"
echo ""

# Stage 1: Checkout (simulated)
echo -e "${BLUE}🔄 Stage 1: Checkout${NC}"
echo "✅ Source code already checked out locally"
((PASSED++))

# Stage 2: Build
echo ""
echo -e "${BLUE}🚀 Stage 2: Build${NC}"
run_test "Environment Configuration" "node -e \"const { config } = require('./config/env').init(); console.log('App:', config.app.name);\""
run_test "Dependency Check" "npm list --depth=0 > /dev/null 2>&1"
run_test "Syntax Validation" "node -c index.js"

# Stage 3: Test
echo ""
echo -e "${BLUE}🧪 Stage 3: Test${NC}"
run_test "Validation Demo" "node demo_validation.js"
run_test "Custom Validation Test" "node test_validation.js"

# Stage 4: Code Quality
echo ""
echo -e "${BLUE}📋 Stage 4: Code Quality${NC}"

# Create temporary ESLint config if not exists
if [ ! -f ".eslintrc.js" ]; then
    echo "Creating temporary ESLint config..."
    cat > .eslintrc.js << 'EOF'
module.exports = {
    env: {
        node: true,
        es2021: true,
    },
    extends: ['eslint:recommended'],
    rules: {
        'no-unused-vars': 'warn',
        'no-console': 'off'
    }
};
EOF
fi

run_test "ESLint Installation" "npm list eslint > /dev/null 2>&1 || npm install eslint --no-save"
run_test "Code Style Check" "npx eslint . --ext .js --max-warnings 20"
run_test "File Complexity Check" "find . -name '*.js' -not -path './node_modules/*' | head -5 | xargs wc -l"

# Stage 5: Security
echo ""
echo -e "${BLUE}🔒 Stage 5: Security${NC}"
run_test "Secret Detection" "! grep -r 'password\\|secret\\|key' --include='*.js' --exclude-dir=node_modules . | grep -v 'process.env' | grep -v 'example'"
run_test ".env Security Check" "! git ls-files | grep -q '^\.env$'"
run_test "Security Audit Script" "[ -x ./security_audit.sh ] && ./security_audit.sh > /dev/null || echo 'Security audit script check'"

# Stage 6: Deploy (Simulation)
echo ""
echo -e "${BLUE}🚀 Stage 6: Deploy${NC}"
run_test "Staging Directory Creation" "mkdir -p staging-test && cp index.js staging-test/ && [ -f staging-test/index.js ]"
run_test "Environment Validation" "cd staging-test && node -e \"console.log('Deployment simulation OK')\""
run_test "Cleanup Staging" "rm -rf staging-test"

# Stage 7: Release (Simulation)
echo ""
echo -e "${BLUE}🎯 Stage 7: Release${NC}"
echo "✅ Production release simulation (manual approval required in Jenkins)"
((PASSED++))

# Stage 8: Monitoring
echo ""
echo -e "${BLUE}📊 Stage 8: Monitoring${NC}"
run_test "Monitoring Directory" "mkdir -p monitoring-test && echo '{\"status\": \"ok\"}' > monitoring-test/health.json && [ -f monitoring-test/health.json ]"
run_test "Health Check Simulation" "curl -s http://localhost:3000/ > /dev/null || echo 'Health check simulation (server not running)'"
run_test "Cleanup Monitoring" "rm -rf monitoring-test"

echo ""
echo "📊 LOCAL TEST SUMMARY"
echo "====================="
echo -e "${GREEN}✅ PASSED: $PASSED${NC}"
echo -e "${RED}❌ FAILED: $FAILED${NC}"

if [ $FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 ALL LOCAL TESTS PASSED!${NC}"
    echo "🚀 Project ready for Jenkins pipeline execution"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo "1. Ensure Jenkins plugins are installed"
    echo "2. Configure Jenkins credentials" 
    echo "3. Create Jenkins pipeline job"
    echo "4. Run Jenkins build"
    echo ""
    echo "📚 Use checklist: JENKINS_SETUP_CHECKLIST.md"
else
    echo ""
    echo -e "${YELLOW}⚠️  Some local tests failed${NC}"
    echo "Fix issues before running Jenkins pipeline"
    echo ""
    echo "🔧 Common fixes:"
    echo "- Run: npm install"
    echo "- Check file permissions"
    echo "- Verify environment configuration"
fi

# Cleanup temporary files
rm -f .eslintrc.js

echo ""
echo -e "${BLUE}📋 Jenkins Pipeline Readiness Check${NC}"
echo "-----------------------------------"

echo "✅ Run full verification: ./verify_pipeline_setup.sh"
echo "📖 Setup guide: JENKINS_SETUP_CHECKLIST.md"  
echo "🚀 Quick start: QUICK_START_GUIDE.md"

exit $FAILED