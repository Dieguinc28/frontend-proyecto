'use client';

import CloseIcon from '@mui/icons-material/Close';
import { useDownloadQuotePdf } from '../hooks/useQuotes';
import type { Quote } from '../types';

interface QuoteDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: Quote | null;
}

export default function QuoteDetailModal({
  isOpen,
  onClose,
  quote,
}: QuoteDetailModalProps) {
  const { mutate: downloadPdf, isPending } = useDownloadQuotePdf();

  if (!isOpen || !quote) return null;

  const handleDownload = () => {
    downloadPdf(String(quote.id));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '600px' }}
      >
        <div className="modal-header">
          <h3>Detalle de Cotización #{quote.id}</h3>
          <button className="modal-close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="modal-body">
          {/* Información del Cliente */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4
              style={{
                margin: '0 0 0.75rem 0',
                fontSize: '0.875rem',
                color: '#2e86ab',
                fontWeight: 600,
              }}
            >
              Información del Cliente
            </h4>
            <div
              style={{ display: 'grid', gap: '0.5rem', fontSize: '0.875rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6c757d' }}>Nombre:</span>
                <span style={{ fontWeight: 500 }}>
                  {quote.user?.name || 'N/A'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6c757d' }}>Email:</span>
                <span style={{ fontWeight: 500 }}>
                  {quote.user?.email || 'N/A'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6c757d' }}>Fecha:</span>
                <span style={{ fontWeight: 500 }}>
                  {new Date(quote.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6c757d' }}>Estado:</span>
                <span className={`status-badge ${quote.status}`}>
                  {quote.status}
                </span>
              </div>
            </div>
          </div>

          {/* Productos */}
          <div>
            <h4
              style={{
                margin: '0 0 0.75rem 0',
                fontSize: '0.875rem',
                color: '#2e86ab',
                fontWeight: 600,
              }}
            >
              Productos ({quote.items.length})
            </h4>
            <div
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            >
              <table style={{ width: '100%', fontSize: '0.875rem' }}>
                <thead style={{ background: '#f8fafc' }}>
                  <tr>
                    <th
                      style={{
                        padding: '0.75rem',
                        textAlign: 'left',
                        fontWeight: 600,
                        color: '#475569',
                      }}
                    >
                      Producto
                    </th>
                    <th
                      style={{
                        padding: '0.75rem',
                        textAlign: 'left',
                        fontWeight: 600,
                        color: '#475569',
                      }}
                    >
                      Marca
                    </th>
                    <th
                      style={{
                        padding: '0.75rem',
                        textAlign: 'center',
                        fontWeight: 600,
                        color: '#475569',
                      }}
                    >
                      Cant.
                    </th>
                    <th
                      style={{
                        padding: '0.75rem',
                        textAlign: 'right',
                        fontWeight: 600,
                        color: '#475569',
                      }}
                    >
                      Precio
                    </th>
                    <th
                      style={{
                        padding: '0.75rem',
                        textAlign: 'right',
                        fontWeight: 600,
                        color: '#475569',
                      }}
                    >
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {quote.items.map((item, index) => (
                    <tr key={index} style={{ borderTop: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '0.75rem' }}>{item.name}</td>
                      <td style={{ padding: '0.75rem' }}>
                        {item.brand || 'N/A'}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        {item.quantity}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                        ${item.price.toFixed(2)}
                      </td>
                      <td
                        style={{
                          padding: '0.75rem',
                          textAlign: 'right',
                          fontWeight: 500,
                        }}
                      >
                        ${(item.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot style={{ borderTop: '2px solid #e2e8f0' }}>
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        padding: '0.75rem',
                        textAlign: 'right',
                        fontWeight: 600,
                        color: '#2e86ab',
                      }}
                    >
                      Total:
                    </td>
                    <td
                      style={{
                        padding: '0.75rem',
                        textAlign: 'right',
                        fontWeight: 700,
                        color: '#2e86ab',
                        fontSize: '1rem',
                      }}
                    >
                      ${Number(quote.total).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn-primary"
            onClick={handleDownload}
            disabled={isPending}
          >
            {isPending ? 'Descargando...' : 'Descargar PDF'}
          </button>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
