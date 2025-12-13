/**
 * Test API Endpoints
 * Tests the actual HTTP endpoints to identify issues
 */

const BASE_URL = 'http://localhost:3000';
const testPhone = '0718888888'; // Different phone to avoid conflicts

interface ApiResponse {
  success?: boolean;
  error?: string;
  message?: string;
  otp?: string;
  userId?: string;
  [key: string]: any;
}

async function testEndpoint(
  name: string,
  endpoint: string,
  method: string = 'POST',
  body?: any
): Promise<{ ok: boolean; status: number; data: ApiResponse; error?: string }> {
  try {
    console.log(`\n🔍 Testing: ${name}`);
    console.log(`   Endpoint: ${method} ${endpoint}`);
    if (body) {
      console.log(`   Body:`, JSON.stringify(body, null, 2).split('\n').join('\n          '));
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      ...(body && { body: JSON.stringify(body) }),
    });
    
    const data = await response.json();
    
    console.log(`   Status: ${response.status} ${response.ok ? '✅' : '❌'}`);
    console.log(`   Response:`, JSON.stringify(data, null, 2).split('\n').join('\n            '));
    
    return {
      ok: response.ok,
      status: response.status,
      data,
    };
  } catch (error) {
    console.log(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      ok: false,
      status: 0,
      data: {},
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function testRegistrationFlow() {
  console.log('🧪 Testing Registration Flow via API Endpoints\n');
  console.log('═'.repeat(80));
  console.log(`📱 Test Phone: ${testPhone}`);
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log('═'.repeat(80));
  
  let userId: string | undefined;
  let otp: string | undefined;
  
  try {
    // Check if server is running
    console.log('\n📡 Checking if server is running...');
    try {
      const healthCheck = await fetch(BASE_URL);
      console.log(`   ✅ Server is running (status: ${healthCheck.status})`);
    } catch (error) {
      console.log('   ❌ Server is not running!');
      console.log('\n💡 Please start the server first:');
      console.log('   npm run dev\n');
      return;
    }
    
    // Step 1: Request OTP
    const otpRequest = await testEndpoint(
      'Request OTP',
      '/api/auth/request-otp',
      'POST',
      {
        phoneNumber: testPhone,
        purpose: 'registration',
      }
    );
    
    if (!otpRequest.ok) {
      console.log('\n❌ OTP Request Failed!');
      console.log(`   Status: ${otpRequest.status}`);
      console.log(`   Error: ${otpRequest.data.error || 'Unknown error'}`);
      return;
    }
    
    otp = otpRequest.data.otp;
    if (!otp) {
      console.log('\n⚠️  OTP not returned in response (might be production mode)');
      console.log('   In development mode, OTP should be included in response.');
      console.log('   Check your NODE_ENV setting.');
      return;
    }
    
    console.log(`\n✅ Step 1 Passed: OTP Request successful`);
    console.log(`   OTP: ${otp}`);
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Step 2: Verify OTP
    const otpVerify = await testEndpoint(
      'Verify OTP',
      '/api/auth/verify-otp',
      'POST',
      {
        phoneNumber: testPhone,
        otp: otp,
        purpose: 'registration',
      }
    );
    
    if (!otpVerify.ok) {
      console.log('\n❌ OTP Verification Failed!');
      console.log(`   Status: ${otpVerify.status}`);
      console.log(`   Error: ${otpVerify.data.error || 'Unknown error'}`);
      return;
    }
    
    userId = otpVerify.data.userId;
    if (!userId) {
      console.log('\n❌ User ID not returned after verification!');
      return;
    }
    
    console.log(`\n✅ Step 2 Passed: OTP Verification successful`);
    console.log(`   User ID: ${userId}`);
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Step 3: Complete Registration
    const registration = await testEndpoint(
      'Complete Registration',
      '/api/auth/register',
      'POST',
      {
        userId: userId,
        pin: '123456',
        confirmPin: '123456',
        role: 'PWD',
        firstName: 'Test',
        lastName: 'User',
        disabilityType: 'MOBILITY',
      }
    );
    
    if (!registration.ok) {
      console.log('\n❌ Registration Failed!');
      console.log(`   Status: ${registration.status}`);
      console.log(`   Error: ${registration.data.error || 'Unknown error'}`);
      return;
    }
    
    console.log(`\n✅ Step 3 Passed: Registration completed successfully`);
    console.log(`   User:`, JSON.stringify(registration.data.user, null, 2).split('\n').join('\n          '));
    
    // Summary
    console.log('\n═'.repeat(80));
    console.log('📊 TEST SUMMARY');
    console.log('═'.repeat(80));
    console.log('✅ Step 1: OTP Request - PASSED');
    console.log('✅ Step 2: OTP Verification - PASSED');
    console.log('✅ Step 3: Registration - PASSED');
    console.log('\n🎉 ALL TESTS PASSED! Registration flow is working correctly via API.\n');
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
  }
}

// Test for existing issues
async function testCommonIssues() {
  console.log('\n═'.repeat(80));
  console.log('🔍 Testing Common Issues');
  console.log('═'.repeat(80));
  
  // Test 1: Duplicate phone number
  console.log('\n1️⃣ Testing duplicate phone number handling...');
  const duplicate1 = await testEndpoint(
    'First OTP Request',
    '/api/auth/request-otp',
    'POST',
    { phoneNumber: testPhone, purpose: 'registration' }
  );
  
  if (duplicate1.ok) {
    // Try again immediately
    const duplicate2 = await testEndpoint(
      'Second OTP Request (immediate)',
      '/api/auth/request-otp',
      'POST',
      { phoneNumber: testPhone, purpose: 'registration' }
    );
    
    if (duplicate2.ok) {
      console.log('   ✅ Can request OTP multiple times (old OTP invalidated)');
    } else {
      console.log('   ❌ Cannot request OTP again immediately');
    }
  }
  
  // Test 2: Invalid OTP
  console.log('\n2️⃣ Testing invalid OTP handling...');
  const invalidOtp = await testEndpoint(
    'Verify Invalid OTP',
    '/api/auth/verify-otp',
    'POST',
    { phoneNumber: testPhone, otp: '000000', purpose: 'registration' }
  );
  
  if (!invalidOtp.ok && invalidOtp.data.error) {
    console.log('   ✅ Invalid OTP properly rejected');
  } else {
    console.log('   ❌ Invalid OTP was accepted!');
  }
  
  // Test 3: Expired OTP (we can't easily test without waiting)
  console.log('\n3️⃣ Skipping expired OTP test (requires waiting 5+ minutes)');
  
  console.log('\n═'.repeat(80));
  console.log('✅ Common issue tests completed\n');
}

async function main() {
  await testRegistrationFlow();
  await testCommonIssues();
  
  console.log('\n💡 To cleanup test data, run:');
  console.log('   npx tsx scripts/cleanup-incomplete-registrations.ts');
  console.log('');
}

main().catch(console.error);

