const { z } = require('zod');

/**
 * Generic validation middleware creator
 * @param {z.ZodSchema} schema - The Zod schema to validate against
 * @param {string} source - The source to validate ('body', 'query', 'params')
 * @param {function} errorHandler - Optional custom error handler
 * @returns {function} Express middleware function
 */
function validate(schema, source = 'body', errorHandler = null) {
  return (req, res, next) => {
    try {
      let dataToValidate;
      
      // Get data from the specified source
      switch (source) {
        case 'body':
          dataToValidate = req.body;
          break;
        case 'query':
          dataToValidate = req.query;
          break;
        case 'params':
          dataToValidate = req.params;
          break;
        default:
          throw new Error(`Invalid validation source: ${source}`);
      }

      // Parse and validate data
      const result = schema.safeParse(dataToValidate);
      
      if (!result.success) {
        // Format validation errors
        const errors = formatValidationErrors(result.error, source);
        
        if (errorHandler && typeof errorHandler === 'function') {
          return errorHandler(req, res, errors);
        }
        
        // Default error handling for survey form (compatible with existing template)
        if (source === 'body' && req.route && req.route.path === '/submitsurvey') {
          return res.render('results', {
            title: 'Incorrect Input',
            errors,
            isError: true
          });
        }
        
        // Default JSON error response for other cases
        return res.status(400).json({
          error: 'Validation failed',
          details: errors
        });
      }
      
      // Attach validated and transformed data to request
      req.validatedData = result.data;
      
      // For backward compatibility, also update the original source
      if (source === 'body') {
        req.body = { ...req.body, ...result.data };
      } else if (source === 'query') {
        req.query = { ...req.query, ...result.data };
      } else if (source === 'params') {
        req.params = { ...req.params, ...result.data };
      }
      
      next();
    } catch (error) {
      console.error('Validation middleware error:', error);
      return res.status(500).json({
        error: 'Internal validation error',
        message: error.message
      });
    }
  };
}

/**
 * Format Zod validation errors to match existing error format
 * @param {z.ZodError} zodError - The Zod error object
 * @param {string} source - The source being validated
 * @returns {string[]} Array of formatted error messages
 */
function formatValidationErrors(zodError, source) {
  const errors = [];
  
  for (const issue of zodError.issues) {
    const fieldPath = issue.path.join('.');
    const fieldName = getFieldDisplayName(fieldPath);
    const message = issue.message;
    
    // Format error message to match existing style
    let formattedError;
    
    switch (fieldPath) {
      case 'firstname':
        formattedError = `Error in field 'FIRSTNAME': <em>${message}</em>`;
        break;
      case 'surname':
        formattedError = `Error in field 'SURNAME': <em>${message}</em>`;
        break;
      case 'email':
        formattedError = `Error in field 'EMAIL': <em>${message}</em>`;
        break;
      case 'q1radio':
        formattedError = `Error in field 'SURVEY QUESTION #1': <em>${message}</em>`;
        break;
      case 'q2radio':
        formattedError = `Error in field 'SURVEY QUESTION #2': <em>${message}</em>`;
        break;
      case 'q3radio':
        formattedError = `Error in field 'SURVEY QUESTION #3': <em>${message}</em>`;
        break;
      case 'comments':
        formattedError = `Error in field 'COMMENT': <em>${message}</em>`;
        break;
      case 'butterflyColour':
        formattedError = `Error in field 'BUTTERFLY COLOUR': <em>${message}</em>`;
        break;
      default:
        formattedError = `Error in field '${fieldName.toUpperCase()}': <em>${message}</em>`;
    }
    
    errors.push(formattedError);
  }
  
  return errors;
}

/**
 * Get display name for a field
 * @param {string} fieldPath - The field path from Zod error
 * @returns {string} Human-readable field name
 */
function getFieldDisplayName(fieldPath) {
  const displayNames = {
    'firstname': 'First Name',
    'surname': 'Surname',
    'email': 'Email',
    'q1radio': 'Survey Question #1',
    'q2radio': 'Survey Question #2',
    'q3radio': 'Survey Question #3',
    'comments': 'Comments',
    'butterflyColour': 'Butterfly Colour',
    'page': 'Page',
    'limit': 'Limit',
    'sortBy': 'Sort By',
    'order': 'Order'
  };
  
  return displayNames[fieldPath] || fieldPath;
}

/**
 * Specific middleware functions for different validation scenarios
 */
const validationMiddleware = {
  // Validate request body
  validateBody: (schema, errorHandler) => validate(schema, 'body', errorHandler),
  
  // Validate query parameters
  validateQuery: (schema, errorHandler) => validate(schema, 'query', errorHandler),
  
  // Validate URL parameters
  validateParams: (schema, errorHandler) => validate(schema, 'params', errorHandler),
  
  // Combined validation for multiple sources
  validateMultiple: (schemas, errorHandler) => {
    return (req, res, next) => {
      const validatedData = {};
      
      for (const [source, schema] of Object.entries(schemas)) {
        if (!['body', 'query', 'params'].includes(source)) {
          return res.status(500).json({
            error: 'Invalid validation source in validateMultiple'
          });
        }
        
        const dataToValidate = req[source];
        const result = schema.safeParse(dataToValidate);
        
        if (!result.success) {
          const errors = formatValidationErrors(result.error, source);
          
          if (errorHandler && typeof errorHandler === 'function') {
            return errorHandler(req, res, errors);
          }
          
          return res.status(400).json({
            error: `Validation failed for ${source}`,
            details: errors
          });
        }
        
        validatedData[source] = result.data;
        req[source] = { ...req[source], ...result.data };
      }
      
      req.validatedData = validatedData;
      next();
    };
  }
};

module.exports = {
  validate,
  formatValidationErrors,
  getFieldDisplayName,
  ...validationMiddleware
};