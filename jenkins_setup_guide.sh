#!/bin/bash

# 🚀 Jenkins Environment Setup Script
# Hướng dẫn setup Jenkins để chạy CI/CD pipeline

echo "🚀 Jenkins Environment Setup Guide"
echo "=================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}📋 BƯỚC 1: KIỂM TRA JENKINS${NC}"
echo "----------------------------"

# Check if Jenkins is running
if lsof -i :8080 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Jenkins đang chạy trên port 8080${NC}"
    echo "🌐 Truy cập Jenkins tại: http://localhost:8080"
else
    echo -e "${RED}❌ Jenkins không chạy. Khởi động Jenkins:${NC}"
    echo "   brew services start jenkins-lts"
    echo "   hoặc:"
    echo "   java -jar /usr/local/opt/jenkins-lts/libexec/jenkins.war"
    exit 1
fi

echo ""
echo -e "${BLUE}📦 BƯỚC 2: DANH SÁCH PLUGINS CẦN CÀI${NC}"
echo "-----------------------------------"

echo "Truy cập Jenkins → Manage Jenkins → Manage Plugins → Available"
echo ""
echo "🔧 Core Plugins (BẮT BUỘC):"
echo "  ✅ Pipeline"
echo "  ✅ Git Plugin" 
echo "  ✅ NodeJS Plugin"
echo "  ✅ Build Timeout Plugin"
echo "  ✅ AnsiColor Plugin"
echo "  ✅ Timestamper Plugin"
echo ""
echo "📊 Quality & Testing Plugins:"
echo "  ✅ Checkstyle Plugin"
echo "  ✅ Warnings Next Generation Plugin"
echo "  ✅ JUnit Plugin"
echo ""
echo "🔒 Security & Deployment Plugins:"
echo "  ✅ Credentials Plugin"
echo "  ✅ SSH Agent Plugin" 
echo "  ✅ Snyk Security Plugin"
echo ""
echo "🔔 Notification Plugins:"
echo "  ✅ Email Extension Plugin"
echo "  ✅ Slack Notification Plugin (tùy chọn)"

echo ""
echo -e "${BLUE}🔧 BƯỚC 3: CẤU HÌNH GLOBAL TOOLS${NC}"
echo "-------------------------------"

echo "Truy cập: Manage Jenkins → Global Tool Configuration"
echo ""
echo "📦 NodeJS Installation:"
echo "  - Name: NodeJS-20"
echo "  - Version: NodeJS 20.x"  
echo "  - ✅ Install automatically"
echo ""
echo "📡 Git Installation:"
echo "  - Name: Default"
echo "  - Path to Git executable: /usr/bin/git"

echo ""
echo -e "${BLUE}🔐 BƯỚC 4: TẠO CREDENTIALS${NC}"
echo "-------------------------"

echo "Truy cập: Manage Jenkins → Manage Credentials → Global credentials"
echo ""
echo "🔑 Cần tạo các credentials sau:"

# Generate sample secrets
JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "your-jwt-secret-here")
SESSION_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "your-session-secret-here") 
ENCRYPTION_KEY=$(openssl rand -base64 32 2>/dev/null || echo "your-encryption-key-here")

cat << EOF

1. github-token (Secret text)
   - ID: github-token
   - Secret: [GitHub Personal Access Token]
   - Cách tạo: GitHub → Settings → Developer settings → Personal access tokens
   - Permissions: repo, workflow, write:packages

2. snyk-token (Secret text)
   - ID: snyk-token
   - Secret: [Snyk API Token] 
   - Cách tạo: https://snyk.io → Account Settings → API Token

3. jwt-secret (Secret text)
   - ID: jwt-secret
   - Secret: ${JWT_SECRET}

4. session-secret (Secret text)  
   - ID: session-secret
   - Secret: ${SESSION_SECRET}

5. encryption-key (Secret text)
   - ID: encryption-key
   - Secret: ${ENCRYPTION_KEY}
EOF

echo ""
echo -e "${BLUE}🚀 BƯỚC 5: TẠO PIPELINE JOB${NC}"
echo "--------------------------"

echo "1. Jenkins Dashboard → New Item"
echo "2. Item name: '10.1P-Butterfly-Club-Pipeline'"
echo "3. Chọn: Pipeline"
echo "4. Click OK"
echo ""
echo "📋 Pipeline Configuration:"
echo "  - Definition: Pipeline script from SCM"
echo "  - SCM: Git"
echo "  - Repository URL: https://github.com/datnq2001/SIT753_7.3.git"
echo "  - Credentials: github-token"
echo "  - Branch Specifier: */main"
echo "  - Script Path: Jenkinsfile"
echo ""
echo "🔔 Build Triggers:"
echo "  ✅ GitHub hook trigger for GITScm polling"
echo "  ✅ Poll SCM: H/5 * * * *"

echo ""
echo -e "${BLUE}🎯 BƯỚC 6: CHẠY PIPELINE LẦN ĐẦU${NC}"
echo "------------------------------"

echo "1. Vào Jenkins job: '10.1P-Butterfly-Club-Pipeline'"
echo "2. Click 'Build Now'"
echo "3. Theo dõi tiến trình trong 'Build History'"
echo "4. Click vào build number để xem chi tiết"
echo "5. Xem 'Console Output' để debug nếu có lỗi"

echo ""
echo -e "${YELLOW}⚡ PIPELINE STAGES SẼ CHẠY:${NC}"
echo ""
echo "🔄 Stage 1: Checkout (~30s)"
echo "🚀 Stage 2: Build (~2-3min)"  
echo "🧪 Stage 3: Test (~3-5min) - Parallel execution"
echo "📋 Stage 4: Code Quality (~2-4min) - Parallel execution"
echo "🔒 Stage 5: Security (~3-7min) - Parallel execution" 
echo "🚀 Stage 6: Deploy (~2-3min) - Parallel execution"
echo "🎯 Stage 7: Release (~1-2min) - Chỉ chạy trên main branch"
echo "📊 Stage 8: Monitoring (~1-2min) - Parallel execution"
echo ""
echo -e "${GREEN}⏱️  Tổng thời gian: 15-25 phút${NC}"

echo ""
echo -e "${BLUE}🔧 TROUBLESHOOTING THƯỜNG GẶP${NC}"
echo "-----------------------------"

echo "❌ Lỗi: 'node: command not found'"
echo "   ➤ Kiểm tra NodeJS tool configuration"
echo ""
echo "❌ Lỗi: 'Credentials not found'"  
echo "   ➤ Kiểm tra credential IDs khớp chính xác"
echo ""
echo "❌ Lỗi: 'Authentication failed'"
echo "   ➤ Kiểm tra GitHub token permissions"
echo ""
echo "❌ Lỗi: 'Snyk auth failed'"
echo "   ➤ Tạo tài khoản miễn phí tại snyk.io"

echo ""
echo -e "${GREEN}🎉 HOÀN THÀNH SETUP!${NC}"
echo ""
echo "📚 Tài liệu chi tiết:"
echo "  - JENKINS_DEPLOYMENT_GUIDE.md"
echo "  - QUICK_START_GUIDE.md"
echo "  - ./verify_pipeline_setup.sh"
echo ""
echo "🚀 Sẵn sàng chạy CI/CD pipeline với 8 stages!"