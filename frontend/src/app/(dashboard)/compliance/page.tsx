'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useComplianceExpirations } from '@/hooks/useComplianceExpirations';
import { useCandidates } from '@/hooks/useCandidates';
import { StatusBadge } from '@/ui/StatusBadge';
import { Search, Filter, AlertTriangle, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import styles from './page.module.css';

export default function ComplianceDashboardPage() {
  const { data: expirations, isLoading, isError, refetch } = useComplianceExpirations();
  const { data: candidatesData } = useCandidates();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const candidatesList = Array.isArray(candidatesData) ? candidatesData : (candidatesData as any)?.content || (candidatesData as any)?.data || [];
  const candidateMap = new Map<string, any>(candidatesList.map((c: any) => [c.id, c]));

  const filteredExpirations = expirations?.filter((exp) => {
    const candidateObj = candidateMap.get(exp.candidateApplicationId);
    const candidateName = candidateObj ? `${candidateObj.firstName || ''} ${candidateObj.lastName || ''}`.trim() : (exp as any).candidateName || exp.candidateApplicationId;
    const doc = exp.documentType || '';
    const matchesSearch = candidateName.toLowerCase().includes(search.toLowerCase()) || doc.toLowerCase().includes(search.toLowerCase());
    const itemStatus = exp.status?.toUpperCase() || 'NOT_STARTED';
    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'SUBMITTED' ? (itemStatus === 'SUBMITTED' || itemStatus === 'IN_PROGRESS') : itemStatus === statusFilter);
    return matchesSearch && matchesStatus;
  }) || [];

  const counts = {
    all: expirations?.length || 0,
    notStarted: expirations?.filter(e => e.status?.toUpperCase() === 'NOT_STARTED').length || 0,
    inProgress: expirations?.filter(e => e.status?.toUpperCase() === 'IN_PROGRESS' || e.status?.toUpperCase() === 'SUBMITTED').length || 0,
    verified: expirations?.filter(e => e.status?.toUpperCase() === 'VERIFIED').length || 0,
    expired: expirations?.filter(e => e.status?.toUpperCase() === 'EXPIRED').length || 0,
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Compliance Governance</h1>
          <p className={styles.subtitle}>
            Monitor document expirations, track regulatory checklists, and audit candidate mobility rules.
          </p>
        </div>
      </header>

      {/* Summary Cards Row */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryCardHeader}>
            <div className={`${styles.iconContainer} ${styles.blueIcon}`}>
              <ShieldCheck size={20} />
            </div>
            <span className={styles.summaryCardTag}>Total Monitored</span>
          </div>
          <div className={styles.summaryValue}>{counts.all}</div>
          <p className={styles.summaryFooter}>Active compliance checklists</p>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryCardHeader}>
            <div className={`${styles.iconContainer} ${styles.amberIcon}`}>
              <Clock size={20} />
            </div>
            <span className={styles.summaryCardTag}>Pending Review</span>
          </div>
          <div className={styles.summaryValue}>{counts.inProgress + counts.notStarted}</div>
          <p className={styles.summaryFooter}>Awaiting document verification</p>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryCardHeader}>
            <div className={`${styles.iconContainer} ${styles.greenIcon}`}>
              <CheckCircle2 size={20} />
            </div>
            <span className={styles.summaryCardTag}>Verified Status</span>
          </div>
          <div className={styles.summaryValue}>{counts.verified}</div>
          <p className={styles.summaryFooter}>100% compliant documents</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className={styles.tableCard}>
        {/* Tab Filters */}
        <div className={styles.tabFilters}>
          <button 
            className={`${styles.tabBtn} ${statusFilter === 'ALL' ? styles.activeTab : ''}`}
            onClick={() => setStatusFilter('ALL')}
          >
            All Items ({counts.all})
          </button>
          <button 
            className={`${styles.tabBtn} ${statusFilter === 'VERIFIED' ? styles.activeTab : ''}`}
            onClick={() => setStatusFilter('VERIFIED')}
          >
            Verified ({counts.verified})
          </button>
          <button 
            className={`${styles.tabBtn} ${statusFilter === 'SUBMITTED' ? styles.activeTab : ''}`}
            onClick={() => setStatusFilter('SUBMITTED')}
          >
            Submitted ({counts.inProgress})
          </button>
          <button 
            className={`${styles.tabBtn} ${statusFilter === 'EXPIRED' ? styles.activeTab : ''}`}
            onClick={() => setStatusFilter('EXPIRED')}
          >
            Expired ({counts.expired})
          </button>
        </div>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Filter by candidate or document..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.toolbarActions}>
            <button className={styles.filterBtn}>
              <Filter size={14} />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Table Content / Empty / Error */}
        {isLoading && (
          <div className={styles.stateContainer}>
            <p>Loading compliance telemetry...</p>
          </div>
        )}

        {isError && (
          <div className={styles.stateContainer}>
            <div className={styles.errorIcon}>
              <AlertTriangle size={24} />
            </div>
            <h3>Unable to fetch compliance checklist</h3>
            <p>Could not connect to Compliance Microservice on port 8084.</p>
            <button onClick={() => refetch()} className={styles.primaryBtn}>
              Retry Connection
            </button>
          </div>
        )}

        {!isLoading && !isError && filteredExpirations.length === 0 && (
          <div className={styles.stateContainer}>
            <ShieldCheck size={36} style={{ color: 'var(--color-text-tertiary)' }} />
            <h3>No Expirations Found</h3>
            <p>No document compliance items match your current filter parameters.</p>
          </div>
        )}

        {!isLoading && !isError && filteredExpirations.length > 0 && (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Document Type</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'end' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpirations.map((exp) => {
                const candidateObj = candidateMap.get(exp.candidateApplicationId);
                const candidateName = candidateObj ? `${candidateObj.firstName || ''} ${candidateObj.lastName || ''}`.trim() : (exp as any).candidateName || exp.candidateApplicationId;
                const initial = candidateName.charAt(0).toUpperCase();

                return (
                  <tr key={exp.itemId || exp.candidateApplicationId}>
                    <td>
                      <div className={styles.candidateCell}>
                        <div className={styles.avatar}>{initial}</div>
                        <div>
                          <div className={styles.candidateName}>{candidateName}</div>
                          <div className={styles.candidateSub}>ID: {exp.candidateApplicationId.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={styles.docType}>{exp.documentType}</span>
                    </td>
                    <td className={styles.expiryDate}>{exp.expiryDate || 'N/A'}</td>
                    <td>
                      <StatusBadge status={exp.status} />
                    </td>
                    <td style={{ textAlign: 'end' }}>
                      <Link href={`/compliance/${exp.candidateApplicationId}`} className={styles.actionBtn}>
                        Manage
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
