import prisma from '@/lib/prisma';
import { nanoid } from 'nanoid';

// PostgreSQL version of companyStorage using Prisma

export interface Company {
  id: string;
  name: string;
  domain: string;
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
  constructor() {
    console.log('Company storage: Using PostgreSQL');
  }

  // Company methods
  async createCompany(data: Omit<Company, 'id' | 'createdAt'>): Promise<Company> {
    const company = await prisma.company.create({
      data: {
        name: data.name,
        domains: [data.domain],
        logo: data.logo || null
      }
    });

    return {
      id: company.id,
      name: company.name,
      domain: data.domain,
      logo: company.logo || undefined,
      createdAt: company.createdAt.toISOString(),
      settings: data.settings
    };
  }

  async getCompany(id: string): Promise<Company | null> {
    const company = await prisma.company.findUnique({
      where: { id }
    });

    if (!company) return null;

    return {
      id: company.id,
      name: company.name,
      domain: company.domains[0] || '',
      logo: company.logo || undefined,
      createdAt: company.createdAt.toISOString()
    };
  }

  async getCompanyByDomain(domain: string): Promise<Company | null> {
    const company = await prisma.company.findFirst({
      where: {
        domains: { has: domain }
      }
    });

    if (!company) return null;

    return {
      id: company.id,
      name: company.name,
      domain,
      logo: company.logo || undefined,
      createdAt: company.createdAt.toISOString()
    };
  }

  // Alias for backward compatibility
  async getCompanyById(id: string): Promise<Company | null> {
    return this.getCompany(id);
  }

  async getOrCreateCompanyFromEmail(email: string, companyName?: string): Promise<Company> {
    const domain = email.split('@')[1];
    
    // First try to find by domain
    let company = await this.getCompanyByDomain(domain);
    if (company) return company;
    
    // Create new company
    const name = companyName || domain.charAt(0).toUpperCase() + domain.slice(1).split('.')[0];
    return this.createCompany({
      name,
      domain
    });
  }

  async getUserByEmail(email: string): Promise<any | null> {
    const user = await prisma.userProfile.findFirst({
      where: { email: email.toLowerCase() }
    });
    return user;
  }

  async updateCompany(id: string, updates: Partial<Company>): Promise<boolean> {
    try {
      const updateData: any = {};
      
      if (updates.name) updateData.name = updates.name;
      if (updates.logo) updateData.logo = updates.logo;
      if (updates.domain) {
        const company = await prisma.company.findUnique({ where: { id } });
        if (company) {
          const domains = new Set(company.domains);
          domains.add(updates.domain);
          updateData.domains = Array.from(domains);
        }
      }

      await prisma.company.update({
        where: { id },
        data: updateData
      });

      return true;
    } catch {
      return false;
    }
  }

  // User methods
  async createUser(data: Omit<CompanyUser, 'id' | 'createdAt'>): Promise<CompanyUser> {
    // Create or update UserProfile
    const userProfile = await prisma.userProfile.upsert({
      where: { email: data.email },
      create: {
        clerkUserId: nanoid(), // Temporary ID if no Clerk ID
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        companyId: data.companyId,
        role: data.role === 'manager' ? 'Manager' : 
              data.role === 'admin' ? 'Executive' : 'Individual Contributor'
      },
      update: {
        firstName: data.firstName,
        lastName: data.lastName,
        companyId: data.companyId,
        role: data.role === 'manager' ? 'Manager' : 
              data.role === 'admin' ? 'Executive' : 'Individual Contributor'
      }
    });

    return {
      id: userProfile.id,
      email: userProfile.email,
      firstName: userProfile.firstName || '',
      lastName: userProfile.lastName || '',
      companyId: userProfile.companyId || data.companyId,
      role: data.role,
      status: data.status,
      createdAt: userProfile.createdAt.toISOString(),
      invitedAt: data.invitedAt,
      lastSignIn: data.lastSignIn,
      toolsAccessed: data.toolsAccessed
    };
  }

  async getUser(email: string): Promise<CompanyUser | null> {
    const userProfile = await prisma.userProfile.findUnique({
      where: { email }
    });

    if (!userProfile || !userProfile.companyId) return null;

    return {
      id: userProfile.id,
      email: userProfile.email,
      firstName: userProfile.firstName || '',
      lastName: userProfile.lastName || '',
      companyId: userProfile.companyId,
      role: 'member', // Default role
      status: 'active',
      createdAt: userProfile.createdAt.toISOString()
    };
  }

  async getUsersByCompany(companyId: string): Promise<CompanyUser[]> {
    const users = await prisma.userProfile.findMany({
      where: { companyId }
    });

    return users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      companyId: user.companyId || companyId,
      role: 'member' as const,
      status: 'active' as const,
      createdAt: user.createdAt.toISOString()
    }));
  }

  async updateUser(email: string, updates: Partial<CompanyUser>): Promise<boolean> {
    try {
      const updateData: any = {};
      
      if (updates.firstName) updateData.firstName = updates.firstName;
      if (updates.lastName) updateData.lastName = updates.lastName;
      if (updates.companyId) updateData.companyId = updates.companyId;
      if (updates.role) {
        updateData.role = updates.role === 'manager' ? 'Manager' : 
                         updates.role === 'admin' ? 'Executive' : 'Individual Contributor';
      }

      await prisma.userProfile.update({
        where: { email },
        data: updateData
      });

      return true;
    } catch {
      return false;
    }
  }

  async addUserToCompany(email: string, companyId: string, role: CompanyUser['role'] = 'member'): Promise<boolean> {
    try {
      await prisma.userProfile.upsert({
        where: { email },
        create: {
          clerkUserId: nanoid(),
          email,
          companyId,
          role: role === 'manager' ? 'Manager' : 
                role === 'admin' ? 'Executive' : 'Individual Contributor'
        },
        update: {
          companyId
        }
      });

      return true;
    } catch {
      return false;
    }
  }
}

export const companyStorage = new CompanyStorage();