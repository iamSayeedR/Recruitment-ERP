'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUiStore } from '@/stores/ui-store';
import { useTenantStore } from '@/stores/tenant-store';
import { useSession } from 'next-auth/react';
import { hasRole } from '@/lib/rbac';
import styles from './Sidebar.module.css';

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed } = useUiStore();
  const { tenantName } = useTenantStore();
  const { data: session } = useSession();
  const roles = session?.user?.roles || [];
  const userName = session?.user?.name || session?.user?.email || 'User';
  const roleName = roles.includes('TENANT_ADMIN') ? 'Tenant Admin' : roles[0] || 'User';

  const displayTitle = tenantName || 'Recruitment ERP';

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <aside className={`${styles.sidebar} ${sidebarCollapsed ? styles.collapsed : ''}`} suppressHydrationWarning>
      <div className={styles.brand}>
        <div className={styles.brandIcon} title="Recruitment ERP Enterprise Suite">ERP</div>
        {!sidebarCollapsed && (
          <div className={styles.brandText}>
            <span className={styles.brandTitle}>{displayTitle}</span>
            <span className={styles.brandSubtitle}>Enterprise Suite</span>
          </div>
        )}
      </div>

      <nav className={styles.nav}>
        {!sidebarCollapsed && <div className={styles.sectionHeader}>PLATFORM OVERVIEW</div>}
        <Link href="/" title="Executive Dashboard" className={`${styles.link} ${isActive('/') ? styles.active : ''}`}>
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
          </svg>
          {!sidebarCollapsed && <span>Dashboard</span>}
        </Link>

        {hasRole(roles, ['TENANT_ADMIN', 'BRANCH_MANAGER', 'COMPLIANCE_OFFICER']) && (
          <Link href="/operations" title="Operational Feed & Activity" className={`${styles.link} ${isActive('/operations') ? styles.active : ''}`}>
            <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            {!sidebarCollapsed && <span>Operations</span>}
          </Link>
        )}

        {hasRole(roles, ['TENANT_ADMIN', 'BRANCH_MANAGER', 'RECRUITER']) && (
          <>
            {!sidebarCollapsed && <div className={styles.sectionHeader}>RECRUITMENT & ATS</div>}
            <Link href="/requisitions" title="Job Requisitions & Pipelines" className={`${styles.link} ${isActive('/requisitions') ? styles.active : ''}`}>
              <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              {!sidebarCollapsed && <span>Requisitions</span>}
            </Link>

            <Link href="/candidates" title="Candidate Talent Pool" className={`${styles.link} ${isActive('/candidates') && !pathname.includes('bulk') ? styles.active : ''}`}>
              <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              {!sidebarCollapsed && <span>Candidates</span>}
            </Link>

            <Link href="/candidates/bulk" title="Bulk Candidate CSV Import" className={`${styles.link} ${isActive('/candidates/bulk') ? styles.active : ''}`}>
              <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              {!sidebarCollapsed && <span>Bulk Upload</span>}
            </Link>

            <Link href="/clients" title="Client Company Management" className={`${styles.link} ${isActive('/clients') ? styles.active : ''}`}>
              <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 21h18" />
                <path d="M9 8h1" />
                <path d="M9 12h1" />
                <path d="M9 16h1" />
                <path d="M14 8h1" />
                <path d="M14 12h1" />
                <path d="M14 16h1" />
                <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
              </svg>
              {!sidebarCollapsed && <span>Clients</span>}
            </Link>
          </>
        )}

        {hasRole(roles, ['TENANT_ADMIN', 'COMPLIANCE_OFFICER']) && (
          <>
            {!sidebarCollapsed && <div className={styles.sectionHeader}>GOVERNANCE</div>}
            <Link href="/compliance" title="Compliance & Document Audits" className={`${styles.link} ${isActive('/compliance') ? styles.active : ''}`}>
              <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
              {!sidebarCollapsed && <span>Compliance</span>}
            </Link>
          </>
        )}

        {hasRole(roles, ['TENANT_ADMIN', 'BRANCH_MANAGER']) && (
          <Link href="/branches" title="Branch Office Network" className={`${styles.link} ${isActive('/branches') ? styles.active : ''}`}>
            <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {!sidebarCollapsed && <span>Branches</span>}
          </Link>
        )}

        {hasRole(roles, ['TENANT_ADMIN']) && (
          <>
            {!sidebarCollapsed && <div className={styles.sectionHeader}>ADMINISTRATION</div>}
            <Link href="/users" title="User Accounts & Roles" className={`${styles.link} ${isActive('/users') ? styles.active : ''}`}>
              <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              {!sidebarCollapsed && <span>Users</span>}
            </Link>
            <Link href="/settings" title="System & Tenant Settings" className={`${styles.link} ${isActive('/settings') ? styles.active : ''}`}>
              <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              {!sidebarCollapsed && <span>Settings</span>}
            </Link>
          </>
        )}
      </nav>

      {!sidebarCollapsed && (
        <div className={styles.userBadge}>
          <div className={styles.avatar}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{userName}</span>
            <span className={styles.roleTag}>{roleName}</span>
          </div>
        </div>
      )}
    </aside>
  );
}
