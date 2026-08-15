import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { RouteGuard } from './RouteGuard';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { canAccessRoute } from '@/lib/rbac';

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

// Mock rbac utilities
vi.mock('@/lib/rbac', () => ({
  canAccessRoute: vi.fn(),
}));

describe('RouteGuard', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('shows loading state if status is loading', () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'loading',
      update: vi.fn(),
    } as any);

    vi.mocked(usePathname).mockReturnValue('/clients');

    render(
      <RouteGuard>
        <div>Protected Content</div>
      </RouteGuard>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('shows Access Denied if canAccessRoute returns false', () => {
    vi.mocked(useSession).mockReturnValue({
      data: { user: { roles: ['RECRUITER'] } },
      status: 'authenticated',
      update: vi.fn(),
    } as any);

    vi.mocked(usePathname).mockReturnValue('/settings');
    vi.mocked(canAccessRoute).mockReturnValue(false);

    render(
      <RouteGuard>
        <div>Protected Content</div>
      </RouteGuard>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText(/you do not have permission/i)).toBeInTheDocument();
  });

  it('renders children if canAccessRoute returns true', () => {
    vi.mocked(useSession).mockReturnValue({
      data: { user: { roles: ['TENANT_ADMIN'] } },
      status: 'authenticated',
      update: vi.fn(),
    } as any);

    vi.mocked(usePathname).mockReturnValue('/settings');
    vi.mocked(canAccessRoute).mockReturnValue(true);

    render(
      <RouteGuard>
        <div>Protected Content</div>
      </RouteGuard>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
  });
});
