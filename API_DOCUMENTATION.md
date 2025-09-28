# Survey API Documentation

This document describes the RESTful API endpoints for the Survey application.

## Base URL
```
http://localhost:3000/api/surveys
```

## Authentication
No authentication required for this API.

## Rate Limiting
- General API endpoints: 100 requests per 15 minutes
- Same rate limiting applies to all endpoints

## Response Format
All API responses follow this structure:

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error type",
  "message": "Error description",
  "details": [
    {
      "field": "fieldName",
      "message": "Validation error message"
    }
  ]
}
```

## Endpoints

### 1. Get All Surveys
**GET** `/api/surveys`

Retrieves a paginated list of all surveys.

#### Query Parameters
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 10, max: 100)
- `sortBy` (string, optional): Sort field - `id`, `created_at`, `firstname`, `surname`, `email` (default: `created_at`)
- `order` (string, optional): Sort order - `asc`, `desc` (default: `desc`)

#### Example Request
```bash
GET /api/surveys?page=1&limit=10&sortBy=created_at&order=desc
```

#### Example Response
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "firstname": "John",
      "surname": "Doe",
      "email": "john.doe@deakin.edu.au",
      "address": "123 Main St",
      "suburb": "Melbourne",
      "postcode": "3000",
      "phone": "0412345678",
      "q1radio": "4",
      "q2radio": "5",
      "q3radio": "3",
      "butterflyColour": "Blue",
      "comments": "Great experience!",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalRecords": 47,
    "pageSize": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### 2. Get Survey by ID
**GET** `/api/surveys/:id`

Retrieves a specific survey by its ID.

#### URL Parameters
- `id` (integer, required): Survey ID

#### Example Request
```bash
GET /api/surveys/1
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "firstname": "John",
    "surname": "Doe",
    "email": "john.doe@deakin.edu.au",
    "address": "123 Main St",
    "suburb": "Melbourne",
    "postcode": "3000",
    "phone": "0412345678",
    "q1radio": "4",
    "q2radio": "5",
    "q3radio": "3",
    "comments": "Great experience!",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### 3. Create New Survey
**POST** `/api/surveys`

Creates a new survey entry.

#### Request Body
```json
{
  "firstname": "John",
  "surname": "Doe",
  "email": "john.doe@deakin.edu.au",
  "address": "123 Main St",
  "suburb": "Melbourne",
  "postcode": "3000",
  "phone": "0412345678",
  "q1radio": "4",
  "q2radio": "5",
  "q3radio": "3",
  "butterflyColour": "Blue",
  "comments": "Great experience!"
}
```

#### Field Validation
- `firstname`: Required, 2-50 characters, letters only
- `surname`: Required, 2-50 characters, letters only
- `email`: Required, must end with @deakin.edu.au
- `address`: Required, max 200 characters
- `suburb`: Required, max 50 characters
- `postcode`: Required, exactly 4 digits
- `phone`: Required, valid phone format
- `q1radio`, `q2radio`, `q3radio`: Required, values 1-5
- `butterflyColour`: Required, one of: Blue, Green, Orange, Purple, Red, Yellow
- `comments`: Optional, max 500 characters

#### Example Response
```json
{
  "success": true,
  "message": "Survey created successfully",
  "data": {
    "id": 48,
    "firstname": "John",
    "surname": "Doe",
    "email": "john.doe@deakin.edu.au",
    "address": "123 Main St",
    "suburb": "Melbourne",
    "postcode": "3000",
    "phone": "0412345678",
    "q1radio": "4",
    "q2radio": "5",
    "q3radio": "3",
    "comments": "Great experience!",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### 4. Update Survey
**PUT** `/api/surveys/:id`

Updates an existing survey. At least one field must be provided.

#### URL Parameters
- `id` (integer, required): Survey ID

#### Request Body
All fields are optional, but at least one must be provided:
```json
{
  "firstname": "Jane",
  "email": "jane.doe@deakin.edu.au",
  "q1radio": "5"
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Survey updated successfully",
  "data": {
    "id": 1,
    "firstname": "Jane",
    "surname": "Doe",
    "email": "jane.doe@deakin.edu.au",
    "address": "123 Main St",
    "suburb": "Melbourne",
    "postcode": "3000",
    "phone": "0412345678",
    "q1radio": "5",
    "q2radio": "5",
    "q3radio": "3",
    "comments": "Great experience!",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### 5. Delete Survey
**DELETE** `/api/surveys/:id`

Deletes a survey by its ID.

#### URL Parameters
- `id` (integer, required): Survey ID

#### Example Request
```bash
DELETE /api/surveys/1
```

#### Example Response
```json
{
  "success": true,
  "message": "Survey deleted successfully"
}
```

## Error Codes

### 400 Bad Request
- Invalid request body
- Validation errors
- Missing required fields

### 404 Not Found
- Survey with specified ID does not exist

### 409 Conflict
- Email already exists (for create/update operations)

### 429 Too Many Requests
- Rate limit exceeded

### 500 Internal Server Error
- Database connection issues
- Server-side errors

## Example cURL Commands

### Get all surveys
```bash
curl -X GET "http://localhost:3000/api/surveys?page=1&limit=5&sortBy=created_at&order=desc"
```

### Get specific survey
```bash
curl -X GET "http://localhost:3000/api/surveys/1"
```

### Create new survey
```bash
curl -X POST "http://localhost:3000/api/surveys" \
  -H "Content-Type: application/json" \
  -d '{
    "firstname": "John",
    "surname": "Doe",
    "email": "john.doe@deakin.edu.au",
    "address": "123 Main St",
    "suburb": "Melbourne", 
    "postcode": "3000",
    "phone": "0412345678",
    "q1radio": "4",
    "q2radio": "5",
    "q3radio": "3",
    "butterflyColour": "Blue",
    "comments": "Great experience!"
  }'
```

### Update survey
```bash
curl -X PUT "http://localhost:3000/api/surveys/1" \
  -H "Content-Type: application/json" \
  -d '{
    "firstname": "Jane",
    "q1radio": "5"
  }'
```

### Delete survey
```bash
curl -X DELETE "http://localhost:3000/api/surveys/1"
```

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Email validation requires @deakin.edu.au domain
- Phone numbers accept various formats with digits, spaces, +, -, (), etc.
- Question ratings (q1radio, q2radio, q3radio) must be strings "1" through "5"
- Pagination starts from page 1
- Maximum page size is 100 items
- Sorting is case-insensitive
- All text fields are automatically trimmed of leading/trailing whitespace