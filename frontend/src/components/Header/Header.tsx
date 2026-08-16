'use client';

import React from 'react';
import { useUiStore } from '@/stores/ui-store';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Search, Bell, Menu, LogOut, ChevronRight } from 'lucide-react';
import styles from './Header.module.css';

export function Header() {
  const { toggleSidebar } = useUiStore();
  const pathname = usePathname();

  const pathSegments = pathname.split('/').filter(Boolean);
  const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

  const breadcrumbs = pathSegments.length === 0 
    ? ['Dashboard'] 
    : pathSegments.map((segment) => {
        if (segment === 'operations') return 'Operations';
        if (segment === 'requisitions') return 'Requisitions';
        if (segment === 'candidates') return 'Candidates';
        if (segment === 'compliance') return 'Compliance';
        if (segment === 'branches') return 'Branches';
        if (segment === 'clients') return 'Clients';
        if (segment === 'users') return 'Users';
        if (segment === 'settings') return 'Settings';
        if (segment === 'pipeline') return 'Pipeline';
        if (segment === 'bulk') return 'Bulk Upload';
        if (segment === 'new') return 'New';
        if (segment === 'edit') return 'Edit';
        if (isUuid(segment)) return 'Details';
        return segment.charAt(0).toUpperCase() + segment.slice(1);
      });

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: '/auth/signin', redirect: false });
    } catch {}
    window.location.href = '/auth/signin';
  };

  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        <button onClick={toggleSidebar} className={styles.iconBtn} title="Toggle Sidebar">
          <Menu size={18} />
        </button>

        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <span className={styles.breadcrumbItem}>Main</span>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight size={14} className={styles.breadcrumbSeparator} />
              <span className={`${styles.breadcrumbItem} ${idx === breadcrumbs.length - 1 ? styles.activeCrumb : ''}`}>
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </nav>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.searchBar}>
          <Search className={styles.searchIcon} size={16} />
          <input type="text" placeholder="Search..." className={styles.searchInput} />
        </div>

        <button className={styles.iconBtn} title="Notifications">
          <Bell size={18} />
          <span className={styles.notificationDot} />
        </button>

        <div className={styles.divider} />

        <button onClick={handleLogout} className={styles.logoutBtn} title="Log Out">
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
}
