# 🔧 Jenkins Pipeline Troubleshooting Guide

## 🚨 Common Pipeline Issues & Solutions

### ✅ Issue #1: RESOLVED - Jenkinsfile Syntax Error

**❌ Error Message:**
```
org.codehaus.groovy.control.MultipleCompilationErrorsException: startup failed:
WorkflowScript: 260: unexpected char: '\' @ line 260, column 94.
   ode_modules/*" -exec du -h {} \; >> comp
                                 ^
```

**🔍 Root Cause:** 
Improper escape character in Groovy shell command. The `\;` in find command wasn't properly escaped for Groovy string parsing.

**✅ Solution Applied:**
```groovy
# Before (BROKEN):
find . -name "*.js" -not -path "./node_modules/*" -exec du -h {} \; >> complexity-report.txt

# After (FIXED):  
find . -name "*.js" -not -path "./node_modules/*" -exec du -h {} \\; >> complexity-report.txt
```

**🎯 Status:** ✅ **FIXED** - Committed to main branch

---

## 🔧 Other Potential Jenkins Pipeline Issues

### ❌ Issue #2: Node.js Not Found
**Error:** `node: command not found`

**Solution:**
1. Check Global Tool Configuration in Jenkins
2. Ensure NodeJS-20 is configured and auto-install enabled
3. Restart Jenkins if needed

### ❌ Issue #3: Credentials Not Found  
**Error:** `could not resolve credential 'github-token'`

**Solution:**
1. Verify all 5 required credentials exist:
   - `github-token`
   - `snyk-token` 
   - `jwt-secret`
   - `session-secret`
   - `encryption-key`
2. Check credential IDs match exactly (case-sensitive)
3. Verify credentials are in Global scope

### ❌ Issue #4: GitHub Authentication Failed
**Error:** `Authentication failed` or `Couldn't find any revision to build`

**Solution:**
1. Verify GitHub token permissions (repo, workflow, write:packages)
2. Check token hasn't expired
3. Test repository access with token
4. Ensure repository URL is correct

### ❌ Issue #5: Snyk Authentication Failed
**Error:** `Snyk auth failed`

**Solution:**
1. Create free account at https://snyk.io
2. Generate new API token
3. Verify token in Snyk dashboard
4. Update Jenkins credential

### ❌ Issue #6: ESLint Configuration Issues
**Error:** `ESLint couldn't find an eslint.config.js file`

**Solution:**
1. Pipeline automatically installs ESLint
2. If issues persist, add .eslintrc.js to repository
3. Or modify pipeline to use different linting approach

### ❌ Issue #7: Permission Denied on Scripts
**Error:** `Permission denied` on security_audit.sh

**Solution:**
1. Scripts should be executable in repository
2. Pipeline includes `chmod +x security_audit.sh`
3. Verify git tracks executable permissions

---

## 🔍 Debugging Steps

### 1. Check Console Output
```
1. Go to Jenkins build
2. Click build number (#1, #2, etc.)
3. Click "Console Output"
4. Look for specific error messages
```

### 2. Validate Project Locally
```bash
# Run project verification
./verify_pipeline_setup.sh

# Test components locally  
./test_pipeline_locally.sh

# Check syntax
node -c index.js
```

### 3. Test Individual Components
```bash
# Test environment config
node -e "require('./config/env').init()"

# Test validation
node demo_validation.js

# Test database
node createDB.js
```

---

## 📊 Pipeline Stage Debugging

### Stage 1: Checkout Issues
- **Check:** Repository URL and credentials
- **Verify:** Branch exists and accessible
- **Test:** `git clone` manually with token

### Stage 2: Build Issues  
- **Check:** package.json exists and valid
- **Verify:** npm dependencies resolve
- **Test:** `npm ci` locally

### Stage 3: Test Issues
- **Check:** Test files exist (demo_validation.js, test_validation.js)
- **Verify:** Application starts without errors
- **Test:** `node demo_validation.js` locally

### Stage 4: Code Quality Issues
- **Check:** ESLint installation and configuration
- **Verify:** JavaScript files syntax is valid
- **Test:** `npx eslint . --ext .js` locally

### Stage 5: Security Issues
- **Check:** Snyk token and account status
- **Verify:** security_audit.sh is executable
- **Test:** `./security_audit.sh` locally

### Stage 6: Deploy Issues
- **Check:** File permissions and paths
- **Verify:** Environment configuration loads
- **Test:** Staging deployment manually

### Stage 7: Release Issues
- **Check:** Branch is 'main' for production release
- **Verify:** Manual approval parameters
- **Test:** Archive and packaging commands

### Stage 8: Monitoring Issues
- **Check:** Monitoring directory creation
- **Verify:** Health check scripts
- **Test:** Monitoring configuration generation

---

## 🎯 Success Validation

### ✅ Pipeline Should Complete With:
```
✅ All 8 stages marked as SUCCESS
✅ Total duration: 15-25 minutes  
✅ Green build status in Jenkins
✅ Artifacts archived successfully
✅ No critical errors in console output
```

### 📊 Generated Artifacts:
```
test-results.txt - Test execution results
eslint-report.xml - Code quality report
complexity-report.txt - Code complexity analysis
security-audit-report.txt - Security scan results
snyk-vulnerabilities.json - Vulnerability details  
monitoring/ - Health check configurations
*.tar.gz - Release packages (main branch)
```

---

## 📞 Getting Help

### 🔍 Self-Diagnosis Steps:
1. **Check this troubleshooting guide** first
2. **Run verification script:** `./verify_pipeline_setup.sh`
3. **Test locally:** `./test_pipeline_locally.sh`
4. **Review console output** for specific errors

### 📚 Documentation References:
- **JENKINS_IMPLEMENTATION_GUIDE.md** - Main setup guide
- **JENKINS_SETUP_CHECKLIST.md** - Step-by-step checklist  
- **JENKINS_DEPLOYMENT_GUIDE.md** - Technical reference
- **QUICK_START_GUIDE.md** - Architecture overview

### 🆘 Advanced Debugging:
```bash
# Check Jenkins system log
tail -f /var/log/jenkins/jenkins.log

# Verify plugin installation
jenkins-cli list-plugins

# Test Git connectivity  
git ls-remote https://github.com/datnq2001/SIT753_7.3.git

# Check Node.js in Jenkins environment
which node && node --version
```

---

## 📈 Pipeline Optimization Tips

### ⚡ Performance Improvements:
1. Use parallel stages effectively
2. Cache dependencies when possible
3. Optimize Docker builds if using containers
4. Use lightweight checkouts

### 🔒 Security Best Practices:
1. Rotate credentials regularly
2. Use least privilege access
3. Scan for vulnerabilities regularly
4. Keep Jenkins and plugins updated

### 📊 Monitoring Enhancements:
1. Set up email notifications
2. Configure Slack integration
3. Monitor build trends
4. Set up alerting for failures

---

**🎯 Current Status: Jenkinsfile Syntax Error FIXED**

Pipeline should now execute successfully with all 8 stages! 🚀