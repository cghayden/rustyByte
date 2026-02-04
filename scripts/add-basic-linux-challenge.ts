import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

if (!process.env.DIRECT_DATABASE_URL) {
  console.error('❌ DIRECT_DATABASE_URL is required');
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function addBasicLinuxChallenge() {
  try {
    // Get the first admin user to use as author
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (!adminUser) {
      console.error('❌ No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    // Check if terminal category exists, create if not
    let terminalCategory = await prisma.category.findUnique({
      where: { id: 'terminal' },
    });

    if (!terminalCategory) {
      terminalCategory = await prisma.category.create({
        data: {
          id: 'terminal',
          name: 'Terminal Challenges',
        },
      });
      console.log('Created "Terminal Challenges" category');
    }

    // Check if challenge already exists
    const existingChallenge = await prisma.challenge.findUnique({
      where: {
        categoryId_slug: {
          categoryId: 'terminal',
          slug: 'basic-linux',
        },
      },
    });

    if (existingChallenge) {
      console.log('Challenge "basic-linux" already exists');
      return;
    }

    // Create the challenge
    const challenge = await prisma.challenge.create({
      data: {
        categoryId: 'terminal',
        authorId: adminUser.id,
        slug: 'basic-linux',
        title: 'Basic Linux Terminal',
        prompt: `Welcome to the Basic Linux Terminal challenge!

This challenge provides you with a basic Alpine Linux environment. Use the terminal below to explore and complete the tasks.

Your goal: Familiarize yourself with basic Linux commands.

Try these commands:
- ls (list files)
- pwd (print working directory)
- whoami (check your username)
- echo "Hello World"
- cat /etc/os-release (check the OS version)`,
        dockerImage: 'ctf-alpine-terminal:latest',
      },
    });

    console.log('✅ Successfully created challenge:', challenge.title);
    console.log(`   Category: ${challenge.categoryId}`);
    console.log(`   Slug: ${challenge.slug}`);
    console.log(`   Docker Image: ${challenge.dockerImage}`);
  } catch (error) {
    console.error('Error creating challenge:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addBasicLinuxChallenge();
