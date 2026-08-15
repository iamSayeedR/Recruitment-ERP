'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCandidates } from '@/hooks/useCandidates';
import { useRequisitions } from '@/hooks/useRequisitions';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { StatusBadge } from '@/ui/StatusBadge';
import { Search, Filter, Plus, Upload, User, AlertCircle, ArrowLeft, GitPullRequest, X, Check, ShieldCheck } from 'lucide-react';
import styles from './page.module.css';

export default function CandidatesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useCandidates();
  const { data: reqsData } = useRequisitions();
  const { data: appsData } = useQuery({
    queryKey: ['all-candidate-applications'],
    queryFn: () => apiClient<any[]>('/candidates/applications').catch(() => []),
    staleTime: 0,
    refetchInterval: 3000,
  });
  
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  
  // Pipeline assignment modal state
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [selectedReqId, setSelectedReqId] = useState<string>('');
  const [assignSuccessMsg, setAssignSuccessMsg] = useState<string | null>(null);

  const requisitions: any[] = (reqsData as any)?.data || (Array.isArray(reqsData) ? reqsData : []);
  const candidateList = Array.isArray(data) ? data : (data as any)?.content || (data as any)?.data || [];

  const getCandidateStage = (c: any) => {
    // 1. Prioritize active requisition pipeline applications from PostgreSQL
    if (Array.isArray(appsData) && appsData.length > 0) {
      const candidateApps = appsData.filter((a: any) => 
        (a.candidateId && String(a.candidateId).toLowerCase() === String(c.id).toLowerCase()) ||
        (a.candidate?.email && c.email && a.candidate.email.toLowerCase() === c.email.toLowerCase()) ||
        (a.candidateId && c.email && String(a.candidateId).toLowerCase() === c.email.toLowerCase()) ||
        (a.candidate?.id && String(a.candidate.id).toLowerCase() === String(c.id).toLowerCase())
      );

      if (candidateApps.length > 0) {
        const statuses = candidateApps.map((a: any) => (a.status || 'APPLIED').toUpperCase());
        if (statuses.includes('MOBILIZED') || statuses.includes('PLACED')) return 'MOBILIZED';
        if (statuses.includes('SELECTED') || statuses.includes('OFFER_ACCEPTED') || statuses.includes('OFFER')) return 'OFFER_ACCEPTED';
        if (statuses.includes('INTERVIEWED') || statuses.includes('SCREENING') || statuses.includes('SHORTLISTED')) return 'SCREENING';
        return statuses[0] || 'APPLIED';
      }
    }

    // 2. Fallback to candidate profile status
    return (c.status || c.stage || 'APPLIED').toUpperCase();
  };

  const filteredCandidates = candidateList.filter((c: any) => {
    const fullName = `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.name || '';
    const email = c.email || '';
    const matchesSearch = fullName.toLowerCase().includes(search.toLowerCase()) || email.toLowerCase().includes(search.toLowerCase());
    const currentStage = getCandidateStage(c);
    const matchesStage = stageFilter === 'ALL' || 
      (stageFilter === 'SELECTED' ? ['SELECTED', 'OFFER_ACCEPTED', 'OFFER'].includes(currentStage) :
       stageFilter === 'INTERVIEWED' ? ['INTERVIEWED', 'SCREENING', 'SHORTLISTED'].includes(currentStage) :
       stageFilter === 'APPLIED' ? ['APPLIED', 'REGISTERED', 'NOT_STARTED'].includes(currentStage) :
       currentStage === stageFilter);
    return matchesSearch && matchesStage;
  });

  const counts = {
    all: candidateList.length,
    applied: candidateList.filter((c: any) => ['APPLIED', 'REGISTERED', 'NOT_STARTED'].includes(getCandidateStage(c))).length,
    interviewed: candidateList.filter((c: any) => ['INTERVIEWED', 'SCREENING', 'SHORTLISTED'].includes(getCandidateStage(c))).length,
    selected: candidateList.filter((c: any) => ['SELECTED', 'OFFER_ACCEPTED', 'OFFER'].includes(getCandidateStage(c))).length,
    mobilized: candidateList.filter((c: any) => ['MOBILIZED', 'PLACED'].includes(getCandidateStage(c))).length,
  };

  // Mutation to attach candidate to a requisition pipeline
  const attachMutation = useMutation({
    mutationFn: ({ candidateId, requisitionId }: { candidateId: string; requisitionId: string }) =>
      apiClient<any>('/candidates/applications', {
        method: 'POST',
        body: JSON.stringify({ candidateId, requisitionId }),
      }),
    onSuccess: (res, variables) => {
      const targetReq = requisitions.find((r: any) => r.id === variables.requisitionId);
      setAssignSuccessMsg(`Added ${selectedCandidate?.firstName || 'Candidate'} to ${targetReq?.title || 'Requisition'} pipeline!`);
      queryClient.invalidateQueries({ queryKey: ['requisitions'] });
      queryClient.invalidateQueries({ queryKey: ['requisition_applications', variables.requisitionId] });
      setTimeout(() => {
        setSelectedCandidate(null);
        setSelectedReqId('');
        setAssignSuccessMsg(null);
      }, 1500);
    },
  });

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCandidate && selectedReqId) {
      attachMutation.mutate({ candidateId: selectedCandidate.id, requisitionId: selectedReqId });
    }
  };

  return (
    <div className={styles.container}>
      {/* Universal Back Navigation Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          onClick={() => router.back()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '0.45rem 0.75rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
      </div>

      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Candidate Talent Pool</h1>
          <p className={styles.subtitle}>
            Track international job applicants, interview stages, and mobility readiness.
          </p>
        </div>

        <div className={styles.actions}>
          <Link href="/candidates/bulk" className={styles.secondaryBtn}>
            <Upload size={16} />
            <span>Bulk Import</span>
          </Link>
          <Link href="/candidates/new" className={styles.primaryBtn}>
            <Plus size={16} />
            <span>Add Candidate</span>
          </Link>
        </div>
      </header>

      <div className={styles.tableCard}>
        {/* Stage Tabs */}
        <div className={styles.tabFilters}>
          <button 
            className={`${styles.tabBtn} ${stageFilter === 'ALL' ? styles.activeTab : ''}`}
            onClick={() => setStageFilter('ALL')}
          >
            All Candidates ({counts.all})
          </button>
          <button 
            className={`${styles.tabBtn} ${stageFilter === 'APPLIED' ? styles.activeTab : ''}`}
            onClick={() => setStageFilter('APPLIED')}
          >
            Applied ({counts.applied})
          </button>
          <button 
            className={`${styles.tabBtn} ${stageFilter === 'INTERVIEWED' ? styles.activeTab : ''}`}
            onClick={() => setStageFilter('INTERVIEWED')}
          >
            Interviewed ({counts.interviewed})
          </button>
          <button 
            className={`${styles.tabBtn} ${stageFilter === 'SELECTED' ? styles.activeTab : ''}`}
            onClick={() => setStageFilter('SELECTED')}
          >
            Selected ({counts.selected})
          </button>
        </div>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search candidate name or email..."
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

        {/* Table Content / States */}
        {isLoading && (
          <div className={styles.stateContainer}>
            <p>Loading candidate talent pool...</p>
          </div>
        )}

        {isError && (
          <div className={styles.stateContainer}>
            <div className={styles.errorIcon}>
              <AlertCircle size={24} />
            </div>
            <h3>Unable to retrieve candidate records</h3>
            <p>Could not connect to Candidate Microservice on port 8083.</p>
            <button onClick={() => refetch()} className={styles.primaryBtn}>
              Retry Query
            </button>
          </div>
        )}

        {!isLoading && !isError && filteredCandidates.length === 0 && (
          <div className={styles.stateContainer}>
            <User size={36} style={{ color: 'var(--color-text-tertiary)' }} />
            <h3>No Candidates Found</h3>
            <p>No candidate profiles match your search criteria.</p>
          </div>
        )}

        {!isLoading && !isError && filteredCandidates.length > 0 && (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Candidate Name & Contact</th>
                <th>Location</th>
                <th>Pipeline Stage</th>
                <th style={{ textAlign: 'end' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map((c: any) => {
                const name = `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.name || 'Candidate';
                const initial = name.charAt(0).toUpperCase();

                return (
                  <tr key={c.id}>
                    <td>
                      <div className={styles.candidateCell}>
                        <div className={styles.avatar}>{initial}</div>
                        <div>
                          <div className={styles.candidateName}>{name}</div>
                          <div className={styles.candidateSub}>{c.email || 'No email provided'}</div>
                        </div>
                      </div>
                    </td>
                    <td className={styles.locationText}>{c.location || c.nationality || 'Remote'}</td>
                    <td>
                      <StatusBadge status={getCandidateStage(c)} />
                    </td>
                    <td style={{ textAlign: 'end' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
                        <button
                          onClick={() => { setSelectedCandidate(c); setSelectedReqId(''); setAssignSuccessMsg(null); }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            padding: '0.35rem 0.65rem',
                            background: '#EFF6FF',
                            border: '1px solid #BFDBFE',
                            borderRadius: '0.375rem',
                            fontSize: '0.775rem',
                            fontWeight: 600,
                            color: '#2563EB',
                            cursor: 'pointer',
                          }}
                        >
                          <GitPullRequest size={13} />
                          <span>Add to Pipeline</span>
                        </button>
                        <Link
                          href={`/compliance/${c.id}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            padding: '0.35rem 0.65rem',
                            background: '#F0FDF4',
                            border: '1px solid #BBF7D0',
                            borderRadius: '0.375rem',
                            fontSize: '0.775rem',
                            fontWeight: 600,
                            color: '#16A34A',
                            textDecoration: 'none',
                          }}
                        >
                          <ShieldCheck size={13} />
                          <span>Compliance</span>
                        </Link>
                        <Link href={`/candidates/${c.id}`} className={styles.actionBtn}>
                          View Profile
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Candidate to Requisition Pipeline Modal */}
      {selectedCandidate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '1rem' }} onClick={() => setSelectedCandidate(null)}>
          <div style={{ background: '#FFFFFF', borderRadius: '1rem', width: '100%', maxWidth: '480px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>Add {selectedCandidate.firstName || 'Candidate'} to Requisition</h3>
              <button style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }} onClick={() => setSelectedCandidate(null)}>
                <X size={18} />
              </button>
            </div>

            {assignSuccessMsg ? (
              <div style={{ padding: '2rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={24} />
                </div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#0F172A' }}>Success!</h4>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#475569' }}>{assignSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleAssignSubmit}>
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ padding: '0.75rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '0.5rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F172A' }}>
                      {selectedCandidate.firstName} {selectedCandidate.lastName}
                    </div>
                    <div style={{ fontSize: '0.775rem', color: '#64748B' }}>
                      {selectedCandidate.email} &bull; {selectedCandidate.experienceYears ?? 0} yrs exp
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Select Target Job Requisition *</label>
                    {requisitions.length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>
                        No active requisitions found. Please create a requisition first.
                      </p>
                    ) : (
                      <select
                        value={selectedReqId}
                        onChange={e => setSelectedReqId(e.target.value)}
                        style={{ padding: '0.65rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontSize: '0.875rem' }}
                        required
                      >
                        <option value="">-- Choose a Job Requisition --</option>
                        {requisitions.map((req: any) => (
                          <option key={req.id} value={req.id}>
                            {req.title} ({req.jobCategory || req.department || 'Engineering'} &bull; {req.destinationCountry || req.location || 'Saudi Arabia'})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', padding: '1.25rem 1.5rem', borderTop: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                  <button type="button" onClick={() => setSelectedCandidate(null)} style={{ padding: '0.55rem 1rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedReqId || attachMutation.isPending}
                    style={{ padding: '0.55rem 1.25rem', background: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer', opacity: !selectedReqId ? 0.6 : 1 }}
                  >
                    {attachMutation.isPending ? 'Attaching...' : 'Add to Pipeline'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
