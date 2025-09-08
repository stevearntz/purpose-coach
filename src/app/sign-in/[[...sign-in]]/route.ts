import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const redirectUrl = searchParams.get('redirect_url')
  
  if (redirectUrl) {
    redirect(`/auth?redirect_url=${encodeURIComponent(redirectUrl)}`)
  } else {
    redirect('/auth')
  }
}