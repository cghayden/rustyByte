// scripts/list-challenges.ts
import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function listChallenges() {
  console.log('📋 Current challenges in database:\n');

  try {
    const challenges = await prisma.challenge.findMany({
      include: {
        category: true,
        questions: true,
        _count: {
          select: {
            questions: true,
            instances: true,
          },
        },
      },
      orderBy: [{ categoryId: 'asc' }, { title: 'asc' }],
    });

    if (challenges.length === 0) {
      console.log('No challenges found in database.');
      return;
    }

    challenges.forEach((challenge, index) => {
      console.log(`${index + 1}. ${challenge.title}`);
      console.log(`   Category: ${challenge.category.name}`);
      console.log(`   Slug: ${challenge.categoryId}/${challenge.slug}`);
      console.log(
        `   URL: http://localhost:3000/${challenge.categoryId}/${challenge.slug}`
      );
      console.log(`   Questions: ${challenge._count.questions}`);
      console.log(`   Docker Image: ${challenge.dockerImage || 'None'}`);
      console.log(`   Active Instances: ${challenge._count.instances}`);
      console.log(`   Created: ${challenge.createdAt.toLocaleDateString()}\n`);
    });
  } catch (error) {
    console.error('❌ Error listing challenges:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listChallenges();
