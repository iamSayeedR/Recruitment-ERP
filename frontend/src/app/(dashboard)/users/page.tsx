'use client';

import React, { useState } from 'react';
import { RouteGuard } from '@/components/RouteGuard/RouteGuard';
import { Search, SlidersHorizontal, Plus, Settings, Users as UsersIcon, MoreVertical, X, Check, Edit, ShieldAlert } from 'lucide-react';
import { useSession } from 'next-auth/react';
import styles from './Users.module.css';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  access: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export default function UsersPage() {
  const { data: session } = useSession();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'role' | 'status'>('name');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeManageCategory, setActiveManageCategory] = useState<string | null>(null);
  const [activeRowMenuId, setActiveRowMenuId] = useState<string | null>(null);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'RECRUITER',
    access: 'Sourcing & ATS',
  });

  const currentUserEmail = session?.user?.email || 'tenantadmin@acme.dev';
  const currentUserName = session?.user?.name || 'Tenant Administrator';
  const roles = session?.user?.roles || ['TENANT_ADMIN'];

  const [userList, setUserList] = useState<UserRecord[]>([
    {
      id: '1',
      name: currentUserName,
      email: currentUserEmail,
      role: roles.includes('TENANT_ADMIN') ? 'Super Admin' : 'Admin',
      access: 'Full Access',
      status: 'ACTIVE',
    },
    {
      id: '2',
      name: 'Branch Operations Manager',
      email: 'branchmanager@acme.dev',
      role: 'Manager',
      access: 'Branch Operations',
      status: 'ACTIVE',
    },
    {
      id: '3',
      name: 'Senior Talent Recruiter',
      email: 'recruiter@acme.dev',
      role: 'Recruiter',
      access: 'Sourcing & ATS',
      status: 'ACTIVE',
    },
    {
      id: '4',
      name: 'Compliance Officer',
      email: 'complianceofficer@acme.dev',
      role: 'Compliance',
      access: 'Audits & Checklists',
      status: 'ACTIVE',
    },
  ]);

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;

    const created: UserRecord = {
      id: String(Date.now()),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role === 'TENANT_ADMIN' ? 'Super Admin' : newUser.role === 'BRANCH_MANAGER' ? 'Manager' : newUser.role === 'COMPLIANCE' ? 'Compliance' : 'Recruiter',
      access: newUser.access || 'General Access',
      status: 'ACTIVE',
    };

    setUserList(prev => [created, ...prev]);
    setIsAddModalOpen(false);
    setNewUser({ name: '', email: '', role: 'RECRUITER', access: 'Sourcing & ATS' });
  };

  const handleToggleStatus = (id: string) => {
    setUserList(prev =>
      prev.map(u => (u.id === id ? { ...u, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : u))
    );
    setActiveRowMenuId(null);
  };

  const filteredUsers = userList
    .filter((u) => {
      const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
      const matchesTab = 
        activeTab === 'ALL' ||
        (activeTab === 'SUPER' && u.role.includes('Admin')) ||
        (activeTab === 'MANAGER' && u.role.includes('Manager')) ||
        (activeTab === 'RECRUITER' && (u.role.includes('Recruiter') || u.role.includes('Compliance')));
      return matchesSearch && matchesTab;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'role') return a.role.localeCompare(b.role);
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      return 0;
    });

  return (
    <RouteGuard>
      <div className={styles.container}>
        {/* Top Title Banner */}
        <header className={styles.header}>
          <div>
            <div className={styles.titleRow}>
              <UsersIcon size={20} className="text-gray-500" />
              <span>Administrators & RBAC Governance</span>
            </div>
            <p className={styles.subtitle}>
              Access is based on system role: Super Admin, Branch Manager, Recruiter, or Compliance Officer.
            </p>
          </div>

          <button className={styles.addBtn} onClick={() => setIsAddModalOpen(true)}>
            <span>Add Member</span>
            <Plus size={16} />
          </button>
        </header>

        {/* 3 Side-by-Side Category Summary Cards */}
        <div className={styles.summaryGrid}>
          {/* Card 1: Super Admin */}
          <div className={styles.categoryCard}>
            <div className={styles.cardHeader}>
              <span className={styles.categoryTitle}>Super Admin</span>
              <button className={styles.seeAllBtn} onClick={() => setActiveTab('SUPER')}>See All</button>
            </div>
            <div className={styles.userList}>
              <div className={styles.userRow}>
                <div className={styles.userInfo}>
                  <div className={styles.avatar}>{currentUserName.charAt(0)}</div>
                  <div>
                    <div className={styles.userName}>{currentUserName}</div>
                    <div className={styles.userEmail}>{currentUserEmail}</div>
                  </div>
                </div>
                <span className={styles.statusPillEnabled}>Enabled</span>
              </div>
            </div>
            <button className={styles.manageBtn} onClick={() => setActiveManageCategory('Super Admin')}>
              <Settings size={14} />
              <span>Manage</span>
            </button>
          </div>

          {/* Card 2: Operations Manager */}
          <div className={styles.categoryCard}>
            <div className={styles.cardHeader}>
              <span className={styles.categoryTitle}>Operations Manager</span>
              <button className={styles.seeAllBtn} onClick={() => setActiveTab('MANAGER')}>See All</button>
            </div>
            <div className={styles.userList}>
              <div className={styles.userRow}>
                <div className={styles.userInfo}>
                  <div className={styles.avatar}>BM</div>
                  <div>
                    <div className={styles.userName}>Branch Manager</div>
                    <div className={styles.userEmail}>branchmanager@acme.dev</div>
                  </div>
                </div>
                <span className={styles.statusPillEnabled}>Enabled</span>
              </div>
            </div>
            <button className={styles.manageBtn} onClick={() => setActiveManageCategory('Operations Manager')}>
              <Settings size={14} />
              <span>Manage</span>
            </button>
          </div>

          {/* Card 3: Recruiter & Compliance */}
          <div className={styles.categoryCard}>
            <div className={styles.cardHeader}>
              <span className={styles.categoryTitle}>Recruiter & Officer</span>
              <button className={styles.seeAllBtn} onClick={() => setActiveTab('RECRUITER')}>See All</button>
            </div>
            <div className={styles.userList}>
              <div className={styles.userRow}>
                <div className={styles.userInfo}>
                  <div className={styles.avatar}>TR</div>
                  <div>
                    <div className={styles.userName}>Talent Recruiter</div>
                    <div className={styles.userEmail}>recruiter@acme.dev</div>
                  </div>
                </div>
                <span className={styles.statusPillEnabled}>Enabled</span>
              </div>
              <div className={styles.userRow}>
                <div className={styles.userInfo}>
                  <div className={styles.avatar}>CO</div>
                  <div>
                    <div className={styles.userName}>Compliance Officer</div>
                    <div className={styles.userEmail}>complianceofficer@acme.dev</div>
                  </div>
                </div>
                <span className={styles.statusPillEnabled}>Enabled</span>
              </div>
            </div>
            <button className={styles.manageBtn} onClick={() => setActiveManageCategory('Recruiter & Officer')}>
              <Settings size={14} />
              <span>Manage</span>
            </button>
          </div>
        </div>

        {/* Administrator Accounts Table Card matching VANTUS Reference */}
        <div className={styles.tableCard}>
          <div className={styles.tableHeaderRow}>
            <div className={styles.tableTitle}>
              <UsersIcon size={18} />
              <span>Administrator & User Accounts</span>
            </div>

            <div className={styles.controlsGroup}>
              <div className={styles.searchBox}>
                <Search size={15} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search accounts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={styles.searchInput}
                />
              </div>

              <select 
                className={styles.selectInput}
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
              >
                <option value="name">Sort by Name</option>
                <option value="role">Sort by Role</option>
                <option value="status">Sort by Status</option>
              </select>

              <button className={styles.iconControlBtn} title="Filter List" onClick={() => setActiveTab(activeTab === 'ALL' ? 'SUPER' : 'ALL')}>
                <SlidersHorizontal size={15} />
              </button>
            </div>
          </div>

          {/* Underline Filter Tabs */}
          <div className={styles.tabFilters}>
            <button
              className={`${styles.tabBtn} ${activeTab === 'ALL' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('ALL')}
            >
              All ({userList.length})
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'SUPER' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('SUPER')}
            >
              Super Admin
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'MANAGER' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('MANAGER')}
            >
              Manager
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'RECRUITER' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('RECRUITER')}
            >
              Recruiters & Officers
            </button>
          </div>

          {/* Data Table */}
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Account</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Access Scope</th>
                <th>Status</th>
                <th style={{ textAlign: 'end' }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} style={{ position: 'relative' }}>
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.avatar}>{u.name.charAt(0)}</div>
                      <span className="font-semibold text-gray-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="text-gray-500">{u.email}</td>
                  <td className="text-gray-700 font-medium">{u.role}</td>
                  <td className="text-gray-700">{u.access}</td>
                  <td>
                    <span className={u.status === 'ACTIVE' ? styles.statusPillEnabled : styles.statusPillDisabled}>
                      {u.status === 'ACTIVE' ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'end', position: 'relative' }}>
                    <button
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem' }}
                      onClick={() => setActiveRowMenuId(activeRowMenuId === u.id ? null : u.id)}
                    >
                      <MoreVertical size={16} className="text-gray-400" />
                    </button>

                    {/* Action Dropdown Menu */}
                    {activeRowMenuId === u.id && (
                      <div style={{ position: 'absolute', right: 0, top: '2.2rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 10, width: '160px', padding: '0.4rem 0', textAlign: 'left' }}>
                        <button
                          onClick={() => handleToggleStatus(u.id)}
                          style={{ width: '100%', padding: '0.5rem 0.85rem', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#334155', cursor: 'pointer' }}
                        >
                          <ShieldAlert size={14} />
                          <span>{u.status === 'ACTIVE' ? 'Disable Account' : 'Enable Account'}</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Member Modal */}
        {isAddModalOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '1rem' }} onClick={() => setIsAddModalOpen(false)}>
            <div style={{ background: '#FFFFFF', borderRadius: '1rem', width: '100%', maxWidth: '480px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>Add Team Member</h3>
                <button style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }} onClick={() => setIsAddModalOpen(false)}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddMemberSubmit}>
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Sarah Connor"
                      value={newUser.name}
                      onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                      style={{ padding: '0.65rem 0.85rem', border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontSize: '0.875rem' }}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Email Address *</label>
                    <input
                      type="email"
                      placeholder="sarah@acme.dev"
                      value={newUser.email}
                      onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                      style={{ padding: '0.65rem 0.85rem', border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontSize: '0.875rem' }}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>System Role *</label>
                    <select
                      value={newUser.role}
                      onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                      style={{ padding: '0.65rem 0.85rem', border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontSize: '0.875rem' }}
                    >
                      <option value="RECRUITER">Recruiter</option>
                      <option value="BRANCH_MANAGER">Branch Manager</option>
                      <option value="COMPLIANCE">Compliance Officer</option>
                      <option value="TENANT_ADMIN">Super Admin</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', padding: '1.25rem 1.5rem', borderTop: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                  <button type="button" onClick={() => setIsAddModalOpen(false)} style={{ padding: '0.55rem 1rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit" style={{ padding: '0.55rem 1.25rem', background: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer' }}>
                    Save Member
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Manage Category Modal */}
        {activeManageCategory && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '1rem' }} onClick={() => setActiveManageCategory(null)}>
            <div style={{ background: '#FFFFFF', borderRadius: '1rem', width: '100%', maxWidth: '420px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden', padding: '1.5rem' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Manage Role: {activeManageCategory}</h3>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setActiveManageCategory(null)}><X size={18} /></button>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
                Permissions for {activeManageCategory} are managed via IAM Keycloak realm rules. Access scope is active for all tenant users.
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button onClick={() => setActiveManageCategory(null)} style={{ padding: '0.55rem 1rem', background: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer' }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RouteGuard>
  );
}
