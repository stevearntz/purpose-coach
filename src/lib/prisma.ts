import { PrismaClient } from '@prisma/client';

declare global {
  // Allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error', 'warn'],
  });
  
  // Add error event handler for better production debugging
  if (process.env.NODE_ENV === 'production') {
    client.$on('error' as never, (e: any) => {
      console.error('[Prisma Error]', e);
    });
  }
  
  return client;
};

const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;