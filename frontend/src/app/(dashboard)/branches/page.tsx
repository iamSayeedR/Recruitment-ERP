'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RouteGuard } from '@/components/RouteGuard/RouteGuard';
import { useBranches, useCreateBranch } from '@/hooks/useBranches';
import { Search, Plus, MapPin, AlertCircle, Building2, X, ArrowLeft } from 'lucide-react';
import styles from './branches.module.css';

const DEMO_BRANCH_PRESETS = [
  {
    label: 'Dubai Regional HQ',
    data: {
      name: 'Dubai Regional Headquarters',
      code: 'UAE-DXB-01',
      country: 'UAE',
      city: 'Dubai',
      address: 'Business Bay Tower, Office 1402',
      phone: '+971 4 398 7654',
      email: 'dubai@recruitment-erp.com',
    },
  },
  {
    label: 'Mumbai Staffing Hub',
    data: {
      name: 'Mumbai Manpower Sourcing Hub',
      code: 'IND-BOM-01',
      country: 'India',
      city: 'Mumbai',
      address: 'BKC Financial District, Level 4',
      phone: '+91 22 6789 0123',
      email: 'mumbai@recruitment-erp.com',
    },
  },
  {
    label: 'Manila Talent Hub',
    data: {
      name: 'Manila Talent Acquisition Hub',
      code: 'PHL-MNL-01',
      country: 'Philippines',
      city: 'Manila',
      address: 'Makati Avenue, Tower 2',
      phone: '+63 2 8123 4567',
      email: 'manila@recruitment-erp.com',
    },
  },
  {
    label: 'Dhahran Operations',
    data: {
      name: 'Dhahran EPC Operations',
      code: 'SAU-DHR-01',
      country: 'Saudi Arabia',
      city: 'Dhahran',
      address: 'Aramco Road, Industrial Complex',
      phone: '+966 13 890 1234',
      email: 'dhahran@recruitment-erp.com',
    },
  },
];

export default function BranchesPage() {
  const router = useRouter();
  const { data, isLoading, error } = useBranches(1, 50);
  const createBranchMutation = useCreateBranch();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    country: '',
    city: '',
    address: '',
    phone: '',
    email: '',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const branches: any[] = Array.isArray(data) ? data : ((data as any)?.content || []);
  const filtered = branches.filter((b: any) =>
    (b.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (b.country || '').toLowerCase().includes(search.toLowerCase()) ||
    (b.city || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenModal = () => {
    setFormData({
      name: '',
      code: '',
      country: '',
      city: '',
      address: '',
      phone: '',
      email: '',
    });
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      setErrorMessage('Branch name and branch code are required.');
      return;
    }

    createBranchMutation.mutate(formData, {
      onSuccess: () => {
        setIsModalOpen(false);
      },
      onError: (err: any) => {
        setErrorMessage(err?.message || 'Failed to create branch. Please try again.');
      },
    });
  };

  return (
    <RouteGuard>
      <div className={styles.container}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <button
            onClick={() => router.back()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: '#FFFFFF',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.45rem 0.75rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
        </div>

        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Branch Network</h1>
            <p className={styles.subtitle}>
              Manage global branch offices, operational status, and geographic coverage.
            </p>
          </div>
          <button className={styles.primaryBtn} onClick={handleOpenModal}>
            <Plus size={16} />
            <span>Create Branch</span>
          </button>
        </header>

        {/* Summary Stats */}
        <div className={styles.summaryGrid}>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>Total Branches</span>
              <div className={`${styles.iconBox} ${styles.blueIcon}`}>
                <Building2 size={16} />
              </div>
            </div>
            <div className={styles.statValue}>{isLoading ? '—' : branches.length}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>Active Branches</span>
              <div className={`${styles.iconBox} ${styles.greenIcon}`}>
                <MapPin size={16} />
              </div>
            </div>
            <div className={styles.statValue}>
              {isLoading ? '—' : branches.filter((b: any) => b.status === 'ACTIVE').length}
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>Countries Covered</span>
              <div className={`${styles.iconBox} ${styles.amberIcon}`}>
                <MapPin size={16} />
              </div>
            </div>
            <div className={styles.statValue}>
              {isLoading ? '—' : new Set(branches.map((b: any) => b.country).filter(Boolean)).size}
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className={styles.tableCard}>
          {/* Toolbar */}
          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <Search size={15} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by branch name, country, or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>

          {/* States */}
          {isLoading && (
            <div className={styles.stateContainer}>
              <p>Loading branch network from IAM service...</p>
            </div>
          )}

          {error && (
            <div className={styles.stateContainer}>
              <div className={styles.errorIcon}><AlertCircle size={22} /></div>
              <h3>Unable to Load Branches</h3>
              <p>Could not connect to IAM Microservice (port 8081).</p>
            </div>
          )}

          {!isLoading && !error && filtered.length === 0 && (
            <div className={styles.stateContainer}>
              <Building2 size={36} style={{ color: 'var(--color-text-tertiary)' }} />
              <h3>No Branches Found</h3>
              <p>No branch records match your search criteria.</p>
              <button className={styles.primaryBtn} onClick={handleOpenModal} style={{ marginTop: '0.5rem' }}>
                <Plus size={15} />
                <span>Create First Branch</span>
              </button>
            </div>
          )}

          {!isLoading && !error && filtered.length > 0 && (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Branch Name & Code</th>
                  <th>Country</th>
                  <th>City</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((branch: any) => {
                  const initial = (branch.name || 'B').charAt(0).toUpperCase();
                  const isActive = branch.status === 'ACTIVE';
                  return (
                    <tr key={branch.id}>
                      <td>
                        <div className={styles.branchCell}>
                          <div className={styles.avatar}>{initial}</div>
                          <div>
                            <div className={styles.branchName}>{branch.name}</div>
                            <div className={styles.branchCode}>{branch.code || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className={styles.cellSecondary}>{branch.country || '—'}</td>
                      <td className={styles.cellSecondary}>{branch.city || '—'}</td>
                      <td>
                        <span className={isActive ? styles.pillActive : styles.pillInactive}>
                          {branch.status || 'ACTIVE'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Create Branch Modal */}
        {isModalOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '1rem' }} onClick={handleCloseModal}>
            <div style={{ background: '#FFFFFF', borderRadius: '1rem', width: '100%', maxWidth: '520px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>Create New Branch</h3>
                <button style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }} onClick={handleCloseModal}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {errorMessage && (
                    <div style={{ padding: '0.6rem 0.75rem', background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: '0.375rem', fontSize: '0.85rem' }}>
                      {errorMessage}
                    </div>
                  )}

                  <div style={{ background: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: '0.5rem', padding: '0.75rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                      Auto-Fill Demo Branch Data
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {DEMO_BRANCH_PRESETS.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '0.375rem', color: '#2563EB', fontWeight: 600, cursor: 'pointer' }}
                          onClick={() => setFormData(preset.data)}
                        >
                          + {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>Branch Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Dubai Regional Headquarters"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{ padding: '0.6rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontSize: '0.875rem' }}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>Branch Code *</label>
                      <input
                        type="text"
                        placeholder="e.g. UAE-DXB-01"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        style={{ padding: '0.6rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontSize: '0.875rem' }}
                        required
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>Country</label>
                      <input
                        type="text"
                        placeholder="e.g. UAE"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        style={{ padding: '0.6rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontSize: '0.875rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>City</label>
                      <input
                        type="text"
                        placeholder="e.g. Dubai"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        style={{ padding: '0.6rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontSize: '0.875rem' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>Phone</label>
                      <input
                        type="text"
                        placeholder="+971 4 398 7654"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        style={{ padding: '0.6rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontSize: '0.875rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>Email</label>
                    <input
                      type="email"
                      placeholder="dubai@recruitment-erp.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{ padding: '0.6rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontSize: '0.875rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', padding: '1.25rem 1.5rem', borderTop: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                  <button type="button" onClick={handleCloseModal} style={{ padding: '0.55rem 1rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.primaryBtn} disabled={createBranchMutation.isPending}>
                    {createBranchMutation.isPending ? 'Saving...' : 'Save Branch'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </RouteGuard>
  );
}
