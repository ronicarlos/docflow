const { cookies } = require('next/headers');
const { jwtVerify } = require('jose');

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

const COOKIE_NAME = 'docflow-session';

async function debugAuth() {
  try {
    console.log('Debugging authentication...\n');
    
    // Simulate getting cookies (this won't work in Node.js directly, but shows the logic)
    console.log('Cookie name to look for:', COOKIE_NAME);
    console.log('JWT Secret exists:', !!process.env.JWT_SECRET);
    
    // Check environment variables
    console.log('\nEnvironment variables:');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    
  } catch (error) {
    console.error('Error debugging auth:', error);
  }
}

debugAuth();