import { useState } from 'react';
import { PhoneCall, MessageSquare, FileText, Calendar, Check } from 'lucide-react';
import { Modal } from './Modal';
import api from '../api';

export function LogActivityModal({ lead, onClose, onSaved }) {
  const [type, setType] = useState('Call');
  const [summary, setSummary] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const types = [
    { id: 'Call', label: 'Phone Call', icon: PhoneCall },
    { id: 'WhatsApp', label: 'WhatsApp', icon: MessageSquare },
    { id: 'Meeting', label: 'Meeting', icon: Calendar },
    { id: 'Note', label: 'Discussion Note', icon: FileText }
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    if (!summary.trim()) {
      setError('Please provide a brief summary of the conversation');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.post(`/leads/${lead._id}/activities`, {
        type,
        summary: summary.trim(),
        occurredAt: new Date()
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save interaction');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title="Log Interaction"
      subtitle={`Record notes for ${lead.businessName}`}
      icon={PhoneCall}
      size="md"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          {error && (
            <div className="alert-box alert-error">
              <span>{error}</span>
            </div>
          )}

          <div className="form-field">
            <label>Interaction Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {types.map(t => {
                const Icon = t.icon;
                const active = type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id)}
                    style={{
                      padding: '10px 8px',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${active ? 'var(--primary)' : 'var(--border-light)'}`,
                      background: active ? 'var(--primary-light)' : 'var(--bg-surface)',
                      color: active ? 'var(--primary-text)' : 'var(--text-body)',
                      fontWeight: active ? '600' : '500',
                      fontSize: '11.5px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Icon size={16} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="form-field">
            <label>
              Summary of discussion <span className="req">*</span>
            </label>
            <textarea
              className="form-textarea"
              rows="4"
              required
              placeholder="e.g. Called owner. Discussed modernizing website portfolio. They requested a quote for an e-commerce redesign."
              value={summary}
              onChange={e => setSummary(e.target.value)}
            />
            <span className="form-hint">
              This will be permanently added to the interaction timeline.
            </span>
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
            {saving ? 'Saving…' : 'Record Interaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
