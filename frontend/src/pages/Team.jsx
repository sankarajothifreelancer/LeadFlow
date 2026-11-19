import { useEffect, useState } from 'react';
import {
  Users,
  Plus,
  ShieldCheck,
  UserCheck,
  UserX,
  Mail,
  Lock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Power
} from 'lucide-react';
import api from '../api';
import { Modal } from '../components/Modal';
import { ConfirmModal } from '../components/ConfirmModal';

export function Team() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [togglingUser, setTogglingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [saving, setSaving] = useState(false);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }

  async function loadUsers() {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data);
      setError('');
    } catch {
      setError('Unable to load team members');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleCreateMember(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || form.password.length < 6) {
      setError('Please provide valid details and a password of at least 6 characters');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.post('/users', form);
      setShowModal(false);
      setForm({ name: '', email: '', password: '', role: 'member' });
      showToast('Team member account created successfully');
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create member account');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus() {
    if (!togglingUser) return;
    try {
      await api.patch(`/users/${togglingUser._id}`, { active: !togglingUser.active });
      showToast(`Account for ${togglingUser.name} ${togglingUser.active ? 'deactivated' : 'reactivated'}`);
      setTogglingUser(null);
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update user status');
      setTogglingUser(null);
    }
  }

  async function handleDeleteMember() {
    if (!deletingUser) return;
    try {
      const res = await api.delete(`/users/${deletingUser._id}`);
      showToast(res.data.message || 'Team member deleted');
      setDeletingUser(null);
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete user');
      setDeletingUser(null);
    }
  }

  return (
    <div className="page">
      {toast && (
        <div className="toast-msg">
          <CheckCircle2 size={16} style={{ color: 'var(--white-smoke)' }} />
          <span>{toast}</span>
        </div>
      )}

      <div className="page-header">
        <div>
          <span className="eyebrow">Workspace Access</span>
          <h1 className="page-title">Team Members (3-Seat Team)</h1>
          <p className="page-desc">
            Manage the logins for your 3-person team. As Super Admin, you can invite, suspend/deactivate, or delete teammate access.
          </p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Add Team Member
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-box alert-error">
          <span>{error}</span>
        </div>
      )}

      {/* Role Explanation Callout Card */}
      <div
        className="team-roles-banner"
        style={{
          background: 'var(--surface-card)',
          border: '1px solid var(--border-line)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          boxShadow: 'var(--glass-shadow-sm)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px'
        }}
      >
        <div style={{ display: 'flex', gap: '14px' }}>
          <div className="stat-card-icon neutral" style={{ flexShrink: 0 }}>
            <ShieldCheck size={20} style={{ color: 'var(--royal-blue)' }} />
          </div>
          <div>
            <strong style={{ fontSize: '13.5px', color: 'var(--royal-blue)', display: 'block', marginBottom: '4px' }}>
              Super Admin Role (Owner)
            </strong>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Full administrative authority. Can create, deactivate/suspend, or permanently delete team member accounts, re-assign leads across teammates, access team-wide conversion metrics, and manage pipeline settings.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '14px' }}>
          <div className="stat-card-icon neutral" style={{ flexShrink: 0 }}>
            <UserCheck size={20} style={{ color: 'var(--royal-blue)' }} />
          </div>
          <div>
            <strong style={{ fontSize: '13.5px', color: 'var(--royal-blue)', display: 'block', marginBottom: '4px' }}>
              Team Member / Business Role
            </strong>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Outreach & sales execution. When a member logs in and registers a business lead, it is <strong>permanently stored under their name</strong> and assigned directly to their queue. They can view the shared pipeline to avoid duplicate calls, but can only edit their assigned leads.
            </p>
          </div>
        </div>
      </div>

      {/* Team Member Cards */}
      <div className="card-grid">
        {users.map(u => (
          <div key={u._id} className="card-item" style={{ opacity: u.active ? 1 : 0.72 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div className="avatar avatar-lg">
                {u.name.slice(0, 1).toUpperCase()}
              </div>
              <span className={`badge ${u.active ? 'badge-green' : 'badge-red'}`}>
                {u.active ? 'Active' : 'Inactive / Suspended'}
              </span>
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '2px', color: 'var(--royal-blue)' }}>
              {u.name}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              {u.email}
            </p>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--navy-light)',
                color: 'var(--royal-blue)',
                fontSize: '11px',
                fontWeight: '600',
                width: 'fit-content',
                marginBottom: '16px'
              }}
            >
              <ShieldCheck size={13} />
              <span>{u.role === 'admin' ? 'Super Admin' : 'Team Member'}</span>
            </div>

            {u.role !== 'admin' && (
              <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid var(--border-line)', display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className={`btn ${u.active ? 'btn-outline-danger' : 'btn-secondary'} btn-sm`}
                  style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  onClick={() => setTogglingUser(u)}
                >
                  <Power size={13} />
                  <span>{u.active ? 'Deactivate' : 'Reactivate'}</span>
                </button>

                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  style={{ padding: '0 10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Permanently Delete Member"
                  onClick={() => setDeletingUser(u)}
                  aria-label="Delete Member"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* POPUP 1: Add Member Modal */}
      {showModal && (
        <Modal
          title="Create Team Member Account"
          subtitle="Provision access for one of your 3 team seats"
          icon={Users}
          size="md"
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleCreateMember} autoComplete="off">
            <input type="text" name="dummy_prevent_autofill_u" style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" autoComplete="off" />
            <input type="password" name="dummy_prevent_autofill_p" style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" autoComplete="new-password" />
            <div className="modal-body">
              <div className="form-field">
                <label>Full Name <span className="req">*</span></label>
                <input
                  required
                  className="form-input"
                  placeholder="e.g. Rahul Sharma"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  autoComplete="off"
                />
              </div>

              <div className="form-field">
                <label>Email Address <span className="req">*</span></label>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="rahul@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  autoComplete="off"
                />
              </div>

              <div className="form-field">
                <label>Password <span className="req">*</span></label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="form-input"
                  placeholder="Minimum 6 characters"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  autoComplete="new-password"
                />
                <span className="form-hint">
                  Password must be at least 6 characters. Share this securely with your teammate.
                </span>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? 'Creating…' : 'Create Member Account'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* POPUP 2: Confirm Status Toggle */}
      {togglingUser && (
        <ConfirmModal
          title={`${togglingUser.active ? 'Deactivate' : 'Reactivate'} Account`}
          message={`Are you sure you want to ${togglingUser.active ? 'deactivate' : 'reactivate'} ${togglingUser.name}'s login? ${
            togglingUser.active ? 'They will immediately be blocked from signing in.' : 'They will regain access to their assigned pipeline.'
          }`}
          confirmLabel={togglingUser.active ? 'Deactivate' : 'Reactivate'}
          confirmVariant={togglingUser.active ? 'danger' : 'primary'}
          onConfirm={handleToggleStatus}
          onClose={() => setTogglingUser(null)}
        />
      )}

      {/* POPUP 3: Confirm Member Deletion */}
      {deletingUser && (
        <ConfirmModal
          title={`Delete ${deletingUser.name}?`}
          message={`Are you sure you want to permanently delete ${deletingUser.name}'s account (${deletingUser.email})? Any active leads or projects assigned to them will be safely reassigned to you (Super Admin).`}
          confirmLabel="Permanently Delete"
          confirmVariant="danger"
          onConfirm={handleDeleteMember}
          onClose={() => setDeletingUser(null)}
        />
      )}
    </div>
  );
}
