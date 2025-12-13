/**
 * Simulate OTP Request Script
 * This simulates exactly what the API endpoint does
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

// Copy the auth functions we need
function validatePhoneNumber(phoneNumber: string): boolean {
  // Remove spaces and dashes
  const cleaned = phoneNumber.replace(/[\s-]/g, '');
  
  // Kenyan phone number patterns:
  // 07XXXXXXXX or 01XXXXXXXX (10 digits starting with 0)
  // 2547XXXXXXXX or 2541XXXXXXXX (12 digits starting with 254)
  // +2547XXXXXXXX or +2541XXXXXXXX (13 chars starting with +254)
  const kenyaPattern = /^(?:\+?254|0)?[17]\d{8}$/;
  
  return kenyaPattern.test(cleaned);
}

function formatPhoneNumber(phoneNumber: string): string {
  // Remove spaces and dashes
  let cleaned = phoneNumber.replace(/[\s-]/g, '');
  
  // Remove + if present
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  
  // Convert to +254 format
  if (cleaned.startsWith('0')) {
    return `+254${cleaned.substring(1)}`;
  } else if (cleaned.startsWith('254')) {
    return `+${cleaned}`;
  } else {
    return `+254${cleaned}`;
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

function getOTPExpiryDate(): Date {
  const expiryMinutes = 5;
  const now = new Date();
  return new Date(now.getTime() + expiryMinutes * 60 * 1000);
}

async function simulateOTPRequest() {
  try {
    console.log('🧪 Simulating OTP Request...\n');
    
    const testPhone = '0712345678';
    const purpose = 'registration';
    
    console.log(`📞 Phone: ${testPhone}`);
    console.log(`🎯 Purpose: ${purpose}`);
    console.log('─'.repeat(80));
    
    // Step 1: Validate phone number
    console.log('\n1. Validating phone number...');
    if (!validatePhoneNumber(testPhone)) {
      throw new Error('Invalid phone number format');
    }
    console.log('   ✅ Phone number valid');
    
    // Step 2: Format phone number
    const formattedPhone = formatPhoneNumber(testPhone);
    console.log(`   ✅ Formatted: ${formattedPhone}`);
    
    // Step 3: Check if user exists
    console.log('\n2. Checking for existing user...');
    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber: formattedPhone },
    });
    
    if (existingUser) {
      console.log('   ℹ️  User found:');
      console.log(`      ID: ${existingUser.id}`);
      console.log(`      Has PIN: ${existingUser.pinHash ? 'Yes' : 'No'}`);
      
      if (existingUser.pinHash) {
        throw new Error('Phone number already registered. Please login instead.');
      }
    } else {
      console.log('   ℹ️  No existing user');
    }
    
    // Step 4: Generate OTP
    console.log('\n3. Generating OTP...');
    const otp = generateOTP();
    const expiresAt = getOTPExpiryDate();
    console.log(`   ✅ OTP: ${otp}`);
    console.log(`   ✅ Expires: ${expiresAt.toISOString()}`);
    
    // Step 5: Invalidate old OTPs
    console.log('\n4. Invalidating old OTPs...');
    const invalidated = await prisma.otpLog.updateMany({
      where: {
        phoneNumber: formattedPhone,
        purpose,
        isUsed: false,
      },
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
    });
    console.log(`   ✅ Invalidated ${invalidated.count} old OTP(s)`);
    
    // Step 6: Create/find temp user
    console.log('\n5. Creating/finding temp user...');
    let tempUser = await prisma.user.findUnique({
      where: { phoneNumber: formattedPhone },
    });
    
    if (!tempUser) {
      console.log('   📝 Creating new temp user...');
      tempUser = await prisma.user.create({
        data: {
          phoneNumber: formattedPhone,
          role: 'PWD',
          phoneVerified: false,
        },
      });
      console.log(`   ✅ Created user: ${tempUser.id}`);
    } else {
      console.log(`   ✅ Using existing user: ${tempUser.id}`);
    }
    
    // Step 7: Save OTP
    console.log('\n6. Saving OTP to database...');
    const otpLog = await prisma.otpLog.create({
      data: {
        userId: tempUser.id,
        phoneNumber: formattedPhone,
        otp,
        purpose,
        expiresAt,
        ipAddress: 'test-script',
      },
    });
    console.log(`   ✅ OTP saved: ${otpLog.id}`);
    
    // Step 8: Log SMS
    console.log('\n7. Logging SMS...');
    const smsLog = await prisma.smsLog.create({
      data: {
        userId: tempUser.id,
        phoneNumber: formattedPhone,
        message: `Your HMK verification code is: ${otp}. Valid for 5 minutes.`,
        purpose: 'otp',
        status: 'sent',
      },
    });
    console.log(`   ✅ SMS logged: ${smsLog.id}`);
    
    console.log('\n' + '═'.repeat(80));
    console.log('✅ OTP Request Simulation SUCCESSFUL!');
    console.log('\n📋 Summary:');
    console.log(`   User ID: ${tempUser.id}`);
    console.log(`   OTP: ${otp}`);
    console.log(`   Expires: ${expiresAt.toLocaleString()}`);
    
  } catch (error) {
    console.error('\n❌ Error during simulation:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
      console.error('   Stack:', error.stack);
    }
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

simulateOTPRequest()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\nFatal error:', error);
    process.exit(1);
  });

