/**
 * Test API endpoint directly
 */

async function testAPIEndpoint() {
  try {
    console.log('🧪 Testing API endpoint directly...\n');
    
    const testPhone = '0798765432'; // Different number to test from scratch
    
    console.log(`📞 Test phone: ${testPhone}`);
    console.log('─'.repeat(80));
    
    console.log('\n1. Sending POST request to /api/auth/request-otp...');
    
    const response = await fetch('http://localhost:3000/api/auth/request-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: testPhone,
        purpose: 'registration',
      }),
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Headers:`, Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('\n2. Response data:');
    console.log(JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('\n✅ SUCCESS! OTP request worked!');
      if (data.otp) {
        console.log(`🔑 OTP: ${data.otp} (development mode)`);
      }
    } else {
      console.log('\n❌ FAILED! Response not OK');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    if (error instanceof Error) {
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
    }
    throw error;
  }
}

testAPIEndpoint()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

