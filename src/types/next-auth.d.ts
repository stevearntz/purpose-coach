import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    email: string
    name: string
    companyId?: string
    companyName?: string
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      companyId?: string
      companyName?: string
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    email: string
    name: string
    companyId?: string
    companyName?: string
  }
}