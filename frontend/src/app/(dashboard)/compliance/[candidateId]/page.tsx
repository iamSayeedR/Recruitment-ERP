'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/ui/Button';
import styles from '../page.module.css';
import {
  useComplianceChecklist,
  useAddComplianceItem,
  useUpdateComplianceItemStatus,
  useVerifyChecklistItem,
  ChecklistItem
} from '@/hooks/useComplianceChecklist';
import { Plus, ShieldCheck, ArrowLeft, Check, Upload, X } from 'lucide-react';

export default function CandidateCompliancePage() {
  const { candidateId } = useParams();
  const router = useRouter();

  const { data: checklist, isLoading, error, refetch } = useComplianceChecklist(candidateId as string);
  const addItemMutation = useAddComplianceItem();
  const updateStatusMutation = useUpdateComplianceItemStatus();
  const verifyMutation = useVerifyChecklistItem();

  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [newDocType, setNewDocType] = useState('');
  const [newStatus, setNewStatus] = useState('NOT_STARTED');
  const [selectedDocUrl, setSelectedDocUrl] = useState<string | null>(null);

  const handleStatusChange = (itemId: string, statusValue: string) => {
    if (!checklist?.id) return;
    updateStatusMutation.mutate({
      checklistId: checklist.id,
      itemId,
      status: statusValue,
      candidateId: candidateId as string,
    });
  };

  const handleAddRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocType.trim()) return;

    addItemMutation.mutate(
      {
        candidateId: candidateId as string,
        documentType: newDocType.trim(),
        status: newStatus,
      },
      {
        onSuccess: () => {
          setNewDocType('');
          setNewStatus('NOT_STARTED');
          setIsAddFormOpen(false);
        },
      }
    );
  };

  const isFetchingData = isLoading || (!checklist && !error);

  return (
    <div className={styles.container}>
      <header className={styles.header} style={{ marginBottom: '1.5rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <button
            onClick={() => router.back()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'none',
              border: 'none',
              color: '#64748B',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
              Compliance Checklist
            </h1>
            <p style={{ margin: '0.25rem 0 0 0', color: '#64748B', fontSize: '0.875rem' }}>
              Candidate ID: {candidateId}
            </p>
          </div>

          <button
            onClick={() => setIsAddFormOpen(!isAddFormOpen)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.6rem 1.1rem',
              background: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(37,99,235,0.2)',
            }}
          >
            <Plus size={16} />
            <span>{isAddFormOpen ? 'Close Form' : 'Add Compliance Requirement'}</span>
          </button>
        </div>
      </header>

      {/* Add Compliance Requirement Form Modal / Panel */}
      {isAddFormOpen && (
        <div
          style={{
            background: '#F8FAFC',
            border: '1px solid #CBD5E1',
            borderRadius: '0.75rem',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#1E293B' }}>
              + Add New Compliance Requirement
            </h3>
            <button
              onClick={() => setIsAddFormOpen(false)}
              style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleAddRequirement} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 2, minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
                Requirement / Document Type *
              </label>
              <input
                type="text"
                placeholder="e.g. Passport, Medical Certificate, Police Clearance..."
                value={newDocType}
                onChange={(e) => setNewDocType(e.target.value)}
                style={{
                  padding: '0.55rem 0.75rem',
                  border: '1px solid #CBD5E1',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  width: '100%',
                }}
                required
              />
            </div>

            <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
                Initial Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                style={{
                  padding: '0.55rem 0.75rem',
                  border: '1px solid #CBD5E1',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  background: '#FFFFFF',
                }}
              >
                <option value="NOT_STARTED">Not Started</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="VERIFIED">Verified</option>
                <option value="EXPIRED">Expired</option>
                <option value="WAIVED">Waived</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={addItemMutation.isPending}
              style={{
                padding: '0.58rem 1.25rem',
                background: '#16A34A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              {addItemMutation.isPending ? 'Saving...' : 'Save Requirement'}
            </button>
          </form>
        </div>
      )}

      {error ? (
        <div style={{ padding: '1rem', color: '#EF4444', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px' }}>
          Failed to load compliance checklist: {(error as Error).message}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '2rem' }}>
          <section className={styles.section} style={{ flex: 1 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', color: '#1E293B' }}>
              Requirements & Regulatory Verification
            </h2>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Requirement / Document Type</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'end' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isFetchingData ? (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', padding: '1.5rem' }}>
                        Loading compliance items...
                      </td>
                    </tr>
                  ) : checklist?.items && checklist.items.length > 0 ? (
                    checklist.items.map((item) => {
                      const docType = item.rule?.documentType || 'Required Document';
                      const currentStatus = (item.status || 'NOT_STARTED').toUpperCase();
                      const hasDoc = !!item.documentReference;

                      return (
                        <tr key={item.id}>
                          <td>
                            <strong>{docType}</strong>
                          </td>
                          <td>
                            <select
                              value={currentStatus}
                              onChange={(e) => handleStatusChange(item.id, e.target.value)}
                              style={{
                                padding: '0.4rem 0.65rem',
                                borderRadius: '6px',
                                border: '1px solid #CBD5E1',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                background:
                                  currentStatus === 'VERIFIED'
                                    ? '#F0FDF4'
                                    : currentStatus === 'SUBMITTED'
                                    ? '#EFF6FF'
                                    : currentStatus === 'IN_PROGRESS'
                                    ? '#FEFCE8'
                                    : '#FFFFFF',
                                color:
                                  currentStatus === 'VERIFIED'
                                    ? '#16A34A'
                                    : currentStatus === 'SUBMITTED'
                                    ? '#2563EB'
                                    : currentStatus === 'IN_PROGRESS'
                                    ? '#D97706'
                                    : '#334155',
                              }}
                              disabled={updateStatusMutation.isPending}
                            >
                              <option value="NOT_STARTED">Not Started</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="SUBMITTED">Submitted</option>
                              <option value="VERIFIED">Verified</option>
                              <option value="EXPIRED">Expired</option>
                              <option value="WAIVED">Waived</option>
                            </select>
                          </td>
                          <td style={{ textAlign: 'end' }}>
                            <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                              {!hasDoc && currentStatus !== 'SUBMITTED' && (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleStatusChange(item.id, 'SUBMITTED')}
                                >
                                  Upload
                                </Button>
                              )}
                              {hasDoc && (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => setSelectedDocUrl(item.documentReference!)}
                                >
                                  View Document
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
                        No compliance requirements added yet. Click <strong>+ Add Compliance Requirement</strong> above to add one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {selectedDocUrl && (
            <section className={styles.section} style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2>Document Viewer</h2>
                <Button variant="secondary" size="sm" onClick={() => setSelectedDocUrl(null)}>
                  Close
                </Button>
              </div>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', height: '500px' }}>
                <iframe
                  src={selectedDocUrl}
                  title="Document Viewer"
                  sandbox="allow-same-origin"
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
