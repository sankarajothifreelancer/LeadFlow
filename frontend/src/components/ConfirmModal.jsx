import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

export function ConfirmModal({
  title = 'Please Confirm',
  message,
  confirmLabel = 'Confirm',
  confirmVariant = 'primary',
  onConfirm,
  onClose,
  busy = false
}) {
  return (
    <Modal
      title={title}
      icon={AlertTriangle}
      size="sm"
      onClose={onClose}
    >
      <div className="modal-body">
        <p style={{ color: 'var(--text-body)', fontSize: '13px', lineHeight: 1.6 }}>
          {message}
        </p>
      </div>
      <div className="modal-footer">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onClose}
          disabled={busy}
        >
          Cancel
        </button>
        <button
          type="button"
          className={`btn ${confirmVariant === 'danger' ? 'btn-outline-danger' : 'btn-primary'}`}
          onClick={onConfirm}
          disabled={busy}
        >
          {busy ? 'Processing…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
