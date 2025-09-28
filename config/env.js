require('dotenv').config();

/**
 * Environment Configuration Module
 * Validates and provides type-safe access to environment variables
 */

class ConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConfigError';
  }
}

/**
 * Get environment variable with validation
 * @param {string} key - Environment variable name
 * @param {*} defaultValue - Default value if not set
 * @param {boolean} required - Whether the variable is required
 * @param {string} type - Expected type ('string', 'number', 'boolean')
 * @returns {*} Parsed environment variable value
 */
function getEnvVar(key, defaultValue = null, required = false, type = 'string') {
  const value = process.env[key];
  
  if (!value && required) {
    throw new ConfigError(`Required environment variable ${key} is not set`);
  }
  
  const finalValue = value || defaultValue;
  
  if (finalValue === null && required) {
    throw new ConfigError(`Required environment variable ${key} has no value`);
  }
  
  // Type conversion
  switch (type) {
    case 'number':
      const num = parseInt(finalValue, 10);
      if (isNaN(num)) {
        throw new ConfigError(`Environment variable ${key} must be a valid number, got: ${finalValue}`);
      }
      return num;
      
    case 'boolean':
      return finalValue === 'true' || finalValue === '1' || finalValue === 'yes';
      
    case 'array':
      return finalValue ? finalValue.split(',').map(s => s.trim()) : [];
      
    default:
      return finalValue;
  }
}

/**
 * Application Configuration Object
 */
const config = {
  // Environment
  nodeEnv: getEnvVar('NODE_ENV', 'development'),
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // Server Configuration
  server: {
    port: getEnvVar('PORT', 3000, false, 'number'),
    host: getEnvVar('HOST', 'localhost'),
  },
  
  // Database Configuration
  database: {
    path: getEnvVar('DB_PATH', './mySurveyDB.db'),
    type: getEnvVar('DB_TYPE', 'sqlite3'),
  },
  
  // Security Configuration
  security: {
    jwtSecret: getEnvVar('JWT_SECRET', 'fallback-jwt-secret-change-in-production'),
    sessionSecret: getEnvVar('SESSION_SECRET', 'fallback-session-secret-change-in-production'),
    encryptionKey: getEnvVar('ENCRYPTION_KEY', 'fallback-32-character-key-here!!'),
  },
  
  // Rate Limiting Configuration
  rateLimit: {
    windowMs: getEnvVar('RATE_LIMIT_WINDOW_MS', 900000, false, 'number'), // 15 minutes
    maxRequests: getEnvVar('RATE_LIMIT_MAX_REQUESTS', 100, false, 'number'),
    submitMaxRequests: getEnvVar('SUBMIT_RATE_LIMIT_MAX', 5, false, 'number'),
  },
  
  // CORS Configuration
  cors: {
    allowedOrigins: getEnvVar('ALLOWED_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000', false, 'array'),
  },
  
  // Security Scanning
  security_scanning: {
    snykToken: getEnvVar('SNYK_TOKEN', null, false),
  },
  
  // Application Metadata
  app: {
    name: getEnvVar('APP_NAME', 'dKin Butterfly Club'),
    version: getEnvVar('APP_VERSION', '1.0.0'),
    description: getEnvVar('APP_DESCRIPTION', 'Informative web page on Butterflies from around the world'),
  },
  
  // Logging Configuration
  logging: {
    level: getEnvVar('LOG_LEVEL', 'info'),
    file: getEnvVar('LOG_FILE', './logs/app.log'),
  },
  
  // Email Configuration
  email: {
    host: getEnvVar('SMTP_HOST', null, false),
    port: getEnvVar('SMTP_PORT', 587, false, 'number'),
    user: getEnvVar('SMTP_USER', null, false),
    password: getEnvVar('SMTP_PASS', null, false),
  },
  
  // Analytics Configuration
  analytics: {
    googleAnalyticsId: getEnvVar('GOOGLE_ANALYTICS_ID', null, false),
  },
  
  // Feature Flags
  features: {
    enableAnalytics: getEnvVar('ENABLE_ANALYTICS', false, false, 'boolean'),
    enableEmailNotifications: getEnvVar('ENABLE_EMAIL_NOTIFICATIONS', false, false, 'boolean'),
    maintenanceMode: getEnvVar('MAINTENANCE_MODE', false, false, 'boolean'),
  },
};

/**
 * Validate critical configuration
 */
function validateConfig() {
  const errors = [];
  
  // Validate required configurations based on environment
  if (config.isProduction) {
    if (config.security.jwtSecret.includes('fallback') || config.security.jwtSecret.includes('change')) {
      errors.push('JWT_SECRET must be changed in production environment');
    }
    
    if (config.security.sessionSecret.includes('fallback') || config.security.sessionSecret.includes('change')) {
      errors.push('SESSION_SECRET must be changed in production environment');
    }
    
    if (config.security.encryptionKey.includes('fallback') || config.security.encryptionKey.includes('change')) {
      errors.push('ENCRYPTION_KEY must be changed in production environment');
    }
  }
  
  // Validate port range
  if (config.server.port < 1 || config.server.port > 65535) {
    errors.push(`Invalid port number: ${config.server.port}. Must be between 1-65535`);
  }
  
  // Validate rate limiting values
  if (config.rateLimit.maxRequests < 1) {
    errors.push('RATE_LIMIT_MAX_REQUESTS must be greater than 0');
  }
  
  if (errors.length > 0) {
    throw new ConfigError(`Configuration validation failed:\n${errors.join('\n')}`);
  }
}

/**
 * Initialize configuration with validation
 */
function init() {
  try {
    validateConfig();
    console.log(`Configuration loaded successfully for ${config.nodeEnv} environment`);
    
    if (config.isDevelopment) {
      console.log(`Server will run on: http://${config.server.host}:${config.server.port}`);
      console.log(`📁 Database path: ${config.database.path}`);
    }
    
    return { config };
  } catch (error) {
    console.error('Configuration Error:', error.message);
    process.exit(1);
  }
}

module.exports = {
  config,
  init,
  ConfigError,
  getEnvVar,
};