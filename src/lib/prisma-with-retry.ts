import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create a Prisma client with connection retry logic
function createPrismaClient() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['error', 'warn'] 
      : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

  // Add middleware for retry logic
  client.$use(async (params, next) => {
    const maxRetries = 3
    const retryDelay = 1000 // Start with 1 second delay
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await next(params)
      } catch (error: any) {
        // Check if it's a connection error
        if (
          error.code === 'P1001' || // Can't reach database server
          error.code === 'P1002' || // Database server timeout
          error.code === 'P1008' || // Operations timed out
          error.code === 'P1017'    // Server has closed the connection
        ) {
          console.warn(`Database connection error (attempt ${i + 1}/${maxRetries}):`, error.message)
          
          if (i < maxRetries - 1) {
            // Exponential backoff
            const delay = retryDelay * Math.pow(2, i)
            console.log(`Retrying in ${delay}ms...`)
            await new Promise(resolve => setTimeout(resolve, delay))
            continue
          }
        }
        
        // If not a connection error or max retries reached, throw the error
        throw error
      }
    }
  })

  return client
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Connection health check utility
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database connection check failed:', error)
    return false
  }
}

// Graceful shutdown
export async function disconnectPrisma() {
  await prisma.$disconnect()
}

// Handle process termination
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await disconnectPrisma()
  })
}