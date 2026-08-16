import React, { useState } from 'react';
import { useRequisitions } from '@/hooks/useRequisitions';
import { StatusBadge } from '@/ui/StatusBadge';
import Link from 'next/link';
import { Search, Filter, Briefcase, AlertCircle } from 'lucide-react';
import styles from './RequisitionList.module.css';

export const RequisitionList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [filters, setFilters] = useState({});
  const { data, isLoading, isError, refetch } = useRequisitions(filters);

  const listData: any[] = Array.isArray(data) ? data : (data as any)?.content || (data as any)?.data || [];

  const filtered = listData.filter((r: any) => {
    const title = (r.title || r.jobTitle || '').toLowerCase();
    const dept = (r.department || '').toLowerCase();
    const matchesSearch = title.includes(search.toLowerCase()) || dept.includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const counts = {
    all: listData.length,
    open: listData.filter((r: any) => r.status === 'OPEN' || r.status === 'PUBLISHED').length,
    draft: listData.filter((r: any) => r.status === 'DRAFT').length,
    filled: listData.filter((r: any) => r.status === 'FILLED' || r.status === 'CLOSED').length,
  };

  return (
    <div className={styles.wrapper}>
      {/* Status Count Tab Filters */}
      <div className={styles.tabFilters}>
        <button
          className={`${styles.tabBtn} ${statusFilter === 'ALL' ? styles.activeTab : ''}`}
          onClick={() => setStatusFilter('ALL')}
        >
          All ({counts.all})
        </button>
        <button
          className={`${styles.tabBtn} ${statusFilter === 'OPEN' ? styles.activeTab : ''}`}
          onClick={() => setStatusFilter('OPEN')}
        >
          Open ({counts.open})
        </button>
        <button
          className={`${styles.tabBtn} ${statusFilter === 'DRAFT' ? styles.activeTab : ''}`}
          onClick={() => setStatusFilter('DRAFT')}
        >
          Draft ({counts.draft})
        </button>
        <button
          className={`${styles.tabBtn} ${statusFilter === 'FILLED' ? styles.activeTab : ''}`}
          onClick={() => setStatusFilter('FILLED')}
        >
          Filled ({counts.filled})
        </button>
      </div>

      {/* Search Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search requisitions by title or department..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setFilters({ ...filters, search: e.target.value });
            }}
            className={styles.searchInput}
          />
        </div>
        <button className={styles.filterBtn}>
          <Filter size={14} />
          <span>Filter</span>
        </button>
      </div>

      {/* States */}
      {isLoading && (
        <div className={styles.stateContainer}>
          <p>Loading requisitions...</p>
        </div>
      )}

      {isError && (
        <div className={styles.stateContainer}>
          <div className={styles.errorIcon}><AlertCircle size={22} /></div>
          <h3>Unable to load requisitions</h3>
          <p>Could not connect to Requisition Microservice (port 8082).</p>
          <button onClick={() => refetch()} className={styles.retryBtn}>Retry</button>
        </div>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <div className={styles.stateContainer}>
          <Briefcase size={36} style={{ color: 'var(--color-text-tertiary)' }} />
          <h3>No Requisitions Found</h3>
          <p>Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Job Title & Department</th>
              <th>Location / Destination</th>
              <th>Headcount</th>
              <th>Status</th>
              <th style={{ textAlign: 'end' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r: any) => {
              const title = r.title || r.jobTitle || 'Untitled Requisition';
              const rawDept = (r.department && r.department !== r.jobCategory) ? r.department : (r.jobCategory ? r.jobCategory.replace(/_/g, ' ') : 'Engineering');
              const dept = rawDept.toUpperCase() === 'IT' ? 'IT' : rawDept.toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase());
              const initial = title.charAt(0).toUpperCase();
              const headcount = r.positionsRequired ?? r.positions_required ?? r.headcount ?? r.vacancies ?? 1;
              const location = r.destinationCountry ?? r.destination_country ?? r.location ?? r.country ?? '—';
              return (
                <tr key={r.id}>
                  <td>
                    <div className={styles.reqCell}>
                      <div className={styles.reqAvatar}>{initial}</div>
                      <div>
                        <div className={styles.reqTitle}>{title}</div>
                        <div className={styles.reqSub}>{dept}</div>
                      </div>
                    </div>
                  </td>
                  <td className={styles.cellSecondary}>{location}</td>
                  <td className={styles.cellSecondary} style={{ fontWeight: 600, color: 'var(--color-text)' }}>{headcount}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td style={{ textAlign: 'end' }}>
                    <Link href={`/requisitions/${r.id}`} className={styles.actionLink}>
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};
