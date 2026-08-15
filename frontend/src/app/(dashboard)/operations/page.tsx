'use client';

import React from 'react';
import { useDashboardActivity } from '@/hooks/useDashboardActivity';
import { useComplianceExpirations } from '@/hooks/useComplianceExpirations';
import styles from './page.module.css';
import Link from 'next/link';

export default function OperationsDashboardPage() {
  const { data: activities, isLoading: activitiesLoading } = useDashboardActivity();
  const { data: expirations, isLoading: expirationsLoading } = useComplianceExpirations();

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
          {activitiesLoading && <p>Loading activity feed...</p>}
          <div className={styles.activityList}>
            {activities?.map((activity) => (
              <div key={activity.id} className={styles.activityItem}>
                <div className={styles.activityHeader}>
                  <span className={styles.activityType}>{activity.type}</span>
                  <span className={styles.activityTime}>{new Date(activity.timestamp).toLocaleString()}</span>
                </div>
                <div className={styles.activityBody}>
                  <span className={styles.activityActor}>{activity.actor}</span> acted on <b>{activity.entity}</b>.
                </div>
              </div>
            ))}
            {(!activities || activities.length === 0) && !activitiesLoading && (
              <p style={{ color: '#94a3b8' }}>No recent activity.</p>
            )}
          </div>
        </div>

        {/* Pending Actions & Compliance Alerts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className={styles.glassCard}>
            <h2 className={styles.cardTitle}>Pending Actions</h2>
            <div className={styles.activityList}>
              <div className={styles.activityItem}>
                <div className={styles.activityHeader}>
                  <span className={styles.activityType}>OVERDUE APPROVAL</span>
                </div>
                <div className={styles.activityBody}>
                  Requisition REQ-123 has been pending approval for 3 days.
                </div>
              </div>
              <div className={styles.activityItem}>
                <div className={styles.activityHeader}>
                  <span className={styles.activityType}>STALLED CANDIDATE</span>
                </div>
                <div className={styles.activityBody}>
                  Candidate John Doe has been in INTERVIEWED stage for 8 days.
                </div>
              </div>
            </div>
          </div>

          <div className={styles.glassCard}>
            <h2 className={styles.cardTitle}>Compliance Alerts</h2>
            {expirationsLoading && <p>Loading alerts...</p>}
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
                  {expirations.map((exp) => (
                    <tr key={exp.itemId || exp.candidateApplicationId}>
                      <td>
                        <div>{(exp as any).candidateName || exp.candidateApplicationId}</div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{exp.documentType}</div>
                      </td>
                      <td>
                        <span className={`${styles.badge} ${styles[exp.status]}`}>
                          {exp.status ? exp.status.replace('_', ' ') : ''}
                        </span>
                      </td>
                      <td>
                        <Link href={`/compliance/${exp.candidateApplicationId}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              !expirationsLoading && <p style={{ color: '#94a3b8' }}>No compliance alerts.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
