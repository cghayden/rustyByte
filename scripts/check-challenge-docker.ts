// scripts/check-challenge-docker.ts
import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function checkChallenge() {
  try {
    const challenges = await prisma.challenge.findMany({
      where: {
        categoryId: 'terminal'
      },
      select: {
        id: true,
        slug: true,
        title: true,
        dockerImage: true,
        categoryId: true,
      }
    });

    console.log('Terminal Challenges:');
    console.log(JSON.stringify(challenges, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkChallenge();
