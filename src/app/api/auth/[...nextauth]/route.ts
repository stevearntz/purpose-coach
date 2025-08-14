import { getAuth } from "@/lib/auth-init"

// Get handlers at runtime
const auth = getAuth()
const { GET, POST } = auth.handlers

export { GET, POST }