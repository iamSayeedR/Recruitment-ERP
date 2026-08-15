import React from 'react';
import { useRequisitions } from '@/hooks/useRequisitions';
import styles from './RequisitionKanban.module.css';
import Link from 'next/link';
import { StatusBadge } from '@/ui/StatusBadge';

const KANBAN_COLUMNS = [
  { key: 'DRAFT', label: 'Draft' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'PUBLISHED', label: 'Published' },
  { key: 'PARTIALLY_FILLED', label: 'Partially Filled' },
  { key: 'FILLED', label: 'Filled' },
  { key: 'CLOSED', label: 'Closed' },
];

export const RequisitionKanban: React.FC = () => {
  const { data } = useRequisitions();
  const requisitions: any[] = (data as any)?.data || (Array.isArray(data) ? data : []);

  const grouped = KANBAN_COLUMNS.map(col => ({
    ...col,
    items: requisitions.filter((r: any) => r.status === col.key),
  }));

  return (
    <div className={styles.board}>
      {grouped.map(col => (
        <div key={col.key} className={styles.column}>
          <h3 className={styles.colHeader}>{col.label} ({col.items.length})</h3>
          {col.items.length === 0 ? (
            <div style={{ fontSize: '0.8rem', color: '#94A3B8', padding: '1rem 0', textAlign: 'center' }}>
              No requisitions
            </div>
          ) : (
            col.items.map((item: any) => (
              <Link key={item.id} href={`/requisitions/${item.id}`} className={styles.cardLink}>
                <div className={styles.card}>
                  <h4>{item.title}</h4>
                  <p>{item.jobCategory || item.department || 'Engineering'} &bull; {item.destinationCountry || item.location || 'Saudi Arabia'}</p>
                  <div style={{ marginTop: '0.4rem' }}>
                    <StatusBadge status={item.status} />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      ))}
    </div>
  );
};
