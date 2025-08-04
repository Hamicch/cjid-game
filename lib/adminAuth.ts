// Simple admin authentication
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';

export function isAdmin(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

export function getAdminPassword(): string {
  return ADMIN_PASSWORD;
}

// Check if user is admin (for client-side)
export function checkAdminAccess(password: string): boolean {
  return password === ADMIN_PASSWORD;
}