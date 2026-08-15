'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UserPlus, Sparkles } from 'lucide-react';
import { useCreateCandidate } from '@/hooks/useCandidates';
import styles from '../page.module.css';

const DEMO_CANDIDATE_PRESETS = [
  {
    label: 'Fatima Al-Zahra',
    data: {
      firstName: 'Fatima',
      lastName: 'Al-Zahra',
      email: 'fatima.alzahra@example.com',
      phone: '+971 50 123 4567',
      location: 'Dubai, UAE',
      skills: 'Project Management, Agile, Scrum, EPC',
      experienceYears: 8,
    },
  },
  {
    label: 'Carlos Mendoza',
    data: {
      firstName: 'Carlos',
      lastName: 'Mendoza',
      email: 'carlos.mendoza@example.com',
      phone: '+63 917 555 0199',
      location: 'Manila, Philippines',
      skills: 'React, TypeScript, Node.js, Spring Boot',
      experienceYears: 5,
    },
  },
  {
    label: 'Vikram Patel',
    data: {
      firstName: 'Vikram',
      lastName: 'Patel',
      email: 'vikram.patel@example.com',
      phone: '+91 98123 45678',
      location: 'Mumbai, India',
      skills: 'Kubernetes, DevOps, AWS, CI/CD, Java',
      experienceYears: 9,
    },
  },
  {
    label: 'Amina Hassan',
    data: {
      firstName: 'Amina',
      lastName: 'Hassan',
      email: 'amina.hassan@example.com',
      phone: '+20 10 9876 5432',
      location: 'Cairo, Egypt',
      skills: 'Python, Django, PostgreSQL, Data Science',
      experienceYears: 4,
    },
  },
];

export default function NewCandidatePage() {
  const router = useRouter();
  const createCandidateMutation = useCreateCandidate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    skills: '',
    experienceYears: 3,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      setErrorMessage('First name, last name, and email are required.');
      return;
    }

    const payload = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      phone: formData.phone ? formData.phone.trim() : undefined,
      nationality: formData.location ? formData.location.trim() : 'Filipino',
      skills: formData.skills ? formData.skills.trim() : '',
    };

    createCandidateMutation.mutate(payload as any, {
      onSuccess: () => {
        router.push('/candidates');
      },
      onError: (err: any) => {
        setErrorMessage(err?.message || 'Failed to create candidate. Please try again.');
      },
    });
  };

  return (
    <div className={styles.container}>
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
          <span>Back to Candidates</span>
        </button>
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '2rem', maxWidth: '640px', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserPlus size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>Add Candidate Profile</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: '0.2rem 0 0 0' }}>Register a new candidate in the global talent pool.</p>
          </div>
        </div>

        {errorMessage && (
          <div style={{ padding: '0.75rem 1rem', background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: '0.5rem', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            {errorMessage}
          </div>
        )}

        {/* Demo Auto-Fill Chips */}
        <div style={{ background: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: '0.65rem', padding: '0.85rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Sparkles size={13} style={{ color: '#2563EB' }} />
            One-Click Demo Candidate Presets
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {DEMO_CANDIDATE_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '0.375rem', color: '#2563EB', fontWeight: 600, cursor: 'pointer' }}
                onClick={() => setFormData(preset.data)}
              >
                + {preset.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>First Name *</label>
              <input
                type="text"
                placeholder="e.g. Fatima"
                value={formData.firstName}
                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                style={{ padding: '0.65rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontSize: '0.875rem' }}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Last Name *</label>
              <input
                type="text"
                placeholder="e.g. Al-Zahra"
                value={formData.lastName}
                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                style={{ padding: '0.65rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontSize: '0.875rem' }}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Email Address *</label>
              <input
                type="email"
                placeholder="fatima.alzahra@example.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                style={{ padding: '0.65rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontSize: '0.875rem' }}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Phone Number</label>
              <input
                type="text"
                placeholder="+971 50 123 4567"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                style={{ padding: '0.65rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontSize: '0.875rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Location / Country</label>
              <input
                type="text"
                placeholder="e.g. Dubai, UAE"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                style={{ padding: '0.65rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontSize: '0.875rem' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Experience (Years)</label>
              <input
                type="number"
                min="0"
                max="40"
                value={formData.experienceYears}
                onChange={e => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                style={{ padding: '0.65rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontSize: '0.875rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Skills (comma-separated)</label>
            <input
              type="text"
              placeholder="e.g. Project Management, Agile, Scrum"
              value={formData.skills}
              onChange={e => setFormData({ ...formData, skills: e.target.value })}
              style={{ padding: '0.65rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontSize: '0.875rem' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => router.back()}
              style={{ padding: '0.6rem 1.25rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createCandidateMutation.isPending}
              style={{ padding: '0.6rem 1.5rem', background: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer' }}
            >
              {createCandidateMutation.isPending ? 'Saving Candidate...' : 'Save Candidate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
