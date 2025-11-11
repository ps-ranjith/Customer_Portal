const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAuthFlow() {
  try {
    console.log('🧪 Testing Authentication Flow...\n');

    // Test 1: Login
    console.log('1. Testing Login...');
    const loginResponse = await axios.post(`${BASE_URL}/login`, {
      customer_id: 'K901698',
      password: 'Ranjith@2004'
    }, {
      withCredentials: true
    });
    console.log('✅ Login successful:', loginResponse.data);

    // Get cookies from login response
    const cookies = loginResponse.headers['set-cookie'];
    console.log('🍪 Cookies received:', cookies);

    // Test 2: Try to access protected endpoint
    console.log('\n2. Testing Protected Endpoint...');
    const inquiryResponse = await axios.get(`${BASE_URL}/inquiry`, {
      withCredentials: true,
      headers: {
        'Cookie': cookies ? cookies.join('; ') : ''
      }
    });
    console.log('✅ Inquiry endpoint accessible:', inquiryResponse.data);

    // Test 3: Test userDetails endpoint
    console.log('\n3. Testing User Details...');
    const userResponse = await axios.get(`${BASE_URL}/userDetails`, {
      withCredentials: true,
      headers: {
        'Cookie': cookies ? cookies.join('; ') : ''
      }
    });
    console.log('✅ User details accessible:', userResponse.data);

    console.log('\n🎉 All tests passed! Authentication flow is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.response ? error.response.data : error.message);
    console.error('Status:', error.response ? error.response.status : 'Unknown');
  }
}

testAuthFlow(); 