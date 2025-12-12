import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create Admin Users
  console.log('Creating admin users...');
  const passwordHash = await bcrypt.hash('admin123', 10);
  
  const superAdmin = await prisma.adminUser.upsert({
    where: { email: 'admin@hmk.org' },
    update: {},
    create: {
      email: 'admin@hmk.org',
      passwordHash,
      role: 'SUPER_ADMIN',
      firstName: 'Super',
      lastName: 'Admin',
      isActive: true,
    },
  });

  const supportUser = await prisma.adminUser.upsert({
    where: { email: 'support@hmk.org' },
    update: {},
    create: {
      email: 'support@hmk.org',
      passwordHash,
      role: 'SUPPORT',
      firstName: 'Support',
      lastName: 'User',
      isActive: true,
    },
  });

  console.log(`Created admin users: ${superAdmin.email}, ${supportUser.email}`);

  // Create Sample PWD Users
  console.log('Creating sample PWD users...');
  const pwd1 = await prisma.user.create({
    data: {
      phoneNumber: '+254712345678',
      phoneVerified: true,
      pinHash: await bcrypt.hash('1234', 10),
      role: 'PWD',
      disabilityType: 'MOBILITY',
      firstName: 'John',
      lastName: 'Doe',
      county: 'Nairobi',
      subCounty: 'Westlands',
      profileComplete: true,
      preferredLanguage: 'en',
    },
  });

  const pwd2 = await prisma.user.create({
    data: {
      phoneNumber: '+254723456789',
      phoneVerified: true,
      pinHash: await bcrypt.hash('1234', 10),
      role: 'PWD',
      disabilityType: 'VISUAL',
      firstName: 'Mary',
      lastName: 'Kamau',
      county: 'Nairobi',
      subCounty: 'Dagoretti',
      profileComplete: true,
      preferredLanguage: 'sw',
    },
  });

  console.log(`Created PWD users: ${pwd1.phoneNumber}, ${pwd2.phoneNumber}`);

  // Create Sample Caregiver
  console.log('Creating sample caregiver...');
  const caregiver = await prisma.user.create({
    data: {
      phoneNumber: '+254734567890',
      phoneVerified: true,
      pinHash: await bcrypt.hash('1234', 10),
      role: 'CAREGIVER',
      firstName: 'Jane',
      lastName: 'Wanjiku',
      county: 'Nairobi',
      subCounty: 'Westlands',
      profileComplete: true,
      preferredLanguage: 'en',
    },
  });

  // Link caregiver to PWD
  await prisma.beneficiary.create({
    data: {
      caregiverId: caregiver.id,
      pwdId: pwd1.id,
      relationship: 'PARENT',
      isVerified: true,
    },
  });

  console.log(`Created caregiver: ${caregiver.phoneNumber}`);

  // Create Mobility Devices - Comprehensive catalog
  console.log('Creating mobility devices catalog...');
  const devices = [
    // Wheelchairs
    {
      name: 'Standard Manual Wheelchair',
      description: 'Basic manual wheelchair with adjustable footrests and armrests. Suitable for daily use.',
      category: 'wheelchair',
      price: 15000,
      availability: true,
      specifications: {
        weight: '15kg',
        capacity: '120kg',
        width: '65cm',
        seatWidth: '40cm',
        frame: 'Steel',
        wheels: '24 inch',
      },
    },
    {
      name: 'Lightweight Wheelchair',
      description: 'Ultra-lightweight aluminum wheelchair for easy transport and maneuverability',
      category: 'wheelchair',
      price: 25000,
      availability: true,
      specifications: {
        weight: '10kg',
        capacity: '100kg',
        width: '60cm',
        seatWidth: '38cm',
        frame: 'Aluminum',
        wheels: '22 inch',
      },
    },
    {
      name: 'Heavy Duty Wheelchair',
      description: 'Reinforced wheelchair for users up to 200kg with extra-wide seat',
      category: 'wheelchair',
      price: 30000,
      availability: true,
      specifications: {
        weight: '20kg',
        capacity: '200kg',
        width: '75cm',
        seatWidth: '50cm',
        frame: 'Steel reinforced',
        wheels: '26 inch',
      },
    },
    {
      name: 'Sports Wheelchair',
      description: 'Lightweight sports wheelchair with cambered wheels for active users',
      category: 'wheelchair',
      price: 45000,
      availability: false,
      specifications: {
        weight: '8kg',
        capacity: '90kg',
        width: '55cm',
        frame: 'Titanium',
        wheels: '24 inch cambered',
      },
    },
    // Walkers
    {
      name: 'Standard Folding Walker',
      description: 'Lightweight aluminum walker with height adjustment and foldable design',
      category: 'walker',
      price: 5000,
      availability: true,
      specifications: {
        weight: '2.5kg',
        capacity: '135kg',
        adjustable: true,
        heightRange: '80-100cm',
        frame: 'Aluminum',
      },
    },
    {
      name: 'Rollator Walker with Seat',
      description: 'Walker with wheels, brakes, and built-in seat for resting',
      category: 'walker',
      price: 12000,
      availability: true,
      specifications: {
        weight: '6kg',
        capacity: '120kg',
        wheels: '4 wheels with brakes',
        seat: 'Yes',
        basket: 'Yes',
      },
    },
    {
      name: 'Knee Walker',
      description: 'Knee scooter for lower leg injuries, non-weight bearing support',
      category: 'walker',
      price: 15000,
      availability: true,
      specifications: {
        weight: '5kg',
        capacity: '150kg',
        wheels: '4 wheels',
        kneePad: 'Adjustable',
      },
    },
    // Crutches
    {
      name: 'Elbow Crutches (Pair)',
      description: 'Adjustable elbow crutches with ergonomic grips and height adjustment',
      category: 'crutches',
      price: 3500,
      availability: true,
      specifications: {
        weight: '1kg per crutch',
        capacity: '100kg',
        adjustable: true,
        heightRange: '100-150cm',
        material: 'Aluminum',
      },
    },
    {
      name: 'Underarm Crutches (Pair)',
      description: 'Traditional underarm crutches with padded armrests',
      category: 'crutches',
      price: 3000,
      availability: true,
      specifications: {
        weight: '1.2kg per crutch',
        capacity: '120kg',
        adjustable: true,
        heightRange: '110-160cm',
        material: 'Aluminum',
      },
    },
    {
      name: 'Forearm Crutches with Ergonomic Grip',
      description: 'Premium forearm crutches with contoured grips and shock absorbers',
      category: 'crutches',
      price: 6000,
      availability: true,
      specifications: {
        weight: '0.8kg per crutch',
        capacity: '110kg',
        adjustable: true,
        shockAbsorber: 'Yes',
        material: 'Carbon fiber',
      },
    },
    // Prosthetics
    {
      name: 'Below Knee Prosthetic',
      description: 'Custom-fitted below knee prosthetic limb with socket and foot',
      category: 'prosthetics',
      price: 45000,
      availability: false,
      specifications: {
        type: 'below-knee',
        customFitted: true,
        socket: 'Custom',
        foot: 'Dynamic',
        weight: '1.5kg',
      },
    },
    {
      name: 'Above Knee Prosthetic',
      description: 'Custom-fitted above knee prosthetic with knee joint and foot',
      category: 'prosthetics',
      price: 75000,
      availability: false,
      specifications: {
        type: 'above-knee',
        customFitted: true,
        socket: 'Custom',
        knee: 'Mechanical',
        foot: 'Dynamic',
        weight: '2.5kg',
      },
    },
    {
      name: 'Transradial Prosthetic',
      description: 'Below elbow prosthetic arm with functional hand',
      category: 'prosthetics',
      price: 60000,
      availability: false,
      specifications: {
        type: 'transradial',
        customFitted: true,
        socket: 'Custom',
        hand: 'Functional',
        weight: '1.2kg',
      },
    },
    // Orthotics
    {
      name: 'Ankle Foot Orthosis (AFO)',
      description: 'Custom-molded AFO for foot drop and ankle instability',
      category: 'orthotics',
      price: 15000,
      availability: true,
      specifications: {
        type: 'AFO',
        customFitted: true,
        material: 'Polypropylene',
        weight: '0.5kg',
        side: 'Left or Right',
      },
    },
    {
      name: 'Knee Ankle Foot Orthosis (KAFO)',
      description: 'Full leg brace for knee and ankle support',
      category: 'orthotics',
      price: 25000,
      availability: true,
      specifications: {
        type: 'KAFO',
        customFitted: true,
        material: 'Carbon fiber',
        weight: '1.2kg',
        side: 'Left or Right',
      },
    },
    {
      name: 'Spinal Orthosis (TLSO)',
      description: 'Thoracic Lumbar Sacral Orthosis for spinal support',
      category: 'orthotics',
      price: 35000,
      availability: true,
      specifications: {
        type: 'TLSO',
        customFitted: true,
        material: 'Plastic',
        weight: '1.5kg',
        coverage: 'Torso',
      },
    },
    {
      name: 'Wrist Hand Orthosis (WHO)',
      description: 'Custom wrist and hand brace for support and positioning',
      category: 'orthotics',
      price: 8000,
      availability: true,
      specifications: {
        type: 'WHO',
        customFitted: true,
        material: 'Thermoplastic',
        weight: '0.3kg',
        side: 'Left or Right',
      },
    },
    // Additional devices
    {
      name: 'Cane - Standard',
      description: 'Single point cane with ergonomic handle',
      category: 'crutches',
      price: 1500,
      availability: true,
      specifications: {
        weight: '0.3kg',
        capacity: '100kg',
        adjustable: true,
        material: 'Aluminum',
      },
    },
    {
      name: 'Quad Cane',
      description: 'Four-point base cane for enhanced stability',
      category: 'crutches',
      price: 2500,
      availability: true,
      specifications: {
        weight: '0.5kg',
        capacity: '120kg',
        adjustable: true,
        base: '4-point',
        material: 'Aluminum',
      },
    },
  ];

  // Clear existing devices first (optional - comment out if you want to keep existing data)
  // await prisma.mobilityDevice.deleteMany({});

  for (const device of devices) {
    try {
      await prisma.mobilityDevice.create({ data: device });
    } catch (error) {
      // Device might already exist, skip
      console.log(`Device ${device.name} might already exist, skipping...`);
    }
  }

  console.log(`Created/Updated ${devices.length} mobility devices`);

  // Create Outreach Locations
  console.log('Creating outreach locations...');
  const locations = [
    {
      name: 'Nairobi Community Center',
      county: 'Nairobi',
      subCounty: 'Westlands',
      ward: 'Kangemi',
      description: 'Main outreach center in Nairobi',
      address: 'Waiyaki Way, Kangemi',
      contactName: 'Peter Omondi',
      contactPhone: '+254700123456',
      isActive: true,
    },
    {
      name: 'Kisumu Regional Office',
      county: 'Kisumu',
      subCounty: 'Kisumu Central',
      description: 'Regional office serving Nyanza region',
      address: 'Oginga Odinga Street',
      contactName: 'Grace Atieno',
      contactPhone: '+254700234567',
      isActive: true,
    },
    {
      name: 'Mombasa Service Point',
      county: 'Mombasa',
      subCounty: 'Mvita',
      description: 'Coastal region service point',
      address: 'Moi Avenue',
      contactName: 'Hassan Mohammed',
      contactPhone: '+254700345678',
      isActive: true,
    },
  ];

  for (const location of locations) {
    await prisma.outreachLocation.create({ data: location });
  }

  console.log(`Created ${locations.length} outreach locations`);

  // Create Sample Appointments
  console.log('Creating sample appointments...');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Ensure tomorrow is a valid day (Tuesday or Thursday for Resource Center)
  const validDate = new Date(tomorrow);
  const dayOfWeek = validDate.getDay();
  if (dayOfWeek !== 2 && dayOfWeek !== 4) {
    // If not Tuesday (2) or Thursday (4), move to next Tuesday
    const daysUntilTuesday = (2 - dayOfWeek + 7) % 7 || 7;
    validDate.setDate(validDate.getDate() + daysUntilTuesday);
  }

  await prisma.appointment.create({
    data: {
      userId: pwd1.id,
      appointmentDate: validDate,
      appointmentTime: '10:00',
      locationType: 'RESOURCE_CENTER',
      location: 'Resource Center',
      purpose: 'Wheelchair fitting',
      status: 'CONFIRMED',
      ageGroup: '15+',
    },
  });

  const validDate2 = new Date(validDate);
  validDate2.setDate(validDate2.getDate() + 2); // Thursday

  await prisma.appointment.create({
    data: {
      userId: pwd2.id,
      appointmentDate: validDate2,
      appointmentTime: '14:00',
      locationType: 'RESOURCE_CENTER',
      location: 'Resource Center',
      purpose: 'Disability assessment',
      status: 'PENDING',
      ageGroup: '<15',
    },
  });

  console.log('Created sample appointments');

  // Create Sample Service Requests
  console.log('Creating sample service requests...');
  await prisma.serviceRequest.create({
    data: {
      userId: pwd1.id,
      serviceType: 'OPERATIONAL',
      title: 'Wheelchair Repair',
      description: 'Left wheel needs replacement',
      status: 'PENDING',
      priority: 'high',
    },
  });

  await prisma.serviceRequest.create({
    data: {
      userId: pwd2.id,
      serviceType: 'SPIRITUAL',
      title: 'Counseling Session',
      description: 'Request for spiritual counseling',
      status: 'IN_PROGRESS',
      priority: 'medium',
    },
  });

  console.log('Created sample service requests');

  // Create Sample Assessment
  console.log('Creating sample assessment...');
  await prisma.assessment.create({
    data: {
      userId: pwd1.id,
      status: 'SUBMITTED',
      responses: {
        mobilityLevel: 'wheelchair_dependent',
        assistanceNeeded: ['dressing', 'bathing'],
        communicationAbility: 'normal',
        visionStatus: 'normal',
        hearingStatus: 'normal',
      },
      score: 65,
      submittedAt: new Date(),
    },
  });

  console.log('Created sample assessment');

  console.log('✅ Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


