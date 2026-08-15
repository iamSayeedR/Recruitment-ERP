import React from 'react';
import styles from './StatusBadge.module.css';

export interface StatusBadgeProps {
  status: string;
}

const statusConfig: Record<string, { bg: string; color: string; dotColor: string }> = {
  // User & general
  ACTIVE:       { bg: '#D1FAE5', color: '#065F46', dotColor: '#10B981' },
  INACTIVE:     { bg: '#F1F5F9', color: '#475569', dotColor: '#94A3B8' },
  SUSPENDED:    { bg: '#FEE2E2', color: '#991B1B', dotColor: '#EF4444' },
  PENDING:      { bg: '#FEF3C7', color: '#92400E', dotColor: '#F59E0B' },
  COMPLETED:    { bg: '#D1FAE5', color: '#065F46', dotColor: '#10B981' },
  CANCELLED:    { bg: '#FEE2E2', color: '#991B1B', dotColor: '#EF4444' },
  // Requisitions
  DRAFT:        { bg: '#F1F5F9', color: '#475569', dotColor: '#94A3B8' },
  OPEN:         { bg: '#DBEAFE', color: '#1E40AF', dotColor: '#3B82F6' },
  PUBLISHED:    { bg: '#DBEAFE', color: '#1E40AF', dotColor: '#3B82F6' },
  APPROVED:     { bg: '#D1FAE5', color: '#065F46', dotColor: '#10B981' },
  FILLED:       { bg: '#F0FDF4', color: '#166534', dotColor: '#22C55E' },
  CLOSED:       { bg: '#F1F5F9', color: '#475569', dotColor: '#94A3B8' },
  REJECTED:     { bg: '#FEE2E2', color: '#991B1B', dotColor: '#EF4444' },
  // Candidates / Pipeline
  APPLIED:      { bg: '#EFF6FF', color: '#1D4ED8', dotColor: '#3B82F6' },
  SCREENING:    { bg: '#FEF3C7', color: '#92400E', dotColor: '#F59E0B' },
  SHORTLISTED:  { bg: '#FEF3C7', color: '#92400E', dotColor: '#F59E0B' },
  INTERVIEWED:  { bg: '#FEF3C7', color: '#92400E', dotColor: '#F59E0B' },
  SELECTED:     { bg: '#D1FAE5', color: '#065F46', dotColor: '#10B981' },
  OFFER_ACCEPTED:{ bg: '#D1FAE5', color: '#065F46', dotColor: '#10B981' },
  OFFER:        { bg: '#D1FAE5', color: '#065F46', dotColor: '#10B981' },
  MOBILIZED:    { bg: '#F3E8FF', color: '#6B21A8', dotColor: '#A855F7' },
  PLACED:       { bg: '#F3E8FF', color: '#6B21A8', dotColor: '#A855F7' },
  WITHDRAWN:    { bg: '#FEE2E2', color: '#991B1B', dotColor: '#EF4444' },
  // Compliance
  NOT_STARTED:  { bg: '#F1F5F9', color: '#475569', dotColor: '#94A3B8' },
  IN_PROGRESS:  { bg: '#FEF3C7', color: '#92400E', dotColor: '#F59E0B' },
  SUBMITTED:    { bg: '#DBEAFE', color: '#1E40AF', dotColor: '#3B82F6' },
  VERIFIED:     { bg: '#D1FAE5', color: '#065F46', dotColor: '#10B981' },
  EXPIRED:      { bg: '#FEE2E2', color: '#991B1B', dotColor: '#EF4444' },
  EXPIRING_SOON:{ bg: '#FEF3C7', color: '#92400E', dotColor: '#F59E0B' },
  WAIVED:       { bg: '#F1F5F9', color: '#475569', dotColor: '#94A3B8' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const key = (status || '').toUpperCase();
  const cfg = statusConfig[key] || { bg: '#F1F5F9', color: '#475569', dotColor: '#94A3B8' };
  const label = (status || '').charAt(0).toUpperCase() + (status || '').slice(1).toLowerCase().replace(/_/g, ' ');

  return (
    <span
      className={styles.badge}
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <span className={styles.dot} style={{ background: cfg.dotColor }} />
      {label}
    </span>
  );
};
