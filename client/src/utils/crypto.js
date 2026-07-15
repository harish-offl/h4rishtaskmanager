// Simple password hashing using Web Crypto API (no backend needed)
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

const SALT = 'arrise_salt_2024'

export async function hashPassword(password) {
  return sha256(SALT + password + SALT)
}

export async function verifyPassword(password, hash) {
  const computed = await hashPassword(password)
  return computed === hash
}
