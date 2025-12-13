/**
 * Check Users Script
 * 
 * This script displays all users in the database with their registration status.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Checking all users in database...\n');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        phoneNumber: true,
        phoneVerified: true,
        pinHash: true,
        role: true,
        firstName: true,
        lastName: true,
        profileComplete: true,
        createdAt: true,
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    if (users.length === 0) {
      console.log('📭 No users found in database.');
      return;
    }
    
    console.log(`Found ${users.length} user(s):\n`);
    console.log('═'.repeat(80));
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.phoneNumber}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Name: ${user.firstName || 'N/A'} ${user.lastName || 'N/A'}`);
      console.log(`   Phone Verified: ${user.phoneVerified ? '✅' : '❌'}`);
      console.log(`   PIN Set: ${user.pinHash ? '✅' : '❌'}`);
      console.log(`   Profile Complete: ${user.profileComplete ? '✅' : '❌'}`);
      console.log(`   Active: ${user.isActive ? '✅' : '❌'}`);
      console.log(`   Created: ${user.createdAt.toLocaleString()}`);
    });
    
    console.log('\n' + '═'.repeat(80));
    
    // Show summary
    const incompleteUsers = users.filter(u => !u.pinHash);
    const completeUsers = users.filter(u => u.pinHash);
    
    console.log(`\n📊 Summary:`);
    console.log(`   Total: ${users.length}`);
    console.log(`   Complete: ${completeUsers.length}`);
    console.log(`   Incomplete: ${incompleteUsers.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

