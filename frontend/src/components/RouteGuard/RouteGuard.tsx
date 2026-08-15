'use client';
import { useSession } from 'next-auth/react';
import { AppRole, canAccessRoute } from '@/lib/rbac';
import { usePathname } from 'next/navigation';

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status === 'loading') return <div>Loading...</div>;

  const roles = session?.user?.roles as AppRole[] || [];

  if (!canAccessRoute(pathname, roles)) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  return <>{children}</>;
}
