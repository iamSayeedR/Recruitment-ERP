import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCandidate } from '@/hooks/useCandidates';
import { Button } from '@/ui/Button';
import styles from './CandidateProfile.module.css';

export const CandidateProfile: React.FC<{ id: string }> = ({ id }) => {
  const t = useTranslations('Candidates');
  const router = useRouter();
  const { data: candidate, isLoading } = useCandidate(id);
  const [activeTab, setActiveTab] = useState<'personal' | 'applications' | 'documents' | 'viewer'>('personal');
  const [selectedDocUrl, setSelectedDocUrl] = useState<string | null>(null);

  if (id === 'new') {
    router.replace('/candidates/new');
    return null;
  }

  if (isLoading || !candidate) return <div className={styles.loading}>Loading Candidate Profile...</div>;

  const handleViewDocument = (url?: string) => {
    if (url) {
      setSelectedDocUrl(url);
      setActiveTab('viewer');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.avatar}>{(candidate.firstName || 'C')[0]}{(candidate.lastName || 'A')[0]}</div>
        <div>
          <h2>{candidate.firstName || 'Candidate'} {candidate.lastName || ''}</h2>
          <p>{candidate.email || 'No email'} &bull; {candidate.phone || 'No phone'}</p>
        </div>
      </header>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'personal' ? styles.active : ''}`}
          onClick={() => setActiveTab('personal')}
        >
          {t('profile')}
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'applications' ? styles.active : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          {t('applications')}
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'documents' ? styles.active : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          {t('uploadDocuments')}
        </button>
        {activeTab === 'viewer' && (
          <button className={`${styles.tab} ${styles.active}`}>
            {t('viewDocument')}
          </button>
        )}
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'personal' && (
          <div className={styles.grid}>
            <div className={styles.infoBlock}>
              <span>{t('location')}</span>
              <strong>{candidate.location || '-'}</strong>
            </div>
            <div className={styles.infoBlock}>
              <span>{t('experienceYears')}</span>
              <strong>{candidate.experienceYears ?? 0}</strong>
            </div>
            <div className={styles.infoBlock}>
              <span>{t('skills')}</span>
              <strong>
                {Array.isArray(candidate.skills)
                  ? candidate.skills.join(', ')
                  : typeof candidate.skills === 'string'
                  ? candidate.skills
                  : '-'}
              </strong>
            </div>
            <div className={styles.infoBlock}>
              <span>Passport / National ID</span>
              <strong>***-***-*** (Encrypted)</strong>
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div>
            <h3>Recent Applications</h3>
            {/* Will fetch applications here */}
            <p className={styles.empty}>No recent applications found.</p>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className={styles.documentsArea}>
            <Button>{t('uploadDocuments')} via Presigned URL</Button>
            
            <ul className={styles.docList}>
              {candidate.documents?.map((doc: any) => (
                <li key={doc.id} className={styles.docItem}>
                  <span>{doc.fileName}</span>
                  <Button variant="secondary" size="sm" onClick={() => handleViewDocument(doc.url)}>
                    {t('viewDocument')}
                  </Button>
                </li>
              ))}
              {!candidate.documents?.length && <li className={styles.empty}>No documents uploaded.</li>}
            </ul>
          </div>
        )}

        {activeTab === 'viewer' && selectedDocUrl && (
          <div className={styles.viewerContainer}>
            <iframe src={selectedDocUrl} className={styles.viewerFrame} title="Document Viewer" sandbox="allow-same-origin" />
          </div>
        )}
      </div>
    </div>
  );
};
