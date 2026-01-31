import { PrismaClient } from '../generated/prisma/client'
import type { Category, Challenge, Question, ChallengeFile } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = global as unknown as {
    prisma: PrismaClient
}

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_DATABASE_URL,
})

const prisma = globalForPrisma.prisma || new PrismaClient({
  adapter,
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma


export type { Category, Challenge, Question, ChallengeFile }

export interface ChallengeWithDetails extends Challenge {
  questions: Question[]
  files: ChallengeFile[]
}

// Database functions using Prisma
export async function getCategories(): Promise<Category[]> {
  return await prisma.category.findMany({
    orderBy: { name: 'asc' }
  })
}

export async function getChallenges(
  categoryId: string
): Promise<ChallengeWithDetails[]> {
  return await prisma.challenge.findMany({
    where: { categoryId },
    include: {
      questions: {
        orderBy: { id: 'asc' }
      },
      files: {
        orderBy: { id: 'asc' }
      }
    },
    orderBy: { title: 'asc' }
  })
}

export async function getChallenge(
  categoryId: string,
  slug: string
): Promise<ChallengeWithDetails | null> {
  return await prisma.challenge.findUnique({
    where: {
      categoryId_slug: {
        categoryId,
        slug
      }
    },
    include: {
      questions: {
        orderBy: { id: 'asc' }
      },
      files: {
        orderBy: { id: 'asc' }
      }
    }
  })
}

// Additional helper functions
export async function getCategoryById(id: string): Promise<Category | null> {
  return await prisma.category.findUnique({
    where: { id }
  })
}

export default prisma
