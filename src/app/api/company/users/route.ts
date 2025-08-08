import { NextRequest, NextResponse } from 'next/server';
import companyStorage from '@/lib/companyStorage';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    // Get or create company from email domain
    const company = await companyStorage.getOrCreateCompanyFromEmail(email);
    
    // Get or create user
    let user = await companyStorage.getUserByEmail(email);
    if (!user) {
      const [firstName, ...lastNameParts] = email.split('@')[0].split('.');
      user = await companyStorage.createUser({
        email,
        firstName: firstName || 'User',
        lastName: lastNameParts.join(' ') || '',
        companyId: company.id,
        role: 'hr_leader', // First user is HR leader
        status: 'active'
      });
    }
    
    // Get all company users
    const users = await companyStorage.getCompanyUsers(company.id);
    
    return NextResponse.json({
      company,
      currentUser: user,
      users: users.filter(u => u.email !== email) // Exclude current user from list
    });
  } catch (error) {
    console.error('Failed to fetch company users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}