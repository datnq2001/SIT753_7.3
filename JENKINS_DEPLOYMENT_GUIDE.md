# 🚀 Jenkins Pipeline Deployment Guide

## 📋 Overview

Jenkins Pipeline hoàn chỉnh với **8 stages chính**:

1. **🔄 Checkout** - Lấy source code từ GitHub
2. **🚀 Build** - Build ứng dụng và cấu hình environment
3. **🧪 Test** - Chạy unit tests, integration tests, performance tests
4. **📋 Code Quality** - ESLint, Code complexity, Documentation check
5. **🔒 Security** - Vulnerability scanning, Secret detection, Security audit
6. **🚀 Deploy** - Deploy to staging và smoke tests
7. **🎯 Release** - Production release với approval gate
8. **📊 Monitoring** - Performance monitoring, Health checks, Alerts

---

## ⚙️ Jenkins Configuration Requirements

### 1. 📦 Required Jenkins Plugins

Cài đặt các plugins sau trong Jenkins:

```bash
# Core plugins
- Pipeline
- Git
- NodeJS Plugin
- Build Timeout Plugin
- AnsiColor Plugin
- Timestamper

# Quality & Testing plugins
- Checkstyle Plugin
- Warnings Next Generation Plugin

# Deployment & Security plugins
- Credentials Plugin
- SSH Agent Plugin
- Snyk Security Plugin

# Notification plugins
- Email Extension Plugin
- Slack Notification Plugin

# Utility plugins
- Build Name and Description Setter Plugin
- Copy Artifact Plugin
```

### 2. 🔧 Global Tool Configuration

**Manage Jenkins → Global Tool Configuration:**

#### NodeJS Configuration
- Name: `NodeJS-20`
- Version: `NodeJS 20.x`
- Auto-install: ✅ Enabled

#### Git Configuration
- Git executable: `/usr/bin/git`
- Default branch: `main`

---

## 🔐 Credentials Setup

**Manage Jenkins → Manage Credentials → Global credentials:**

### Required Credentials (ID → Type → Description)

```
github-token        → Secret text      → GitHub Personal Access Token
snyk-token         → Secret text      → Snyk API Token
jwt-secret         → Secret text      → JWT Secret Key
session-secret     → Secret text      → Session Secret Key
encryption-key     → Secret text      → Encryption Key
deploy-ssh-key     → SSH Username     → Deployment SSH Key
```

### 🔑 How to Create Each Credential

#### 1. GitHub Token (`github-token`)
```
1. GitHub → Settings → Developer settings → Personal access tokens
2. Generate token with permissions: repo, workflow, write:packages
3. Jenkins → Add credential → Secret text
4. ID: github-token
5. Secret: [paste token]
```

#### 2. Snyk Token (`snyk-token`)
```
1. Register at https://snyk.io/
2. Account Settings → API Token → Generate token
3. Jenkins → Add credential → Secret text
4. ID: snyk-token
5. Secret: [paste token]
```

#### 3. Application Secrets
```javascript
// Generate strong secrets
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -base64 32)

// Add each to Jenkins as Secret text
```

---

## 🚀 Pipeline Creation

### 1. Create New Pipeline Job

```
1. Jenkins Dashboard → New Item
2. Name: "10.1P-Butterfly-Club-Pipeline"
3. Type: Pipeline
4. OK
```

### 2. Configure Pipeline

**Pipeline Configuration:**

```groovy
Definition: Pipeline script from SCM
SCM: Git
Repository URL: https://github.com/datnq2001/SIT753_7.3.git
Credentials: github-token
Branch: */main
Script Path: Jenkinsfile
```

### 3. Build Triggers

```
✅ GitHub hook trigger for GITScm polling
✅ Poll SCM: H/5 * * * *
```

---

## 🎯 Pipeline Execution Stages

### Stage 1: 🔄 Checkout
```yaml
Purpose: Get source code from GitHub
Actions:
  - Checkout main branch
  - Set build metadata
  - Extract commit info
```

### Stage 2: 🚀 Build
```yaml
Purpose: Build application and setup environment
Actions:
  - Create .env from Jenkins credentials
  - npm ci (clean install)
  - Verify environment configuration
  - Run dependency audit
```

### Stage 3: 🧪 Test (Parallel)
```yaml
Unit Tests:
  - Validation tests
  - Custom test scripts
Integration Tests:
  - Start server
  - Health checks
  - API endpoint tests
Performance Tests:
  - Memory usage check
  - Performance baseline
```

### Stage 4: 📋 Code Quality (Parallel)
```yaml
ESLint Analysis:
  - Code style checking
  - Generate checkstyle report
Code Complexity:
  - Lines of code analysis
  - File size analysis
Documentation Check:
  - Required files validation
  - Documentation completeness
```

### Stage 5: 🔒 Security (Parallel)
```yaml
Vulnerability Scanning:
  - Snyk security scan
  - Dependency vulnerabilities
Secret Detection:
  - Hardcoded secrets scan
  - .env file security check
Security Audit:
  - Custom security checks
  - File permissions audit
```

### Stage 6: 🚀 Deploy (Parallel)
```yaml
Deploy to Staging:
  - Create staging environment
  - Copy application files
  - Deployment verification
Smoke Tests:
  - Environment validation
  - Basic functionality tests
```

### Stage 7: 🎯 Release (Production Only)
```yaml
Conditions: Only on main branch
Approval: Manual approval gate
Actions:
  - Production deployment
  - Version management
  - Release packaging
  - Success notifications
```

### Stage 8: 📊 Monitoring (Parallel)
```yaml
Performance Monitoring:
  - Performance baseline setup
  - Metrics configuration
Health Check Setup:
  - Health check scripts
  - Monitoring endpoints
Alert Configuration:
  - Alert thresholds
  - Notification rules
```

---

## 🎮 How to Run the Pipeline

### 1. Manual Trigger
```
1. Go to Jenkins job
2. Click "Build Now"
3. Monitor build progress
```

### 2. Automatic Triggers
```yaml
Git Push: Automatic build on code push
Scheduled: Every 5 minutes SCM polling
Webhook: GitHub webhook notifications
```

### 3. Branch-Specific Behavior
```yaml
main branch:
  - Full pipeline execution
  - Production release approval
  - All 8 stages
  
develop/staging:
  - Skip production release
  - Deploy to staging only
  - 7 stages (no release approval)
  
feature branches:
  - Build, Test, Quality, Security only
  - No deployment stages
```

---

## 📧 Notifications & Reports

### 1. Email Notifications
```yaml
Success: Build completion summary
Failure: Error details and logs
Approval: Production release confirmation
```

### 2. Generated Reports
```yaml
Artifacts:
  - test-results.txt
  - eslint-report.xml
  - complexity-report.txt
  - security-audit-report.txt
  - snyk-vulnerabilities.json
  
Release Packages:
  - dkin-butterfly-club-[version].tar.gz
  - version.json metadata
```

---

## 🔧 Troubleshooting

### Common Issues & Solutions

#### 1. Node.js Not Found
```bash
Error: node: command not found
Solution: Configure NodeJS tool in Global Tools
```

#### 2. Credentials Not Found
```bash
Error: could not resolve credential
Solution: Check credential IDs match exactly
```

#### 3. Git Authentication Failed
```bash
Error: Authentication failed
Solution: Verify github-token permissions
```

#### 4. Snyk Authentication Failed
```bash
Error: Snyk auth failed
Solution: Verify snyk-token is valid
```

### Debug Commands
```bash
# Check available tools
jenkins-cli list-plugins

# Test credentials
jenkins-cli get-credentials-as-xml system::system::jenkins

# Check SCM polling logs
Jenkins → Job → Git Polling Log
```

---

## 🎯 Success Criteria

### Pipeline Success Indicators
```yaml
✅ All 8 stages pass
✅ No security vulnerabilities (high/critical)
✅ Code quality gates met
✅ All tests pass
✅ Staging deployment successful
✅ Artifacts archived
✅ Notifications sent
```

### Quality Gates
```yaml
Code Coverage: ≥ 80%
Security Threshold: Medium or lower
ESLint Issues: < 10 errors
Performance: < 200ms response time
Documentation: All required files present
```

---

## 📚 Additional Resources

### Jenkins Documentation
- [Pipeline Syntax](https://www.jenkins.io/doc/book/pipeline/syntax/)
- [Credential Management](https://www.jenkins.io/doc/book/using/using-credentials/)
- [Plugin Management](https://www.jenkins.io/doc/book/managing/plugins/)

### Integration Tools
- [Snyk Documentation](https://docs.snyk.io/)
- [ESLint Configuration](https://eslint.org/docs/user-guide/configuring)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/)

---

## 📞 Support

Nếu gặp vấn đề:

1. **Check Build Logs**: Jenkins → Job → Build → Console Output
2. **Verify Configuration**: Compare với documentation này
3. **Test Credentials**: Ensure all secrets are properly configured
4. **Check Dependencies**: Verify all plugins installed

**Pipeline Status**: ✅ Production Ready