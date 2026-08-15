'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RequisitionList } from '@/features/requisitions/RequisitionList';
import { RequisitionKanban } from '@/features/requisitions/RequisitionKanban';
import Link from 'next/link';
import { List, LayoutGrid, Plus, ArrowLeft } from 'lucide-react';
import styles from './page.module.css';

export default function RequisitionsPage() {
  const router = useRouter();
  const [view, setView] = useState<'list' | 'kanban'>('list');

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <button
          onClick={() => router.push('/')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: '#FFFFFF',
            border: '1px solid var(--color-border, #E2E8F0)',
            borderRadius: '0.5rem',
            padding: '0.45rem 0.75rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#64748B',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
      </div>

      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Job Requisitions</h1>
          <p className={styles.subtitle}>
            Manage job orders, approvals, and candidate sourcing pipelines.
          </p>
        </div>

        <div className={styles.actions}>
          <div className={styles.viewToggle}>
            <button
              onClick={() => setView('list')}
              className={`${styles.toggleBtn} ${view === 'list' ? styles.activeToggle : ''}`}
            >
              <List size={15} />
              List
            </button>
            <button
              onClick={() => setView('kanban')}
              className={`${styles.toggleBtn} ${view === 'kanban' ? styles.activeToggle : ''}`}
            >
              <LayoutGrid size={15} />
              Kanban
            </button>
          </div>

          <Link href="/requisitions/new" className={styles.primaryBtn}>
            <Plus size={16} />
            <span>New Requisition</span>
          </Link>
        </div>
      </header>

      <div className={styles.tableCard}>
        {view === 'list' ? <RequisitionList /> : <RequisitionKanban />}
      </div>
    </div>
  );
}
