#!/bin/bash

# 🔍 Jenkins Pipeline Setup Verification Script
# This script validates your Jenkins environment is ready for the CI/CD pipeline

echo "🚀 Jenkins Pipeline Setup Verification"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Function to print status
print_status() {
    local status=$1
    local message=$2
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ PASS${NC}: $message"
        ((PASSED++))
    elif [ "$status" = "FAIL" ]; then
        echo -e "${RED}❌ FAIL${NC}: $message"
        ((FAILED++))
    elif [ "$status" = "WARN" ]; then
        echo -e "${YELLOW}⚠️  WARN${NC}: $message"
        ((WARNINGS++))
    elif [ "$status" = "INFO" ]; then
        echo -e "${BLUE}ℹ️  INFO${NC}: $message"
    fi
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check file exists
file_exists() {
    [ -f "$1" ]
}

echo ""
echo "🔧 1. SYSTEM REQUIREMENTS"
echo "------------------------"

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    print_status "PASS" "Node.js installed: $NODE_VERSION"
    
    # Check Node.js version (should be 18+ for modern features)
    NODE_MAJOR=$(node --version | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -ge 18 ]; then
        print_status "PASS" "Node.js version is compatible (>= 18)"
    else
        print_status "WARN" "Node.js version might be outdated. Recommended: v18+"
    fi
else
    print_status "FAIL" "Node.js not found. Install Node.js v18+"
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    print_status "PASS" "npm installed: $NPM_VERSION"
else
    print_status "FAIL" "npm not found. Should come with Node.js"
fi

# Check Git
if command_exists git; then
    GIT_VERSION=$(git --version)
    print_status "PASS" "Git installed: $GIT_VERSION"
else
    print_status "FAIL" "Git not found. Install Git for version control"
fi

# Check curl (for health checks)
if command_exists curl; then
    print_status "PASS" "curl available for health checks"
else
    print_status "WARN" "curl not found. Health checks might fail"
fi

echo ""
echo "📁 2. PROJECT STRUCTURE"
echo "----------------------"

# Check essential files
REQUIRED_FILES=(
    "package.json"
    "index.js"
    "Jenkinsfile"
    ".env.example"
    ".gitignore"
)

for file in "${REQUIRED_FILES[@]}"; do
    if file_exists "$file"; then
        print_status "PASS" "$file exists"
    else
        print_status "FAIL" "$file missing"
    fi
done

# Check directories
REQUIRED_DIRS=(
    "config"
    "schemas"
    "middleware"
    "views"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        print_status "PASS" "$dir/ directory exists"
    else
        print_status "FAIL" "$dir/ directory missing"
    fi
done

echo ""
echo "🔐 3. ENVIRONMENT CONFIGURATION"
echo "------------------------------"

# Check .env.example
if file_exists ".env.example"; then
    print_status "PASS" ".env.example template exists"
    
    # Check for required environment variables
    REQUIRED_VARS=(
        "NODE_ENV"
        "PORT"
        "DB_PATH"
        "JWT_SECRET"
        "SESSION_SECRET"
    )
    
    for var in "${REQUIRED_VARS[@]}"; do
        if grep -q "^$var=" .env.example; then
            print_status "PASS" "$var defined in .env.example"
        else
            print_status "WARN" "$var not found in .env.example"
        fi
    done
else
    print_status "FAIL" ".env.example template missing"
fi

# Check .env is not committed
if file_exists ".env"; then
    if git ls-files .env >/dev/null 2>&1; then
        print_status "FAIL" ".env file is tracked by git (security risk!)"
    else
        print_status "PASS" ".env file exists but not tracked by git"
    fi
else
    print_status "INFO" ".env file not present (will be created by Jenkins)"
fi

echo ""
echo "📦 4. DEPENDENCIES"
echo "-----------------"

# Check package.json content
if file_exists "package.json"; then
    # Check for essential dependencies
    REQUIRED_DEPS=(
        "express"
        "dotenv"
        "zod"
        "helmet"
        "cors"
        "express-rate-limit"
    )
    
    for dep in "${REQUIRED_DEPS[@]}"; do
        if grep -q "\"$dep\":" package.json; then
            print_status "PASS" "$dep dependency found"
        else
            print_status "WARN" "$dep dependency not found"
        fi
    done
    
    # Check if node_modules exists
    if [ -d "node_modules" ]; then
        print_status "PASS" "Dependencies installed (node_modules exists)"
    else
        print_status "WARN" "Dependencies not installed. Run: npm install"
    fi
else
    print_status "FAIL" "package.json missing"
fi

echo ""
echo "🔒 5. SECURITY CONFIGURATION"
echo "---------------------------"

# Check security-related files
SECURITY_FILES=(
    "security_audit.sh"
    "SECURITY_HARDENING.md"
)

for file in "${SECURITY_FILES[@]}"; do
    if file_exists "$file"; then
        print_status "PASS" "$file exists"
        
        # Check if script is executable
        if [[ "$file" == *.sh && -x "$file" ]]; then
            print_status "PASS" "$file is executable"
        elif [[ "$file" == *.sh ]]; then
            print_status "WARN" "$file is not executable. Run: chmod +x $file"
        fi
    else
        print_status "WARN" "$file missing (optional but recommended)"
    fi
done

# Check .gitignore content
if file_exists ".gitignore"; then
    GITIGNORE_PATTERNS=(
        ".env"
        "node_modules"
        "*.log"
        ".DS_Store"
    )
    
    for pattern in "${GITIGNORE_PATTERNS[@]}"; do
        if grep -q "$pattern" .gitignore; then
            print_status "PASS" "$pattern ignored in git"
        else
            print_status "WARN" "$pattern not in .gitignore"
        fi
    done
else
    print_status "FAIL" ".gitignore missing"
fi

echo ""
echo "🧪 6. TESTING SETUP"
echo "------------------"

# Check test files
TEST_FILES=(
    "demo_validation.js"
    "test_validation.js"
)

for file in "${TEST_FILES[@]}"; do
    if file_exists "$file"; then
        print_status "PASS" "$file test file exists"
    else
        print_status "WARN" "$file test file missing"
    fi
done

echo ""
echo "🚀 7. JENKINS CONFIGURATION"
echo "--------------------------"

# Check Jenkinsfile
if file_exists "Jenkinsfile"; then
    print_status "PASS" "Jenkinsfile exists"
    
    # Check Jenkinsfile content
    JENKINS_STAGES=(
        "Checkout"
        "Build"
        "Test"
        "Code Quality"
        "Security"
        "Deploy"
        "Release"
        "Monitoring"
    )
    
    for stage in "${JENKINS_STAGES[@]}"; do
        if grep -q "$stage" Jenkinsfile; then
            print_status "PASS" "Pipeline stage '$stage' found"
        else
            print_status "WARN" "Pipeline stage '$stage' not found"
        fi
    done
    
    # Check for required Jenkins configurations
    JENKINS_CONFIGS=(
        "tools"
        "environment"
        "triggers"
        "post"
    )
    
    for config in "${JENKINS_CONFIGS[@]}"; do
        if grep -q "$config" Jenkinsfile; then
            print_status "PASS" "Jenkins $config configuration found"
        else
            print_status "WARN" "Jenkins $config configuration missing"
        fi
    done
else
    print_status "FAIL" "Jenkinsfile missing"
fi

echo ""
echo "📊 8. APPLICATION HEALTH CHECK"
echo "-----------------------------"

# Try to run basic application checks
if file_exists "index.js"; then
    print_status "PASS" "Main application file exists"
    
    # Check if we can parse the main file
    if node -c index.js >/dev/null 2>&1; then
        print_status "PASS" "index.js syntax is valid"
    else
        print_status "FAIL" "index.js has syntax errors"
    fi
else
    print_status "FAIL" "index.js main file missing"
fi

# Check if environment config can be loaded
if file_exists "config/env.js"; then
    print_status "PASS" "Environment configuration file exists"
else
    print_status "WARN" "config/env.js not found"
fi

echo ""
echo "📈 SUMMARY REPORT"
echo "================"

TOTAL=$((PASSED + FAILED + WARNINGS))

echo -e "${GREEN}✅ PASSED: $PASSED${NC}"
echo -e "${RED}❌ FAILED: $FAILED${NC}"
echo -e "${YELLOW}⚠️  WARNINGS: $WARNINGS${NC}"
echo "📊 TOTAL CHECKS: $TOTAL"

echo ""
if [ $FAILED -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}🎉 EXCELLENT! Your project is fully ready for Jenkins CI/CD pipeline!${NC}"
        EXIT_CODE=0
    else
        echo -e "${YELLOW}👍 GOOD! Your project is ready with minor warnings. Consider fixing warnings for better pipeline reliability.${NC}"
        EXIT_CODE=0
    fi
else
    echo -e "${RED}❌ ISSUES FOUND! Please fix the failed items before running the Jenkins pipeline.${NC}"
    EXIT_CODE=1
fi

echo ""
echo "🔗 NEXT STEPS"
echo "============"

if [ $FAILED -gt 0 ]; then
    echo "1. 🔧 Fix all FAILED items listed above"
    echo "2. 🔄 Run this script again to verify fixes"
    echo "3. 📚 Check JENKINS_DEPLOYMENT_GUIDE.md for detailed setup"
else
    echo "1. 🚀 Configure Jenkins credentials (see JENKINS_DEPLOYMENT_GUIDE.md)"
    echo "2. 📦 Create Jenkins pipeline job"
    echo "3. 🎯 Run your first pipeline build"
    echo "4. 📊 Monitor pipeline execution and reports"
fi

echo ""
echo "📚 Documentation: JENKINS_DEPLOYMENT_GUIDE.md"
echo "🆘 Support: Check troubleshooting section in deployment guide"

exit $EXIT_CODE