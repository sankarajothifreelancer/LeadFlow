import { useState } from 'react';
import { Building2, Sparkles, UserCheck } from 'lucide-react';
import { Modal } from './Modal';
import api from '../api';

const STATUSES = [
  'New Lead',
  'First Call Completed',
  'Interested',
  'Portfolio Sent',
  'Proposal Sent',
  'Follow-up Required',
  'Negotiation',
  'Converted',
  'Not Interested',
  'No Response',
  'Lost'
];

const SERVICES = ['Website', 'Mobile App', 'CRM / SaaS', 'Digital Marketing', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High'];
const SOURCES = ['Call', 'WhatsApp', 'Instagram', 'Email', 'Referral', 'Other'];

export function LeadFormModal({
  lead,
  currentUser,
  members = [],
  onClose,
  onSaved
}) {
  const isEdit = Boolean(lead);

  const [form, setForm] = useState(() => {
    if (lead) {
      return {
        businessName: lead.businessName || '',
        contactPerson: lead.contactPerson || '',
        mobile: lead.mobile || '',
        email: lead.email || '',
        city: lead.city || '',
        category: lead.category || '',
        service: lead.service || 'Website',
        status: lead.status || 'New Lead',
        priority: lead.priority || 'Medium',
        source: lead.source || 'Call',
        notes: lead.notes || '',
        assignedTo: lead.assignedTo?._id || lead.assignedTo || ''
      };
    }
    return {
      businessName: '',
      contactPerson: '',
      mobile: '',
      email: '',
      city: '',
      category: '',
      service: 'Website',
      status: 'New Lead',
      priority: 'Medium',
      source: 'Call',
      notes: '',
      assignedTo: currentUser.id || members[0]?._id || ''
    };
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.businessName.trim() || !form.mobile.trim()) {
      setError('Business name and contact mobile are required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload = { ...form };
      if (!payload.assignedTo) delete payload.assignedTo;

      if (isEdit) {
        await api.patch(`/leads/${lead._id}`, payload);
      } else {
        await api.post('/leads', payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save business');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={isEdit ? 'Edit Business Lead' : 'Add New Business'}
      subtitle={isEdit ? `Updating record for ${lead.businessName}` : 'Register a new business lead into the pipeline'}
      icon={Building2}
      size="lg"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="modal-form-wrapper">
        <div className="modal-body">
          {error && (
            <div className="alert-box alert-error">
              <span>{error}</span>
            </div>
          )}

          {/* Attribution Notice */}
          <div className="info-callout primary">
            <UserCheck size={18} style={{ flexShrink: 0 }} />
            <div>
              <strong>Lead Ownership & Attribution</strong>
              <p style={{ margin: '2px 0 0', fontSize: '11.5px' }}>
                {isEdit
                  ? `Originally created by ${lead.createdBy?.name || 'team member'}. Changes will be logged under your login (${currentUser.name}).`
                  : currentUser.role === 'admin'
                  ? `Will be registered by ${currentUser.name}. As Super Admin, you can assign this lead to any team member.`
                  : `Will be permanently recorded under your name (${currentUser.name}) and assigned directly to you for outreach.`}
              </p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label>
                Business Name <span className="req">*</span>
              </label>
              <input
                required
                className="form-input"
                placeholder="e.g. Apex Dental Clinic"
                value={form.businessName}
                onChange={e => setForm({ ...form, businessName: e.target.value })}
              />
            </div>

            <div className="form-field">
              <label>Contact Person</label>
              <input
                className="form-input"
                placeholder="e.g. Dr. Rajesh Kumar"
                value={form.contactPerson}
                onChange={e => setForm({ ...form, contactPerson: e.target.value })}
              />
            </div>

            <div className="form-field">
              <label>
                Mobile Number <span className="req">*</span>
              </label>
              <input
                required
                className="form-input"
                placeholder="e.g. 9876543210"
                value={form.mobile}
                onChange={e => setForm({ ...form, mobile: e.target.value })}
              />
            </div>

            <div className="form-field">
              <label>Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="contact@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="form-field">
              <label>City / Location</label>
              <input
                className="form-input"
                placeholder="e.g. Mumbai, Bengaluru"
                value={form.city}
                onChange={e => setForm({ ...form, city: e.target.value })}
              />
            </div>

            <div className="form-field">
              <label>Business Category</label>
              <input
                className="form-input"
                placeholder="e.g. Healthcare, Real Estate, Retail"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
              />
            </div>

            <div className="form-field">
              <label>Interested Service</label>
              <select
                className="form-select"
                value={form.service}
                onChange={e => setForm({ ...form, service: e.target.value })}
              >
                {SERVICES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Current Status</label>
              <select
                className="form-select"
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
              >
                {STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Priority</label>
              <select
                className="form-select"
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}
              >
                {PRIORITIES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Lead Source</label>
              <select
                className="form-select"
                value={form.source}
                onChange={e => setForm({ ...form, source: e.target.value })}
              >
                {SOURCES.map(src => (
                  <option key={src} value={src}>{src}</option>
                ))}
              </select>
            </div>

            {currentUser.role === 'admin' && (
              <div className="form-field form-full">
                <label>Assigned Team Member (Super Admin Only)</label>
                <select
                  className="form-select"
                  value={form.assignedTo}
                  onChange={e => setForm({ ...form, assignedTo: e.target.value })}
                >
                  {members.filter(m => m.active).map(m => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.email}) {m._id === currentUser.id ? '— You' : ''}
                    </option>
                  ))}
                </select>
                <span className="form-hint">
                  Assign to any of the 3 team members who will handle outreach.
                </span>
              </div>
            )}

            <div className="form-field form-full">
              <label>Discussion & Discovery Notes</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="Add initial talking points, requirements, or client background…"
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Save Business'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
