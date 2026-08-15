'use client';

import React from 'react';
import { RouteGuard } from '@/components/RouteGuard/RouteGuard';
import { useTenantStore } from '@/stores/tenant-store';
import styles from './settings.module.css';

export default function SettingsPage() {
  const { tenantName, primaryColor, secondaryColor, setTenantBranding, applyBranding } = useTenantStore();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    applyBranding();
    alert('Settings saved!');
  };

  return (
    <RouteGuard>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Tenant Settings</h1>
            <p className={styles.subtitle}>Configure your organization&apos;s branding and preferences.</p>
          </div>
        </header>

        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Organization Branding</h2>
          <form onSubmit={handleSave} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Tenant Name</label>
              <input
                type="text"
                value={tenantName || ''}
                onChange={(e) => setTenantBranding({ tenantName: e.target.value })}
                className={styles.input}
                placeholder="ACME Corporation"
              />
            </div>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>Primary Color</label>
                <div className={styles.colorRow}>
                  <input
                    type="color"
                    value={primaryColor || '#38BDF8'}
                    onChange={(e) => setTenantBranding({ primaryColor: e.target.value })}
                    className={styles.colorPicker}
                  />
                  <span className={styles.colorHex}>{primaryColor || '#38BDF8'}</span>
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Secondary Color</label>
                <div className={styles.colorRow}>
                  <input
                    type="color"
                    value={secondaryColor || '#64748B'}
                    onChange={(e) => setTenantBranding({ secondaryColor: e.target.value })}
                    className={styles.colorPicker}
                  />
                  <span className={styles.colorHex}>{secondaryColor || '#64748B'}</span>
                </div>
              </div>
            </div>
            <div className={styles.formFooter}>
              <button type="submit" className={styles.saveBtn}>
                Save Branding Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </RouteGuard>
  );
}
