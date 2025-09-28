# Fix for SQLITE_MISMATCH Error 

## 🐛 Problem Identified:
The `SQLITE_MISMATCH: datatype mismatch` error occurred because:
- Query parameters `page` and `limit` were `undefined` or `NaN`
- SQLite received `[undefined, NaN]` instead of valid numbers
- This happened when accessing `/surveys` without query parameters

## ✅ Solution Applied:

### 1. Updated Query Parameter Handling in `/surveys` Route

**Before (Problem):**
```javascript
const { page, limit, sortBy, order } = req.query;
const offset = (page - 1) * limit; // NaN if page/limit undefined
db.all(selectSQL, [limit, offset], ...)  // [undefined, NaN] → SQLite error
```

**After (Fixed):**
```javascript
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

const offset = (page - 1) * limit; // Always valid numbers
```

### 2. Enhanced Schema Validation (Alternative Approach)

Updated `schemas/validation.js` with `.preprocess()` to handle empty/undefined values:

```javascript
const surveysQuerySchema = z.object({
  page: z.preprocess(
    (val) => val === undefined || val === '' ? '1' : val,
    z.string().regex(/^\d+$/).transform(val => parseInt(val, 10))
  ).default(1),
  // ... similar for limit, sortBy, order
});
```

## 🧪 How to Test the Fix:

### Manual Testing:
1. **Start the server:**
   ```bash
   cd /Users/datnq2001/Documents/SIT774/10.1P
   node index.js
   ```

2. **Test /surveys endpoint:**
   ```bash
   # Test without parameters (should work now)
   curl http://localhost:3000/surveys
   
   # Test with parameters
   curl "http://localhost:3000/surveys?page=1&limit=5"
   curl "http://localhost:3000/surveys?sortBy=firstname&order=asc"
   
   # Test with invalid parameters (should use defaults)
   curl "http://localhost:3000/surveys?page=0&limit=abc"
   ```

3. **Browser Testing:**
   - Navigate to `http://localhost:3000/surveys`
   - Should show "Survey List" without database errors

## 📋 What Was Fixed:

✅ **Default Values**: All query params now have safe defaults (page=1, limit=20, etc.)
✅ **Type Safety**: `parseInt()` with fallbacks ensures numbers are passed to SQLite
✅ **Bounds Checking**: page ≥ 1, limit between 1-100
✅ **SQL Injection Prevention**: sortBy limited to valid field names
✅ **Error Handling**: Graceful fallbacks for invalid inputs

## 🔄 Alternative Solutions Considered:

1. **Zod Validation Middleware** - Implemented but caused conflicts
2. **Manual Validation** - **✅ Current solution** - Simple and reliable
3. **Default Route Parameters** - Could be added in Express router

## 🎯 Expected Behavior Now:

- **`/surveys`** → Shows all surveys, page 1, limit 20
- **`/surveys?page=2`** → Shows page 2 with default limit 20
- **`/surveys?page=0`** → Automatically corrected to page 1
- **`/surveys?limit=200`** → Automatically limited to 100
- **`/surveys?sortBy=invalid`** → Falls back to 'date' sorting

## 🚀 Current Status:

The SQLITE_MISMATCH error should now be **RESOLVED**. The `/surveys` endpoint has robust parameter validation with safe defaults that prevent undefined/NaN values from reaching the SQLite query.

## 📝 Files Modified:

- ✅ `index.js` - Updated `/surveys` route with manual validation
- ✅ `schemas/validation.js` - Enhanced with `.preprocess()` 
- ✅ `middleware/validation.js` - Improved error handling

**Ready for testing!** 🎊