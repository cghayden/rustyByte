import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { config } from 'dotenv'

config()

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

const categories = [
  { id: 'cryptography', name: 'Cryptography' },
  { id: 'password-cracking', name: 'Password Cracking' },
  { id: 'osint', name: 'OSINT' },
  { id: 'network-traffic', name: 'Network Traffic Analysis' },
  { id: 'exploitation-re', name: 'Exploitation and RE' },
]

async function seedCategories() {
  console.log('🌱 Seeding categories...')

  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: {},
      create: category,
    })
    console.log('✓ Created:', category.name)
  }

  console.log('✅ Categories seeded successfully!')
  await prisma.$disconnect()
}

seedCategories()
