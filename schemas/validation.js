const { z } = require('zod');

// Common validation patterns
const emailSchema = z
  .string()
  .trim()
  .min(1, { message: "Email is required" })
  .email({ message: "Invalid email format" })
  .refine((email) => email.endsWith('@deakin.edu.au'), {
    message: "Email must be a @deakin.edu.au address"
  });

const nameSchema = z
  .string({ required_error: "This field is required" })
  .trim()
  .min(1, { message: "This field is required" })
  .max(50, { message: "Name must be less than 50 characters" })
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, { message: "Name can only contain letters, spaces, hyphens and apostrophes" });

const commentSchema = z
  .string()
  .trim()
  .min(1, { message: "Comment is required" })
  .max(1000, { message: "Comment must be less than 1000 characters" });

const questionSchema = z
  .string()
  .trim()
  .min(1, { message: "Rating is required" })
  .regex(/^[1-5]$/, { message: "Must be a valid rating from 1 to 5" })
  .transform((val) => parseInt(val, 10))
  .refine((val) => val >= 1 && val <= 5, {
    message: "Rating must be between 1 and 5"
  });

const butterflyColorSchema = z
  .string()
  .trim()
  .optional()
  .transform((val) => val || '');

// Survey form validation schema
const surveyFormSchema = z.object({
  firstname: nameSchema,
  surname: nameSchema,
  email: emailSchema,
  q1radio: questionSchema,
  q2radio: questionSchema,
  q3radio: questionSchema,
  butterflyColour: butterflyColorSchema,
  comments: commentSchema
}).strict(); // Reject unknown fields

// Query parameters validation for surveys list
const surveysQuerySchema = z.object({
  page: z
    .preprocess(
      (val) => val === undefined || val === '' ? '1' : val,
      z.string().regex(/^\d+$/, { message: "Page must be a positive number" })
        .transform(val => parseInt(val, 10))
        .refine((val) => val > 0, { message: "Page must be greater than 0" })
    )
    .default(1),
  limit: z
    .preprocess(
      (val) => val === undefined || val === '' ? '20' : val,
      z.string().regex(/^\d+$/, { message: "Limit must be a positive number" })
        .transform(val => parseInt(val, 10))
        .refine((val) => val > 0 && val <= 100, { message: "Limit must be between 1 and 100" })
    )
    .default(20),
  sortBy: z
    .preprocess(
      (val) => val === undefined || val === '' ? 'date' : val,
      z.enum(['date', 'firstname', 'surname', 'email'], { 
        errorMap: () => ({ message: "Sort field must be one of: date, firstname, surname, email" })
      })
    )
    .default('date'),
  order: z
    .preprocess(
      (val) => val === undefined || val === '' ? 'desc' : val,
      z.enum(['asc', 'desc'], {
        errorMap: () => ({ message: "Order must be 'asc' or 'desc'" })
      })
    )
    .default('desc')
});

// URL parameters validation (for future use if needed)
const surveyIdParamSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, { message: "Survey ID must be a positive number" })
    .transform((val) => parseInt(val, 10))
});

// API-specific validation schemas
const apiSurveyCreateSchema = z.object({
  firstname: nameSchema,
  surname: nameSchema,
  email: emailSchema,
  address: z.string().trim().min(1, "Address is required").max(200, "Address too long"),
  suburb: z.string().trim().min(1, "Suburb is required").max(50, "Suburb too long"),
  postcode: z.string().trim().regex(/^\d{4}$/, "Postcode must be 4 digits"),
  phone: z.string().trim().regex(/^[\d\s\+\-\(\)]+$/, "Invalid phone number format"),
  q1radio: z.string().regex(/^[1-5]$/, "Q1 rating must be 1-5"),
  q2radio: z.string().regex(/^[1-5]$/, "Q2 rating must be 1-5"),  
  q3radio: z.string().regex(/^[1-5]$/, "Q3 rating must be 1-5"),
  butterflyColour: butterflyColorSchema,
  comments: commentSchema
});

const apiSurveyUpdateSchema = z.object({
  firstname: nameSchema.optional(),
  surname: nameSchema.optional(),
  email: emailSchema.optional(),
  address: z.string().trim().min(1, "Address is required").max(200, "Address too long").optional(),
  suburb: z.string().trim().min(1, "Suburb is required").max(50, "Suburb too long").optional(),
  postcode: z.string().trim().regex(/^\d{4}$/, "Postcode must be 4 digits").optional(),
  phone: z.string().trim().regex(/^[\d\s\+\-\(\)]+$/, "Invalid phone number format").optional(),
  q1radio: z.string().regex(/^[1-5]$/, "Q1 rating must be 1-5").optional(),
  q2radio: z.string().regex(/^[1-5]$/, "Q2 rating must be 1-5").optional(),
  q3radio: z.string().regex(/^[1-5]$/, "Q3 rating must be 1-5").optional(),
  butterflyColour: butterflyColorSchema.optional(),
  comments: commentSchema.optional()
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update"
});

const apiQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['id', 'created_at', 'firstname', 'surname', 'email']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc')
});

module.exports = {
  surveyFormSchema,
  surveysQuerySchema,
  surveyIdParamSchema,
  // API schemas
  apiSurveyCreateSchema,
  apiSurveyUpdateSchema,
  apiQuerySchema,
  // Individual schemas for reuse
  emailSchema,
  nameSchema,
  commentSchema,
  questionSchema,
  butterflyColorSchema
};