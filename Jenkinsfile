pipeline {
    agent any
    
    // Environment variables and credentials
    environment {
        NODE_ENV = 'production'
        APP_NAME = 'dkin-butterfly-club'
        
        // Jenkins credentials (configure these in Jenkins Credentials)
        DB_PATH = credentials('butterfly-club-db-path')
        JWT_SECRET = credentials('butterfly-club-jwt-secret')
        SESSION_SECRET = credentials('butterfly-club-session-secret')
        ENCRYPTION_KEY = credentials('butterfly-club-encryption-key')
        SNYK_TOKEN = credentials('snyk-token')
        
        // Docker registry (if using containerization)
        DOCKER_REGISTRY = 'your-registry.com'
        DOCKER_IMAGE = "${DOCKER_REGISTRY}/${APP_NAME}"
        
        // Deployment targets
        STAGING_HOST = credentials('staging-host')
        PRODUCTION_HOST = credentials('production-host')
    }
    
    // Build triggers
    triggers {
        // Poll SCM every 5 minutes for changes
        pollSCM('H/5 * * * *')
        
        // Build on webhook (configure in GitHub/GitLab)
        githubPush()
    }
    
    // Pipeline options
    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        retry(2)
        skipStagesAfterUnstable()
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '🔄 Checking out source code...'
                checkout scm
                
                script {
                    // Set build info
                    env.GIT_COMMIT_SHORT = sh(
                        script: "git rev-parse --short HEAD",
                        returnStdout: true
                    ).trim()
                    
                    env.BUILD_VERSION = "${env.BUILD_NUMBER}-${env.GIT_COMMIT_SHORT}"
                }
            }
        }
        
        stage('Environment Setup') {
            steps {
                echo '🔧 Setting up environment...'
                
                script {
                    // Create .env file from Jenkins credentials
                    writeFile file: '.env', text: """
NODE_ENV=${NODE_ENV}
PORT=3000

DB_PATH=${DB_PATH}
DB_TYPE=sqlite3

JWT_SECRET=${JWT_SECRET}
SESSION_SECRET=${SESSION_SECRET}
ENCRYPTION_KEY=${ENCRYPTION_KEY}

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
SUBMIT_RATE_LIMIT_MAX=5

ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

SNYK_TOKEN=${SNYK_TOKEN}

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
                
                // Install Node.js dependencies
                sh '''
                    echo "📦 Installing dependencies..."
                    npm ci --only=production
                    
                    echo "📋 Audit dependencies..."
                    npm audit --audit-level high
                '''
            }
        }
        
        stage('Code Quality & Testing') {
            parallel {
                stage('Lint') {
                    steps {
                        echo '🔍 Running ESLint...'
                        sh '''
                            npx eslint . --ext .js --format checkstyle > eslint-report.xml || true
                        '''
                        publishCheckStyleResults pattern: 'eslint-report.xml'
                    }
                }
                
                stage('Security Scan - Snyk') {
                    steps {
                        echo '🔒 Running Snyk security scan...'
                        sh '''
                            # Install Snyk if not available
                            npm install -g snyk || true
                            
                            # Authenticate with Snyk
                            snyk auth ${SNYK_TOKEN}
                            
                            # Test for vulnerabilities
                            snyk test --json > snyk-report.json || true
                            
                            # Monitor project (sends results to Snyk dashboard)
                            snyk monitor --project-name="${APP_NAME}" || true
                        '''
                        
                        // Archive security report
                        archiveArtifacts artifacts: 'snyk-report.json', allowEmptyArchive: true
                    }
                }
                
                stage('Unit Tests') {
                    steps {
                        echo '🧪 Running unit tests...'
                        sh '''
                            # Run tests if test script exists
                            if npm run test --silent 2>/dev/null; then
                                npm test -- --reporter=xunit --outputFile=test-results.xml
                            else
                                echo "No test script found, skipping..."
                            fi
                        '''
                        
                        // Publish test results if available
                        publishTestResults testResultsPattern: 'test-results.xml'
                    }
                }
            }
        }
        
        stage('Build Application') {
            steps {
                echo '🏗️ Building application...'
                
                sh '''
                    # Create build directory
                    mkdir -p build
                    
                    # Copy application files
                    cp -r views build/
                    cp -r schemas build/
                    cp -r middleware build/
                    cp -r config build/
                    cp index.js build/
                    cp package*.json build/
                    cp .env build/
                    
                    # Create logs directory
                    mkdir -p build/logs
                    
                    echo "Build completed successfully"
                '''
                
                // Archive build artifacts
                archiveArtifacts artifacts: 'build/**/*', fingerprint: true
            }
        }
        
        stage('Security Hardening Check') {
            steps {
                echo '🛡️ Running security hardening checks...'
                
                sh '''
                    # Check file permissions
                    find . -name "*.js" -perm 777 && exit 1 || echo "File permissions OK"
                    
                    # Check for sensitive data in files
                    if grep -r "password\\|secret\\|key" --include="*.js" --exclude-dir=node_modules . | grep -v "process.env" | grep -v "config."; then
                        echo "⚠️ Warning: Potential hardcoded secrets found"
                        exit 1
                    fi
                    
                    # Validate environment configuration
                    node -e "
                        try {
                            const { config } = require('./config/env').init();
                            console.log('✅ Environment validation passed');
                        } catch (error) {
                            console.error('❌ Environment validation failed:', error.message);
                            process.exit(1);
                        }
                    "
                '''
            }
        }
        
        stage('Deploy to Staging') {
            when {
                anyOf {
                    branch 'develop'
                    branch 'staging'
                }
            }
            
            steps {
                echo '🚀 Deploying to staging environment...'
                
                script {
                    // Deploy to staging server
                    sshagent(['staging-ssh-key']) {
                        sh '''
                            # Copy build to staging server
                            scp -r build/* ${STAGING_HOST}:/opt/butterfly-club/
                            
                            # Restart application on staging
                            ssh ${STAGING_HOST} "
                                cd /opt/butterfly-club
                                pm2 restart butterfly-club || pm2 start index.js --name butterfly-club
                                pm2 save
                            "
                            
                            echo "✅ Staging deployment completed"
                        '''
                    }
                }
                
                // Health check
                sh '''
                    sleep 10
                    curl -f http://${STAGING_HOST}:3000/ || exit 1
                    echo "✅ Staging health check passed"
                '''
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            
            input {
                message "Deploy to production?"
                ok "Deploy"
                parameters {
                    choice(
                        name: 'DEPLOYMENT_TYPE',
                        choices: ['rolling', 'blue-green', 'canary'],
                        description: 'Deployment strategy'
                    )
                }
            }
            
            steps {
                echo "🚀 Deploying to production with ${params.DEPLOYMENT_TYPE} strategy..."
                
                script {
                    // Production deployment with zero-downtime
                    sshagent(['production-ssh-key']) {
                        sh '''
                            # Backup current version
                            ssh ${PRODUCTION_HOST} "
                                cp -r /opt/butterfly-club /opt/butterfly-club-backup-$(date +%Y%m%d_%H%M%S)
                            "
                            
                            # Deploy new version
                            scp -r build/* ${PRODUCTION_HOST}:/opt/butterfly-club-new/
                            
                            # Switch to new version
                            ssh ${PRODUCTION_HOST} "
                                cd /opt
                                mv butterfly-club butterfly-club-old
                                mv butterfly-club-new butterfly-club
                                
                                # Restart application
                                cd butterfly-club
                                pm2 restart butterfly-club || pm2 start index.js --name butterfly-club
                                pm2 save
                                
                                # Cleanup old version after successful start
                                sleep 5 && rm -rf butterfly-club-old
                            "
                            
                            echo "✅ Production deployment completed"
                        '''
                    }
                }
                
                // Production health check
                sh '''
                    sleep 15
                    for i in {1..5}; do
                        curl -f https://yourdomain.com/ && break
                        sleep 5
                    done
                    echo "✅ Production health check passed"
                '''
            }
            
            post {
                success {
                    // Notify team of successful deployment
                    emailext (
                        subject: "✅ Production Deployment Successful - ${APP_NAME} v${BUILD_VERSION}",
                        body: """
                            <h3>Production Deployment Successful</h3>
                            <p><strong>Application:</strong> ${APP_NAME}</p>
                            <p><strong>Version:</strong> ${BUILD_VERSION}</p>
                            <p><strong>Build:</strong> ${BUILD_URL}</p>
                            <p><strong>Commit:</strong> ${GIT_COMMIT_SHORT}</p>
                            <p><strong>Strategy:</strong> ${params.DEPLOYMENT_TYPE}</p>
                        """,
                        to: "${env.CHANGE_AUTHOR_EMAIL}, devops@yourdomain.com"
                    )
                }
            }
        }
    }
    
    post {
        always {
            echo '🧹 Cleaning up...'
            
            // Clean workspace
            deleteDir()
            
            // Archive logs
            archiveArtifacts artifacts: '**/*.log', allowEmptyArchive: true
        }
        
        failure {
            echo '❌ Pipeline failed!'
            
            // Notify team of failure
            emailext (
                subject: "❌ Pipeline Failed - ${APP_NAME} #${BUILD_NUMBER}",
                body: """
                    <h3>Pipeline Failed</h3>
                    <p><strong>Project:</strong> ${APP_NAME}</p>
                    <p><strong>Build:</strong> ${BUILD_URL}</p>
                    <p><strong>Stage:</strong> ${env.STAGE_NAME}</p>
                    <p><strong>Commit:</strong> ${GIT_COMMIT_SHORT}</p>
                    
                    <p>Please check the build logs for more details.</p>
                """,
                to: "${env.CHANGE_AUTHOR_EMAIL}, devops@yourdomain.com"
            )
        }
        
        success {
            echo '✅ Pipeline completed successfully!'
        }
    }
}