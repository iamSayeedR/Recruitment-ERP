export type AppRole = 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'BRANCH_MANAGER' | 'RECRUITER' | 'COMPLIANCE_OFFICER' | 'FINANCE_OFFICER' | 'CLIENT_USER' | 'CANDIDATE';

export const ROUTE_ACCESS: Record<string, AppRole[]> = {
  '/settings': ['TENANT_ADMIN'],
  '/users': ['TENANT_ADMIN'],
  '/branches': ['TENANT_ADMIN', 'BRANCH_MANAGER'],
  '/clients': ['TENANT_ADMIN', 'BRANCH_MANAGER', 'RECRUITER'],
};

export function canAccessRoute(route: string, roles: AppRole[]): boolean {
  if (roles.includes('SUPER_ADMIN')) return true;
  if (!route || typeof route !== 'string') return true;
  const requiredRoles = Object.entries(ROUTE_ACCESS).find(([path]) => route.startsWith(path))?.[1];
  if (!requiredRoles) return true;
  return roles.some(role => requiredRoles.includes(role));
}

export function hasRole(roles: string[], required: AppRole | AppRole[]): boolean {
  if (roles.includes('SUPER_ADMIN')) return true;
  const requiredArray = Array.isArray(required) ? required : [required];
  return roles.some(role => requiredArray.includes(role as AppRole));
}
