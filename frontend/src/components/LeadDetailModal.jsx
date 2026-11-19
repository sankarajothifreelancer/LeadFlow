import { useEffect, useState } from 'react';
import {
  Building2,
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  CalendarClock,
  Handshake,
  Edit3,
  Clock,
  User,
  CheckCircle2,
  Tag,
  ArrowRight
} from 'lucide-react';
import { Modal } from './Modal';
import api from '../api';

export function LeadDetailModal({
  lead,
  currentUser,
  onClose,
  onEdit,
  onLogActivity,
  onScheduleFollowUp,
  onConvert
}) {
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  useEffect(() => {
    async function loadActivities() {
      try {
        const { data } = await api.get(`/leads/${lead._id}/activities`);
        setActivities(data);
      } catch {
        // fail silently or keep empty
      } finally {
        setLoadingActivities(false);
      }
    }
    loadActivities();
  }, [lead._id]);

  const cleanPhone = (lead.mobile || '').replace(/[^0-9]/g, '');
  const waNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const isCreator = lead.createdBy?._id === currentUser.id || lead.createdBy === currentUser.id;
  const isAssigned = lead.assignedTo?._id === currentUser.id || lead.assignedTo === currentUser.id;

  return (
    <Modal
      title={lead.businessName}
      subtitle={lead.category ? `${lead.category} · ${lead.city || 'No city specified'}` : lead.city || 'Business Lead Details'}
      icon={Building2}
      size="lg"
      onClose={onClose}
    >
      <div className="modal-body">
        {/* Ownership & Attribution Card */}
        <div
          style={{
            background: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <span className="eyebrow">Ownership & Attribution</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span className={`badge badge-${lead.status === 'Converted' ? 'green' : lead.status.includes('Follow') ? 'amber' : 'neutral'}`}>
                {lead.status}
              </span>
              <span className="badge badge-neutral">
                <span className={`priority-dot priority-${(lead.priority || 'Medium').toLowerCase()}`} />
                {lead.priority} Priority
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="avatar">
                {(lead.createdBy?.name || 'U').slice(0, 1).toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Created & Stored by</span>
                <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>
                  {lead.createdBy?.name || 'Unknown'} {isCreator && <span style={{ color: 'var(--primary-text)', fontWeight: '600' }}>(You)</span>}
                </strong>
                <span style={{ fontSize: '10.5px', color: 'var(--text-subtle)' }}>
                  {new Date(lead.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="avatar">
                {(lead.assignedTo?.name || 'U').slice(0, 1).toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Assigned Handler</span>
                <strong style={{ fontSize: '13px', color: 'var(--navy)' }}>
                  {lead.assignedTo?.name || 'Unassigned'} {isAssigned && <span style={{ color: 'var(--navy)', fontWeight: '600' }}>(You)</span>}
                </strong>
                <span style={{ fontSize: '10.5px', color: 'var(--text-subtle)' }}>
                  Responsible for outreach
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Service Specs */}
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-item-label">Contact Person</span>
            <span className="detail-item-val">{lead.contactPerson || 'Not provided'}</span>
          </div>

          <div className="detail-item">
            <span className="detail-item-label">Interested Service</span>
            <span className="detail-item-val" style={{ color: 'var(--primary-text)' }}>
              {lead.service || 'Other'}
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-item-label">Phone & Quick Actions</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <strong style={{ fontSize: '13px' }}>{lead.mobile}</strong>
              <a
                href={`tel:${lead.mobile}`}
                className="btn btn-secondary btn-sm"
                title="Direct call"
                style={{ padding: '4px 8px' }}
              >
                <Phone size={13} /> Call
              </a>
              {cleanPhone && (
                <a
                  href={`https://wa.me/${waNumber}?text=Hi%20${encodeURIComponent(lead.contactPerson || lead.businessName)},%20reaching%20out%20from%20our%20team.`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary btn-sm"
                  title="Chat on WhatsApp"
                  style={{ padding: '4px 8px', color: 'var(--navy)' }}
                >
                  <MessageSquare size={13} /> WhatsApp
                </a>
              )}
            </div>
          </div>

          <div className="detail-item">
            <span className="detail-item-label">Email Address</span>
            {lead.email ? (
              <a
                href={`mailto:${lead.email}`}
                style={{ color: 'var(--primary)', textDecoration: 'underline', fontSize: '13px' }}
              >
                {lead.email}
              </a>
            ) : (
              <span className="detail-item-val" style={{ color: 'var(--text-subtle)' }}>None added</span>
            )}
          </div>

          <div className="detail-item">
            <span className="detail-item-label">Source & Lead Channel</span>
            <span className="detail-item-val">{lead.source || 'Direct Call'}</span>
          </div>

          <div className="detail-item">
            <span className="detail-item-label">Next Scheduled Follow-up</span>
            <span className="detail-item-val" style={{ color: lead.nextFollowUpAt ? 'var(--status-amber-text)' : 'inherit' }}>
              {lead.nextFollowUpAt
                ? new Date(lead.nextFollowUpAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                : 'None scheduled'}
            </span>
          </div>
        </div>

        {/* Discussion Notes */}
        {lead.notes && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span className="eyebrow">Discussion & Requirements Notes</span>
            <div
              style={{
                background: 'var(--bg-app)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                fontSize: '12.5px',
                color: 'var(--text-body)',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6
              }}
            >
              {lead.notes}
            </div>
          </div>
        )}

        {/* Quick Action Pop-up Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '4px' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onLogActivity(lead)}
          >
            <Phone size={14} /> Log Interaction
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onScheduleFollowUp(lead)}
          >
            <CalendarClock size={14} /> Schedule Follow-up
          </button>
          {lead.status !== 'Converted' && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => onConvert(lead)}
            >
              <Handshake size={14} /> Convert to Client
            </button>
          )}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ marginLeft: 'auto' }}
            onClick={() => onEdit(lead)}
          >
            <Edit3 size={14} /> Edit Details
          </button>
        </div>

        {/* Activity & Interaction Timeline */}
        <div style={{ marginTop: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span className="eyebrow">Activity & History Timeline</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {activities.length} recorded events
            </span>
          </div>

          {loadingActivities ? (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '12px 0' }}>Loading activity logs…</p>
          ) : activities.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--text-muted)' }}>
              No interactions recorded yet. Click <em>Log Interaction</em> to record your first call or discussion note.
            </div>
          ) : (
            <div className="timeline">
              {activities.map(act => (
                <div className="timeline-item" key={act._id}>
                  <div className="timeline-dot">
                    <Clock size={12} />
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <span className="timeline-title">
                        {act.type} {act.user?.name && <span style={{ fontWeight: '400', color: 'var(--text-muted)' }}>by {act.user.name}</span>}
                      </span>
                      <span className="timeline-time">
                        {new Date(act.occurredAt || act.createdAt).toLocaleString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="timeline-desc">{act.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </Modal>
  );
}
