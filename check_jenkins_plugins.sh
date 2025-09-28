#!/bin/bash

# 🔍 Jenkins Plugin Verification Script
# Kiểm tra xem Jenkins plugins cần thiết đã được cài đặt chưa

echo "🔍 Jenkins Plugin Verification"
echo "=============================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Jenkins URL
JENKINS_URL="http://localhost:8080"

echo ""
echo -e "${BLUE}📋 Kiểm tra Jenkins connectivity...${NC}"

# Check if Jenkins is accessible
if curl -s "$JENKINS_URL/login" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Jenkins accessible tại $JENKINS_URL${NC}"
else
    echo -e "${RED}❌ Không thể kết nối Jenkins tại $JENKINS_URL${NC}"
    echo "   Đảm bảo Jenkins đang chạy và accessible"
    exit 1
fi

echo ""
echo -e "${BLUE}🔧 Required Plugins Check${NC}"
echo "-------------------------"

# List of required plugins
REQUIRED_PLUGINS=(
    "workflow-aggregator:Pipeline"
    "git:Git Plugin"
    "nodejs:NodeJS Plugin"  
    "build-timeout:Build Timeout Plugin"
    "ansicolor:AnsiColor Plugin"
    "timestamper:Timestamper Plugin"
    "checkstyle:Checkstyle Plugin"
    "warnings-ng:Warnings Next Generation"
    "junit:JUnit Plugin"
    "credentials:Credentials Plugin"
    "ssh-agent:SSH Agent Plugin"  
    "email-ext:Email Extension Plugin"
)

echo "📦 Core & Required Plugins:"
echo ""

# Function to check plugin (simulation since we can't easily check via CLI without auth)
check_plugin_simulation() {
    local plugin_id=$1
    local plugin_name=$2
    
    # This is a simulation - in real scenario you'd need Jenkins CLI with auth
    # For now, we'll provide instructions for manual verification
    echo "🔍 $plugin_name"
    echo "   ID: $plugin_id"
    echo "   Status: Manual verification required"
    echo ""
}

for plugin_info in "${REQUIRED_PLUGINS[@]}"; do
    IFS=':' read -r plugin_id plugin_name <<< "$plugin_info"
    check_plugin_simulation "$plugin_id" "$plugin_name"
done

echo ""
echo -e "${YELLOW}📋 Manual Plugin Verification Steps:${NC}"
echo "-----------------------------------"

echo "1. 🌐 Truy cập Jenkins: $JENKINS_URL"
echo "2. 📦 Vào: Manage Jenkins → Manage Plugins → Installed"
echo "3. 🔍 Tìm kiếm từng plugin sau trong danh sách:"
echo ""

for plugin_info in "${REQUIRED_PLUGINS[@]}"; do
    IFS=':' read -r plugin_id plugin_name <<< "$plugin_info"
    echo "   ✅ $plugin_name"
done

echo ""
echo -e "${BLUE}🔧 Alternative: Install via Jenkins CLI${NC}"
echo "------------------------------------"

echo "Nếu có Jenkins CLI setup, có thể cài plugins bằng lệnh:"
echo ""
echo "jenkins-cli install-plugin workflow-aggregator"
echo "jenkins-cli install-plugin git"  
echo "jenkins-cli install-plugin nodejs"
echo "jenkins-cli install-plugin build-timeout"
echo "jenkins-cli install-plugin ansicolor"
echo "jenkins-cli install-plugin timestamper"
echo "jenkins-cli install-plugin checkstyle"
echo "jenkins-cli install-plugin warnings-ng"
echo "jenkins-cli install-plugin junit"
echo "jenkins-cli install-plugin ssh-agent"
echo "jenkins-cli install-plugin email-ext"

echo ""
echo -e "${BLUE}🎯 Next Steps After Plugin Installation${NC}"
echo "------------------------------------"

echo "1. ✅ Restart Jenkins nếu cần thiết"
echo "2. 🔧 Configure Global Tools (NodeJS-20)"
echo "3. 🔐 Setup Credentials (5 required credentials)"
echo "4. 🚀 Create Pipeline Job"
echo "5. 🎯 Run first pipeline build"

echo ""
echo -e "${GREEN}📚 Documentation Available:${NC}"
echo "  - JENKINS_SETUP_CHECKLIST.md (step-by-step guide)"
echo "  - JENKINS_DEPLOYMENT_GUIDE.md (comprehensive setup)"
echo "  - QUICK_START_GUIDE.md (overview & architecture)"

echo ""
echo -e "${BLUE}🔍 Credentials Verification${NC}"
echo "-------------------------"

echo "After installing plugins, verify these credential IDs exist:"
echo "  🔑 github-token"
echo "  🔑 snyk-token"  
echo "  🔑 jwt-secret"
echo "  🔑 session-secret"
echo "  🔑 encryption-key"

echo ""
echo -e "${YELLOW}⚠️  Important Notes:${NC}"
echo "- Some plugins might be bundled or pre-installed"
echo "- Check 'Installed' tab in Plugin Manager"
echo "- Restart Jenkins after installing plugins"
echo "- Run './verify_pipeline_setup.sh' after complete setup"

echo ""
echo -e "${GREEN}🚀 Ready for next phase: Credentials Configuration${NC}"