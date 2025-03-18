// Test script to verify Auth0 configuration
require('dotenv').config({ path: '.env.local' });

console.log('Auth0 Configuration:');
console.log('AUTH0_SECRET:', process.env.AUTH0_SECRET ? 'Set (length: ' + process.env.AUTH0_SECRET.length + ')' : 'Not set');
console.log('AUTH0_BASE_URL:', process.env.AUTH0_BASE_URL);
console.log('AUTH0_ISSUER_BASE_URL:', process.env.AUTH0_ISSUER_BASE_URL);
console.log('AUTH0_CLIENT_ID:', process.env.AUTH0_CLIENT_ID);
console.log('AUTH0_CLIENT_SECRET:', process.env.AUTH0_CLIENT_SECRET ? 'Set (length: ' + process.env.AUTH0_CLIENT_SECRET.length + ')' : 'Not set');

// Test if the Auth0 domain is reachable
const https = require('https');
const url = new URL(process.env.AUTH0_ISSUER_BASE_URL);

console.log(`\nTesting connection to Auth0 domain: ${url.hostname}`);
const req = https.get({
  hostname: url.hostname,
  path: '/.well-known/openid-configuration',
  method: 'GET'
}, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  if (res.statusCode === 200) {
    console.log('Connection successful! Auth0 domain is reachable.');
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        console.log('OpenID Configuration retrieved successfully.');
      } catch (e) {
        console.error('Error parsing OpenID Configuration:', e.message);
      }
    });
  } else {
    console.error('Connection failed. Auth0 domain might be incorrect or unreachable.');
  }
});

req.on('error', (e) => {
  console.error(`Error connecting to Auth0 domain: ${e.message}`);
});

req.end(); 