// scripts/seed-users.ts
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function seedUsers() {
  console.log('🌱 Seeding users...');

  try {
    // Create some test users with hashed passwords
    const users = await prisma.user.createMany({
      data: [
        {
          email: 'alice@example.com',
          username: 'alice_hacker',
          password:
            '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4alwz5VKyS', // "password"
        },
        {
          email: 'bob@example.com',
          username: 'bob_security',
          password:
            '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4alwz5VKyS', // "password"
        },
        {
          email: 'charlie@example.com',
          username: 'charlie_dev',
          password:
            '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4alwz5VKyS', // "password"
        },
      ],
      skipDuplicates: true, // Skip if users already exist
    });

    console.log(`✅ Created ${users.count} users`);

    // Display all users
    const allUsers = await prisma.user.findMany();
    console.log('\n📋 All users:');
    allUsers.forEach((user) => {
      console.log(`  - ${user.username} (${user.email}) - ID: ${user.id}`);
    });
  } catch (error) {
    console.error('❌ Error seeding users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedUsers();
