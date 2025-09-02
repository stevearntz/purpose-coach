import { PrismaClient } from '@prisma/client';

declare global {
  // Allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
  
  // Add middleware for automatic retry on connection errors
  client.$use(async (params, next) => {
    const maxRetries = 3;
    const retryDelay = 1000; // Start with 1 second
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await next(params);
      } catch (error: any) {
        // Connection error codes that should trigger retry
        const retryableCodes = ['P1001', 'P1002', 'P1008', 'P1017'];
        const isRetryable = retryableCodes.includes(error.code);
        
        if (isRetryable && attempt < maxRetries - 1) {
          const delay = retryDelay * Math.pow(2, attempt); // Exponential backoff
          console.warn(`[Prisma] Connection error (attempt ${attempt + 1}/${maxRetries}). Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // If not retryable or max attempts reached
        console.error('[Prisma Error]', error);
        throw error;
      }
    }
  });
  
  return client;
};

const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// Export both the client and a health check function
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('[Prisma] Database connection check failed:', error);
    return false;
  }
};

export default prisma;
export { prisma };