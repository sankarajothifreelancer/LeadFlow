import { useState } from 'react';
import { CalendarClock, Sparkles } from 'lucide-react';
import { Modal } from './Modal';
import api from '../api';

export function ScheduleFollowUpModal({ lead, onClose, onSaved }) {
  // Format default to tomorrow 10:00 AM local time
  const getDefaultDateTime = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    // Format YYYY-MM-DDTHH:mm
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const [dueAt, setDueAt] = useState(getDefaultDateTime);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const setPreset = (days, hours = 10) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(hours, 0, 0, 0);
    const tzOffset = d.getTimezoneOffset() * 60000;
    setDueAt(new Date(d.getTime() - tzOffset).toISOString().slice(0, 16));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!dueAt) {
      setError('Please select a valid future date and time');
      return;
    }
    const chosenDate = new Date(dueAt);
    if (chosenDate <= new Date()) {
      setError('Please choose a time in the future');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await api.post(`/leads/${lead._id}/followups`, {
        dueAt: chosenDate.toISOString(),
        note: note.trim()
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not schedule follow-up');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title="Schedule Follow-up"
      subtitle={`Set a reminder callback for ${lead.businessName}`}
      icon={CalendarClock}
      size="md"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="modal-form-wrapper">
        <div className="modal-body">
          {error && (
            <div className="alert-box alert-error">
              <span>{error}</span>
            </div>
          )}

          <div className="form-field">
            <label>Quick Presets</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setPreset(1, 10)}
              >
                Tomorrow 10:00 AM
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setPreset(2, 14)}
              >
                In 2 Days (2:00 PM)
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setPreset(7, 11)}
              >
                In 1 Week
              </button>
            </div>
          </div>

          <div className="form-field">
            <label>
              Date & Time <span className="req">*</span>
            </label>
            <input
              type="datetime-local"
              required
              className="form-input"
              value={dueAt}
              onChange={e => setDueAt(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label>Reminder Note</label>
            <textarea
              className="form-textarea"
              rows="3"
              placeholder="e.g. Call to discuss the customized proposal sent via WhatsApp"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
            <span className="form-hint">
              Assigned team member will receive this reminder on schedule.
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
            {saving ? 'Scheduling…' : 'Save Follow-up'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
