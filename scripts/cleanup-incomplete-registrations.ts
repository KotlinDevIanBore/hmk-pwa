/**
 * Cleanup Script for Incomplete User Registrations
 * 
 * This script removes user records that were created during OTP request
 * but never completed the full registration process (no PIN set).
 * 
 * Usage:
 *   npx tsx scripts/cleanup-incomplete-registrations.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupIncompleteRegistrations() {
  try {
    console.log('🔍 Searching for incomplete user registrations...\n');
    
    // Find users without a PIN hash (incomplete registrations)
    const incompleteUsers = await prisma.user.findMany({
      where: {
        pinHash: null,
        phoneVerified: false,
      },
      select: {
        id: true,
        phoneNumber: true,
        createdAt: true,
        role: true,
      },
    });
    
    if (incompleteUsers.length === 0) {
      console.log('✅ No incomplete registrations found.');
      return;
    }
    
    console.log(`Found ${incompleteUsers.length} incomplete registration(s):\n`);
    
    incompleteUsers.forEach((user, index) => {
      console.log(`${index + 1}. Phone: ${user.phoneNumber}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Created: ${user.createdAt.toLocaleString()}\n`);
    });
    
    // Delete incomplete users and their associated data
    const deletedOtpLogs = await prisma.otpLog.deleteMany({
      where: {
        userId: {
          in: incompleteUsers.map(u => u.id),
        },
      },
    });
    
    const deletedSmsLogs = await prisma.smsLog.deleteMany({
      where: {
        userId: {
          in: incompleteUsers.map(u => u.id),
        },
      },
    });
    
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        id: {
          in: incompleteUsers.map(u => u.id),
        },
      },
    });
    
    console.log('📊 Cleanup Results:');
    console.log(`   - Deleted ${deletedUsers.count} user record(s)`);
    console.log(`   - Deleted ${deletedOtpLogs.count} OTP log(s)`);
    console.log(`   - Deleted ${deletedSmsLogs.count} SMS log(s)`);
    console.log('\n✅ Cleanup completed successfully!');
    console.log('\n💡 Users can now retry registration with their phone numbers.');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupIncompleteRegistrations()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

