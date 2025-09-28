# Zod Validation Implementation

## Overview
Dự án đã được nâng cấp với hệ thống validation toàn diện sử dụng **Zod** để thay thế validation thủ công. Hệ thống này cung cấp:

- ✅ **Type Safety**: Kiểm tra kiểu dữ liệu chặt chẽ
- ✅ **Schema Validation**: Validation schema có cấu trúc rõ ràng
- ✅ **Custom Error Messages**: Thông báo lỗi tùy chỉnh phù hợp với UI hiện tại
- ✅ **Email Regex**: Validation email với regex và domain checking
- ✅ **Query Parameter Validation**: Validation cho pagination và sorting
- ✅ **Data Transformation**: Tự động convert và sanitize dữ liệu

## Files Structure

```
10.1P/
├── schemas/
│   └── validation.js          # Zod schemas cho tất cả validation
├── middleware/
│   └── validation.js          # Middleware xử lý validation
├── index.js                   # Main server với validation đã tích hợp
└── test_validation.js         # Test script (optional)
```

## Implemented Validation

### 1. Survey Form Validation (`/submitsurvey`)

#### Fields Validated:
- **firstname**: Required, max 50 chars, chỉ letters/spaces/hyphens/apostrophes
- **surname**: Required, max 50 chars, chỉ letters/spaces/hyphens/apostrophes  
- **email**: Required, valid email format, phải kết thúc bằng `@deakin.edu.au`
- **q1radio, q2radio, q3radio**: Required, phải là số từ 1-5
- **comments**: Required, max 1000 chars
- **butterflyColour**: Optional

#### Example Valid Data:
```javascript
{
  firstname: "John",
  surname: "Doe", 
  email: "john.doe@deakin.edu.au",
  q1radio: "5",
  q2radio: "4", 
  q3radio: "3",
  butterflyColour: "blue",
  comments: "This is a valid comment."
}
```

#### Example Validation Errors:
- `Error in field 'FIRSTNAME': This field is required`
- `Error in field 'EMAIL': Email must be a @deakin.edu.au address`
- `Error in field 'SURVEY QUESTION #1': Must be a valid rating from 1 to 5`

### 2. Query Parameter Validation (`/surveys`)

#### Supported Parameters:
- **page**: Integer > 0 (default: 1)
- **limit**: Integer 1-100 (default: 20)  
- **sortBy**: Enum ['date', 'firstname', 'surname', 'email'] (default: 'date')
- **order**: Enum ['asc', 'desc'] (default: 'desc')

#### Example Usage:
```
GET /surveys?page=1&limit=10&sortBy=date&order=desc
GET /surveys?page=2&limit=5&sortBy=firstname&order=asc
```

## Key Features

### 1. Type Safety & Data Transformation
```javascript
// Input: "5" (string)  
// After validation: 5 (number)
q1radio: questionSchema.transform(val => parseInt(val, 10))
```

### 2. Email Validation with Regex
```javascript
const emailSchema = z
  .string()
  .email({ message: "Invalid email format" })
  .refine(email => email.endsWith('@deakin.edu.au'), {
    message: "Email must be a @deakin.edu.au address"
  });
```

### 3. Name Validation with Regex
```javascript
const nameSchema = z
  .string()
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, { 
    message: "Name can only contain letters, spaces, hyphens and apostrophes" 
  });
```

### 4. Flexible Query Parameter Handling
```javascript
const surveysQuerySchema = z.object({
  page: z.union([
    z.string().regex(/^\d+$/).transform(val => parseInt(val, 10)),
    z.number().int()
  ]).refine(val => val > 0, { message: "Page must be greater than 0" })
});
```

## Error Handling

### Survey Form Errors (HTML Response)
- Tương thích 100% với template `results.ejs` hiện tại
- Format: `Error in field 'FIELDNAME': <em>Error message</em>`
- Hiển thị tất cả lỗi validation cùng lúc

### Query Parameter Errors (JSON Response)  
```javascript
{
  "error": "Validation failed for query",
  "details": ["Page must be greater than 0", "Limit must be between 1 and 100"]
}
```

## How to Use

### 1. Start Server
```bash
cd /Users/datnq2001/Documents/SIT774/10.1P
node index.js
```

### 2. Test Survey Form
- Navigate to `http://localhost:3000`
- Submit form with invalid data to see Zod validation in action

### 3. Test Query Parameters
```bash
# Valid request
curl "http://localhost:3000/surveys?page=1&limit=10"

# Invalid request (will return JSON error)
curl "http://localhost:3000/surveys?page=0&limit=200"
```

## Test Cases to Verify

### ✅ Survey Form Tests:
1. **Valid data**: Should succeed
2. **Missing firstname**: Should show "This field is required"  
3. **Invalid email format**: Should show "Invalid email format"
4. **Non-Deakin email**: Should show "Email must be a @deakin.edu.au address"
5. **Invalid question rating (6)**: Should show "Must be a valid rating from 1 to 5" 
6. **Empty comment**: Should show "Comment is required"
7. **Name with numbers**: Should show "Name can only contain letters..."

### ✅ Query Parameter Tests:
1. **Valid params**: Should work with pagination/sorting
2. **Page = 0**: Should return error "Page must be greater than 0"
3. **Limit = 200**: Should return error "Limit must be between 1 and 100"  
4. **Invalid sortBy**: Should return error "Sort field must be one of..."

## Benefits Over Previous Manual Validation

1. **Type Safety**: Automatic type conversion and validation
2. **Maintainability**: Centralized schemas, easy to modify
3. **Consistency**: Same validation logic across all fields
4. **Performance**: More efficient than manual string checking
5. **Extensibility**: Easy to add new validation rules
6. **Security**: Built-in protection against injection attacks
7. **Developer Experience**: Clear error messages and IntelliSense support

## Future Enhancements

- [ ] Add file upload validation (if needed)
- [ ] Add rate limiting per user (current is per IP)
- [ ] Add CSRF protection with validation
- [ ] Add API key validation for external endpoints
- [ ] Add request ID validation for idempotency