import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createBusinessTestUser() {
  const timestamp = Date.now();
  const email = `business-test-${timestamp}@example.com`;
  const password = 'TestBusiness123!';
  const name = 'Business Test User';

  console.log('Creating BUSINESS tier test user...\n');
  console.log(`Email will be: ${email}`);
  console.log(`Password will be: ${password}\n`);

  try {
    // Hash password using bcryptjs
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Create user with all required relationships
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        verified: true, // Skip email verification
        role: 'USER',
        authProviders: {
          create: {
            provider: 'EMAIL',
            providerId: email, // Use email as providerId for EMAIL provider
          },
        },
        subscription: {
          create: {
            plan: 'BUSINESS',
            status: 'active',
            startDate: new Date(),
            endDate: null, // Active subscription
            nextBilledAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            scheduledToBeCancelled: false,
          },
        },
        usage: {
          create: {
            linksCount: 0,
            linksLimit: 1000, // BUSINESS tier limits
            clicksCount: 0,
            clicksLimit: 100000, // BUSINESS tier limits
          },
        },
      },
      include: {
        subscription: true,
        usage: true,
        authProviders: true,
      },
    });

    console.log('✓ Test user created successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('USER CREDENTIALS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('USER DETAILS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`User ID:  ${user.id}`);
    console.log(`Name:     ${user.name}`);
    console.log(`Role:     ${user.role}`);
    console.log(`Verified: ${user.verified}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('SUBSCRIPTION DETAILS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Plan:          ${user.subscription.plan}`);
    console.log(`Status:        ${user.subscription.status}`);
    console.log(`Start Date:    ${user.subscription.startDate.toISOString()}`);
    console.log(`Next Billing:  ${user.subscription.nextBilledAt?.toISOString() || 'N/A'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('USAGE LIMITS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Links:  ${user.usage.linksCount}/${user.usage.linksLimit}`);
    console.log(`Clicks: ${user.usage.clicksCount}/${user.usage.clicksLimit}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return {
      email,
      password,
      userId: user.id,
    };
  } catch (error) {
    console.error('Error creating test user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createBusinessTestUser()
  .then((credentials) => {
    console.log('Next steps:');
    console.log('1. Ensure backend is running on http://localhost:3000');
    console.log('2. Ensure frontend is running on http://localhost:4200');
    console.log('3. Login with the credentials above');
    console.log('\nCredentials for copy-paste:');
    console.log(`${credentials.email}`);
    console.log(`${credentials.password}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to create test user:', error.message);
    process.exit(1);
  });
