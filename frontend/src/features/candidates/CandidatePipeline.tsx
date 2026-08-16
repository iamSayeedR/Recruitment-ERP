import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Candidate, CandidateApplication, CandidateApplicationStatus } from '@/lib/api-types';
import { UserPlus, X, Search, ArrowLeft } from 'lucide-react';
import styles from './CandidatePipeline.module.css';

const PIPELINE_COLUMNS: Array<{ key: CandidateApplicationStatus; label: string }> = [
  { key: 'APPLIED', label: 'Applied' },
  { key: 'SCREENING', label: 'Screening' },
  { key: 'INTERVIEW_SCHEDULED', label: 'Interview Scheduled' },
  { key: 'INTERVIEWED', label: 'Interviewed' },
  { key: 'SHORTLISTED', label: 'Shortlisted' },
  { key: 'SELECTED', label: 'Selected' },
  { key: 'OFFER_ACCEPTED', label: 'Offer Accepted' },
  { key: 'REJECTED', label: 'Rejected' },
];

const formatExp = (c: any) => {
  if (!c) return '';
  if (c.workExperience && String(c.workExperience).trim()) {
    const val = String(c.workExperience).trim();
    return val.toLowerCase().includes('exp') || val.toLowerCase().includes('year') ? val : `${val} Yrs Exp`;
  }
  if (c.experienceYears !== undefined && c.experienceYears !== null && c.experienceYears !== 0) {
    return `${c.experienceYears} Yrs Exp`;
  }
  return '';
};

export const CandidatePipeline: React.FC<{ requisitionId: string }> = ({ requisitionId }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [candidateSearch, setCandidateSearch] = useState('');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
  
  const [modalMode, setModalMode] = useState<'select' | 'create'>('select');
  const [newCandidateData, setNewCandidateData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    skills: '',
    experienceYears: 3,
  });

  const [localApps, setLocalApps] = useState<CandidateApplication[]>([]);

  // Fetch applications for this requisition from candidate-service
  const { data: serverApps, isLoading, refetch } = useQuery({
    queryKey: ['requisition_applications', requisitionId],
    queryFn: async () => {
      try {
        const res = await apiClient<CandidateApplication[]>(`/candidates/requisitions/${requisitionId}/applications`);
        return Array.isArray(res) ? res : [];
      } catch (err) {
        console.warn('Failed to fetch applications for requisition:', err);
        return [];
      }
    },
    staleTime: 0,
  });

  useEffect(() => {
    if (Array.isArray(serverApps)) {
      setLocalApps(serverApps);
    }
  }, [serverApps]);

  // Fetch all registered candidates for modal picker
  const { data: candidatesData } = useQuery({
    queryKey: ['all_candidates_select'],
    queryFn: () => apiClient<any>('/candidates?page=0&size=100').catch(() => null),
    enabled: isAssignModalOpen,
  });

  const candidates: any[] = candidatesData?.content || candidatesData?.data || (Array.isArray(candidatesData) ? candidatesData : []);

  const filteredCandidates = candidates.filter(c => {
    const fullName = `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase();
    const email = (c.email || '').toLowerCase();
    const q = candidateSearch.toLowerCase();
    return fullName.includes(q) || email.includes(q);
  });

  const handleDropWithId = async (appId: string, newStatus: CandidateApplicationStatus) => {
    // If appId is a temporary client-side ID, refetch to get the real UUID from server
    let targetAppId = appId;
    if (targetAppId.startsWith('temp-') || targetAppId.startsWith('app-')) {
      const fresh = await refetch();
      const realList = fresh.data || [];
      const match = realList.find(a => a.id && !a.id.startsWith('temp-') && !a.id.startsWith('app-'));
      if (match) {
        targetAppId = match.id;
      } else {
        return;
      }
    }

    setLocalApps(prev => prev.map(a => a.id === appId || a.id === targetAppId ? { ...a, status: newStatus } : a));
    setIsAssignModalOpen(false);

    try {
      await apiClient(`/candidates/applications/${targetAppId}/status?status=${newStatus}`, {
        method: 'PATCH',
      });
      queryClient.invalidateQueries({ queryKey: ['requisition_applications', requisitionId] });
      refetch();
    } catch (e) {
      console.warn('Status patch saved locally:', e);
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'select' && selectedCandidateId) {
      const selected = candidates.find(c => c.id === selectedCandidateId);
      const tempId = `temp-${Date.now()}`;
      const newApp: CandidateApplication = {
        id: tempId,
        candidateId: selectedCandidateId,
        requisitionId,
        status: 'APPLIED',
        appliedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        candidate: selected as Candidate,
      };
      setLocalApps(prev => [newApp, ...prev]);
      setIsAssignModalOpen(false);
      setSelectedCandidateId('');

      try {
        const res = await apiClient<CandidateApplication>('/candidates/applications', {
          method: 'POST',
          body: JSON.stringify({ candidateId: selectedCandidateId, requisitionId }),
        });
        if (res && res.id) {
          setLocalApps(prev => prev.map(a => a.id === tempId ? { ...a, id: res.id } : a));
        }
        refetch();
      } catch (err) {
        console.warn('Application assigned locally:', err);
      }
    } else if (modalMode === 'create') {
      const newCandId = `cand-${Date.now()}`;
      const tempId = `app-${Date.now()}`;
      const newApp: CandidateApplication = {
        id: tempId,
        candidateId: newCandId,
        requisitionId,
        status: 'APPLIED',
        appliedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        candidate: {
          id: newCandId,
          firstName: newCandidateData.firstName,
          lastName: newCandidateData.lastName,
          email: newCandidateData.email,
          phone: newCandidateData.phone,
          location: newCandidateData.location,
          skills: newCandidateData.skills || '',
          workExperience: `${newCandidateData.experienceYears || 3} Years`,
        } as any,
      };
      setLocalApps(prev => [newApp, ...prev]);
      setIsAssignModalOpen(false);

      try {
        const createdCand = await apiClient<Candidate>('/candidates', {
          method: 'POST',
          body: JSON.stringify({
            firstName: newCandidateData.firstName.trim(),
            lastName: newCandidateData.lastName.trim(),
            email: newCandidateData.email.trim(),
            phone: newCandidateData.phone ? newCandidateData.phone.trim() : undefined,
            nationality: newCandidateData.location ? newCandidateData.location.trim() : 'Filipino',
            skills: newCandidateData.skills ? newCandidateData.skills.trim() : '',
            workExperience: `${newCandidateData.experienceYears || 3} Years`,
          }),
        });
        if (createdCand?.id) {
          const res = await apiClient<CandidateApplication>('/candidates/applications', {
            method: 'POST',
            body: JSON.stringify({ candidateId: createdCand.id, requisitionId }),
          });
          if (res && res.id) {
            setLocalApps(prev => prev.map(a => a.id === tempId ? { ...a, id: res.id, candidateId: createdCand.id, candidate: createdCand } : a));
          }
        }
        refetch();
      } catch (err) {
        console.warn('Candidate created & assigned locally:', err);
      }
    }
  };

  if (isLoading) return <div className={styles.loading}>Loading Candidate Pipeline...</div>;

  const getAppsByStatus = (status: string) => {
    return Array.isArray(localApps) ? localApps.filter(a => a && a.status === status) : [];
  };

  return (
    <div className={styles.container}>
      {/* Top Back Navigation Banner */}
      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => router.push(`/requisitions/${requisitionId}`)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: '#64748B', fontWeight: 600, cursor: 'pointer' }}
        >
          <ArrowLeft size={16} /> Back to Requisition Detail
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 className={styles.title} style={{ margin: 0 }}>Candidate Sourcing Pipeline</h2>
        <button
          onClick={() => { setIsAssignModalOpen(true); setModalMode('select'); }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.55rem 1rem',
            background: '#2563EB',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '0.5rem',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          <UserPlus size={16} />
          <span>Add Candidate to Pipeline</span>
        </button>
      </div>

      <div className={styles.board}>
        {PIPELINE_COLUMNS.map(col => (
          <div 
            key={col.key} 
            className={styles.column}
            onDragOver={e => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
            }}
            onDrop={e => {
              e.preventDefault();
              const appId = e.dataTransfer.getData('text/plain');
              if (appId) {
                handleDropWithId(appId, col.key);
              }
            }}
          >
            <div className={styles.columnHeader}>
              <h3>{col.label}</h3>
              <span className={styles.count}>{getAppsByStatus(col.key).length}</span>
            </div>
            
            <div className={styles.cards}>
              {getAppsByStatus(col.key).length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: '#94A3B8', textAlign: 'center', padding: '1rem 0' }}>
                  No candidates
                </div>
              ) : (
                getAppsByStatus(col.key).map(app => (
                  <div 
                    key={app.id} 
                    className={styles.card}
                    draggable
                    onDragStart={e => {
                      e.dataTransfer.setData('text/plain', app.id);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                  >
                    <div className={styles.cardName}>
                      {app.candidate?.firstName || 'Candidate'} {app.candidate?.lastName || ''}
                    </div>
                    <div className={styles.cardMeta}>
                      {formatExp(app.candidate)} &bull; {app.candidate?.email || 'N/A'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Assign / Create Candidate Modal */}
      {isAssignModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '1rem' }} onClick={() => setIsAssignModalOpen(false)}>
          <div style={{ background: '#FFFFFF', borderRadius: '1rem', width: '100%', maxWidth: '520px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>
                {modalMode === 'select' ? 'Add Existing Candidate to Pipeline' : 'Create & Add New Candidate'}
              </h3>
              <button style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }} onClick={() => setIsAssignModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Sub-Header Mode Switcher */}
            <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
              <button
                type="button"
                style={{ flex: 1, padding: '0.65rem', border: 'none', background: modalMode === 'select' ? '#FFFFFF' : 'transparent', fontWeight: 600, fontSize: '0.85rem', color: modalMode === 'select' ? '#2563EB' : '#64748B', borderBottom: modalMode === 'select' ? '2px solid #2563EB' : 'none', cursor: 'pointer' }}
                onClick={() => setModalMode('select')}
              >
                Search Existing Candidates
              </button>
              <button
                type="button"
                style={{ flex: 1, padding: '0.65rem', border: 'none', background: modalMode === 'create' ? '#FFFFFF' : 'transparent', fontWeight: 600, fontSize: '0.85rem', color: modalMode === 'create' ? '#2563EB' : '#64748B', borderBottom: modalMode === 'create' ? '2px solid #2563EB' : 'none', cursor: 'pointer' }}
                onClick={() => setModalMode('create')}
              >
                + Create New Candidate
              </button>
            </div>

            <form onSubmit={handleAssignSubmit}>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {modalMode === 'select' ? (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Filter Candidate List</label>
                      <div style={{ position: 'relative' }}>
                        <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input
                          type="text"
                          placeholder="Search candidate by name or email..."
                          value={candidateSearch}
                          onChange={e => setCandidateSearch(e.target.value)}
                          style={{ padding: '0.55rem 0.75rem 0.55rem 2.2rem', border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontSize: '0.85rem', width: '100%' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Select Candidate *</label>
                      <select
                        value={selectedCandidateId}
                        onChange={e => setSelectedCandidateId(e.target.value)}
                        style={{ padding: '0.65rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontSize: '0.875rem' }}
                        required
                      >
                        <option value="">-- Choose a Candidate --</option>
                        {filteredCandidates.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.firstName} {c.lastName} ({c.email || 'No email'}) - {formatExp(c)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>First Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Fatima"
                          value={newCandidateData.firstName}
                          onChange={e => setNewCandidateData({ ...newCandidateData, firstName: e.target.value })}
                          style={{ padding: '0.55rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontSize: '0.85rem' }}
                          required
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>Last Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Al-Zahra"
                          value={newCandidateData.lastName}
                          onChange={e => setNewCandidateData({ ...newCandidateData, lastName: e.target.value })}
                          style={{ padding: '0.55rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontSize: '0.85rem' }}
                          required
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>Email *</label>
                        <input
                          type="email"
                          placeholder="fatima@example.com"
                          value={newCandidateData.email}
                          onChange={e => setNewCandidateData({ ...newCandidateData, email: e.target.value })}
                          style={{ padding: '0.55rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontSize: '0.85rem' }}
                          required
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>Phone</label>
                        <input
                          type="text"
                          placeholder="+971 50 123 4567"
                          value={newCandidateData.phone}
                          onChange={e => setNewCandidateData({ ...newCandidateData, phone: e.target.value })}
                          style={{ padding: '0.55rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>Location</label>
                        <input
                          type="text"
                          placeholder="Dubai, UAE"
                          value={newCandidateData.location}
                          onChange={e => setNewCandidateData({ ...newCandidateData, location: e.target.value })}
                          style={{ padding: '0.55rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>Experience (Yrs)</label>
                        <input
                          type="number"
                          value={newCandidateData.experienceYears}
                          onChange={e => setNewCandidateData({ ...newCandidateData, experienceYears: Number(e.target.value) })}
                          style={{ padding: '0.55rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', padding: '1.25rem 1.5rem', borderTop: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                <button type="button" onClick={() => setIsAssignModalOpen(false)} style={{ padding: '0.55rem 1rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.55rem 1.25rem', background: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  {modalMode === 'select' ? 'Add Candidate' : 'Create & Add Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
