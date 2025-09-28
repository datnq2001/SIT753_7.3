const express = require('express');
const router = express.Router();
const surveyService = require('../services/surveyService');
const { 
  apiSurveyCreateSchema, 
  apiSurveyUpdateSchema, 
  apiQuerySchema, 
  surveyIdParamSchema 
} = require('../schemas/validation');

// Validation middleware
const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.body);
      req.validatedBody = validatedData;
      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors?.map(err => ({
          field: err.path.join('.'),
          message: err.message
        })) || [{ message: error.message }]
      });
    }
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      const validatedQuery = schema.parse(req.query);
      req.validatedQuery = validatedQuery;
      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: error.errors?.map(err => ({
          field: err.path.join('.'),
          message: err.message
        })) || [{ message: error.message }]
      });
    }
  };
};

const validateParams = (schema) => {
  return (req, res, next) => {
    try {
      const validatedParams = schema.parse(req.params);
      req.validatedParams = validatedParams;
      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid parameters',
        details: error.errors?.map(err => ({
          field: err.path.join('.'),
          message: err.message
        })) || [{ message: error.message }]
      });
    }
  };
};

// Error handling wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// GET /api/surveys - Get all surveys with pagination and filtering
router.get('/', validateQuery(apiQuerySchema), asyncHandler(async (req, res) => {
  const { page, limit, sortBy, order } = req.validatedQuery;
  
  try {
    const result = await surveyService.getSurveysWithPagination({ page, limit, sortBy, order });
    
    res.json({
      success: true,
      data: result.surveys,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(result.total / limit),
        totalRecords: result.total,
        pageSize: limit,
        hasNextPage: page < Math.ceil(result.total / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching surveys:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch surveys',
      message: error.message
    });
  }
}));

// GET /api/surveys/:id - Get a specific survey by ID
router.get('/:id', validateParams(surveyIdParamSchema), asyncHandler(async (req, res) => {
  const { id } = req.validatedParams;
  
  try {
    const survey = await surveyService.getSurveyById(id);
    
    if (!survey) {
      return res.status(404).json({
        success: false,
        error: 'Survey not found',
        message: `Survey with ID ${id} does not exist`
      });
    }
    
    res.json({
      success: true,
      data: survey
    });
  } catch (error) {
    console.error('Error fetching survey:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch survey',
      message: error.message
    });
  }
}));

// POST /api/surveys - Create a new survey
router.post('/', validateBody(apiSurveyCreateSchema), asyncHandler(async (req, res) => {
  const surveyData = req.validatedBody;
  
  try {
    const newSurvey = await surveyService.createSurvey(surveyData);
    
    res.status(201).json({
      success: true,
      message: 'Survey created successfully',
      data: newSurvey
    });
  } catch (error) {
    console.error('Error creating survey:', error);
    
    // Handle duplicate email error
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({
        success: false,
        error: 'Duplicate survey',
        message: 'A survey with this email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create survey',
      message: error.message
    });
  }
}));

// PUT /api/surveys/:id - Update an existing survey
router.put('/:id', 
  validateParams(surveyIdParamSchema),
  validateBody(apiSurveyUpdateSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.validatedParams;
    const updateData = req.validatedBody;
    
    try {
      const updatedSurvey = await surveyService.updateSurvey(id, updateData);
      
      if (!updatedSurvey) {
        return res.status(404).json({
          success: false,
          error: 'Survey not found',
          message: `Survey with ID ${id} does not exist`
        });
      }
      
      res.json({
        success: true,
        message: 'Survey updated successfully',
        data: updatedSurvey
      });
    } catch (error) {
      console.error('Error updating survey:', error);
      
      // Handle duplicate email error
      if (error.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({
          success: false,
          error: 'Duplicate email',
          message: 'Another survey with this email already exists'
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to update survey',
        message: error.message
      });
    }
  })
);

// DELETE /api/surveys/:id - Delete a survey
router.delete('/:id', validateParams(surveyIdParamSchema), asyncHandler(async (req, res) => {
  const { id } = req.validatedParams;
  
  try {
    const deleted = await surveyService.deleteSurvey(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Survey not found',
        message: `Survey with ID ${id} does not exist`
      });
    }
    
    res.json({
      success: true,
      message: 'Survey deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting survey:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete survey',
      message: error.message
    });
  }
}));

module.exports = router;