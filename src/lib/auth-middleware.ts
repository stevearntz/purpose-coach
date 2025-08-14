import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
    email: string;
    name?: string;
    companyId?: string;
    companyName?: string;
  };
}

export function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const session = await auth();
      
      if (!session?.user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      
      // Add user to request
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = session.user as any;
      
      return handler(authenticatedReq);
    } catch (error) {
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 500 }
      );
    }
  };
}