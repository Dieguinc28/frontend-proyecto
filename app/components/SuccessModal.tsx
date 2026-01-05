'use client';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export default function SuccessModal({
  isOpen,
  onClose,
  title,
  message,
}: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content success-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>
          <CloseIcon />
        </button>

        <div className="modal-icon success-icon">
          <CheckCircleIcon />
        </div>

        <h2>{title}</h2>
        <p className="success-message">{message}</p>

        <button className="btn btn-primary" onClick={onClose}>
          Continuar
        </button>
      </div>
    </div>
  );
}
