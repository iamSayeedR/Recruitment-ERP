'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import styles from './page.module.css';

export default function SignInPage() {
  const [username, setUsername] = useState('tenantadmin@acme.dev');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        username: username.trim(),
        password: password.trim(),
        redirect: false,
        callbackUrl: '/',
      });

      setLoading(false);

      if (res?.error) {
        setError('Invalid username/email or password. Please try again.');
      } else {
        window.location.href = res?.url || '/';
      }
    } catch (err: any) {
      setLoading(false);
      setError('Invalid username/email or password. Please try again.');
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  return (
    <div className={styles.container} suppressHydrationWarning>
      <div className={styles.glassCard} suppressHydrationWarning>
        <div className={styles.brandHeader}>
          <div className={styles.logoBadge}>ERP</div>
          <h1>Recruitment ERP</h1>
          <p>Enterprise Mobility & Talent System</p>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleCredentialsLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="username">Username or Email</label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. tenantadmin@acme.dev"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={loading} className={styles.primaryBtn}>
            {loading ? 'Authenticating...' : 'Sign In with Credentials'}
          </button>
        </form>

        <div className={styles.divider}>
          <span>OR CONTINUE WITH SSO</span>
        </div>

        <button
          onClick={() => signIn('keycloak', { callbackUrl: '/' })}
          className={styles.ssoBtn}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          Sign in via Keycloak IAM
        </button>

        <div className={styles.demoSection}>
          <p className={styles.demoTitle}>Quick Fill Demo Roles:</p>
          <div className={styles.demoButtons}>
            <button
              type="button"
              onClick={() => handleQuickFill('tenantadmin@acme.dev', 'admin123')}
              className={styles.demoChip}
            >
              Tenant Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('recruiter@acme.dev', 'admin123')}
              className={styles.demoChip}
            >
              Recruiter
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('complianceofficer@acme.dev', 'compliance123')}
              className={styles.demoChip}
            >
              Compliance
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('branchmanager@acme.dev', 'admin123')}
              className={styles.demoChip}
            >
              Branch Manager
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
