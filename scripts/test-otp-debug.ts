/**
 * Debug OTP Request to identify the exact error
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function debugOTPRequest() {
  const testPhone = '0718888888';
  const formattedPhone = '+254718888888';
  
  console.log('🔍 Debugging OTP Request Flow\n');
  console.log('═'.repeat(80));
  
  try {
    // Step 1: Check phone validation
    console.log('1. Testing phone validation...');
    const validatePhoneNumber = (phone: string): boolean => {
      const cleaned = phone.replace(/[\s-]/g, '');
      const kenyanPattern = /^(?:\+?254|0)?[17]\d{8}$/;
      return kenyanPattern.test(cleaned);
    };
    
    const formatPhoneNumber = (phone: string): string => {
      const cleaned = phone.replace(/[\s-]/g, '');
      if (cleaned.startsWith('0')) {
        return `+254${cleaned.slice(1)}`;
      }
      if (cleaned.startsWith('254')) {
        return `+${cleaned}`;
      }
      if (cleaned.startsWith('+254')) {
        return cleaned;
      }
      return `+254${cleaned}`;
    };
    
    if (!validatePhoneNumber(testPhone)) {
      console.log('   ❌ Phone validation failed');
      return;
    }
    console.log(`   ✅ Phone validated: ${testPhone} → ${formattedPhone}`);
    
    // Step 2: Check existing user
    console.log('\n2. Checking for existing user...');
    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber: formattedPhone },
    });
    
    if (existingUser) {
      console.log(`   ℹ️  User exists: ${existingUser.id}`);
      console.log(`   - Has PIN: ${existingUser.pinHash ? 'Yes' : 'No'}`);
      
      if (existingUser.pinHash) {
        console.log('   ⚠️  User already registered - should be rejected');
      } else {
        console.log('   ✅ Incomplete registration - can reuse');
      }
    } else {
      console.log('   ✅ No existing user');
    }
    
    // Step 3: Test OTP generation
    console.log('\n3. Testing OTP generation...');
    const generateOTP = (): string => {
      const length = parseInt(process.env.OTP_LENGTH || '6');
      const digits = '0123456789';
      let otp = '';
      for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
      }
      return otp;
    };
    
    const otp = generateOTP();
    console.log(`   ✅ Generated OTP: ${otp}`);
    
    // Step 4: Test OTP expiry calculation
    console.log('\n4. Testing OTP expiry...');
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '5');
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
    console.log(`   ✅ Expires at: ${expiresAt.toISOString()} (in ${expiryMinutes} minutes)`);
    
    // Step 5: Test database operations
    console.log('\n5. Testing database operations...');
    
    // Invalidate old OTPs
    console.log('   a. Invalidating old OTPs...');
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
    console.log(`      ✅ Invalidated ${invalidated.count} old OTP(s)`);
    
    // Create or get user
    console.log('   b. Creating/getting user...');
    let tempUser;
    if (existingUser && !existingUser.pinHash) {
      tempUser = existingUser;
      console.log(`      ✅ Reusing user: ${tempUser.id}`);
    } else if (!existingUser) {
      tempUser = await prisma.user.create({
        data: {
          phoneNumber: formattedPhone,
          role: 'PWD',
          phoneVerified: false,
        },
      });
      console.log(`      ✅ Created user: ${tempUser.id}`);
    } else {
      console.log(`      ⚠️  Cannot proceed - user already registered`);
      return;
    }
    
    // Create OTP log
    console.log('   c. Creating OTP log...');
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
    console.log(`      ✅ OTP log created: ${otpLog.id}`);
    
    // Create SMS log
    console.log('   d. Creating SMS log...');
    const smsLog = await prisma.smsLog.create({
      data: {
        userId: tempUser.id,
        phoneNumber: formattedPhone,
        message: `Your HMK verification code is: ${otp}. Valid for ${expiryMinutes} minutes.`,
        purpose: 'otp',
        status: 'sent',
      },
    });
    console.log(`      ✅ SMS log created: ${smsLog.id}`);
    
    console.log('\n═'.repeat(80));
    console.log('✅ ALL STEPS COMPLETED SUCCESSFULLY!');
    console.log('═'.repeat(80));
    console.log(`\nOTP: ${otp}`);
    console.log(`User ID: ${tempUser.id}`);
    console.log('\n💡 The database logic works fine.');
    console.log('   The API 500 error must be coming from something else.\n');
    
    // Cleanup
    console.log('🧹 Cleaning up...');
    await prisma.otpLog.delete({ where: { id: otpLog.id } });
    await prisma.smsLog.delete({ where: { id: smsLog.id } });
    if (!existingUser) {
      await prisma.user.delete({ where: { id: tempUser.id } });
    }
    console.log('✅ Cleanup complete\n');
    
  } catch (error) {
    console.error('\n❌ ERROR OCCURRED:');
    console.error('═'.repeat(80));
    console.error(error);
    console.error('═'.repeat(80));
    
    if (error instanceof Error) {
      console.error('\nError details:');
      console.error(`  Message: ${error.message}`);
      console.error(`  Stack: ${error.stack}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

debugOTPRequest().catch(console.error);

