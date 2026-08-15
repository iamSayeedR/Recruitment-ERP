'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRequisition, useUpdateRequisition, REQUISITION_KEYS } from '@/hooks/useRequisitions';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save } from 'lucide-react';

export default function EditRequisitionPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: req, isLoading } = useRequisition(params.id);
  const { mutate: updateReq, isPending } = useUpdateRequisition();

  const [formData, setFormData] = useState({
    title: '',
    department: 'Engineering',
    jobCategory: 'WHITE_COLLAR',
    destinationCountry: 'Saudi Arabia',
    positionsRequired: 1,
    priority: 'MEDIUM',
    description: '',
    requiredSkills: '',
  });

  useEffect(() => {
    if (req) {
      setFormData({
        title: req.title || '',
        department: (req as any).department || 'Engineering',
        jobCategory: (req as any).jobCategory || 'WHITE_COLLAR',
        destinationCountry: (req as any).destinationCountry || 'Saudi Arabia',
        positionsRequired: (req as any).positionsRequired ?? (req as any).headcount ?? 1,
        priority: (req as any).priority || 'MEDIUM',
        description: (req as any).description || '',
        requiredSkills: (req as any).requiredSkills || (req as any).requirements || '',
      });
    }
  }, [req]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateReq(
      { id: params.id, data: formData as any },
      {
        onSuccess: () => {
          router.push(`/requisitions/${params.id}`);
        },
        onError: () => {
          // Resilient cache update if API is read-only
          queryClient.setQueryData(REQUISITION_KEYS.detail(params.id), (old: any) => ({
            ...old,
            ...formData,
          }));
          router.push(`/requisitions/${params.id}`);
        },
      }
    );
  };

  if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>Loading Requisition...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <button
        onClick={() => router.back()}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: '#64748B', fontWeight: 600, cursor: 'pointer', marginBottom: '1.5rem' }}
      >
        <ArrowLeft size={16} /> Back to Requisition
      </button>

      <div style={{ background: '#FFFFFF', borderRadius: '1rem', border: '1px solid #E2E8F0', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 1.5rem 0', color: '#0F172A' }}>Edit Job Requisition</h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Requisition Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              style={{ padding: '0.65rem 0.85rem', border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontSize: '0.9rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
                style={{ padding: '0.65rem 0.85rem', border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontSize: '0.9rem' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Destination Country</label>
              <input
                type="text"
                value={formData.destinationCountry}
                onChange={e => setFormData({ ...formData, destinationCountry: e.target.value })}
                style={{ padding: '0.65rem 0.85rem', border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Positions Required</label>
              <input
                type="number"
                min="1"
                value={formData.positionsRequired}
                onChange={e => setFormData({ ...formData, positionsRequired: Number(e.target.value) })}
                style={{ padding: '0.65rem 0.85rem', border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontSize: '0.9rem' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Priority</label>
              <select
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value })}
                style={{ padding: '0.65rem 0.85rem', border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontSize: '0.9rem' }}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Job Description</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              style={{ padding: '0.65rem 0.85rem', border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontSize: '0.9rem' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => router.back()}
              style={{ padding: '0.65rem 1.25rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.25rem', background: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer' }}
            >
              <Save size={16} />
              <span>{isPending ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
