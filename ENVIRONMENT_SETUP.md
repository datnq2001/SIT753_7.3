# Environment Configuration & Secrets Management

## 🎯 Overview

This project now implements **professional-grade secrets and configuration management** using:

- ✅ **dotenv** for local development
- ✅ **.env files** with proper .gitignore protection  
- ✅ **Jenkins Credentials** for CI/CD environment injection
- ✅ **Environment validation** with type safety
- ✅ **Security hardening** and audit trails

## 📁 Project Structure

```
10.1P/
├── .env                     # Local development (NEVER COMMIT!)
├── .env.example            # Template for environment setup
├── .gitignore              # Protects sensitive files
├── config/
│   └── env.js              # Environment configuration module
├── Jenkinsfile             # CI/CD pipeline with credential injection
└── setup_jenkins.sh        # Jenkins credentials setup guide
```

## 🔧 Environment Variables

### Core Application Settings
```bash
NODE_ENV=development          # Environment: development/staging/production
PORT=3000                    # Server port
HOST=localhost               # Server host

APP_NAME=dKin Butterfly Club
APP_VERSION=1.0.0
APP_DESCRIPTION=Informative web page on Butterflies
```

### Database Configuration
```bash
DB_PATH=./mySurveyDB.db     # SQLite database path
DB_TYPE=sqlite3             # Database type
```

### Security Configuration
```bash
JWT_SECRET=your-jwt-secret-here              # JWT signing key
SESSION_SECRET=your-session-secret-here      # Session encryption key  
ENCRYPTION_KEY=your-32-character-key-here    # Data encryption key
```

### Rate Limiting
```bash
RATE_LIMIT_WINDOW_MS=900000    # 15 minutes window
RATE_LIMIT_MAX_REQUESTS=100    # Max requests per window
SUBMIT_RATE_LIMIT_MAX=5        # Max form submissions per window
```

### CORS & Security
```bash
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
SNYK_TOKEN=your-snyk-token     # Security scanning token
```

### Feature Flags
```bash
ENABLE_ANALYTICS=false         # Google Analytics integration
ENABLE_EMAIL_NOTIFICATIONS=false
MAINTENANCE_MODE=false         # Emergency maintenance mode
```

## 🚀 Local Development Setup

1. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Edit .env with your local settings:**
   ```bash
   # Update these values for local development
   NODE_ENV=development
   PORT=3000
   DB_PATH=./mySurveyDB.db
   
   # Generate secure secrets (or use development defaults)
   JWT_SECRET=dev-jwt-secret-change-in-production
   SESSION_SECRET=dev-session-secret-change-in-production
   ```

3. **Start application:**
   ```bash
   npm start
   ```

4. **Environment validation:**
   The app automatically validates environment variables on startup and will exit with clear error messages if required variables are missing or invalid.

## 🏗️ Jenkins CI/CD Integration

### Required Jenkins Credentials

Configure these in **Jenkins > Manage Jenkins > Manage Credentials**:

#### Database & Application
- **`butterfly-club-db-path`** (Secret text): Production database path
- **`butterfly-club-jwt-secret`** (Secret text): JWT signing secret
- **`butterfly-club-session-secret`** (Secret text): Session encryption secret
- **`butterfly-club-encryption-key`** (Secret text): Data encryption key

#### Security & Monitoring
- **`snyk-token`** (Secret text): Snyk security scanning token

#### Deployment
- **`staging-host`** (Secret text): Staging server connection string
- **`production-host`** (Secret text): Production server connection string
- **`staging-ssh-key`** (SSH key): SSH key for staging deployment
- **`production-ssh-key`** (SSH key): SSH key for production deployment

### Pipeline Features

The Jenkinsfile includes:

✅ **Automatic Environment Injection**: Credentials → Environment Variables
✅ **Security Scanning**: Snyk integration for vulnerability detection
✅ **Multi-environment Deployment**: Staging → Production workflow
✅ **Zero-downtime Deployment**: Rolling updates with health checks
✅ **Security Hardening**: File permission & secret detection checks
✅ **Automated Testing**: ESLint, unit tests, integration tests
✅ **Monitoring & Alerts**: Email notifications and build status

### Setup Jenkins Pipeline

1. **Run setup script:**
   ```bash
   ./setup_jenkins.sh
   ```

2. **Create Jenkins Pipeline Job:**
   - New Item → Pipeline
   - Name: `dkin-butterfly-club`
   - Pipeline script from SCM
   - Repository URL: Your Git repository
   - Script Path: `Jenkinsfile`

3. **Configure Webhook (Optional):**
   - GitHub: Repository → Settings → Webhooks
   - Payload URL: `http://your-jenkins.com/github-webhook/`

## 🛡️ Security Best Practices

### ✅ What We Implemented:

1. **Never Commit Secrets**: .env files in .gitignore
2. **Environment Validation**: Type-safe configuration with validation
3. **Credential Injection**: Jenkins manages all production secrets
4. **Security Scanning**: Automated Snyk vulnerability detection
5. **Permission Hardening**: File permission checks in pipeline
6. **Secret Detection**: Automated scanning for hardcoded secrets
7. **Audit Trail**: All deployments logged and traceable

### 🔐 Production Security Checklist:

- [ ] Change all default secrets in production
- [ ] Use strong, randomly generated keys (32+ characters)
- [ ] Rotate secrets regularly
- [ ] Limit access to Jenkins credentials
- [ ] Enable audit logging
- [ ] Monitor for security vulnerabilities
- [ ] Regular security scans with Snyk

## 🧪 Testing Environment Configuration

### Test Local Configuration:
```bash
# Validate environment variables
node -e "console.log(require('./config/env').init())"

# Test with different NODE_ENV
NODE_ENV=production node -e "console.log(require('./config/env').init())"
```

### Test Production Secrets:
The pipeline automatically validates that production secrets are properly configured and don't contain default/development values.

## 🚨 Troubleshooting

### Common Issues:

1. **"Required environment variable X is not set"**
   - Check .env file exists and contains the variable
   - Verify variable name spelling

2. **"Configuration validation failed"**
   - Production secrets contain default/fallback values
   - Update secrets in Jenkins credentials

3. **Jenkins credential injection not working**
   - Verify credential IDs match exactly
   - Check Jenkins credential configuration

### Debug Commands:
```bash
# Check environment loading
node -p "require('dotenv').config(); process.env"

# Validate configuration
node config/env.js

# Test database connection
node -e "
  const { config } = require('./config/env').init();
  console.log('DB Path:', config.database.path);
"
```

## 📈 Benefits Achieved

### 🔒 Security:
- ✅ Zero hardcoded secrets in source code
- ✅ Environment-specific configuration
- ✅ Automated security vulnerability scanning
- ✅ Audit trail for all deployments

### 🚀 DevOps:
- ✅ Automated CI/CD pipeline
- ✅ Zero-downtime deployments
- ✅ Environment promotion (dev → staging → prod)
- ✅ Rollback capability

### 🛠️ Maintainability:
- ✅ Centralized configuration management
- ✅ Type-safe environment validation
- ✅ Clear separation of environments
- ✅ Comprehensive documentation

**Your application now has enterprise-grade configuration management! 🎉**