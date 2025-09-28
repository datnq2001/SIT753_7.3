// Simple test to check if we can access /surveys endpoint
const http = require('http');

function testSurveysEndpoint() {
  console.log('🔍 Testing /surveys endpoint...');
  
  // First, start the server
  const server = require('./index.js');
  
  setTimeout(() => {
    // Make a request to /surveys
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/surveys',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      console.log(`Status: ${res.statusCode}`);
      console.log(`Headers: ${JSON.stringify(res.headers)}`);

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ /surveys endpoint working!');
          if (data.includes('Survey List')) {
            console.log('✅ Survey List page loaded successfully');
          } else {
            console.log('⚠️  Response received but may not be correct page');
          }
        } else {
          console.log('❌ /surveys endpoint returned error');
          console.log('Response body:', data.substring(0, 500));
        }
        process.exit(0);
      });
    });

    req.on('error', (e) => {
      console.error(`❌ Request error: ${e.message}`);
      process.exit(1);
    });

    req.end();
  }, 1000); // Wait 1 second for server to start
}

testSurveysEndpoint();