import { describe, it, expect } from 'vitest';
import { canAccessRoute, hasRole, AppRole } from './rbac';

describe('RBAC Utilities', () => {
  describe('canAccessRoute', () => {
    it('returns true for allowed roles', () => {
      const userRoles: AppRole[] = ['BRANCH_MANAGER'];
      expect(canAccessRoute('/branches', userRoles)).toBe(true);
    });

    it('returns false for disallowed roles', () => {
      const userRoles: AppRole[] = ['RECRUITER'];
      expect(canAccessRoute('/settings', userRoles)).toBe(false);
    });

    it('SUPER_ADMIN can access all routes', () => {
      const userRoles: AppRole[] = ['SUPER_ADMIN'];
      expect(canAccessRoute('/settings', userRoles)).toBe(true);
    });
  });

  describe('hasRole', () => {
    it('checks single role correctly', () => {
      const userRoles = ['RECRUITER'];
      expect(hasRole(userRoles, 'RECRUITER')).toBe(true);
      expect(hasRole(userRoles, 'TENANT_ADMIN')).toBe(false);
    });

    it('checks multiple roles (any match)', () => {
      const userRoles = ['BRANCH_MANAGER'];
      expect(hasRole(userRoles, ['RECRUITER', 'BRANCH_MANAGER'])).toBe(true);
      expect(hasRole(userRoles, ['TENANT_ADMIN', 'SUPER_ADMIN'])).toBe(false);
    });
    
    it('SUPER_ADMIN implicitly has all standard roles', () => {
      const userRoles = ['SUPER_ADMIN'];
      expect(hasRole(userRoles, 'TENANT_ADMIN')).toBe(true);
      expect(hasRole(userRoles, 'RECRUITER')).toBe(true);
    });
  });
});
