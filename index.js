// Load and validate environment configuration
const { config } = require('./config/env').init();

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Import validation schemas and middleware
const { surveyFormSchema, surveysQuerySchema } = require('./schemas/validation');
const { validateBody, validateQuery } = require('./middleware/validation');

const app = express();

// Use environment configuration
const port = config.server.port;
const host = config.server.host;

// Trust proxy if running behind a reverse proxy (like nginx, cloudflare, etc.)
app.set('trust proxy', 1);

// Security Headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable if you need to embed external content
}));

// Strict CORS Configuration from environment
app.use(cors({
  origin: config.cors.allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));

// Rate Limiting from environment configuration
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(config.rateLimit.windowMs / 60000) + ' minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for static files
  skip: (req) => req.path.startsWith('/images/')
});

// Apply rate limiting to all routes
app.use(limiter);

// Stricter rate limiting for form submissions
const submitLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.submitMaxRequests,
  message: {
    error: 'Too many form submissions from this IP, please try again later.',
    retryAfter: Math.ceil(config.rateLimit.windowMs / 60000) + ' minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Body parsing middleware with size limits for security
app.use(bodyParser.urlencoded({ 
  extended: true,
  limit: '10mb',
  parameterLimit: 1000
}));

// JSON parsing middleware for API endpoints
app.use(express.json({
  limit: '10mb',
  strict: true
}));

// Template engine configuration
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files with security headers
app.use('/images', express.static(path.join(__dirname, 'images'), {
  maxAge: '1d',
  etag: false,
  setHeaders: (res, path) => {
    res.set('X-Content-Type-Options', 'nosniff');
  }
}));

// Disable x-powered-by header for additional security
app.disable('x-powered-by');

// Import API routes
const surveyApiRoutes = require('./routes/surveyRoutes');

// Connect to SQLite3 database using environment configuration
const dbPath = path.isAbsolute(config.database.path) 
  ? config.database.path 
  : path.join(__dirname, config.database.path);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Failed to connect to database:', err.message);
    process.exit(1);
  } else {
    console.log(`✅ Connected to SQLite database: ${dbPath}`);
  }
});

// Mount API routes
app.use('/api/surveys', surveyApiRoutes);

// GET route to render survey form
app.get('/', (req, res) => {
  // Check maintenance mode
  if (config.features.maintenanceMode) {
    return res.status(503).render('error', {
      title: 'Maintenance Mode',
      message: 'The application is currently under maintenance. Please try again later.',
      error: { status: 503 }
    });
  }
  
  res.render('index', {
    title: config.app.name,
    description: config.app.description,
    version: config.app.version,
    enableAnalytics: config.features.enableAnalytics,
    analyticsId: config.analytics.googleAnalyticsId
  });
});

// POST route to handle survey submission with stricter rate limiting and Zod validation
app.post('/submitsurvey', submitLimiter, validateBody(surveyFormSchema), (req, res) => {
  // At this point, all data has been validated by Zod middleware
  const {
    firstname, surname, email,
    q1radio, q2radio, q3radio,
    butterflyColour, comments
  } = req.body;

  const now = new Date().toISOString();

  const insertSQL = `
    INSERT INTO survey (fname, sname, email, date, q1, q2, q3, colour, comment)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    firstname.trim(),
    surname.trim(),
    email.trim(),
    now,
    parseInt(q1radio),
    parseInt(q2radio),
    parseInt(q3radio),
    butterflyColour,
    comments.trim()
  ];

  db.run(insertSQL, params, function(err) {
    if (err) {
      console.error('Database insertion error:', err.message);
      return res.status(500).render('error', {
        title: 'Database Error',
        message: 'Failed to store survey response.',
        error: err
      });
    }

    const selectSQL = `SELECT q1, q2, q3 FROM survey`;
    db.all(selectSQL, [], (err, rows) => {
      if (err) {
        console.error('Database read error:', err.message);
        return res.status(500).render('error', {
          title: 'Database Error',
          message: 'Failed to retrieve survey data.',
          error: err
        });
      }

      const surveyCount = rows.length;
      const totalQ1 = rows.reduce((sum, row) => sum + row.q1, 0);
      const totalQ2 = rows.reduce((sum, row) => sum + row.q2, 0);
      const totalQ3 = rows.reduce((sum, row) => sum + row.q3, 0);
      const avgQ1 = (totalQ1 / surveyCount).toFixed(2);
      const avgQ2 = (totalQ2 / surveyCount).toFixed(2);
      const avgQ3 = (totalQ3 / surveyCount).toFixed(2);
      const avgTotal = ((+avgQ1 + +avgQ2 + +avgQ3) / 3).toFixed(2);

      res.render('results', {
        title: 'Survey Submitted',
        firstname,
        surname,
        email,
        butterflyColour,
        comments,
        q1radio,
        q2radio,
        q3radio,
        surveyCount,
        avgQ1,
        avgQ2,
        avgQ3,
        avgTotal,
        isError: false,
        errors: []
      });
    });
  });
});

// GET route to list all surveys with manual validation and fallbacks
app.get('/surveys', (req, res) => {
  // Manual validation with safe defaults
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 20;
  let sortBy = req.query.sortBy || 'date';
  let order = req.query.order || 'desc';
  
  // Ensure values are within safe bounds
  page = Math.max(1, page);
  limit = Math.min(100, Math.max(1, limit));
  
  // Validate sortBy and order for safety
  const validSortFields = ['date', 'firstname', 'surname', 'email'];
  sortBy = validSortFields.includes(sortBy) ? sortBy : 'date';
  order = ['asc', 'desc'].includes(order) ? order : 'desc';
  
  // Calculate offset for pagination
  const offset = (page - 1) * limit;
  
  // Build SQL query with pagination and sorting
  const selectSQL = `SELECT * FROM survey ORDER BY ${sortBy} ${order.toUpperCase()} LIMIT ? OFFSET ?`;
  const countSQL = `SELECT COUNT(*) as total FROM survey`;
  
  // Get total count for pagination info
  db.get(countSQL, [], (err, countResult) => {
    if (err) {
      console.error('Error counting surveys:', err.message);
      return res.status(500).render('error', {
        title: 'Database Error',
        message: 'Failed to retrieve survey count.',
        error: err
      });
    }
    
    const totalSurveys = countResult.total;
    const totalPages = Math.ceil(totalSurveys / limit);
    
    // Get surveys for current page
    db.all(selectSQL, [limit, offset], (err, rows) => {
      if (err) {
        console.error('Error retrieving surveys:', err.message);
        return res.status(500).render('error', {
          title: 'Database Error',
          message: 'Failed to retrieve surveys.',
          error: err
        });
      }
      
      res.render('surveys', {
        title: 'Survey List',
        surveys: rows,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalSurveys: totalSurveys,
          hasNext: page < totalPages,
          hasPrev: page > 1,
          limit: limit
        },
        sort: {
          sortBy: sortBy,
          order: order
        }
      });
    });
  });
});

// Route: 404 handler – Page not found
app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Page Not Found',
    message: 'Oops! Page not found.',
    url: req.originalUrl
  });
});

// Middleware: General error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).render('error', {
    title: 'Server Error',
    message: 'Something went wrong on the server.',
    error: err
  });
});

// Start server with environment configuration
app.listen(port, host, () => {
  console.log(`🚀 ${config.app.name} v${config.app.version}`);
  console.log(`🌐 Server running at http://${host}:${port}`);
  console.log(`📁 Environment: ${config.nodeEnv}`);
  console.log(`📊 Analytics: ${config.features.enableAnalytics ? 'Enabled' : 'Disabled'}`);
  console.log(`🔧 Maintenance Mode: ${config.features.maintenanceMode ? 'ON' : 'OFF'}`);
});
