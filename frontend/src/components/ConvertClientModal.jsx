import { useState } from 'react';
import { Handshake, IndianRupee, Sparkles } from 'lucide-react';
import { Modal } from './Modal';
import api from '../api';

export function ConvertClientModal({ lead, onClose, onConverted }) {
  const [agreedAmount, setAgreedAmount] = useState('0');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post(`/leads/${lead._id}/convert`, {
        agreedAmount: Number(agreedAmount) || 0,
        notes: notes.trim()
      });
      onConverted();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not convert lead');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title="Convert to Client"
      subtitle={`Turn ${lead.businessName} into an active client relationship`}
      icon={Handshake}
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

          <div className="info-callout primary">
            <Sparkles size={18} style={{ flexShrink: 0 }} />
            <div>
              <strong>Closing the deal!</strong>
              <p style={{ margin: '2px 0 0', fontSize: '11.5px' }}>
                Converting will update this business to <em>Converted</em> and create a dedicated Client record for project delivery and invoice tracking.
              </p>
            </div>
          </div>

          <div className="form-field">
            <label>
              Agreed Project Value (INR ₹) <span className="req">*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                min="0"
                step="500"
                required
                className="form-input"
                style={{ paddingLeft: '32px' }}
                placeholder="50000"
                value={agreedAmount}
                onChange={e => setAgreedAmount(e.target.value)}
              />
              <span
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  fontWeight: '600'
                }}
              >
                ₹
              </span>
            </div>
            <span className="form-hint">
              Enter 0 if the final commercial amount is still being determined.
            </span>
          </div>

          <div className="form-field">
            <label>Project Scope or Handover Notes</label>
            <textarea
              className="form-textarea"
              rows="3"
              placeholder="e.g. Scope includes 5-page responsive website, contact form, and WhatsApp integration. Kickoff meeting on Monday."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
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
            {saving ? 'Converting…' : 'Confirm & Convert Client'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
