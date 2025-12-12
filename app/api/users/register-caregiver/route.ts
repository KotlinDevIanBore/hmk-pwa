/**
 * Caregiver Registration API Route
 * POST /api/users/register-caregiver
 * Complete registration for caregivers with optional beneficiary setup
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPin } from '@/lib/auth';
import { createSession } from '@/lib/session';
import {
  caregiverRegistrationSchema,
  normalizePhoneNumber,
  calculateAge,
} from '@/lib/validation';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate request data
    const validation = caregiverRegistrationSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }
    
    const data = validation.data;
    
    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(data.phoneNumber);
    
    // Check if phone number already exists
    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber: normalizedPhone },
    });
    
    if (existingUser && existingUser.pinHash) {
      return NextResponse.json(
        { error: 'Phone number already registered' },
        { status: 409 }
      );
    }
    
    // Check if ID number already exists (if provided)
    if (data.idNumber) {
      const existingIdUser = await prisma.user.findFirst({
        where: {
          idType: data.idType,
          idNumber: data.idNumber,
        },
      });
      
      if (existingIdUser) {
        return NextResponse.json(
          { error: 'ID number already registered' },
          { status: 409 }
        );
      }
    }
    
    // Hash PIN
    const pinHash = await hashPin(data.pin);
    
    // Calculate age from date of birth if provided
    const age = data.dateOfBirth ? calculateAge(data.dateOfBirth) : data.age;
    
    // Use transaction for caregiver + beneficiary creation
    const result = await prisma.$transaction(async (tx) => {
      // Create or update caregiver user
      let caregiver;
      if (existingUser) {
        // Update existing user (from OTP verification)
        caregiver = await tx.user.update({
          where: { id: existingUser.id },
          data: {
            pinHash,
            role: 'CAREGIVER',
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            age,
            dateOfBirth: data.dateOfBirth,
            gender: data.gender,
            county: data.county,
            subCounty: data.subCounty,
            ward: data.ward,
            village: data.village,
            idType: data.idType,
            idNumber: data.idNumber,
            phoneVerified: true,
            profileComplete: true,
            lastLogin: new Date(),
          },
        });
      } else {
        // Create new user
        caregiver = await tx.user.create({
          data: {
            phoneNumber: normalizedPhone,
            pinHash,
            role: 'CAREGIVER',
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            age,
            dateOfBirth: data.dateOfBirth,
            gender: data.gender,
            county: data.county,
            subCounty: data.subCounty,
            ward: data.ward,
            village: data.village,
            idType: data.idType,
            idNumber: data.idNumber,
            phoneVerified: true,
            profileComplete: true,
          },
        });
      }
      
      // Create beneficiary (PWD) if provided
      let beneficiary = null;
      let beneficiaryLink = null;
      
      if (data.registeringForBeneficiary && data.beneficiary) {
        const beneficiaryData = data.beneficiary;
        const beneficiaryAge = beneficiaryData.dateOfBirth
          ? calculateAge(beneficiaryData.dateOfBirth)
          : beneficiaryData.age;
        
        // Normalize beneficiary phone number if provided
        const beneficiaryPhone = beneficiaryData.phoneNumber
          ? normalizePhoneNumber(beneficiaryData.phoneNumber)
          : `${normalizedPhone}_beneficiary_${Date.now()}`; // Generate unique placeholder if no phone
        
        // Check if beneficiary phone already exists
        const existingBeneficiary = beneficiaryData.phoneNumber
          ? await tx.user.findUnique({
              where: { phoneNumber: beneficiaryPhone },
            })
          : null;
        
        if (existingBeneficiary) {
          // Link to existing PWD
          beneficiary = existingBeneficiary;
        } else {
          // Create new PWD user
          beneficiary = await tx.user.create({
            data: {
              phoneNumber: beneficiaryPhone,
              role: 'PWD',
              firstName: beneficiaryData.firstName,
              lastName: beneficiaryData.lastName,
              age: beneficiaryAge,
              dateOfBirth: beneficiaryData.dateOfBirth,
              gender: beneficiaryData.gender,
              disabilityType: beneficiaryData.disabilityType,
              phoneVerified: false, // Beneficiary needs to verify later
              profileComplete: false, // Beneficiary can complete profile later
            },
          });
        }
        
        // Create beneficiary relationship
        beneficiaryLink = await tx.beneficiary.create({
          data: {
            caregiverId: caregiver.id,
            pwdId: beneficiary.id,
            relationship: beneficiaryData.relationship,
            isVerified: false, // Requires admin or PWD verification
          },
        });
      }
      
      return { caregiver, beneficiary, beneficiaryLink };
    });
    
    // Create session for caregiver
    await createSession(result.caregiver.id, result.caregiver.phoneNumber, result.caregiver.role);
    
    // Log SMS welcome message
    await prisma.smsLog.create({
      data: {
        userId: result.caregiver.id,
        phoneNumber: result.caregiver.phoneNumber,
        message: `Welcome to HMK, ${data.firstName}! Your caregiver registration is complete.${
          result.beneficiary
            ? ` You have been linked to ${result.beneficiary.firstName} ${result.beneficiary.lastName}.`
            : ''
        }`,
        purpose: 'notification',
        status: 'sent',
      },
    });
    
    // Send SMS to beneficiary if phone number provided
    if (result.beneficiary && data.beneficiary?.phoneNumber) {
      await prisma.smsLog.create({
        data: {
          userId: result.beneficiary.id,
          phoneNumber: result.beneficiary.phoneNumber,
          message: `${data.firstName} ${data.lastName} has registered as your caregiver on HMK. Please verify this relationship by logging in.`,
          purpose: 'notification',
          status: 'sent',
        },
      });
    }
    
    return NextResponse.json(
      {
        success: true,
        message: 'Caregiver registration completed successfully',
        caregiver: {
          id: result.caregiver.id,
          phoneNumber: result.caregiver.phoneNumber,
          role: result.caregiver.role,
          firstName: result.caregiver.firstName,
          lastName: result.caregiver.lastName,
          profileComplete: result.caregiver.profileComplete,
        },
        beneficiary: result.beneficiary
          ? {
              id: result.beneficiary.id,
              firstName: result.beneficiary.firstName,
              lastName: result.beneficiary.lastName,
              relationship: data.beneficiary?.relationship,
              isVerified: result.beneficiaryLink?.isVerified,
            }
          : null,
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Caregiver registration error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}

