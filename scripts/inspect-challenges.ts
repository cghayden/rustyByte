import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

if (!process.env.DIRECT_DATABASE_URL) {
  console.error('❌ DIRECT_DATABASE_URL is required')
  process.exit(1)
}

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function inspectChallenges() {
  try {
    const challenges = await prisma.challenge.findMany({
      include: {
        category: true,
        files: true,
        questions: true,
      },
      orderBy: [{ categoryId: 'asc' }, { slug: 'asc' }],
    })

    console.log(`\n📋 Found ${challenges.length} challenge(s)\n`)

    for (const challenge of challenges) {
      console.log(`┌─ Challenge: ${challenge.title}`)
      console.log(`│  ID: ${challenge.id}`)
      console.log(`│  Slug: ${challenge.slug}`)
      console.log(`│  Category: ${challenge.category.name} (${challenge.categoryId})`)
      console.log(`│  Docker Image: ${challenge.dockerImage || '(none)'}`)
      console.log(`│  Created: ${challenge.createdAt?.toISOString() || '(unknown)'}`)
      
      if (challenge.files.length > 0) {
        console.log(`│`)
        console.log(`│  📁 Files (${challenge.files.length}):`)
        challenge.files.forEach((file, idx) => {
          console.log(`│     ${idx + 1}. ${file.name} (${file.mimeType || 'unknown type'})`)
          console.log(`│        Filename: ${file.filename}`)
          console.log(`│        Path: ${file.filePath || '(not set)'}`)
          console.log(`│        Size: ${file.fileSize || '?'} bytes`)
          if (file.description) {
            console.log(`│        Description: ${file.description}`)
          }
        })
      } else {
        console.log(`│  📁 Files: (none)`)
      }

      if (challenge.questions.length > 0) {
        console.log(`│`)
        console.log(`│  ❓ Questions (${challenge.questions.length}):`)
        challenge.questions.forEach((q, idx) => {
          console.log(`│     ${idx + 1}. ${q.challengeQuestion}`)
          console.log(`│        Answers: ${q.answers.join(', ')}`)
        })
      } else {
        console.log(`│  ❓ Questions: (none)`)
      }

      console.log(`└─`)
      console.log()
    }

    console.log('✅ Done\n')
  } catch (err) {
    console.error('❌ Error:', err)
  } finally {
    await prisma.$disconnect()
  }
}

inspectChallenges()
