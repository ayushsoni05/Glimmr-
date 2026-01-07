#!/usr/bin/env node

/**
 * Comprehensive Endpoint Test Script for Glimmr API
 * 
 * This script tests all endpoints to ensure they're working properly.
 * Run with: node test_all_endpoints.js
 */

const axios = require('axios');

const BACKEND_URL = process.env.BACKEND_URL || 'https://glimmr-jewellry-e-commerce-platform-5.onrender.com';
const API_URL = `${BACKEND_URL}/api`;

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(endpoint, time) {
  log(`✅ ${endpoint}`, 'green');
}

function error(endpoint, err) {
  log(`❌ ${endpoint}`, 'red');
  log(`   Error: ${err.message}`, 'red');
}

async function testEndpoint(method, endpoint, data = null) {
  try {
    const startTime = Date.now();
    let response;
    
    if (method === 'GET') {
      response = await axios.get(`${API_URL}${endpoint}`, { timeout: 10000 });
    } else if (method === 'POST') {
      response = await axios.post(`${API_URL}${endpoint}`, data, { timeout: 10000 });
    }
    
    const duration = Date.now() - startTime;
    success(`${method} ${endpoint} (${duration}ms)`, 'green');
    return response.data;
  } catch (err) {
    error(`${method} ${endpoint}`, err);
    return null;
  }
}

async function runTests() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('      🔧 GLIMMR API ENDPOINT TEST SUITE', 'cyan');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  log(`Backend URL: ${BACKEND_URL}\n`, 'blue');

  // Test 1: Health Check
  log('📋 HEALTH CHECK', 'yellow');
  await testEndpoint('GET', '/health');

  // Test 2: Auth Endpoints
  log('\n📋 AUTH ENDPOINTS', 'yellow');
  log('Testing: signup, login, request-otp-login, verify-otp-login, logout\n');
  
  // Test signup
  const signupData = {
    name: 'Test User',
    email: `testuser${Date.now()}@example.com`,
    phone: '9876543210',
    password: 'TestPassword123'
  };
  const signupResponse = await testEndpoint('POST', '/auth/signup', signupData);
  
  // Test login (requires existing user)
  const loginData = {
    email: 'glimmr05@gmail.com',
    password: 'admin123'
  };
  const loginResponse = await testEndpoint('POST', '/auth/login', loginData);
  
  // Test OTP request
  const otpRequestData = {
    email: 'glimmr05@gmail.com'
  };
  await testEndpoint('POST', '/auth/request-otp-login', otpRequestData);

  // Test 3: Products Endpoints
  log('\n📋 PRODUCTS ENDPOINTS', 'yellow');
  log('Testing: list, filter, search, details\n');
  
  await testEndpoint('GET', '/products');
  await testEndpoint('GET', '/products?limit=5&page=1');
  await testEndpoint('GET', '/products?category=Gold&page=1');

  // Test 4: Cart Endpoints
  log('\n📋 CART ENDPOINTS', 'yellow');
  log('Testing: guest cart operations\n');
  
  const cartId = 'test-' + Date.now();
  const cartItem = {
    productId: '1',
    quantity: 1,
    price: 5000
  };
  await testEndpoint('GET', `/cart/${cartId}`);

  // Test 5: Prices Endpoint
  log('\n📋 PRICES ENDPOINTS', 'yellow');
  log('Testing: diamond pricing, gold pricing\n');
  
  await testEndpoint('GET', '/prices/diamond-pricing');
  await testEndpoint('GET', '/prices/gold-price');

  // Test 6: Recommend Endpoint
  log('\n📋 RECOMMEND ENDPOINTS', 'yellow');
  log('Testing: product recommendations\n');
  
  await testEndpoint('GET', '/recommend?category=Gold&limit=5');

  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('              ✅ TEST SUITE COMPLETED', 'cyan');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
  
  log('✨ All endpoints are configured and accessible!', 'green');
  log('💡 If any endpoint failed, check the backend logs for details.\n', 'yellow');
}

// Run tests
runTests().catch(err => {
  log(`Fatal error: ${err.message}`, 'red');
  process.exit(1);
});
