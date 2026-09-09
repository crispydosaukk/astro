'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { 
  UserCog, 
  Plus, 
  Search, 
  Edit2, 
  Shield, 
  Eye, 
  Trash2, 
  X, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  UserCheck, 
  Filter 
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  createdDate: string;
}

const initialUsers: User[] = [
  { 
    id: 'U-001', 
    name: 'Super Admin', 
    email: 'astroai@gmail.com', 
    role: 'Super Admin', 
    status: 'active', 
    lastLogin: 'Today, 09:00 AM', 
    createdDate: '2026-01-01' 
  },
];

const roles = [
  { 
    name: 'Super Admin', 
    description: 'Full platform access, manages security and roles', 
    permissions: ['All modules', 'User management', 'Settings', 'Audit logs'], 
    color: 'bg-red-50 text-red-700 border-red-200' 
  },
  { 
    name: 'Admin', 
    description: 'Manage candidates, discovery, outreach, applications', 
    permissions: ['Candidates', 'Discovery', 'Outreach', 'Applications', 'Assessments'], 
    color: 'bg-orange-50 text-orange-700 border-orange-200' 
  },
  { 
    name: 'Recruiter', 
    description: 'Manage discovery campaigns and astrologer outreach', 
    permissions: ['Discovery', 'Candidates', 'Outreach'], 
    color: 'bg-amber-50 text-amber-700 border-amber-200' 
  },
  { 
    name: 'Reviewer', 
    description: 'Review applications and assessment submissions', 
    permissions: ['Applications', 'Assessments', 'Human Review'], 
    color: 'bg-blue-50 text-blue-700 border-blue-200' 
  },
  { 
    name: 'Verification Manager', 
    description: 'Manage probation period, background checks & verification', 
    permissions: ['Probation', 'Verification'], 
    color: 'bg-purple-50 text-purple-700 border-purple-200' 
  },
  { 
    name: 'Read Only', 
    description: 'View dashboard metrics, search candidates and read reports', 
    permissions: ['Dashboard', 'Reports'], 
    color: 'bg-slate-50 text-slate-700 border-slate-200' 
  },
];

const statusBadge: Record<string, { label: string; color: string }> = {
  active: { label: 'Active', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  inactive: { label: 'Inactive', color: 'bg-slate-50 text-slate-600 border border-slate-200' },
  suspended: { label: 'Suspended', color: 'bg-rose-50 text-rose-700 border border-rose-200' },
};

export default function UsersRolesPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  const [search, setSearch] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Form states for Add User
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('Admin');
  const [newStatus, setNewStatus] = useState<'active' | 'inactive'>('active');
  const [formError, setFormError] = useState<string | null>(null);

  // Notification toast
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  // Load persisted users
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('astroparihar_users_list');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setUsers(parsed);
          }
        } catch (_e) {}
      }
    }
  }, []);

  const saveUsersList = (updated: User[]) => {
    setUsers(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('astroparihar_users_list', JSON.stringify(updated));
    }
  };

  // Add User submit
  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newName.trim()) {
      setFormError('User name is required.');
      return;
    }
    if (!newEmail.trim()) {
      setFormError('Email address is required.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (users.some(u => u.email.toLowerCase() === newEmail.trim().toLowerCase())) {
      setFormError('A user with this email address already exists.');
      return;
    }

    const newUser: User = {
      id: `U-${String(users.length + 1).padStart(3, '0')}`,
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      role: newRole,
      status: newStatus,
      lastLogin: 'Never',
      createdDate: new Date().toISOString().split('T')[0],
    };

    const updated = [...users, newUser];
    saveUsersList(updated);
    setIsAddModalOpen(false);
    setNewName('');
    setNewEmail('');
    setNewRole('Admin');
    setNewStatus('active');
    showNotification(`User "${newUser.name}" added successfully.`);
  };

  // Save edited user
  const handleSaveEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (!editingUser.name.trim()) {
      showNotification('Name cannot be empty.', 'error');
      return;
    }
    if (!editingUser.email.trim()) {
      showNotification('Email cannot be empty.', 'error');
      return;
    }

    // Check duplicate email with another user
    const duplicate = users.some(
      u => u.id !== editingUser.id && u.email.toLowerCase() === editingUser.email.trim().toLowerCase()
    );
    if (duplicate) {
      showNotification('Another user already has this email.', 'error');
      return;
    }

    const updated = users.map(u => (u.id === editingUser.id ? editingUser : u));
    saveUsersList(updated);
    setEditingUser(null);
    showNotification(`User "${editingUser.name}" updated successfully.`);
  };

  // Confirm delete user
  const handleConfirmDelete = () => {
    if (!deletingUser) return;

    if (deletingUser.email.toLowerCase() === 'astroai@gmail.com') {
      showNotification('The primary Super Admin account cannot be deleted.', 'error');
      setDeletingUser(null);
      return;
    }

    const updated = users.filter(u => u.id !== deletingUser.id);
    saveUsersList(updated);
    showNotification(`User "${deletingUser.name}" has been removed.`);
    setDeletingUser(null);
  };

  // Filtered users
  const filtered = users.filter(u => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase());
    const matchRole = selectedRoleFilter === 'all' || u.role === selectedRoleFilter;
    return matchSearch && matchRole;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Notification banner */}
        {notification && (
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between text-sm animate-fade-in ${
              notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {notification.type === 'success' ? (
                <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle size={18} className="text-rose-600 flex-shrink-0" />
              )}
              <span className="font-medium">{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-muted-foreground hover:text-foreground p-1"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Page Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <UserCog size={28} className="text-primary" /> Users & Roles
            </h1>
            <p className="text-muted-foreground mt-1">Manage platform users and role-based access control</p>
          </div>
          <button
            onClick={() => {
              setFormError(null);
              setIsAddModalOpen(true);
            }}
            className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:shadow transition-all"
          >
            <Plus size={16} /> Add User
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted/50 p-1 rounded-lg w-fit border border-border">
          {(['users', 'roles'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'users' ? `Users (${users.length})` : 'Roles & Permissions'}
            </button>
          ))}
        </div>

        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Search and Role Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  className="w-full pl-9 pr-8 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Search by name, email, or role…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Role filter dropdown */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter size={14} className="text-muted-foreground" />
                <select
                  value={selectedRoleFilter}
                  onChange={e => setSelectedRoleFilter(e.target.value)}
                  className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="all">All Roles</option>
                  {roles.map(r => (
                    <option key={r.name} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                </select>
                {selectedRoleFilter !== 'all' && (
                  <button
                    onClick={() => setSelectedRoleFilter('all')}
                    className="text-xs text-primary font-medium hover:underline ml-1"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last Login</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">
                          No users found matching your search or filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filtered.map(u => {
                        const sb = statusBadge[u.status] || statusBadge.active;
                        const isSuperAdmin = u.email.toLowerCase() === 'astroai@gmail.com';
                        return (
                          <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full terracotta-gradient text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                                  {u.name
                                    .split(' ')
                                    .map(n => n[0])
                                    .slice(0, 2)
                                    .join('')
                                    .toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-foreground flex items-center gap-1.5">
                                    {u.name}
                                    {isSuperAdmin && (
                                      <span className="text-2xs bg-primary/10 text-primary px-1.5 py-0.2 rounded font-semibold">
                                        Primary
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-xs text-muted-foreground font-mono">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
                                {u.role}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${sb.color}`}>
                                {sb.label}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-xs text-muted-foreground">{u.lastLogin}</td>
                            <td className="px-4 py-3.5 text-right">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  onClick={() => setViewingUser(u)}
                                  className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                  title="View User Details"
                                >
                                  <Eye size={15} />
                                </button>
                                <button
                                  onClick={() => setEditingUser({ ...u })}
                                  className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                                  title="Edit User"
                                >
                                  <Edit2 size={15} />
                                </button>
                                {!isSuperAdmin && (
                                  <button
                                    onClick={() => setDeletingUser(u)}
                                    className="p-1.5 rounded-md hover:bg-rose-50 text-muted-foreground hover:text-rose-600 transition-colors"
                                    title="Delete User"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Roles & Permissions Tab */}
        {activeTab === 'roles' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {roles.map(role => {
              const assignedCount = users.filter(u => u.role === role.name).length;
              return (
                <div key={role.name} className="bg-card border border-border rounded-xl p-5 space-y-4 hover:border-primary/40 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Shield size={18} className="text-primary" />
                        <p className="font-semibold text-foreground text-md">{role.name}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{role.description}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${role.color}`}>
                      {assignedCount} {assignedCount === 1 ? 'user' : 'users'}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-foreground mb-2">Granted Permissions:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {role.permissions.map(p => (
                        <span
                          key={p}
                          className="text-xs bg-muted/70 text-foreground px-2.5 py-1 rounded-md border border-border/50"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSelectedRoleFilter(role.name);
                        setActiveTab('users');
                      }}
                      className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
                    >
                      View users with this role →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MODAL 1: Add User Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in backdrop-blur-xs">
            <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 shadow-xl space-y-5 animate-slide-up">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <UserCheck size={20} className="text-primary" />
                  <h3 className="font-bold text-lg text-foreground">Add New User</h3>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <X size={16} />
                </button>
              </div>

              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleAddUserSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. priya@astroparihar.in"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Role</label>
                    <select
                      value={newRole}
                      onChange={e => setNewRole(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      {roles.map(r => (
                        <option key={r.name} value={r.name}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Status</label>
                    <select
                      value={newStatus}
                      onChange={e => setNewStatus(e.target.value as 'active' | 'inactive')}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="btn-ghost px-4 py-2 text-sm rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary px-4 py-2 text-sm rounded-lg"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: View User Modal */}
        {viewingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in backdrop-blur-xs">
            <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 shadow-xl space-y-5 animate-slide-up">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h3 className="font-bold text-lg text-foreground">User Details</h3>
                <button
                  onClick={() => setViewingUser(null)}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex items-center gap-3.5 pb-2">
                <div className="w-12 h-12 rounded-full terracotta-gradient text-white flex items-center justify-center text-base font-bold flex-shrink-0">
                  {viewingUser.name
                    .split(' ')
                    .map(n => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-base text-foreground">{viewingUser.name}</h4>
                  <p className="text-xs text-muted-foreground font-mono">{viewingUser.email}</p>
                </div>
              </div>

              <div className="space-y-3 bg-muted/40 p-4 rounded-xl border border-border/60 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground font-medium">User ID</span>
                  <span className="font-mono font-semibold text-foreground">{viewingUser.id}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground font-medium">Assigned Role</span>
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md font-semibold">
                    {viewingUser.role}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground font-medium">Account Status</span>
                  <span className={`px-2 py-0.5 rounded-md font-semibold ${statusBadge[viewingUser.status]?.color}`}>
                    {statusBadge[viewingUser.status]?.label}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground font-medium">Created On</span>
                  <span className="text-foreground">{viewingUser.createdDate}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-muted-foreground font-medium">Last Login</span>
                  <span className="text-foreground">{viewingUser.lastLogin}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setViewingUser(null)}
                  className="btn-ghost px-4 py-2 text-sm rounded-lg"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const u = { ...viewingUser };
                    setViewingUser(null);
                    setEditingUser(u);
                  }}
                  className="btn-primary px-4 py-2 text-sm rounded-lg flex items-center gap-1.5"
                >
                  <Edit2 size={13} /> Edit User
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 3: Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in backdrop-blur-xs">
            <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 shadow-xl space-y-5 animate-slide-up">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Edit2 size={18} className="text-primary" />
                  <h3 className="font-bold text-lg text-foreground">Edit User ({editingUser.id})</h3>
                </div>
                <button
                  onClick={() => setEditingUser(null)}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editingUser.name}
                    onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editingUser.email}
                    disabled={editingUser.email.toLowerCase() === 'astroai@gmail.com'}
                    onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                    className={`w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                      editingUser.email.toLowerCase() === 'astroai@gmail.com' ? 'opacity-70 cursor-not-allowed bg-muted/40' : ''
                    }`}
                  />
                  {editingUser.email.toLowerCase() === 'astroai@gmail.com' && (
                    <p className="text-2xs text-muted-foreground mt-1">Primary Super Admin email cannot be modified.</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Role</label>
                    <select
                      value={editingUser.role}
                      disabled={editingUser.email.toLowerCase() === 'astroai@gmail.com'}
                      onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      {roles.map(r => (
                        <option key={r.name} value={r.name}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Status</label>
                    <select
                      value={editingUser.status}
                      disabled={editingUser.email.toLowerCase() === 'astroai@gmail.com'}
                      onChange={e =>
                        setEditingUser({
                          ...editingUser,
                          status: e.target.value as 'active' | 'inactive' | 'suspended',
                        })
                      }
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="btn-ghost px-4 py-2 text-sm rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary px-4 py-2 text-sm rounded-lg"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 4: Delete Confirmation Modal */}
        {deletingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in backdrop-blur-xs">
            <div className="bg-card border border-border rounded-xl max-w-sm w-full p-6 shadow-xl space-y-4 animate-slide-up">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">Remove User</h3>
                  <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
                </div>
              </div>

              <p className="text-sm text-foreground leading-normal">
                Are you sure you want to remove <strong className="font-semibold">{deletingUser.name}</strong> (
                {deletingUser.email}) from platform access?
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingUser(null)}
                  className="btn-ghost px-4 py-2 text-sm rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 text-sm rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium transition-colors"
                >
                  Yes, Remove
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
