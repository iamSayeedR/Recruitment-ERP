'use client';

import React from 'react';
import Link from 'next/link';

export default function AuthError() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F6F9', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '440px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '1rem', padding: '2.5rem', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', textAlign: 'center' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#FEE2E2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto', fontSize: '1.5rem', fontWeight: 'bold' }}>
          !
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>
          Authentication Error
        </h1>
        <p style={{ color: '#64748B', fontSize: '0.875rem', margin: '0.5rem 0 1.5rem 0' }}>
          There was a problem authenticating your session. Please check your credentials or contact your administrator.
        </p>
        <Link href="/auth/signin" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.7rem 1.25rem', background: '#38BDF8', color: '#FFFFFF', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}>
          Return to Sign In
        </Link>
      </div>
    </div>
  );
}
