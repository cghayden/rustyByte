// scripts/add-terminal-challenge.ts
import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Check for required environment variable
if (!process.env.DIRECT_DATABASE_URL) {
  console.error('❌ DIRECT_DATABASE_URL environment variable is required');
  console.error('Current env:', process.env.DIRECT_DATABASE_URL);
  process.exit(1);
}

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function addTerminalChallenge() {
  console.log('🖥️  Adding terminal-based challenge...');

  try {
    // Get the first admin user to use as author
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (!adminUser) {
      console.error('❌ No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    // Make sure we have a terminal category
    await prisma.category.upsert({
      where: { id: 'terminal' },
      update: {},
      create: {
        id: 'terminal',
        name: 'Terminal Challenges',
      },
    });

    // Add the basic Linux challenge
    const challenge = await prisma.challenge.upsert({
      where: {
        categoryId_slug: {
          categoryId: 'terminal',
          slug: 'basic-linux',
        },
      },
      update: {
        dockerImage: 'ctf-basic-linux',
      },
      create: {
        slug: 'basic-linux',
        title: 'Basic Linux Terminal',
        prompt: `Welcome to your first terminal challenge!

In this challenge, you'll get access to a real Linux terminal where you can practice basic commands and find a hidden flag.

**Your Mission:**
Navigate through the filesystem, explore directories, and find the hidden flag somewhere in the system.

**Useful Commands:**
- \`ls\` - list files and directories
- \`cd <directory>\` - change directory
- \`cat <file>\` - display file contents  
- \`find <path> -name "<pattern>"\` - search for files
- \`grep "<text>" <file>\` - search inside files

Click "Start Terminal" below to launch your dedicated Linux environment!`,
        categoryId: 'terminal',
        authorId: adminUser.id,
        dockerImage: 'ctf-basic-linux',
      },
    });

    // Add a sample question for the challenge (create or update existing)
    const existingQuestion = await prisma.question.findFirst({
      where: {
        challengeId: challenge.id,
        questionId: 'find-flag',
      },
    });

    if (existingQuestion) {
      await prisma.question.update({
        where: { id: existingQuestion.id },
        data: {
          challengeQuestion: 'What is the hidden flag in the system?',
          answers: ['CTF{this_is_a_sample_flag}'],
        },
      });
    } else {
      await prisma.question.create({
        data: {
          questionId: 'find-flag',
          challengeQuestion: 'What is the hidden flag in the system?',
          answers: ['CTF{this_is_a_sample_flag}'],
          challengeId: challenge.id,
        },
      });
    }

    console.log('✅ Terminal challenge added successfully!');
    console.log(`   Challenge ID: ${challenge.id}`);
    console.log(`   Title: ${challenge.title}`);
    console.log(`   Docker Image: ${challenge.dockerImage}`);
  } catch (error) {
    console.error('❌ Error adding terminal challenge:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTerminalChallenge();
