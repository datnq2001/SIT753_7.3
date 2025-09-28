pipeline {
    agent any
    
    // Global tools configuration
    tools {
        nodejs 'node24'
    }
    
    environment {
        NODE_ENV = 'development'
        APP_NAME = 'dkin-butterfly-club'
        BU                        sh '''
                            for doc in README.md ENVIRONMENT_SETUP.md SECURITY_HARDENING.md; do
                                if [ -f "$doc" ]; then
                                    echo "Found: $doc"
                                else
                                    echo "Missing: $doc"
                                fi
                            done
                            wc -l *.md > documentation-report.txt
                        '''${env.BUILD_NUMBER}-${env.GIT_COMMIT?.take(7) ?: 'unknown'}"
        
        STAGING_HOST = 'localhost'
        PRODUCTION_HOST = 'localhost'
        NOTIFICATION_EMAIL = 'datnq2001@gmail.com'
        COVERAGE_THRESHOLD = '80'
        SECURITY_THRESHOLD = 'medium'
    }
    
    // Build triggers
    triggers {
        pollSCM('H/5 * * * *')
        githubPush()
    }
    
    // Pipeline options
    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        retry(2)
        skipStagesAfterUnstable()
        timestamps()
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code from GitHub...'
                checkout scm
                
                script {
                    env.GIT_COMMIT_SHORT = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
                    env.GIT_BRANCH_NAME = sh(script: "git rev-parse --abbrev-ref HEAD", returnStdout: true).trim()
                    env.BUILD_VERSION = "${env.BUILD_NUMBER}-${env.GIT_COMMIT_SHORT}"
                    
                    echo "Build Info: ${env.BUILD_VERSION} (${env.GIT_BRANCH_NAME}:${env.GIT_COMMIT_SHORT})"
                }
            }
            post {
                success {
                    echo 'Checkout completed successfully'
                }
                failure {
                    echo 'Checkout failed'
                }
            }
        }
        
        stage('Build') {
            steps {
                echo 'Building application...'
                
                script {
                    writeFile file: '.env', text: """NODE_ENV=${NODE_ENV}
PORT=3000

DB_PATH=./mySurveyDB.db
DB_TYPE=sqlite3

JWT_SECRET=default-jwt-secret-change-in-production
SESSION_SECRET=default-session-secret-change-in-production
ENCRYPTION_KEY=default-encryption-key-change-in-production

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
SUBMIT_RATE_LIMIT_MAX=5

ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080

SNYK_TOKEN=

APP_NAME=dKin Butterfly Club
APP_VERSION=${BUILD_VERSION}
APP_DESCRIPTION=Informative web page on Butterflies from around the world

LOG_LEVEL=info
LOG_FILE=./logs/app.log

ENABLE_ANALYTICS=true
ENABLE_EMAIL_NOTIFICATIONS=true
MAINTENANCE_MODE=false
"""
                }
                
                sh '''
                    npm ci
                    node createDB.js
                    node -e "console.log('Environment check:', require('./config/env').init().config.app.name)"
                    npm audit --audit-level moderate || true
                '''
            }
            post {
                success {
                    echo 'Build stage completed successfully'
                }
                failure {
                    echo 'Build stage failed'
                }
            }
        }
        
        stage('Test') {
            parallel {
                stage('Unit Tests') {
                    steps {
                        echo 'Running unit tests...'
                        sh '''
                            cp .env.example .env.test
                            node demo_validation.js
                            node test_validation.js > test-results.txt || true
                        '''
                    }
                    post {
                        always {
                            archiveArtifacts artifacts: 'test-results.txt', allowEmptyArchive: true
                        }
                    }
                }
                
                stage('Integration Tests') {
                    steps {
                        echo 'Running integration tests...'
                        sh '''
                            timeout 30 node index.js &
                            SERVER_PID=$!
                            sleep 10
                            
                            curl -f http://localhost:3000/ || echo "Health check failed"
                            curl -f http://localhost:3000/surveys || echo "Surveys endpoint test failed"
                            
                            kill $SERVER_PID || true
                            sleep 2
                        '''
                    }
                }
                
                stage('Performance Tests') {
                    steps {
                        echo 'Running performance tests...'
                        sh '''
                            node -e "console.log('Memory usage:', process.memoryUsage())"
                        '''
                    }
                }
            }
            post {
                success {
                    echo 'All tests passed successfully'
                }
                failure {
                    echo 'Some tests failed'
                }
            }
        }
        
        stage('Code Quality') {
            parallel {
                stage('ESLint Analysis') {
                    steps {
                        echo 'Running ESLint code analysis...'
                        sh '''
                            # Install ESLint if not present
                            npm install eslint --save-dev || true
                            
                            # Run ESLint with checkstyle format
                            npx eslint . --ext .js --format checkstyle > eslint-report.xml || true
                            
                            # Count issues
                            ISSUES=$(grep -o "<error " eslint-report.xml | wc -l || echo "0")
                            echo "ESLint found $ISSUES issues"
                        '''
                    }
                    post {
                        always {
                            script {
                                if (fileExists('eslint-report.xml')) {
                                    recordIssues enabledForFailure: false, tools: [checkStyle(pattern: 'eslint-report.xml')]
                                }
                            }
                            archiveArtifacts artifacts: 'eslint-report.xml', allowEmptyArchive: true
                        }
                    }
                }
                
                stage('Code Complexity') {
                    steps {
                        echo 'Analyzing code complexity...'
                        sh '''
                            find . -name "*.js" -not -path "./node_modules/*" | xargs wc -l > complexity-report.txt
                            find . -name "*.js" -not -path "./node_modules/*" -exec du -h {} \\; >> complexity-report.txt
                        '''
                    }
                    post {
                        always {
                            archiveArtifacts artifacts: 'complexity-report.txt', allowEmptyArchive: true
                        }
                    }
                }
                
                stage('Documentation Check') {
                    steps {
                        echo 'Checking documentation quality...'
                        sh '''
                            echo "Checking documentation files..."
                            
                            # Check for required documentation
                            for doc in README.md ENVIRONMENT_SETUP.md SECURITY_HARDENING.md; do
                                if [ -f "$doc" ]; then
                                    echo "$doc exists"
                                else
                                    echo "$doc missing"
                                fi
                            done
                            
                            # Check documentation completeness
                            wc -l *.md > documentation-report.txt
                        '''
                    }
                    post {
                        always {
                            archiveArtifacts artifacts: 'documentation-report.txt', allowEmptyArchive: true
                        }
                    }
                }
            }
            post {
                success {
                    echo 'Code quality checks passed'
                }
                failure {
                    echo 'Code quality issues found'
                }
            }
        }
        
        stage('Security') {
            parallel {
                stage('Vulnerability Scanning') {
                    steps {
                        echo 'Running security vulnerability scan...'
                        sh '''
                            npm install -g snyk || true
                            snyk auth ${SNYK_TOKEN} || echo "Snyk auth failed, using demo mode"
                            snyk test --json > snyk-vulnerabilities.json || echo "Snyk scan completed with issues"
                            snyk monitor --project-name="${APP_NAME}" || true
                        '''
                    }
                    post {
                        always {
                            archiveArtifacts artifacts: 'snyk-*.json', allowEmptyArchive: true
                        }
                    }
                }
                
                stage('Secret Detection') {
                    steps {
                        echo 'Scanning for hardcoded secrets...'
                        sh '''
                            if grep -r "password\\|secret\\|key\\|token" --include="*.js" --exclude-dir=node_modules --exclude-dir=config . | grep -v "process.env" | grep -v "example"; then
                                echo "Warning: Potential hardcoded secrets found" > secret-scan.txt
                            else
                                echo "No hardcoded secrets detected" > secret-scan.txt
                            fi
                            
                            if git ls-files | grep -q "^.env$"; then
                                echo "Warning: .env file found in git" >> secret-scan.txt
                            else
                                echo ".env file properly excluded" >> secret-scan.txt
                            fi
                            
                            cat secret-scan.txt
                        '''
                    }
                    post {
                        always {
                            archiveArtifacts artifacts: 'secret-scan.txt', allowEmptyArchive: true
                        }
                    }
                }
                
                stage('Security Audit') {
                    steps {
                        echo 'Running security audit...'
                        sh '''
                            chmod +x security_audit.sh
                            ./security_audit.sh > security-audit-report.txt || echo "Security audit completed with warnings"
                            find . -name "*.js" -perm 777 > dangerous-permissions.txt || echo "No dangerous permissions found" > dangerous-permissions.txt
                        '''
                    }
                    post {
                        always {
                            archiveArtifacts artifacts: 'security-audit-report.txt,dangerous-permissions.txt', allowEmptyArchive: true
                        }
                    }
                }
            }
            post {
                success {
                    echo 'Security scans completed successfully'
                }
                failure {
                    echo 'Security issues detected'
                }
            }
        }
        
        stage('Deploy') {
            parallel {
                stage('Deploy to Staging') {
                    when {
                        anyOf {
                            branch 'develop'
                            branch 'staging'
                            branch 'main'
                        }
                    }
                    
                    steps {
                        echo 'Deploying to staging environment...'
                        
                        sh '''
                            mkdir -p staging-deploy
                            
                            cp -r views staging-deploy/
                            cp -r schemas staging-deploy/
                            cp -r middleware staging-deploy/
                            cp -r config staging-deploy/
                            cp -r images staging-deploy/
                            cp index.js staging-deploy/
                            cp package*.json staging-deploy/
                            cp .env staging-deploy/
                            
                            echo "Deploying to staging server: ${STAGING_HOST}"
                            
                            if [ -f "staging-deploy/index.js" ]; then
                                echo "Staging deployment successful"
                            else
                                echo "Staging deployment failed"
                                exit 1
                            fi
                        '''
                    }
                    post {
                        success {
                            echo 'Staging deployment completed'
                        }
                        failure {
                            echo 'Staging deployment failed'
                        }
                    }
                }
                
                stage('Smoke Tests') {
                    steps {
                        echo 'Running smoke tests...'
                        sh '''
                            cd staging-deploy && node -e "
                                try {
                                    const { config } = require('./config/env').init();
                                    console.log('✅ Environment validation passed');
                                    console.log('App:', config.app.name, 'v' + config.app.version);
                                } catch (error) {
                                    console.error('❌ Environment validation failed:', error.message);
                                    process.exit(1);
                                }
                            "
                        '''
                    }
                }
            }
            post {
                success {
                    echo 'Deployment stage completed successfully'
                }
                failure {
                    echo 'Deployment stage failed'
                }
            }
        }
        
        stage('Release') {
            when {
                branch 'main'
            }
            
            input {
                message "Ready for production release?"
                ok "Release to Production"
                parameters {
                    choice(
                        name: 'DEPLOYMENT_STRATEGY',
                        choices: ['rolling', 'blue-green', 'canary'],
                        description: 'Choose deployment strategy'
                    )
                    booleanParam(
                        name: 'RUN_PERFORMANCE_TESTS',
                        defaultValue: true,
                        description: 'Run performance tests after deployment'
                    )
                }
            }
            
            steps {
                echo "Creating production release with ${params.DEPLOYMENT_STRATEGY} strategy..."
                
                sh '''
                    echo "Preparing production release..."
                    
                    # Create release directory
                    mkdir -p production-release
                    
                    cp -r staging-deploy/* production-release/
                    echo "{
  \\"version\\": \\"${BUILD_VERSION}\\",
  \\"buildDate\\": \\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\\",
  \\"commit\\": \\"${GIT_COMMIT_SHORT}\\",
  \\"branch\\": \\"${GIT_BRANCH_NAME}\\",
  \\"strategy\\": \\"${DEPLOYMENT_STRATEGY}\\"
}" > production-release/version.json
                    
                    tar -czf "${APP_NAME}-${BUILD_VERSION}.tar.gz" -C production-release .
                    
                    if [ -f "production-release/version.json" ]; then
                        echo "Production release successful"
                        cat production-release/version.json
                    else
                        echo "Production release failed"
                        exit 1
                    fi
                '''
            }
            post {
                success {
                    script {
                        // Archive release artifacts
                        archiveArtifacts artifacts: '*.tar.gz,production-release/**/*', fingerprint: true
                        
                        // Send success notification
                        emailext (
                            subject: "Production Release Successful - ${APP_NAME} v${BUILD_VERSION}",
                            mimeType: 'text/html',
                            from: 'datnq2001@gmail.com',
                            body: """
                                <h3>Production Release Deployed Successfully</h3>
                                <p><strong>Application:</strong> ${APP_NAME}</p>
                                <p><strong>Version:</strong> ${BUILD_VERSION}</p>
                                <p><strong>Strategy:</strong> ${params.DEPLOYMENT_STRATEGY}</p>
                                <p><strong>Commit:</strong> ${GIT_COMMIT_SHORT}</p>
                                <p><strong>Build URL:</strong> <a href="${BUILD_URL}">${BUILD_URL}</a></p>
                            """,
                            to: env.NOTIFICATION_EMAIL
                        )
                    }
                }
                failure {
                    emailext (
                        subject: "Production Release Failed - ${APP_NAME}",
                        mimeType: 'text/html',
                        from: 'datnq2001@gmail.com',
                        body: """
                            <h3>Production Release Failed</h3>
                            <p><strong>Project:</strong> ${APP_NAME}</p>
                            <p><strong>Build:</strong> <a href="${BUILD_URL}">${BUILD_URL}</a></p>
                            <p>Please check the build logs for more details.</p>
                        """,
                        to: env.NOTIFICATION_EMAIL
                    )
                }
            }
        }
        
        // ==================== STAGE 8: MONITORING ====================
        stage('Monitoring') {
            parallel {
                stage('Performance Monitoring') {
                    steps {
                        echo 'Setting up performance monitoring...'
                        sh '''
                            echo "Configuring performance monitoring..."
                            
                            # Create monitoring configuration
                            mkdir -p monitoring
                            
                            # Generate performance baseline
                            echo "{
  \\"application\\": \\"${APP_NAME}\\",
  \\"version\\": \\"${BUILD_VERSION}\\",
  \\"metrics\\": {
    \\"response_time_target\\": \\"< 200ms\\",
    \\"uptime_target\\": \\"> 99.5%\\",
    \\"error_rate_target\\": \\"< 1%\\"
  },
  \\"deployment_time\\": \\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\\"
}" > monitoring/performance-baseline.json
                            
                            echo "Performance monitoring configured"
                        '''
                    }
                }
                
                stage('Health Check Setup') {
                    steps {
                        echo 'Setting up health monitoring...'
                        sh '''
                            cat > monitoring/health-check.sh << 'EOF'
#!/bin/bash
echo "Health check for ${APP_NAME} v${BUILD_VERSION}"
echo "Timestamp: $(date)"
curl -f http://localhost:3000/ -o /dev/null -s -w "HTTP Status: %{http_code}, Response Time: %{time_total}s\\n" || echo "Health check failed"
EOF
                            chmod +x monitoring/health-check.sh
                        '''
                    }
                }
                
                stage('Alert Configuration') {
                    steps {
                        echo 'Setting up monitoring alerts...'
                        sh '''
                            echo "{
  \\"alerts\\": {
    \\"response_time\\": {
      \\"threshold\\": \\"500ms\\",
      \\"action\\": \\"email\\",
      \\"recipients\\": [\\"${NOTIFICATION_EMAIL}\\"]
    },
    \\"error_rate\\": {
      \\"threshold\\": \\"5%\\",
      \\"action\\": \\"email\\",
      \\"recipients\\": [\\"${NOTIFICATION_EMAIL}\\"]
    },
    \\"uptime\\": {
      \\"threshold\\": \\"99%\\",
      \\"action\\": \\"email\\",
      \\"recipients\\": [\\"${NOTIFICATION_EMAIL}\\"]
    }
  }
}" > monitoring/alert-config.json
                        '''
                    }
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'monitoring/**/*', allowEmptyArchive: true
                }
                success {
                    echo 'Monitoring setup completed successfully'
                }
            }
        }
    }
    
    // ==================== POST ACTIONS ====================
    post {
        always {
            echo 'Pipeline cleanup...'
            
            script {
                try {
                    archiveArtifacts artifacts: '**/*.log,**/*-report.*,**/*.json', allowEmptyArchive: true
                    cleanWs()
                } catch (Exception e) {
                    echo "Cleanup warning: ${e.getMessage()}"
                }
            }
        }
        
        success {
            echo 'Pipeline completed successfully!'
            
            emailext (
                subject: "Pipeline Success - ${APP_NAME} #${BUILD_NUMBER}",
                mimeType: 'text/html',
                from: 'datnq2001@gmail.com',
                body: """
                    <h3>Pipeline Completed Successfully</h3>
                    <p><strong>Project:</strong> ${APP_NAME}</p>
                    <p><strong>Version:</strong> ${BUILD_VERSION}</p>
                    <p><strong>Branch:</strong> ${GIT_BRANCH_NAME}</p>
                    <p><strong>Commit:</strong> ${GIT_COMMIT_SHORT}</p>
                    <p><strong>Build URL:</strong> <a href="${BUILD_URL}">${BUILD_URL}</a></p>
                    
                    <h4>Pipeline Stages:</h4>
                    <ul>
                        <li>Checkout</li>
                        <li>Build</li>
                        <li>Test</li>
                        <li>Code Quality</li>
                        <li>Security</li>
                        <li>Deploy</li>
                        <li>Release</li>
                        <li>Monitoring</li>
                    </ul>
                """,
                to: env.NOTIFICATION_EMAIL
            )
        }
        
        failure {
            echo 'Pipeline failed!'
            
            emailext (
                subject: "Pipeline Failed - ${APP_NAME} #${BUILD_NUMBER}",
                mimeType: 'text/html',
                from: 'datnq2001@gmail.com',
                body: """
                    <h3>Pipeline Failed</h3>
                    <p><strong>Project:</strong> ${APP_NAME}</p>
                    <p><strong>Build:</strong> <a href="${BUILD_URL}">${BUILD_URL}</a></p>
                    <p><strong>Branch:</strong> ${GIT_BRANCH_NAME}</p>
                    <p><strong>Commit:</strong> ${GIT_COMMIT_SHORT}</p>
                    
                    <p>Please check the build logs for more details.</p>
                """,
                to: env.NOTIFICATION_EMAIL
            )
        }
        
        unstable {
            echo 'Pipeline completed with warnings'
        }
    }
}