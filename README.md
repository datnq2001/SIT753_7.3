# dKin Butterfly Club 🦋

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-blue.svg)](https://expressjs.com/)
[![SQLite3](https://img.shields.io/badge/SQLite3-5.x-orange.svg)](https://www.sqlite.org/)
[![Security](https://img.shields.io/badge/Security-Hardened-red.svg)](./SECURITY_HARDENING.md)
[![CI/CD](https://img.shields.io/badge/CI/CD-Jenkins-blueviolet.svg)](./Jenkinsfile)

An **enterprise-grade web application** for butterfly enthusiasts featuring comprehensive survey collection, advanced security measures, and professional deployment pipeline.

## 🌟 Features

### 🚀 **Core Functionality**
- **Interactive Survey Form**: Collect user feedback about butterfly preferences
- **Data Visualization**: View survey statistics and results in real-time  
- **Survey Management**: List, filter, and paginate through all survey responses
- **Responsive Design**: Mobile-friendly interface with Bootstrap CSS

### 🛡️ **Security & Validation**
- **Zod Schema Validation**: Type-safe validation for all user inputs
- **Rate Limiting**: IP-based protection against spam and abuse
- **CSRF Protection**: Secure form submissions with Helmet.js
- **Input Sanitization**: SQL injection and XSS prevention
- **Email Validation**: Deakin University domain verification

### 🏗️ **DevOps & Deployment**
- **Environment Management**: dotenv configuration with validation
- **Jenkins CI/CD**: Automated pipeline with security scanning
- **Zero-Downtime Deployment**: Rolling updates with health checks
- **Security Scanning**: Integrated Snyk vulnerability detection
- **Credential Management**: Secure secrets injection via Jenkins

## 📁 Project Structure

```
10.1P/
├── 📋 Application Core
│   ├── index.js                    # Main Express server
│   ├── createDB.js                 # Database initialization
│   └── package.json                # Dependencies and scripts
│
├── ⚙️ Configuration
│   ├── config/env.js               # Environment configuration module
│   ├── .env.example               # Environment template
│   └── .gitignore                 # Git ignore rules
│
├── 🔒 Validation & Security
│   ├── schemas/validation.js       # Zod validation schemas
│   ├── middleware/validation.js    # Validation middleware
│   └── security_audit.sh          # Security audit script
│
├── 🎨 Frontend
│   └── views/                      # EJS templates
│       ├── index.ejs              # Survey form
│       ├── results.ejs            # Results display
│       ├── surveys.ejs            # Survey list
│       └── error.ejs              # Error handling
│
├── 🚀 DevOps
│   ├── Jenkinsfile                # CI/CD pipeline
│   └── setup_jenkins.sh           # Jenkins setup guide
│
└── 📚 Documentation
    ├── VALIDATION_IMPLEMENTATION.md
    ├── ENVIRONMENT_SETUP.md
    ├── SECURITY_HARDENING.md
    └── SQLITE_FIX.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/datnq2001/SIT753_7.3.git
   cd SIT753_7.3
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Initialize database:**
   ```bash
   node createDB.js
   ```

5. **Start the application:**
   ```bash
   npm start
   # or
   node index.js
   ```

6. **Open in browser:**
   ```
   http://localhost:3000
   ```

## 🔧 Configuration

### Environment Variables

The application uses comprehensive environment configuration:

```bash
# Application Settings
NODE_ENV=development
PORT=3000
APP_NAME=dKin Butterfly Club

# Database
DB_PATH=./mySurveyDB.db

# Security (CHANGE IN PRODUCTION!)
JWT_SECRET=your-jwt-secret-here
SESSION_SECRET=your-session-secret-here
ENCRYPTION_KEY=your-32-character-key-here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
SUBMIT_RATE_LIMIT_MAX=5

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Feature Flags
ENABLE_ANALYTICS=false
MAINTENANCE_MODE=false
```

See [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) for complete configuration guide.

## 🛡️ Security Features

### ✅ **Implemented Security Measures:**

- **Input Validation**: Zod schema validation for all user inputs
- **Rate Limiting**: Protection against brute force and spam attacks
- **CORS**: Configured Cross-Origin Resource Sharing
- **Helmet.js**: Security headers and CSP implementation  
- **SQL Injection Prevention**: Parameterized queries with SQLite3
- **XSS Protection**: Input sanitization and output encoding
- **Environment Security**: Secrets management with dotenv
- **Dependency Scanning**: Automated vulnerability detection with Snyk

### 🔒 **Security Audit:**

Run the security audit script:
```bash
./security_audit.sh
```

See [SECURITY_HARDENING.md](./SECURITY_HARDENING.md) for detailed security implementation.

## 🧪 Testing

### Run Validation Tests:
```bash
node demo_validation.js        # Test Zod validation schemas
node test_validation.js        # Integration tests for validation
```

### Security Testing:
```bash
./test_rate_limit.sh          # Test rate limiting functionality
./security_audit.sh           # Comprehensive security audit
```

## 🚀 CI/CD Pipeline

### Jenkins Integration

The project includes a complete Jenkins pipeline with:

- ✅ **Automated Testing**: ESLint, unit tests, integration tests
- ✅ **Security Scanning**: Snyk vulnerability detection  
- ✅ **Environment Management**: Credential injection from Jenkins
- ✅ **Multi-Environment Deployment**: Development → Staging → Production
- ✅ **Zero-Downtime Deployment**: Rolling updates with health checks
- ✅ **Monitoring & Alerts**: Email notifications and build status

### Setup Jenkins Pipeline:

1. **Run setup script:**
   ```bash
   ./setup_jenkins.sh
   ```

2. **Configure Jenkins credentials** (see [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md))

3. **Create pipeline job** pointing to this repository's `Jenkinsfile`

## 📊 API Endpoints

### Survey Management:
- `GET /` - Survey form page
- `POST /submitsurvey` - Submit survey (with validation + rate limiting)  
- `GET /surveys` - List all surveys (with pagination)

### Query Parameters for `/surveys`:
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 20, max: 100)
- `sortBy` - Sort field: `date`, `firstname`, `surname`, `email`
- `order` - Sort order: `asc`, `desc`

### Example:
```bash
GET /surveys?page=2&limit=10&sortBy=date&order=desc
```

## 🏗️ Technical Stack

### **Backend:**
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite3** - Database with prepared statements
- **Zod** - Schema validation and type safety

### **Security:**
- **Helmet.js** - Security headers
- **CORS** - Cross-origin configuration  
- **express-rate-limit** - Rate limiting
- **dotenv** - Environment management

### **Frontend:**
- **EJS** - Templating engine
- **Bootstrap 5** - CSS framework
- **Responsive Design** - Mobile-friendly UI

### **DevOps:**
- **Jenkins** - CI/CD pipeline
- **Snyk** - Security vulnerability scanning
- **Git** - Version control with comprehensive .gitignore

## 📈 Performance & Monitoring

### **Optimization Features:**
- Connection pooling for database
- Static file caching with proper headers
- Gzip compression for responses
- Rate limiting to prevent abuse
- Database query optimization

### **Monitoring:**
- Health check endpoints
- Error logging and tracking
- Performance metrics collection
- Security audit trails

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`  
7. Open Pull Request

### Development Guidelines:
- Follow existing code style
- Add tests for new features
- Update documentation as needed
- Ensure security best practices

## 📄 License

This project is licensed under the ISC License - see the [package.json](package.json) file for details.

## 👥 Team

**Developer:** Quang Dat Nguyen  
**Course:** SIT774 - Application Development and Deployment  
**University:** Deakin University

## 🆘 Support

- 📚 **Documentation**: Check the `/docs` folder for detailed guides
- 🐛 **Issues**: Report bugs via GitHub Issues  
- 💬 **Discussions**: Use GitHub Discussions for questions
- 📧 **Contact**: [Your contact information]

## ✨ Acknowledgments

- Deakin University SIT774 course materials
- Express.js and Node.js communities
- Security best practices from OWASP
- Bootstrap team for responsive design components

---

**Built with ❤️ for butterfly enthusiasts worldwide** 🦋