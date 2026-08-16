import React from 'react';
import { useTranslations } from 'next-intl';
import { useCandidates } from '@/hooks/useCandidates';
import { DataTable, Column } from '@/ui/DataTable';
import { Button } from '@/ui/Button';
import Link from 'next/link';
import styles from './CandidateList.module.css';

export const CandidateList: React.FC = () => {
  const t = useTranslations('Candidates');
  const tCommon = useTranslations('Common');
  const { data, isLoading } = useCandidates();

  const columns: Column<any>[] = [
    { key: 'firstName', header: t('firstName') },
    { key: 'lastName', header: t('lastName') },
    { key: 'email', header: t('email') },
    { key: 'location', header: t('location') },
    {
      key: 'actions',
      header: tCommon('actions'),
      render: (row: any) => (
        <Link href={`/candidates/${row.id}`}>
          <Button variant="secondary" size="sm">{tCommon('view')}</Button>
        </Link>
      )
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>{t('title')}</h2>
        <Link href="/candidates/bulk"><Button>{t('bulkUpload')}</Button></Link>
      </div>
      <DataTable data={Array.isArray(data) ? data : ((data as any)?.content || [])} columns={columns} loading={isLoading} />
    </div>
  );
};
