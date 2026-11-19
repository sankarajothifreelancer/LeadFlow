import { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({
  title,
  subtitle,
  icon: Icon,
  size = 'md',
  onClose,
  children
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const sizeClass = size === 'lg' ? 'modal-card-lg' : size === 'sm' ? 'modal-card-sm' : '';

  return (
    <div
      className="modal-backdrop"
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`modal-card ${sizeClass}`} role="dialog" aria-modal="true">
        <div className="modal-header">
          <div className="modal-title-group">
            {Icon && (
              <div className="modal-header-icon">
                <Icon size={19} />
              </div>
            )}
            <div>
              <h2 className="modal-title">{title}</h2>
              {subtitle && <p className="modal-subtitle">{subtitle}</p>}
            </div>
          </div>
          <button
            type="button"
            className="btn-icon-only"
            onClick={onClose}
            title="Close popup"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
