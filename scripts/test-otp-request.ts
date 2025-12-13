/**
 * Test OTP Request Script
 * 
 * This script tests the OTP request functionality directly
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testOTPRequest() {
  try {
    console.log('🧪 Testing OTP Request System...\n');
    
    const testPhone = '+254712345678';
    
    console.log(`📞 Test phone: ${testPhone}`);
    console.log('─'.repeat(80));
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber: testPhone },
    });
    
    console.log('\n1. Database Check:');
    if (existingUser) {
      console.log(`   ✅ User exists`);
      console.log(`   - ID: ${existingUser.id}`);
      console.log(`   - Phone Verified: ${existingUser.phoneVerified}`);
      console.log(`   - Has PIN: ${existingUser.pinHash ? 'Yes' : 'No'}`);
      console.log(`   - Profile Complete: ${existingUser.profileComplete}`);
    } else {
      console.log(`   ℹ️  No existing user`);
    }
    
    // Check OTP logs
    const otpLogs = await prisma.otpLog.findMany({
      where: { phoneNumber: testPhone },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    
    console.log('\n2. Recent OTP Logs:');
    if (otpLogs.length === 0) {
      console.log('   ℹ️  No OTP logs found');
    } else {
      otpLogs.forEach((log, index) => {
        console.log(`   ${index + 1}. ${log.otp} - ${log.purpose}`);
        console.log(`      Used: ${log.isUsed ? 'Yes' : 'No'}`);
        console.log(`      Expires: ${log.expiresAt.toLocaleString()}`);
        console.log(`      Created: ${log.createdAt.toLocaleString()}`);
      });
    }
    
    // Check SMS logs
    const smsLogs = await prisma.smsLog.findMany({
      where: { phoneNumber: testPhone },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });
    
    console.log('\n3. Recent SMS Logs:');
    if (smsLogs.length === 0) {
      console.log('   ℹ️  No SMS logs found');
    } else {
      smsLogs.forEach((log, index) => {
        console.log(`   ${index + 1}. ${log.purpose} - ${log.status}`);
        console.log(`      ${log.message.substring(0, 50)}...`);
        console.log(`      Sent: ${log.createdAt.toLocaleString()}`);
      });
    }
    
    console.log('\n' + '─'.repeat(80));
    console.log('✅ Test completed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testOTPRequest()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

