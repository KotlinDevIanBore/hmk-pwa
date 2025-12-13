/**
 * Test Database Connection Script
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn', 'info'],
});

async function testConnection() {
  try {
    console.log('🧪 Testing database connection...\n');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    // Test query
    const userCount = await prisma.user.count();
    console.log(`📊 User count: ${userCount}`);
    
    const otpCount = await prisma.otpLog.count();
    console.log(`📊 OTP log count: ${otpCount}`);
    
    const smsCount = await prisma.smsLog.count();
    console.log(`📊 SMS log count: ${smsCount}`);
    
    console.log('\n✅ All database operations successful!');
    
  } catch (error) {
    console.error('❌ Database error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testConnection()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

