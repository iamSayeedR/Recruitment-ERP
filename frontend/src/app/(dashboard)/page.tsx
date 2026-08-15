'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useDashboardSummary } from '@/hooks/useDashboardSummary';
import styles from './page.module.css';

export default function DashboardHome() {
  const { data: session } = useSession();
  const { data: summary, isLoading, isError, refetch } = useDashboardSummary();

  const userName = session?.user?.name || session?.user?.email || 'Executive User';

  if (isLoading) {
    return (
      <div className={styles.dashboardContainer}>
        <header className={styles.header}>
          <h1>Executive Dashboard</h1>
          <p>Loading real-time data metrics...</p>
        </header>
        <div className={styles.grid}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.glassCardSkeleton}>
              <div className={styles.skeletonPulse} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.dashboardContainer}>
        <header className={styles.header}>
          <h1>Executive Dashboard</h1>
          <p>Welcome back, {userName}. Overview of recruitment operations.</p>
        </header>
        <div className={styles.errorCard}>
          <div className={styles.errorIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <h3>Dashboard Metrics Connection Alert</h3>
          <p>Unable to retrieve live telemetry from Gateway service (port 8085).</p>
          <button onClick={() => refetch()} className={styles.retryBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <h1>Executive Dashboard</h1>
        <p>Welcome back, {userName}. Here is your realtime overview.</p>
      </header>

      <div className={styles.grid}>
        {/* Requisition Funnel Widget */}
        <div className={styles.glassCard} id="requisition-funnel">
          <h2 className={styles.cardTitle}>Requisition Funnel</h2>
          <div className={styles.funnel}>
            <div className={styles.funnelStage}>
              <span>{summary?.requisitions?.DRAFT || 0}</span>
              <small>DRAFT</small>
            </div>
            <div className={styles.funnelStage}>
              <span>{summary?.requisitions?.APPROVED || 0}</span>
              <small>APPROVED</small>
            </div>
            <div className={styles.funnelStage}>
              <span>{summary?.requisitions?.PUBLISHED || 0}</span>
              <small>PUBLISHED</small>
            </div>
            <div className={styles.funnelStage}>
              <span>{summary?.requisitions?.FILLED || 0}</span>
              <small>FILLED</small>
            </div>
          </div>
        </div>

        {/* Candidate Pipeline Widget */}
        <div className={styles.glassCard} id="candidate-pipeline">
          <h2 className={styles.cardTitle}>Candidate Pipeline</h2>
          <div className={styles.pipeline}>
            <div className={styles.pipelineItem}>
              <span className={styles.pipelineLabel}>Applied</span>
              <span className={styles.pipelineValue}>{summary?.candidates?.APPLIED || 0}</span>
            </div>
            <div className={styles.pipelineItem}>
              <span className={styles.pipelineLabel}>Interviewed</span>
              <span className={styles.pipelineValue}>{summary?.candidates?.INTERVIEWED || 0}</span>
            </div>
            <div className={styles.pipelineItem}>
              <span className={styles.pipelineLabel}>Selected</span>
              <span className={styles.pipelineValue}>{summary?.candidates?.SELECTED || 0}</span>
            </div>
            <div className={styles.pipelineItem}>
              <span className={styles.pipelineLabel}>Mobilized</span>
              <span className={styles.pipelineValue}>{summary?.candidates?.MOBILIZED || 0}</span>
            </div>
          </div>
        </div>

        {/* Compliance Summary Widget */}
        <div className={styles.glassCard} id="compliance-summary">
          <h2 className={styles.cardTitle}>Compliance Summary</h2>
          <div className={styles.complianceSummary}>
            <div className={`${styles.complianceBadge} ${styles.badgeNOT_STARTED}`}>
              <span>{summary?.compliance?.NOT_STARTED || 0}</span>
              <small>Not Started</small>
            </div>
            <div className={`${styles.complianceBadge} ${styles.badgeSUBMITTED}`}>
              <span>{summary?.compliance?.SUBMITTED || 0}</span>
              <small>Submitted</small>
            </div>
            <div className={`${styles.complianceBadge} ${styles.badgeVERIFIED}`}>
              <span>{summary?.compliance?.VERIFIED || 0}</span>
              <small>Verified</small>
            </div>
            <div className={`${styles.complianceBadge} ${styles.badgeEXPIRED}`}>
              <span>{summary?.compliance?.EXPIRED || 0}</span>
              <small>Expired</small>
            </div>
          </div>
        </div>

        {/* SLA Metrics Widget */}
        <div className={styles.glassCard} id="sla-metrics">
          <h2 className={styles.cardTitle}>SLA Metrics</h2>
          <table className={styles.slaTable}>
            <thead>
              <tr>
                <th>Top Corridors</th>
                <th>Avg. Time-to-Mobilize</th>
              </tr>
            </thead>
            <tbody>
              {summary?.slaMetrics?.map((sla, idx) => (
                <tr key={idx}>
                  <td>{sla.corridor}</td>
                  <td>{sla.averageDaysToMobilize} days</td>
                </tr>
              ))}
              {(!summary?.slaMetrics || summary.slaMetrics.length === 0) && (
                <tr>
                  <td colSpan={2} style={{ textAlign: 'center', color: '#64748b', padding: '1rem' }}>
                    No corridor SLA metrics aggregated yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
