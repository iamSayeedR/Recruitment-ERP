import React, { useState } from 'react';
import { useBulkUploadCandidates } from '@/hooks/useCandidates';
import { useRouter } from 'next/navigation';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import styles from './BulkEntryGrid.module.css';

export const BulkEntryGrid: React.FC = () => {
  const [pastedData, setPastedData] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();
  const { mutate, isPending } = useBulkUploadCandidates();

  const handleSave = () => {
    setStatusMessage(null);
    const rows = pastedData.split('\n').filter(r => r.trim().length > 0);
    const candidates = rows.map(row => {
      const delimiter = row.includes('\t') ? '\t' : ',';
      const cols = row.split(delimiter).map(c => c.trim());
      const firstName = cols[0] || '';
      const lastName = cols[1] || '';
      const email = cols[2] || '';
      const phone = cols[3] || '';
      const nationality = cols[4] || 'Saudi Arabia';
      const skills = cols.length >= 7 ? cols[6] : (cols[5] || '');
      const workExperience = cols.length >= 7 ? `${cols[5]} years` : undefined;

      return {
        firstName,
        lastName,
        email,
        phone,
        nationality,
        skills,
        workExperience,
      };
    }).filter(c => c.firstName && c.lastName);

    if (candidates.length === 0) {
      setStatusMessage({ type: 'error', text: 'No valid candidate rows found. Please provide at least First Name and Last Name per row.' });
      return;
    }

    mutate(candidates as any, {
      onSuccess: () => {
        setPastedData('');
        setStatusMessage({ type: 'success', text: `Successfully uploaded ${candidates.length} candidates!` });
        setTimeout(() => {
          router.push('/candidates');
        }, 1500);
      },
      onError: (err: any) => {
        setStatusMessage({ type: 'error', text: err?.message || 'Failed to upload candidates. Please check row format.' });
      }
    });
  };

  const rowCount = pastedData.split('\n').filter(r => r.trim().length > 0).length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <h2>Bulk Candidate Upload</h2>
          <p>Paste CSV or tab-separated data from Excel to import candidates in batch.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isPending || !pastedData.trim()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.55rem 1.1rem',
            background: isPending || !pastedData.trim() ? 'var(--color-disabled-bg)' : 'var(--color-primary)',
            color: isPending || !pastedData.trim() ? 'var(--color-disabled-text)' : '#FFFFFF',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: isPending || !pastedData.trim() ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s ease',
          }}
        >
          {isPending ? (
            <><Upload size={15} /> Saving Candidates...</>
          ) : (
            <><CheckCircle size={15} /> Save Candidates{rowCount > 0 ? ` (${rowCount})` : ''}</>
          )}
        </button>
      </div>

      {statusMessage && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: statusMessage.type === 'success' ? '#D1FAE5' : '#FEE2E2',
          color: statusMessage.type === 'success' ? '#065F46' : '#991B1B',
        }}>
          {statusMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className={styles.card}>
        <div className={styles.instructions}>
          <p>Paste Candidate Data (CSV / Excel format)</p>
          <p className={styles.helpText}>
            Columns: First Name, Last Name, Email, Phone, Nationality, Experience, Skills
          </p>
        </div>

        <textarea
          className={styles.textarea}
          rows={18}
          value={pastedData}
          onChange={e => setPastedData(e.target.value)}
          placeholder={`John, Doe, john@example.com, +966500000001, Saudi Arabia, 5 years, Java; Spring Boot\nJane, Smith, jane@example.com, +966500000002, UAE, 3 years, React; TypeScript`}
        />
      </div>
    </div>
  );
};
