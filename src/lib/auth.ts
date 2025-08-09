import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';
import { NextRequest, NextResponse } from 'next/server';
import type { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
console.log('[auth] JWT_SECRET configured, using:', JWT_SECRET ? 'env variable' : 'fallback');
const COOKIE_NAME = 'campfire-auth';

export interface AuthPayload {
  userId: string;
  email: string;
  companyId: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    console.log('[auth] Token verified successfully');
    return decoded;
  } catch (error) {
    console.error('[auth] Token verification failed:', error);
    return null;
  }
}

export function setAuthCookie(res: NextResponse, token: string) {
  setCookie(COOKIE_NAME, token, {
    req: res as any,
    res,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  });
}

export function getAuthToken(req: NextRequest): string | undefined {
  const cookie = req.cookies.get(COOKIE_NAME);
  console.log('[auth] getAuthToken - cookie name:', COOKIE_NAME);
  console.log('[auth] getAuthToken - cookie found:', !!cookie);
  console.log('[auth] getAuthToken - cookie value length:', cookie?.value?.length);
  return cookie?.value;
}

export function clearAuthCookie(res: NextResponse) {
  deleteCookie(COOKIE_NAME, {
    req: res as any,
    res,
    path: '/'
  });
}

export async function getAuthUser(req: NextRequest): Promise<AuthPayload | null> {
  try {
    const token = getAuthToken(req);
    console.log('[auth] getAuthUser - token exists:', !!token);
    console.log('[auth] getAuthUser - token length:', token?.length);
    
    if (!token) {
      console.log('[auth] No auth token found in request');
      return null;
    }
    
    const user = verifyToken(token);
    console.log('[auth] getAuthUser - user verified:', !!user);
    console.log('[auth] getAuthUser - user data:', user);
    return user;
  } catch (error) {
    console.error('[auth] getAuthUser error:', error);
    return null;
  }
}