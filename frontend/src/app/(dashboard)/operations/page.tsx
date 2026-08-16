'use client';

import React from 'react';
import { useDashboardActivity } from '@/hooks/useDashboardActivity';
import { useComplianceExpirations } from '@/hooks/useComplianceExpirations';
import { useRequisitions } from '@/hooks/useRequisitions';
import { useCandidates } from '@/hooks/useCandidates';
import styles from './page.module.css';
import Link from 'next/link';

export default function OperationsDashboardPage() {
  const { data: activities, isLoading: activitiesLoading } = useDashboardActivity();
  const { data: expirations, isLoading: expirationsLoading } = useComplianceExpirations();
  const { data: requisitionsData } = useRequisitions();
  const { data: candidatesData } = useCandidates();

  const reqs = Array.isArray(requisitionsData) ? requisitionsData : (requisitionsData as any)?.content || (requisitionsData as any)?.data || [];
  const cands = Array.isArray(candidatesData) ? candidatesData : (candidatesData as any)?.content || (candidatesData as any)?.data || [];

  const pendingRequisitions = reqs.filter((r: any) => r.status === 'DRAFT' || r.status === 'OPEN');
  const pendingActionsList = [
    ...pendingRequisitions.slice(0, 3).map((r: any) => ({
      id: `pending-req-${r.id}`,
      type: 'PENDING REQUISITION',
      text: `Requisition "${r.title || r.jobTitle || 'Untitled'}" (${r.department || r.category || 'General'}) is in ${r.status} status.`,
    })),
    ...cands.slice(0, 3).map((c: any) => ({
      id: `pending-cand-${c.id}`,
      type: 'CANDIDATE IN PIPELINE',
      text: `Candidate ${c.firstName || ''} ${c.lastName || ''} (${c.location || 'Unassigned'}) in application pipeline.`,
    })),
  ];

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <h1>Operational Dashboard</h1>
        <p>Real-time monitoring of system events and pending actions.</p>
      </header>

      <div className={styles.grid}>
        {/* Live Activity Feed */}
        <div className={styles.glassCard}>
          <h2 className={styles.cardTitle}>Live Activity Feed</h2>
          {activitiesLoading && <p style={{ color: 'var(--color-text-secondary)' }}>Loading live activity feed...</p>}
          <div className={styles.activityList}>
            {activities?.map((activity) => (
              <div key={activity.id} className={styles.activityItem}>
                <div className={styles.activityHeader}>
                  <span className={styles.activityType}>{activity.type}</span>
                  <span className={styles.activityTime}>{new Date(activity.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className={styles.activityBody}>
                  <span className={styles.activityActor}>{activity.actor}</span> acted on <b>{activity.entity}</b>.
                </div>
              </div>
            ))}
            {(!activities || activities.length === 0) && !activitiesLoading && (
              <p style={{ color: 'var(--color-text-tertiary)' }}>No recent activity.</p>
            )}
          </div>
        </div>

        {/* Pending Actions & Compliance Alerts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className={styles.glassCard}>
            <h2 className={styles.cardTitle}>Pending Actions</h2>
            <div className={styles.activityList}>
              {pendingActionsList.map((action) => (
                <div key={action.id} className={styles.activityItem}>
                  <div className={styles.activityHeader}>
                    <span className={styles.activityType}>{action.type}</span>
                  </div>
                  <div className={styles.activityBody}>{action.text}</div>
                </div>
              ))}
              {pendingActionsList.length === 0 && (
                <p style={{ color: 'var(--color-text-tertiary)' }}>No pending actions.</p>
              )}
            </div>
          </div>

          <div className={styles.glassCard}>
            <h2 className={styles.cardTitle}>Compliance Alerts</h2>
            {expirationsLoading && <p style={{ color: 'var(--color-text-secondary)' }}>Loading compliance alerts...</p>}
            {expirations && expirations.length > 0 ? (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Candidate / Document</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {expirations.map((exp) => {
                    const displayName = exp.candidateName || exp.candidateApplicationId;
                    return (
                      <tr key={exp.itemId || exp.candidateApplicationId}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--color-text, #0f172a)', fontSize: '0.9rem' }}>{displayName}</div>
                          <div style={{ fontSize: '0.775rem', color: 'var(--color-text-tertiary, #64748b)', marginTop: '0.15rem' }}>{exp.documentType}</div>
                        </td>
                        <td>
                          <span className={`${styles.badge} ${styles[exp.status]}`}>
                            {exp.status ? exp.status.replace('_', ' ') : ''}
                          </span>
                        </td>
                        <td>
                          <Link href={`/compliance/${exp.candidateApplicationId}`} style={{ color: 'var(--color-primary, #2563eb)', textDecoration: 'none', fontWeight: 600 }}>
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              !expirationsLoading && <p style={{ color: 'var(--color-text-tertiary)' }}>No compliance alerts.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
