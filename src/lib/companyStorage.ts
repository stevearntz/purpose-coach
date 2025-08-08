import Redis from 'ioredis';
import { nanoid } from 'nanoid';

export interface Company {
  id: string;
  name: string;
  domain: string; // e.g., "getcampfire.com"
  logo?: string;
  createdAt: string;
  settings?: {
    autoApproveUsers?: boolean;
    defaultTools?: string[];
  };
}

export interface CompanyUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyId: string;
  role: 'admin' | 'hr_leader' | 'manager' | 'member';
  status: 'active' | 'invited' | 'deactivated';
  createdAt: string;
  invitedAt?: string;
  lastSignIn?: string;
  toolsAccessed?: string[];
}

class CompanyStorage {
  private redis: Redis | null = null;
  private memoryStore = {
    companies: new Map<string, Company>(),
    users: new Map<string, CompanyUser>(),
    domainToCompany: new Map<string, string>(), // domain -> companyId
  };
  private useMemoryFallback = false;

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis() {
    if (process.env.REDIS_URL) {
      try {
        this.redis = new Redis(process.env.REDIS_URL, {
          retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
          connectTimeout: 10000,
          maxRetriesPerRequest: 3,
          enableOfflineQueue: false,
          lazyConnect: true,
        });

        await this.redis.connect();
        console.log('Company storage: Redis connection established');

        this.redis.on('error', (err) => {
          console.error('Company storage: Redis error:', err);
          this.useMemoryFallback = true;
        });
      } catch (error) {
        console.error('Company storage: Failed to connect to Redis:', error);
        this.useMemoryFallback = true;
      }
    } else {
      console.log('Company storage: Using memory storage');
      this.useMemoryFallback = true;
    }
  }

  // Company methods
  async createCompany(data: Omit<Company, 'id' | 'createdAt'>): Promise<Company> {
    const company: Company = {
      ...data,
      id: nanoid(),
      createdAt: new Date().toISOString(),
    };

    if (this.redis && !this.useMemoryFallback) {
      try {
        await this.redis.setex(
          `company:${company.id}`,
          60 * 60 * 24 * 365, // 1 year
          JSON.stringify(company)
        );
        await this.redis.set(`domain:${company.domain}`, company.id);
      } catch (error) {
        console.error('Failed to save company to Redis:', error);
        this.memoryStore.companies.set(company.id, company);
        this.memoryStore.domainToCompany.set(company.domain, company.id);
      }
    } else {
      this.memoryStore.companies.set(company.id, company);
      this.memoryStore.domainToCompany.set(company.domain, company.id);
    }

    return company;
  }

  async getCompanyByDomain(domain: string): Promise<Company | null> {
    if (this.redis && !this.useMemoryFallback) {
      try {
        const companyId = await this.redis.get(`domain:${domain}`);
        if (!companyId) return null;
        
        const data = await this.redis.get(`company:${companyId}`);
        return data ? JSON.parse(data) : null;
      } catch (error) {
        console.error('Failed to get company from Redis:', error);
        const companyId = this.memoryStore.domainToCompany.get(domain);
        return companyId ? this.memoryStore.companies.get(companyId) || null : null;
      }
    } else {
      const companyId = this.memoryStore.domainToCompany.get(domain);
      return companyId ? this.memoryStore.companies.get(companyId) || null : null;
    }
  }

  async getCompanyById(id: string): Promise<Company | null> {
    if (this.redis && !this.useMemoryFallback) {
      try {
        const data = await this.redis.get(`company:${id}`);
        return data ? JSON.parse(data) : null;
      } catch (error) {
        console.error('Failed to get company from Redis:', error);
        return this.memoryStore.companies.get(id) || null;
      }
    } else {
      return this.memoryStore.companies.get(id) || null;
    }
  }

  // User methods
  async createUser(data: Omit<CompanyUser, 'id' | 'createdAt'>): Promise<CompanyUser> {
    const user: CompanyUser = {
      ...data,
      id: nanoid(),
      createdAt: new Date().toISOString(),
    };

    if (this.redis && !this.useMemoryFallback) {
      try {
        await this.redis.setex(
          `user:${user.email}`,
          60 * 60 * 24 * 365, // 1 year
          JSON.stringify(user)
        );
        
        // Add to company's user list
        await this.redis.zadd(
          `company:${user.companyId}:users`,
          Date.now(),
          user.email
        );
      } catch (error) {
        console.error('Failed to save user to Redis:', error);
        this.memoryStore.users.set(user.email, user);
      }
    } else {
      this.memoryStore.users.set(user.email, user);
    }

    return user;
  }

  async getUserByEmail(email: string): Promise<CompanyUser | null> {
    if (this.redis && !this.useMemoryFallback) {
      try {
        const data = await this.redis.get(`user:${email}`);
        return data ? JSON.parse(data) : null;
      } catch (error) {
        console.error('Failed to get user from Redis:', error);
        return this.memoryStore.users.get(email) || null;
      }
    } else {
      return this.memoryStore.users.get(email) || null;
    }
  }

  async getCompanyUsers(companyId: string): Promise<CompanyUser[]> {
    if (this.redis && !this.useMemoryFallback) {
      try {
        const emails = await this.redis.zrevrange(`company:${companyId}:users`, 0, -1);
        const users: CompanyUser[] = [];
        
        for (const email of emails) {
          const userData = await this.redis.get(`user:${email}`);
          if (userData) {
            users.push(JSON.parse(userData));
          }
        }
        
        return users;
      } catch (error) {
        console.error('Failed to get company users from Redis:', error);
        return Array.from(this.memoryStore.users.values()).filter(u => u.companyId === companyId);
      }
    } else {
      return Array.from(this.memoryStore.users.values()).filter(u => u.companyId === companyId);
    }
  }

  async updateUser(email: string, updates: Partial<CompanyUser>): Promise<CompanyUser | null> {
    const existing = await this.getUserByEmail(email);
    if (!existing) return null;
    
    const updated = { ...existing, ...updates };
    
    if (this.redis && !this.useMemoryFallback) {
      try {
        await this.redis.setex(
          `user:${email}`,
          60 * 60 * 24 * 365,
          JSON.stringify(updated)
        );
      } catch (error) {
        console.error('Failed to update user in Redis:', error);
        this.memoryStore.users.set(email, updated);
      }
    } else {
      this.memoryStore.users.set(email, updated);
    }
    
    return updated;
  }

  // Helper to get or create company from email domain
  async getOrCreateCompanyFromEmail(email: string, companyName?: string): Promise<Company> {
    const domain = email.split('@')[1];
    
    let company = await this.getCompanyByDomain(domain);
    if (!company) {
      company = await this.createCompany({
        name: companyName || domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1),
        domain,
      });
    }
    
    return company;
  }
}

const companyStorage = new CompanyStorage();
export default companyStorage;