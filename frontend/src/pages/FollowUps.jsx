import { useEffect, useState, useMemo } from 'react';
import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  AlertCircle,
  X,
  Phone,
  Building2,
  Calendar
} from 'lucide-react';
import api from '../api';
import { ConfirmModal } from '../components/ConfirmModal';

export function FollowUps({ user }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const [busyAction, setBusyAction] = useState(false);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  async function loadData() {
    try {
      setLoading(true);
      const r = await api.get('/followups');
      setItems(r.data);
      setError('');
    } catch {
      setError('Unable to load follow-up reminders');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function completeFollowUp(id) {
    try {
      await api.patch(`/followups/${id}/complete`);
      await loadData();
      showToast('Follow-up marked as completed');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not complete follow-up');
    }
  }

  async function handleCancelConfirm() {
    if (!cancellingId) return;
    setBusyAction(true);
    try {
      await api.patch(`/followups/${cancellingId}/cancel`);
      setCancellingId(null);
      await loadData();
      showToast('Follow-up cancelled');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not cancel follow-up');
    } finally {
      setBusyAction(false);
    }
  }

  const now = new Date();

  const { overdueCount, todayCount } = useMemo(() => {
    let overdue = 0;
    let today = 0;
    const todayStr = now.toDateString();

    items.forEach(f => {
      const d = new Date(f.dueAt);
      if (d < now) overdue++;
      if (d.toDateString() === todayStr) today++;
    });

    return { overdueCount: overdue, todayCount: today };
  }, [items, now]);

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
          <span className="eyebrow">Task Engine</span>
          <h1 className="page-title">Follow-up Reminders</h1>
          <p className="page-desc">
            Stay on top of promised callbacks. Reminders trigger email alerts when scheduled.
          </p>
        </div>
        <div className="header-actions">
          <div className="workspace-badge">
            <Clock3 size={14} />
            <span>{items.length} Pending Actions</span>
          </div>
        </div>
      </div>

      {/* Mini Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Pending Follow-ups</span>
            <div className="stat-card-icon neutral"><CalendarClock size={18} /></div>
          </div>
          <strong className="stat-card-value">{items.length}</strong>
          <span className="stat-card-sub">Queued reminders</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Overdue Callbacks</span>
            <div className="stat-card-icon red"><AlertCircle size={18} /></div>
          </div>
          <strong className="stat-card-value" style={{ color: overdueCount > 0 ? 'var(--status-red-text)' : 'inherit' }}>
            {overdueCount}
          </strong>
          <span className="stat-card-sub">Action required immediately</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Due Today</span>
            <div className="stat-card-icon amber"><Clock3 size={18} /></div>
          </div>
          <strong className="stat-card-value">{todayCount}</strong>
          <span className="stat-card-sub">To be handled before end of day</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Your Outreach Focus</span>
            <div className="stat-card-icon green"><CheckCircle2 size={18} /></div>
          </div>
          <strong className="stat-card-value">
            {items.filter(f => (f.assignedTo?._id || f.assignedTo) === user.id).length}
          </strong>
          <span className="stat-card-sub">Assigned to your queue</span>
        </div>
      </div>

      {error && (
        <div className="alert-box alert-error">
          <span>{error}</span>
        </div>
      )}

      {/* Follow-up List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {items.map(f => {
          const isOverdue = new Date(f.dueAt) < now;
          const isAssigned = (f.assignedTo?._id || f.assignedTo) === user.id;

          return (
            <div className="follow-item" key={f._id}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-md)',
                  background: isOverdue ? 'var(--status-red-bg)' : 'var(--status-amber-bg)',
                  color: isOverdue ? 'var(--status-red-text)' : 'var(--status-amber-text)',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0
                }}
              >
                <Clock3 size={19} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: '13.5px', color: 'var(--text-main)' }}>
                    {f.lead?.businessName || 'Business Prospect'}
                  </strong>
                  {f.lead?.contactPerson && (
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      ({f.lead.contactPerson})
                    </span>
                  )}
                  {isOverdue && (
                    <span className="badge badge-red">Overdue</span>
                  )}
                </div>

                <p style={{ margin: '4px 0', fontSize: '12.5px', color: 'var(--text-body)' }}>
                  {f.note || 'No specific note added. Perform status check and review requirements.'}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  {f.lead?.mobile && (
                    <span>Phone: <strong>{f.lead.mobile}</strong></span>
                  )}
                  <span>•</span>
                  <span>
                    Assigned to: <strong>{f.assignedTo?.name || 'Unassigned'}</strong> {isAssigned && '(You)'}
                  </span>
                </div>
              </div>

              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span
                  style={{
                    fontSize: '12.5px',
                    fontWeight: '600',
                    color: isOverdue ? 'var(--status-red-text)' : 'var(--text-main)'
                  }}
                >
                  {new Date(f.dueAt).toLocaleString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                <span style={{ fontSize: '10.5px', color: 'var(--text-subtle)' }}>
                  {isOverdue ? 'Passed callback time' : 'Scheduled reminder'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => completeFollowUp(f._id)}
                  title="Mark this callback complete"
                >
                  <CheckCircle2 size={14} style={{ color: 'var(--status-green-text)' }} /> Complete
                </button>
                <button
                  type="button"
                  className="btn-icon-only"
                  onClick={() => setCancellingId(f._id)}
                  title="Cancel reminder"
                  aria-label="Cancel"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          );
        })}

        {items.length === 0 && !loading && (
          <div className="panel empty-state">
            <div className="empty-icon">
              <CalendarClock size={24} />
            </div>
            <h3>No pending follow-ups</h3>
            <p>
              Your callback queue is clean. Open any business record from the Businesses tab to schedule your next follow-up.
            </p>
          </div>
        )}
      </div>

      {/* POPUP: Confirm Cancel Modal */}
      {cancellingId && (
        <ConfirmModal
          title="Cancel Follow-up"
          message="Are you sure you want to cancel this scheduled follow-up reminder? It will be removed from your active queue."
          confirmLabel="Cancel Reminder"
          confirmVariant="danger"
          busy={busyAction}
          onConfirm={handleCancelConfirm}
          onClose={() => setCancellingId(null)}
        />
      )}
    </div>
  );
}
