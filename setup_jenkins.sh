#!/bin/bash

# Jenkins Credentials Setup Script
# This script helps setup the required credentials in Jenkins for the Butterfly Club project

echo "🔐 Jenkins Credentials Setup for dKin Butterfly Club"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}This script will guide you through setting up Jenkins credentials.${NC}"
echo -e "${YELLOW}You need to configure these in Jenkins > Manage Jenkins > Manage Credentials${NC}"
echo ""

# Required credentials list
echo -e "${GREEN}Required Jenkins Credentials:${NC}"
echo ""

echo "1. 📊 Database Configuration:"
echo "   - ID: butterfly-club-db-path"
echo "   - Type: Secret text"
echo "   - Value: /opt/butterfly-club/data/production.db"
echo ""

echo "2. 🔐 Security Secrets:"
echo "   - ID: butterfly-club-jwt-secret"
echo "   - Type: Secret text"
echo "   - Value: $(openssl rand -base64 32)"
echo ""

echo "   - ID: butterfly-club-session-secret"
echo "   - Type: Secret text" 
echo "   - Value: $(openssl rand -base64 32)"
echo ""

echo "   - ID: butterfly-club-encryption-key"
echo "   - Type: Secret text"
echo "   - Value: $(openssl rand -base64 32 | cut -c1-32)"
echo ""

echo "3. 🛡️ Security Scanning:"
echo "   - ID: snyk-token"
echo "   - Type: Secret text"
echo "   - Value: [Your Snyk API token from https://app.snyk.io/account]"
echo ""

echo "4. 🌐 Deployment Hosts:"
echo "   - ID: staging-host"
echo "   - Type: Secret text"
echo "   - Value: user@staging-server.com"
echo ""

echo "   - ID: production-host"
echo "   - Type: Secret text"
echo "   - Value: user@production-server.com"
echo ""

echo "5. 🔑 SSH Keys:"
echo "   - ID: staging-ssh-key"
echo "   - Type: SSH Username with private key"
echo "   - Username: deploy"
echo "   - Private Key: [Your staging server SSH private key]"
echo ""

echo "   - ID: production-ssh-key"
echo "   - Type: SSH Username with private key"
echo "   - Username: deploy"
echo "   - Private Key: [Your production server SSH private key]"
echo ""

# Generate sample secrets
echo -e "${GREEN}Generated Sample Secrets (use these or generate your own):${NC}"
echo ""
echo "JWT Secret: $(openssl rand -base64 32)"
echo "Session Secret: $(openssl rand -base64 32)"
echo "Encryption Key: $(openssl rand -base64 32 | cut -c1-32)"
echo ""

# Jenkins setup instructions
echo -e "${YELLOW}Jenkins Setup Instructions:${NC}"
echo ""
echo "1. Install Required Jenkins Plugins:"
echo "   - Pipeline"
echo "   - Git"
echo "   - SSH Agent"
echo "   - Email Extension"
echo "   - Checkstyle"
echo "   - JUnit"
echo ""

echo "2. Configure Jenkins Global Settings:"
echo "   - Go to Manage Jenkins > Configure System"
echo "   - Set up Email configuration (SMTP)"
echo "   - Configure Git (if not already done)"
echo ""

echo "3. Create Pipeline Job:"
echo "   - New Item > Pipeline"
echo "   - Name: dkin-butterfly-club"
echo "   - Pipeline script from SCM"
echo "   - Repository URL: [Your Git repository]"
echo "   - Script Path: Jenkinsfile"
echo ""

echo "4. Set up Webhooks (Optional):"
echo "   - GitHub: Repository > Settings > Webhooks"
echo "   - Payload URL: http://your-jenkins.com/github-webhook/"
echo "   - Content type: application/json"
echo "   - Events: Just the push event"
echo ""

echo -e "${GREEN}Setup complete! Your pipeline is ready to use.${NC}"