/**
 * Test Registration Flow
 * Tests the complete OTP registration flow to identify issues
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

interface TestResult {
  step: string;
  status: 'pass' | 'fail';
  message: string;
  data?: any;
}

async function testRegistrationFlow() {
  const results: TestResult[] = [];
  const testPhone = '0712345678';
  const formattedPhone = '+254712345678';
  
  console.log('🧪 Testing Complete Registration Flow\n');
  console.log('═'.repeat(80));
  console.log(`📱 Test Phone: ${testPhone} → ${formattedPhone}`);
  console.log('═'.repeat(80));
  console.log('');

  try {
    // Step 1: Check if user already exists
    console.log('Step 1: Checking for existing user...');
    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber: formattedPhone },
    });
    
    if (existingUser) {
      console.log(`   ℹ️  User exists: ${existingUser.id}`);
      console.log(`   - Has PIN: ${existingUser.pinHash ? 'Yes' : 'No'}`);
      console.log(`   - Phone Verified: ${existingUser.phoneVerified}`);
      console.log(`   - Profile Complete: ${existingUser.profileComplete}`);
      console.log(`   - Role: ${existingUser.role}`);
      console.log(`   - Name: ${existingUser.firstName || '(not set)'} ${existingUser.lastName || '(not set)'}`);
      
      if (existingUser.pinHash) {
        results.push({
          step: 'User Check',
          status: 'fail',
          message: 'User already registered with PIN set. Need to cleanup first.',
          data: { userId: existingUser.id }
        });
        console.log('');
        console.log('⚠️  User is fully registered. Clean up first:');
        console.log('   npx tsx scripts/cleanup-incomplete-registrations.ts');
        console.log('');
        await printResults(results);
        return;
      } else {
        results.push({
          step: 'User Check',
          status: 'pass',
          message: 'User exists but incomplete - will reuse',
          data: { userId: existingUser.id }
        });
      }
    } else {
      console.log('   ✅ No existing user found');
      results.push({
        step: 'User Check',
        status: 'pass',
        message: 'No existing user - ready for registration'
      });
    }
    console.log('');

    // Step 2: Test OTP Request Logic (simulated)
    console.log('Step 2: Testing OTP Request Logic...');
    
    // Invalidate old OTPs
    const invalidated = await prisma.otpLog.updateMany({
      where: {
        phoneNumber: formattedPhone,
        purpose: 'registration',
        isUsed: false,
      },
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
    });
    console.log(`   ✅ Invalidated ${invalidated.count} old OTP(s)`);
    
    // Create or get temp user
    let tempUser;
    if (existingUser) {
      tempUser = existingUser;
      console.log(`   ✅ Reusing existing temp user: ${tempUser.id}`);
    } else {
      tempUser = await prisma.user.create({
        data: {
          phoneNumber: formattedPhone,
          role: 'PWD',
          phoneVerified: false,
        },
      });
      console.log(`   ✅ Created temp user: ${tempUser.id}`);
    }
    
    // Generate and save OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    
    const otpLog = await prisma.otpLog.create({
      data: {
        userId: tempUser.id,
        phoneNumber: formattedPhone,
        otp,
        purpose: 'registration',
        expiresAt,
        ipAddress: 'test',
      },
    });
    console.log(`   ✅ Created OTP: ${otp}`);
    console.log(`   - Expires: ${expiresAt.toISOString()}`);
    
    results.push({
      step: 'OTP Request',
      status: 'pass',
      message: 'OTP generated and saved successfully',
      data: { userId: tempUser.id, otp, otpLogId: otpLog.id }
    });
    console.log('');

    // Step 3: Test OTP Verification
    console.log('Step 3: Testing OTP Verification...');
    
    const storedOtp = await prisma.otpLog.findFirst({
      where: {
        phoneNumber: formattedPhone,
        purpose: 'registration',
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    if (!storedOtp) {
      results.push({
        step: 'OTP Verification',
        status: 'fail',
        message: 'Could not find valid OTP in database'
      });
      console.log('   ❌ No valid OTP found');
    } else if (storedOtp.otp !== otp) {
      results.push({
        step: 'OTP Verification',
        status: 'fail',
        message: 'OTP mismatch',
        data: { expected: otp, found: storedOtp.otp }
      });
      console.log('   ❌ OTP mismatch');
    } else {
      // Mark as used
      await prisma.otpLog.update({
        where: { id: storedOtp.id },
        data: {
          isUsed: true,
          usedAt: new Date(),
        },
      });
      
      // Update user verification
      await prisma.user.update({
        where: { id: storedOtp.userId },
        data: {
          phoneVerified: true,
        },
      });
      
      console.log('   ✅ OTP verified successfully');
      console.log('   ✅ User phone verified flag updated');
      
      results.push({
        step: 'OTP Verification',
        status: 'pass',
        message: 'OTP verified and user updated',
        data: { userId: storedOtp.userId }
      });
    }
    console.log('');

    // Step 4: Test Registration Completion
    console.log('Step 4: Testing Registration Completion...');
    
    const verifiedUser = await prisma.user.findUnique({
      where: { id: tempUser.id },
    });
    
    if (!verifiedUser) {
      results.push({
        step: 'Registration Completion',
        status: 'fail',
        message: 'User not found after OTP verification'
      });
      console.log('   ❌ User not found');
    } else if (!verifiedUser.phoneVerified) {
      results.push({
        step: 'Registration Completion',
        status: 'fail',
        message: 'Phone not verified',
        data: { phoneVerified: verifiedUser.phoneVerified }
      });
      console.log('   ❌ Phone not verified');
    } else {
      // Simulate completing registration
      const pinHash = 'test_hash_' + Date.now(); // In real app, this would be bcrypt hash
      
      const completedUser = await prisma.user.update({
        where: { id: verifiedUser.id },
        data: {
          pinHash,
          role: 'PWD',
          firstName: 'Test',
          lastName: 'User',
          profileComplete: true,
          lastLogin: new Date(),
        },
      });
      
      console.log('   ✅ Registration completed successfully');
      console.log(`   - User ID: ${completedUser.id}`);
      console.log(`   - Phone: ${completedUser.phoneNumber}`);
      console.log(`   - Role: ${completedUser.role}`);
      console.log(`   - Name: ${completedUser.firstName} ${completedUser.lastName}`);
      console.log(`   - Profile Complete: ${completedUser.profileComplete}`);
      
      results.push({
        step: 'Registration Completion',
        status: 'pass',
        message: 'User registration completed successfully',
        data: {
          userId: completedUser.id,
          phoneNumber: completedUser.phoneNumber,
          role: completedUser.role
        }
      });
    }
    console.log('');

    // Print results
    await printResults(results);

    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await prisma.otpLog.deleteMany({
      where: { phoneNumber: formattedPhone },
    });
    await prisma.user.deleteMany({
      where: { phoneNumber: formattedPhone },
    });
    console.log('✅ Cleanup complete');
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    results.push({
      step: 'Test Execution',
      status: 'fail',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
    await printResults(results);
  } finally {
    await prisma.$disconnect();
  }
}

async function printResults(results: TestResult[]) {
  console.log('═'.repeat(80));
  console.log('📊 TEST RESULTS');
  console.log('═'.repeat(80));
  console.log('');
  
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  
  results.forEach((result, index) => {
    const icon = result.status === 'pass' ? '✅' : '❌';
    console.log(`${index + 1}. ${icon} ${result.step}: ${result.message}`);
    if (result.data) {
      console.log(`   Data:`, JSON.stringify(result.data, null, 2).split('\n').join('\n   '));
    }
  });
  
  console.log('');
  console.log('─'.repeat(80));
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log('─'.repeat(80));
  
  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Registration flow is working correctly.\n');
  } else {
    console.log('\n⚠️  SOME TESTS FAILED. Review the results above.\n');
  }
}

function generateOTP(): string {
  const length = 6;
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

// Run the test
testRegistrationFlow().catch(console.error);

