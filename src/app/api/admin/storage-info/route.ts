import { NextRequest, NextResponse } from 'next/server';
import { invitationStorage } from '@/lib/invitationStorage';
import { companyStorage } from '@/lib/companyStorage';

export async function GET(request: NextRequest) {
  try {
    // Get all invitations
    const allInvitations = await invitationStorage.getAllInvitations();
    
    // Get all companies (we'll need to add this method)
    // For now, let's check what we can access
    // @ts-ignore - accessing private property for debugging
    const memoryCompanies = Array.from(companyStorage.memoryStore?.companies?.values() || []);
    // @ts-ignore
    const memoryUsers = Array.from(companyStorage.memoryStore?.users?.values() || []);
    
    // Check Redis status
    // @ts-ignore
    const inviteRedisConnected = !!invitationStorage.redis && !invitationStorage.useMemoryFallback;
    // @ts-ignore
    const companyRedisConnected = !!companyStorage.redis && !companyStorage.useMemoryFallback;
    
    // If Redis is connected, try to get data from Redis
    let redisUsers = [];
    let redisCompanies = [];
    
    // @ts-ignore
    if (companyStorage.redis && !companyStorage.useMemoryFallback) {
      try {
        // @ts-ignore
        const redis = companyStorage.redis;
        
        // Get all user keys
        const userKeys = await redis.keys('user:*');
        for (const key of userKeys) {
          const userData = await redis.get(key);
          if (userData) {
            redisUsers.push(JSON.parse(userData));
          }
        }
        
        // Get all company keys
        const companyKeys = await redis.keys('company:*');
        for (const key of companyKeys) {
          if (!key.includes(':users')) { // Skip the user list keys
            const companyData = await redis.get(key);
            if (companyData) {
              redisCompanies.push(JSON.parse(companyData));
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch from Redis:', error);
      }
    }
    
    const storageInfo = {
      storage: {
        invitations: {
          redisConnected: inviteRedisConnected,
          total: allInvitations.length,
          byStatus: {
            pending: allInvitations.filter(i => i.status === 'pending').length,
            sent: allInvitations.filter(i => i.status === 'sent').length,
            opened: allInvitations.filter(i => i.status === 'opened').length,
            started: allInvitations.filter(i => i.status === 'started').length,
            completed: allInvitations.filter(i => i.status === 'completed').length,
          }
        },
        companies: {
          redisConnected: companyRedisConnected,
          inMemory: memoryCompanies.length,
          inRedis: redisCompanies.length,
          totalUnique: new Set([...memoryCompanies, ...redisCompanies].map(c => c.id)).size
        },
        users: {
          redisConnected: companyRedisConnected,
          inMemory: memoryUsers.length,
          inRedis: redisUsers.length,
          totalUnique: new Set([...memoryUsers, ...redisUsers].map(u => u.email)).size
        }
      },
      invitations: allInvitations.map(inv => ({
        code: inv.inviteCode,
        email: inv.email,
        name: inv.name,
        company: inv.company,
        status: inv.status,
        createdAt: inv.createdAt
      })),
      companies: {
        memory: memoryCompanies,
        redis: redisCompanies
      },
      users: {
        memory: memoryUsers.map((u: any) => ({
          email: u.email,
          name: `${u.firstName} ${u.lastName}`,
          company: u.companyId,
          status: u.status,
          role: u.role
        })),
        redis: redisUsers.map((u: any) => ({
          email: u.email,
          name: `${u.firstName} ${u.lastName}`,
          company: u.companyId,
          status: u.status,
          role: u.role
        }))
      }
    };
    
    return NextResponse.json(storageInfo, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('Failed to get storage info:', error);
    return NextResponse.json({ 
      error: 'Failed to get storage info',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}