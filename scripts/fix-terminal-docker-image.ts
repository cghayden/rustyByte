// scripts/fix-terminal-docker-image.ts
import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function fixDockerImage() {
  try {
    // Update all terminal challenges to use the correct Docker image
    const result = await prisma.challenge.updateMany({
      where: {
        categoryId: 'terminal'
      },
      data: {
        dockerImage: 'ctf-alpine-terminal:latest'
      }
    });

    console.log(`✅ Updated ${result.count} challenge(s) to use ctf-alpine-terminal:latest`);
    
    // Show updated challenges
    const challenges = await prisma.challenge.findMany({
      where: {
        categoryId: 'terminal'
      },
      select: {
        slug: true,
        title: true,
        dockerImage: true,
      }
    });

    console.log('\nUpdated challenges:');
    challenges.forEach(c => {
      console.log(`  - ${c.slug}: ${c.dockerImage}`);
    });
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDockerImage();
