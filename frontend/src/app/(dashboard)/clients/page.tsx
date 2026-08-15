'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RouteGuard } from '@/components/RouteGuard/RouteGuard';
import { Building, Plus, X, Mail, Phone, Globe, User, ArrowLeft } from 'lucide-react';
import { useClients, useCreateClient, CreateClientRequest } from '@/hooks/useClients';
import styles from './clients.module.css';

const DEMO_PRESETS: Array<{ label: string; data: CreateClientRequest }> = [
  {
    label: 'Saudi Aramco',
    data: {
      name: 'Saudi Aramco Project Division',
      industry: 'Oil & Gas',
      country: 'Saudi Arabia',
      contactPerson: 'Ahmed Al-Mansoor',
      contactEmail: 'ahmed.mansoor@aramco-demo.com',
      contactPhone: '+966 13 872 0111',
      notes: 'Overseas EPC & Pipeline Construction Staffing',
    },
  },
  {
    label: 'Al Futtaim Group',
    data: {
      name: 'Al Futtaim Group Services',
      industry: 'Retail & Real Estate',
      country: 'UAE',
      contactPerson: 'Sarah Jenkins',
      contactEmail: 's.jenkins@alfuttaim-demo.ae',
      contactPhone: '+971 4 208 5000',
      notes: 'Commercial & MEP Facilities Management',
    },
  },
  {
    label: 'NMC Healthcare',
    data: {
      name: 'NMC Healthcare Group',
      industry: 'Healthcare',
      country: 'UAE',
      contactPerson: 'Dr. Tariq Hassan',
      contactEmail: 't.hassan@nmc-demo.ae',
      contactPhone: '+971 4 336 4444',
      notes: 'ICU Staff Nurses & Medical Technologists',
    },
  },
  {
    label: 'Qatar Airways',
    data: {
      name: 'Qatar Airways Maintenance',
      industry: 'Aviation',
      country: 'Qatar',
      contactPerson: 'Fatima Al-Kuwari',
      contactEmail: 'fatima.kuwari@qatarairways-demo.qa',
      contactPhone: '+974 4022 5555',
      notes: 'Avionics & Heavy Engineering Logistics',
    },
  },
];

export default function ClientsPage() {
  const router = useRouter();
  const { data: clients = [], isLoading } = useClients();
  const createClientMutation = useCreateClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<CreateClientRequest>({
    name: '',
    industry: '',
    country: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    notes: '',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleOpenModal = () => {
    setFormData({
      name: '',
      industry: '',
      country: '',
      contactPerson: '',
      contactEmail: '',
      contactPhone: '',
      notes: '',
    });
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setErrorMessage(null);
  };

  const handleSelectPreset = (preset: CreateClientRequest) => {
    setFormData(preset);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMessage('Client company name is required.');
      return;
    }

    createClientMutation.mutate(formData, {
      onSuccess: () => {
        setIsModalOpen(false);
      },
      onError: (err: any) => {
        setErrorMessage(err?.message || 'Failed to create client. Please try again.');
      },
    });
  };

  return (
    <RouteGuard>
      <div className={styles.container}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
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
            <h1 className={styles.title}>Clients</h1>
            <p className={styles.subtitle}>Manage client companies and their active recruitment engagements.</p>
          </div>
          <button className={styles.primaryBtn} onClick={handleOpenModal}>
            <Plus size={16} />
            <span>Create Client</span>
          </button>
        </header>

        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>Loading client records...</div>
        ) : clients.length === 0 ? (
          <div className={styles.emptyCard}>
            <div className={styles.emptyIcon}>
              <Building size={28} />
            </div>
            <h3 className={styles.emptyTitle}>No Clients Yet</h3>
            <p className={styles.emptyText}>Client records will appear here once added to the system.</p>
            <button className={styles.primaryBtn} onClick={handleOpenModal}>
              <Plus size={15} />
              <span>Add First Client</span>
            </button>
          </div>
        ) : (
          <div className={styles.grid}>
            {clients.map((client) => (
              <div key={client.id} className={styles.clientCard}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.companyName}>{client.name}</h3>
                  {client.industry && <span className={styles.badge}>{client.industry}</span>}
                </div>
                <div className={styles.contactInfo}>
                  {client.country && (
                    <div className={styles.contactRow}>
                      <Globe size={14} />
                      <span>{client.country}</span>
                    </div>
                  )}
                  {client.contactPerson && (
                    <div className={styles.contactRow}>
                      <User size={14} />
                      <span>{client.contactPerson}</span>
                    </div>
                  )}
                  {client.contactEmail && (
                    <div className={styles.contactRow}>
                      <Mail size={14} />
                      <span>{client.contactEmail}</span>
                    </div>
                  )}
                  {client.contactPhone && (
                    <div className={styles.contactRow}>
                      <Phone size={14} />
                      <span>{client.contactPhone}</span>
                    </div>
                  )}
                  {client.notes && (
                    <div style={{ marginTop: '0.25rem', fontSize: '0.8rem', fontStyle: 'italic', color: '#64748B' }}>
                      &ldquo;{client.notes}&rdquo;
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {isModalOpen && (
          <div className={styles.modalOverlay} onClick={handleCloseModal}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>Create New Client</h3>
                <button className={styles.closeBtn} onClick={handleCloseModal}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className={styles.modalBody}>
                  {errorMessage && (
                    <div style={{ padding: '0.6rem 0.75rem', background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: '0.375rem', fontSize: '0.85rem' }}>
                      {errorMessage}
                    </div>
                  )}

                  <div className={styles.demoBox}>
                    <div className={styles.demoTitle}>Auto-Fill Demo Client Data</div>
                    <div className={styles.demoChips}>
                      {DEMO_PRESETS.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          className={styles.demoChip}
                          onClick={() => handleSelectPreset(preset.data)}
                        >
                          + {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Client / Company Name *</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="e.g. Saudi Aramco Project Division"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Industry</label>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="e.g. Oil & Gas, Healthcare"
                        value={formData.industry || ''}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Country</label>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="e.g. Saudi Arabia, UAE"
                        value={formData.country || ''}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Contact Person Name</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="e.g. Ahmed Al-Mansoor"
                      value={formData.contactPerson || ''}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Contact Email</label>
                      <input
                        type="email"
                        className={styles.input}
                        placeholder="ahmed@company.com"
                        value={formData.contactEmail || ''}
                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Contact Phone</label>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="+966 13 872 0111"
                        value={formData.contactPhone || ''}
                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Engagement Notes</label>
                    <textarea
                      className={styles.textarea}
                      rows={2}
                      placeholder="Key recruitment notes, contract terms, or special instructions..."
                      value={formData.notes || ''}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.modalFooter}>
                  <button type="button" className={styles.secondaryBtn} onClick={handleCloseModal}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.primaryBtn} disabled={createClientMutation.isPending}>
                    {createClientMutation.isPending ? 'Saving...' : 'Save Client'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </RouteGuard>
  );
}
