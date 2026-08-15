const fs = require('fs');
const path = require('path');

const base = 'c:/Users/Sayeed Rizwan/OneDrive/Desktop/recruitment-erp/frontend';
const reqFeaturesDir = path.join(base, 'src/features/requisitions');
const canFeaturesDir = path.join(base, 'src/features/candidates');
const appDashboardDir = path.join(base, 'src/app/(dashboard)');

// Ensure dirs
[
  reqFeaturesDir,
  canFeaturesDir,
  path.join(appDashboardDir, 'requisitions'),
  path.join(appDashboardDir, 'requisitions/[id]'),
  path.join(appDashboardDir, 'requisitions/[id]/pipeline'),
  path.join(appDashboardDir, 'candidates'),
  path.join(appDashboardDir, 'candidates/bulk'),
  path.join(appDashboardDir, 'candidates/[id]')
].forEach(d => fs.mkdirSync(d, { recursive: true }));

const files = {
  // Requisitions Features
  [path.join(reqFeaturesDir, 'RequisitionList.module.css')]: `
.container { padding: 1rem; }
.filters { display: flex; gap: 1rem; margin-bottom: 1rem; }
`,
  [path.join(reqFeaturesDir, 'RequisitionList.tsx')]: `
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRequisitions } from '@/hooks/useRequisitions';
import { DataTable } from '@/ui/DataTable';
import { Input } from '@/ui/Input';
import { Select } from '@/ui/Select';
import { StatusBadge } from '@/ui/StatusBadge';
import { Button } from '@/ui/Button';
import Link from 'next/link';
import styles from './RequisitionList.module.css';

export const RequisitionList: React.FC = () => {
  const t = useTranslations();
  const [filters, setFilters] = useState({});
  const { data, isLoading } = useRequisitions(filters);

  const columns = [
    { key: 'title', title: t('Requisitions.jobTitle') },
    { key: 'department', title: t('Requisitions.department') },
    { key: 'location', title: t('Requisitions.location') },
    { 
      key: 'status', 
      title: t('Requisitions.status'),
      render: (val: string) => <StatusBadge status={val} />
    },
    {
      key: 'actions',
      title: t('Common.actions'),
      render: (_: any, row: any) => (
        <Link href={\`/requisitions/\${row.id}\`}><Button variant="secondary" size="sm">{t('Common.view')}</Button></Link>
      )
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.filters}>
        <Input placeholder={t('Common.search')} onChange={(e) => setFilters({...filters, search: e.target.value})} />
        <Select options={[
          { label: 'All', value: '' },
          { label: 'Open', value: 'OPEN' }
        ]} onChange={(e) => setFilters({...filters, status: e.target.value})} />
      </div>
      <DataTable data={data?.data || []} columns={columns} loading={isLoading} />
    </div>
  );
};
`,
  [path.join(reqFeaturesDir, 'RequisitionKanban.module.css')]: `
.board { display: flex; gap: 1rem; overflow-x: auto; padding: 1rem; }
.column { min-width: 300px; background: #f4f4f5; border-radius: 8px; padding: 1rem; }
.card { background: white; padding: 1rem; margin-bottom: 0.5rem; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
`,
  [path.join(reqFeaturesDir, 'RequisitionKanban.tsx')]: `
import React from 'react';
import { useTranslations } from 'next-intl';
import { useRequisitions } from '@/hooks/useRequisitions';
import styles from './RequisitionKanban.module.css';
import Link from 'next/link';

const STATUSES = ['DRAFT', 'OPEN', 'ON_HOLD', 'CLOSED'];

export const RequisitionKanban: React.FC = () => {
  const t = useTranslations();
  const { data } = useRequisitions();

  const grouped = STATUSES.map(status => ({
    status,
    items: data?.data?.filter(r => r.status === status) || []
  }));

  return (
    <div className={styles.board}>
      {grouped.map(col => (
        <div key={col.status} className={styles.column}>
          <h3>{t(\`Common.status.\${col.status}\`)} ({col.items.length})</h3>
          {col.items.map(item => (
            <Link key={item.id} href={\`/requisitions/\${item.id}\`}>
              <div className={styles.card}>
                <h4>{item.title}</h4>
                <p>{item.department}</p>
              </div>
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
};
`,
  [path.join(reqFeaturesDir, 'RequisitionDetail.tsx')]: `
import React from 'react';
import { useTranslations } from 'next-intl';
import { useRequisition } from '@/hooks/useRequisitions';
import { StatusBadge } from '@/ui/StatusBadge';
import { Button } from '@/ui/Button';
import Link from 'next/link';

export const RequisitionDetail: React.FC<{ id: string }> = ({ id }) => {
  const t = useTranslations();
  const { data: req, isLoading } = useRequisition(id);

  if (isLoading || !req) return <div>Loading...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>{req.title} <StatusBadge status={req.status} /></h2>
        <Link href={\`/requisitions/\${req.id}/pipeline\`}>
          <Button>{t('Requisitions.pipeline')}</Button>
        </Link>
      </div>
      <p>{t('Requisitions.department')}: {req.department}</p>
      <p>{t('Requisitions.location')}: {req.location}</p>
      <div>
        <h3>{t('Requisitions.description')}</h3>
        <p>{req.description}</p>
      </div>
    </div>
  );
};
`,
  // Candidates Features
  [path.join(canFeaturesDir, 'CandidateList.tsx')]: `
import React from 'react';
import { useTranslations } from 'next-intl';
import { useCandidates } from '@/hooks/useCandidates';
import { DataTable } from '@/ui/DataTable';
import { Button } from '@/ui/Button';
import Link from 'next/link';

export const CandidateList: React.FC = () => {
  const t = useTranslations();
  const { data, isLoading } = useCandidates();

  const columns = [
    { key: 'firstName', title: t('Candidates.firstName') },
    { key: 'lastName', title: t('Candidates.lastName') },
    { key: 'email', title: t('Candidates.email') },
    {
      key: 'actions',
      title: t('Common.actions'),
      render: (_: any, row: any) => (
        <Link href={\`/candidates/\${row.id}\`}><Button variant="secondary" size="sm">{t('Common.view')}</Button></Link>
      )
    }
  ];

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <Link href="/candidates/bulk"><Button>{t('Candidates.bulkUpload')}</Button></Link>
      </div>
      <DataTable data={data?.data || []} columns={columns} loading={isLoading} />
    </div>
  );
};
`,
  [path.join(canFeaturesDir, 'CandidatePipeline.tsx')]: `
import React from 'react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { CandidateApplication } from '@/lib/api-types';

export const CandidatePipeline: React.FC<{ requisitionId: string }> = ({ requisitionId }) => {
  const t = useTranslations();
  const { data: apps } = useQuery({
    queryKey: ['requisition_applications', requisitionId],
    queryFn: () => apiClient.get<CandidateApplication[]>(\`/requisitions/\${requisitionId}/applications\`)
  });

  const statuses = ['APPLIED', 'SCREENING', 'INTERVIEWING', 'OFFERED', 'HIRED', 'REJECTED'];

  return (
    <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', padding: '1rem' }}>
      {statuses.map(status => {
        const colApps = apps?.filter(a => a.status === status) || [];
        return (
          <div key={status} style={{ minWidth: 300, background: '#f4f4f5', padding: '1rem', borderRadius: 8 }}>
            <h3>{t(\`Common.status.\${status}\`)} ({colApps.length})</h3>
            {colApps.map(app => (
              <div key={app.id} style={{ background: 'white', padding: '1rem', marginBottom: '0.5rem', borderRadius: 4 }}>
                {app.candidate?.firstName} {app.candidate?.lastName}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};
`,
  [path.join(canFeaturesDir, 'BulkEntryGrid.tsx')]: `
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/ui/Button';
import { useBulkUploadCandidates } from '@/hooks/useCandidates';
import { Textarea } from '@/ui/Textarea';

export const BulkEntryGrid: React.FC = () => {
  const t = useTranslations();
  const [text, setText] = useState('');
  const { mutate, isPending } = useBulkUploadCandidates();

  const handleSave = () => {
    // very basic parser
    const rows = text.split('\\n').filter(Boolean).map(row => {
      const [firstName, lastName, email] = row.split(',');
      return { firstName, lastName, email, phone: '', skills: [], experienceYears: 0 };
    });
    mutate(rows, {
      onSuccess: () => alert('Saved')
    });
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>{t('Candidates.bulkUpload')}</h2>
      <p>{t('Candidates.pasteData')}</p>
      <Textarea rows={10} value={text} onChange={e => setText(e.target.value)} placeholder="firstName,lastName,email" />
      <Button style={{ marginTop: '1rem' }} onClick={handleSave} disabled={isPending}>
        {t('Candidates.saveBulk')}
      </Button>
    </div>
  );
};
`,
  [path.join(canFeaturesDir, 'CandidateProfile.tsx')]: `
import React from 'react';
import { useTranslations } from 'next-intl';
import { useCandidate } from '@/hooks/useCandidates';

export const CandidateProfile: React.FC<{ id: string }> = ({ id }) => {
  const t = useTranslations();
  const { data: candidate, isLoading } = useCandidate(id);

  if (isLoading || !candidate) return <div>Loading...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>{candidate.firstName} {candidate.lastName}</h2>
      <p>{candidate.email} | {candidate.phone}</p>
      <div>
        <h3>{t('Candidates.skills')}</h3>
        <p>{candidate.skills?.join(', ')}</p>
      </div>
      <div>
        <h3>{t('Candidates.documents')}</h3>
        {candidate.documents?.map(doc => (
          <div key={doc.id}><a href={doc.url} target="_blank">{doc.fileName}</a></div>
        ))}
      </div>
    </div>
  );
};
`,
  // App Routes
  [path.join(appDashboardDir, 'requisitions/page.tsx')]: `
"use client";
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { RequisitionList } from '@/features/requisitions/RequisitionList';
import { RequisitionKanban } from '@/features/requisitions/RequisitionKanban';
import { Button } from '@/ui/Button';

export default function RequisitionsPage() {
  const t = useTranslations('Requisitions');
  const [view, setView] = useState<'list'|'kanban'>('list');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between' }}>
        <h1>{t('title')}</h1>
        <div>
          <Button variant={view === 'list' ? 'primary' : 'secondary'} onClick={() => setView('list')}>{t('list')}</Button>
          <Button variant={view === 'kanban' ? 'primary' : 'secondary'} onClick={() => setView('kanban')}>{t('kanban')}</Button>
        </div>
      </div>
      {view === 'list' ? <RequisitionList /> : <RequisitionKanban />}
    </div>
  );
}
`,
  [path.join(appDashboardDir, 'requisitions/[id]/page.tsx')]: `
"use client";
import { RequisitionDetail } from '@/features/requisitions/RequisitionDetail';

export default function RequisitionDetailPage({ params }: { params: { id: string } }) {
  return <RequisitionDetail id={params.id} />;
}
`,
  [path.join(appDashboardDir, 'requisitions/[id]/pipeline/page.tsx')]: `
"use client";
import { CandidatePipeline } from '@/features/candidates/CandidatePipeline';

export default function PipelinePage({ params }: { params: { id: string } }) {
  return <CandidatePipeline requisitionId={params.id} />;
}
`,
  [path.join(appDashboardDir, 'candidates/page.tsx')]: `
"use client";
import { CandidateList } from '@/features/candidates/CandidateList';

export default function CandidatesPage() {
  return <CandidateList />;
}
`,
  [path.join(appDashboardDir, 'candidates/bulk/page.tsx')]: `
"use client";
import { BulkEntryGrid } from '@/features/candidates/BulkEntryGrid';

export default function BulkUploadPage() {
  return <BulkEntryGrid />;
}
`,
  [path.join(appDashboardDir, 'candidates/[id]/page.tsx')]: `
"use client";
import { CandidateProfile } from '@/features/candidates/CandidateProfile';

export default function CandidateProfilePage({ params }: { params: { id: string } }) {
  return <CandidateProfile id={params.id} />;
}
`
};

for (const [filepath, content] of Object.entries(files)) {
  fs.writeFileSync(filepath, content.trim() + '\\n');
  console.log('Created:', filepath);
}
