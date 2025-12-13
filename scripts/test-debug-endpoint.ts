/**
 * Test Debug Endpoint
 */

async function testDebugEndpoint() {
  try {
    console.log('🧪 Testing debug endpoint...\n');
    
    const response = await fetch('http://localhost:3000/api/auth/test-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: '0798765432',
        purpose: 'registration',
      }),
    });
    
    console.log(`Status: ${response.status} ${response.statusText}\n`);
    
    const data = await response.json();
    console.log('Response:');
    console.log(JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('\n✅ Test passed!');
    } else {
      console.log('\n❌ Test failed!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

testDebugEndpoint()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

