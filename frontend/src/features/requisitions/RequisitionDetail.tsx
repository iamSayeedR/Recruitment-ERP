import React from 'react';
import { useRequisition, useTransitionRequisitionStatus } from '@/hooks/useRequisitions';
import { StatusBadge } from '@/ui/StatusBadge';
import { Button } from '@/ui/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, Send, XCircle } from 'lucide-react';
import styles from './RequisitionDetail.module.css';

export const RequisitionDetail: React.FC<{ id: string }> = ({ id }) => {
  const router = useRouter();
  const { data: req, isLoading } = useRequisition(id);
  const { mutate: transitionStatus, isPending: isTransitioning } = useTransitionRequisitionStatus();

  if (isLoading || !req) return <div className={styles.loading}>Loading requisition details...</div>;

  const rawCategory = (req as any).jobCategory || (req as any).category || 'WHITE_COLLAR';
  const category = rawCategory
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c: string) => c.toUpperCase());

  const department = (req as any).department && (req as any).department !== rawCategory
    ? (req as any).department
    : 'Engineering';

  const country = (req as any).destinationCountry || (req as any).country || 'Saudi Arabia';
  const location = (req as any).location || country;
  const priority = (req as any).priority || 'MEDIUM';
  const headcount = (req as any).positionsRequired ?? (req as any).headcount ?? 1;
  const description = (req as any).description || 'No description provided.';
  const requirements = (req as any).requiredSkills || (req as any).requirements || (req as any).requiredCertifications || 'None specified';

  const handleStatusTransition = (status: any) => {
    transitionStatus({ id: req.id, status });
  };

  return (
    <div className={styles.container}>
      <div className={styles.topNav}>
        <button onClick={() => router.push('/requisitions')} className={styles.backBtn}>
          <ArrowLeft size={16} />
          <span>Back to Requisitions</span>
        </button>
      </div>

      <header className={styles.header}>
        <div className={styles.titleSection}>
          <h2>{req.title}</h2>
          <StatusBadge status={req.status} />
        </div>
        <div className={styles.actions} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {/* Status Action Buttons */}
          {req.status === 'DRAFT' && (
            <button
              onClick={() => handleStatusTransition('APPROVED')}
              disabled={isTransitioning}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.85rem', background: '#059669', color: '#FFFFFF', border: 'none', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
            >
              <CheckCircle size={15} />
              <span>Approve Requisition</span>
            </button>
          )}
          {(req.status === 'APPROVED' || req.status === 'OPEN') && (
            <button
              onClick={() => handleStatusTransition('PUBLISHED')}
              disabled={isTransitioning}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.85rem', background: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
            >
              <Send size={15} />
              <span>Publish Job</span>
            </button>
          )}
          {req.status !== 'CLOSED' && req.status !== 'FILLED' && (
            <button
              onClick={() => handleStatusTransition('CLOSED')}
              disabled={isTransitioning}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.85rem', background: '#64748B', color: '#FFFFFF', border: 'none', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
            >
              <XCircle size={15} />
              <span>Close Job</span>
            </button>
          )}

          <Link href={`/requisitions/${req.id}/edit`}>
            <Button variant="secondary">Edit</Button>
          </Link>
          <Link href={`/requisitions/${req.id}/pipeline`}>
            <Button>Pipeline</Button>
          </Link>
        </div>
      </header>
      
      <div className={styles.content}>
        <div className={styles.grid}>
          <div className={styles.infoBlock}>
            <span>Department</span>
            <strong>{department}</strong>
          </div>
          <div className={styles.infoBlock}>
            <span>Category</span>
            <strong>{category}</strong>
          </div>
          <div className={styles.infoBlock}>
            <span>Country</span>
            <strong>{country}</strong>
          </div>
          <div className={styles.infoBlock}>
            <span>Location</span>
            <strong>{location}</strong>
          </div>
          <div className={styles.infoBlock}>
            <span>Priority</span>
            <strong>{priority}</strong>
          </div>
          <div className={styles.infoBlock}>
            <span>Headcount</span>
            <strong>{headcount}</strong>
          </div>
        </div>

        <section className={styles.section}>
          <h3>Description</h3>
          <p className={styles.text}>{description}</p>
        </section>

        <section className={styles.section}>
          <h3>Requirements</h3>
          <p className={styles.text}>{requirements}</p>
        </section>
      </div>
    </div>
  );
};
