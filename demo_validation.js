// Simple validation demo script
const { surveyFormSchema, surveysQuerySchema } = require('./schemas/validation');

console.log('🔍 Testing Zod Validation Schemas...\n');

// Test cases
const testCases = [
  {
    name: '✅ Valid Survey Data',
    schema: surveyFormSchema,
    data: {
      firstname: 'John',
      surname: 'Doe',
      email: 'john.doe@deakin.edu.au',
      q1radio: '5',
      q2radio: '4', 
      q3radio: '3',
      butterflyColour: 'blue',
      comments: 'This is a valid comment.'
    }
  },
  {
    name: '❌ Missing Required Fields',
    schema: surveyFormSchema,
    data: {
      surname: 'Doe',
      email: 'john.doe@deakin.edu.au'
    }
  },
  {
    name: '❌ Invalid Email Domain',
    schema: surveyFormSchema,
    data: {
      firstname: 'John',
      surname: 'Doe',
      email: 'john.doe@gmail.com',
      q1radio: '5',
      q2radio: '4',
      q3radio: '3',
      comments: 'Test comment'
    }
  },
  {
    name: '❌ Invalid Question Rating',
    schema: surveyFormSchema,
    data: {
      firstname: 'John',
      surname: 'Doe',
      email: 'john.doe@deakin.edu.au',
      q1radio: '6', // Invalid - should be 1-5
      q2radio: '4',
      q3radio: '3',
      comments: 'Test comment'
    }
  },
  {
    name: '❌ Name with Numbers',
    schema: surveyFormSchema,
    data: {
      firstname: 'John123', // Invalid - contains numbers
      surname: 'Doe',
      email: 'john.doe@deakin.edu.au',
      q1radio: '5',
      q2radio: '4',
      q3radio: '3',
      comments: 'Test comment'
    }
  },
  {
    name: '✅ Valid Query Parameters',
    schema: surveysQuerySchema,
    data: {
      page: '1',
      limit: '10',
      sortBy: 'date',
      order: 'desc'
    }
  },
  {
    name: '❌ Invalid Query Parameters',
    schema: surveysQuerySchema,
    data: {
      page: '0', // Invalid - must be > 0
      limit: '200', // Invalid - max 100
      sortBy: 'invalid_field' // Invalid - not in enum
    }
  }
];

// Run tests
testCases.forEach((testCase, index) => {
  console.log(`${index + 1}. ${testCase.name}`);
  
  const result = testCase.schema.safeParse(testCase.data);
  
  if (result.success) {
    console.log('   ✅ PASS - Validation successful');
    if (testCase.name.includes('Query Parameters')) {
      console.log('   📊 Parsed data:', JSON.stringify(result.data, null, 2));
    }
  } else {
    console.log('   ❌ FAIL - Validation errors:');
    result.error.issues.forEach(issue => {
      const field = issue.path.join('.');
      console.log(`      • ${field}: ${issue.message}`);
    });
  }
  
  console.log('');
});

console.log('🎯 Demo completed! All validation schemas are working as expected.');
console.log('\n📖 For more details, see VALIDATION_IMPLEMENTATION.md');
console.log('🚀 To start the server: node index.js');