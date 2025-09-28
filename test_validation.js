// Test script để kiểm tra Zod validation
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Test cases for validation
const testCases = [
  {
    name: 'Valid survey data',
    data: {
      firstname: 'John',
      surname: 'Doe', 
      email: 'john.doe@deakin.edu.au',
      q1radio: '5',
      q2radio: '4',
      q3radio: '3',
      butterflyColour: 'blue',
      comments: 'This is a valid comment.'
    },
    expectedResult: 'success'
  },
  {
    name: 'Missing firstname',
    data: {
      surname: 'Doe',
      email: 'john.doe@deakin.edu.au', 
      q1radio: '5',
      q2radio: '4',
      q3radio: '3',
      butterflyColour: 'blue',
      comments: 'Missing firstname test.'
    },
    expectedResult: 'error'
  },
  {
    name: 'Invalid email format',
    data: {
      firstname: 'John',
      surname: 'Doe',
      email: 'invalid-email',
      q1radio: '5', 
      q2radio: '4',
      q3radio: '3',
      butterflyColour: 'blue',
      comments: 'Invalid email test.'
    },
    expectedResult: 'error'
  },
  {
    name: 'Non-Deakin email',
    data: {
      firstname: 'John',
      surname: 'Doe',
      email: 'john.doe@gmail.com',
      q1radio: '5',
      q2radio: '4', 
      q3radio: '3',
      butterflyColour: 'blue',
      comments: 'Non-Deakin email test.'
    },
    expectedResult: 'error'
  },
  {
    name: 'Invalid question rating',
    data: {
      firstname: 'John',
      surname: 'Doe',
      email: 'john.doe@deakin.edu.au',
      q1radio: '6', // Invalid - should be 1-5
      q2radio: '4',
      q3radio: '3',
      butterflyColour: 'blue', 
      comments: 'Invalid rating test.'
    },
    expectedResult: 'error'
  },
  {
    name: 'Empty comment',
    data: {
      firstname: 'John',
      surname: 'Doe',
      email: 'john.doe@deakin.edu.au',
      q1radio: '5',
      q2radio: '4',
      q3radio: '3',
      butterflyColour: 'blue',
      comments: '' // Empty comment
    },
    expectedResult: 'error'
  },
  {
    name: 'Name with invalid characters',
    data: {
      firstname: 'John123', // Invalid - contains numbers
      surname: 'Doe',
      email: 'john.doe@deakin.edu.au',
      q1radio: '5',
      q2radio: '4',
      q3radio: '3',
      butterflyColour: 'blue',
      comments: 'Name with numbers test.'
    },
    expectedResult: 'error'
  }
];

async function runTests() {
  console.log('Starting Zod validation tests...\n');
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`Test ${i + 1}: ${testCase.name}`);
    
    try {
      const response = await axios.post(`${BASE_URL}/submitsurvey`, testCase.data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        transformRequest: [function (data) {
          return Object.keys(data).map(key => 
            encodeURIComponent(key) + '=' + encodeURIComponent(data[key])
          ).join('&');
        }],
        validateStatus: () => true // Don't throw on 4xx/5xx
      });
      
      // Check if response contains error (either JSON error or HTML with "Incorrect Input")
      let isSuccess = false;
      let errorDetails = '';
      
      if (response.status === 200) {
        if (typeof response.data === 'string') {
          isSuccess = !response.data.includes('Incorrect Input');
          if (!isSuccess) {
            const errorMatch = response.data.match(/Error in field[^<]*/g);
            if (errorMatch) {
              errorDetails = errorMatch.join(', ');
            }
          }
        } else if (response.data && response.data.error) {
          isSuccess = false;
          errorDetails = response.data.error;
        } else {
          isSuccess = true;
        }
      } else {
        isSuccess = false;
        if (response.data && response.data.error) {
          errorDetails = response.data.error;
        }
      }
      
      const actualResult = isSuccess ? 'success' : 'error';
      
      if (actualResult === testCase.expectedResult) {
        console.log(`PASS - Expected ${testCase.expectedResult}, got ${actualResult}`);
      } else {
        console.log(`FAIL - Expected ${testCase.expectedResult}, got ${actualResult}`);
      }
      
      // Show error details
      if (actualResult === 'error' && errorDetails) {
        console.log(`   Error details: ${errorDetails}`);
      }
      
    } catch (error) {
      console.log(`❌ ERROR - ${error.message}`);
    }
    
    console.log('');
  }
  
  console.log('🏁 Tests completed!');
}

// Test query parameter validation for /surveys endpoint
async function testQueryValidation() {
  console.log('\nTesting query parameter validation...\n');
  
  const queryTests = [
    {
      name: 'Valid query parameters',
      url: `${BASE_URL}/surveys?page=1&limit=10&sortBy=date&order=desc`,
      expectedResult: 'success'
    },
    {
      name: 'Invalid page number (zero)',
      url: `${BASE_URL}/surveys?page=0`,
      expectedResult: 'error'
    },
    {
      name: 'Invalid limit (too high)',
      url: `${BASE_URL}/surveys?limit=200`,
      expectedResult: 'error'
    },
    {
      name: 'Invalid sortBy field',
      url: `${BASE_URL}/surveys?sortBy=invalid_field`,
      expectedResult: 'error'
    }
  ];
  
  for (let i = 0; i < queryTests.length; i++) {
    const test = queryTests[i];
    console.log(`Query Test ${i + 1}: ${test.name}`);
    
    try {
      const response = await axios.get(test.url, {
        validateStatus: () => true
      });
      
      const actualResult = response.status === 200 ? 'success' : 'error';
      
      if (actualResult === test.expectedResult) {
        console.log(`PASS - Expected ${test.expectedResult}, got ${actualResult}`);
      } else {
        console.log(`FAIL - Expected ${test.expectedResult}, got ${actualResult}`);
        if (response.data && response.data.error) {
          console.log(`   Error: ${response.data.error}`);
        }
      }
    } catch (error) {
      console.log(`❌ ERROR - ${error.message}`);
    }
    
    console.log('');
  }
}

// Check if axios is available
if (typeof require !== 'undefined') {
  try {
    require('axios');
    runTests().then(() => testQueryValidation());
  } catch (e) {
    console.log('Please install axios first: npm install axios');
  }
} else {
  console.log('This script should be run with Node.js');
}