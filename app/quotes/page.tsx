'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '../hooks/useAuth';
import {
  useMyQuotes,
  useAllQuotes,
  useUpdateQuoteStatus,
  useDownloadQuotePdf,
} from '../hooks/useQuotes';
import Layout from '../components/Layout';
import DownloadIcon from '@mui/icons-material/Download';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Toast from '../components/Toast';

export default function Quotes() {
  const { data: user } = useCurrentUser();
  const router = useRouter();

  const { data: myQuotes, isLoading: loadingMy } = useMyQuotes();
  const { data: allQuotes, isLoading: loadingAll } = useAllQuotes();
  const { mutate: updateStatus } = useUpdateQuoteStatus();
  const { mutate: downloadPdf } = useDownloadQuotePdf();
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);
  const [expandedQuotes, setExpandedQuotes] = useState<Set<number>>(new Set());

  const isAdmin = user?.role === 'admin';
  const quotes = isAdmin ? allQuotes : myQuotes;
  const isLoading = isAdmin ? loadingAll : loadingMy;

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  const toggleQuoteExpansion = (quoteId: number) => {
    setExpandedQuotes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(quoteId)) {
        newSet.delete(quoteId);
      } else {
        newSet.add(quoteId);
      }
      return newSet;
    });
  };

  const handleUpdateStatus = (
    quoteId: string,
    status: 'aprobada' | 'rechazada',
  ) => {
    updateStatus(
      { id: quoteId, status },
      {
        onSuccess: () => {
          setToast({
            message: `Cotización ${status === 'aprobada' ? 'aprobada' : 'rechazada'} exitosamente`,
            type: 'success',
          });
        },
        onError: () => {
          setToast({
            message: 'Error al actualizar estado',
            type: 'error',
          });
        },
      },
    );
  };

  const handleDownloadPdf = (quoteId: string) => {
    downloadPdf(quoteId, {
      onSuccess: () => {
        setToast({
          message: 'PDF descargado exitosamente',
          type: 'success',
        });
      },
      onError: () => {
        setToast({
          message: 'Error al descargar el PDF',
          type: 'error',
        });
      },
    });
  };

  if (isLoading)
    return (
      <Layout>
        <div
          style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            fontFamily:
              "'Aksioma Condensed', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          }}
        >
          <p style={{ color: '#6c757d', fontSize: '1.125rem' }}>Cargando...</p>
        </div>
      </Layout>
    );

  return (
    <Layout>
      <div
        className="container"
        style={{ paddingTop: '2rem', paddingBottom: '3rem' }}
      >
        <div style={{ marginBottom: '2rem' }}>
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#2c3e50',
              margin: '0 0 0.5rem 0',
              fontFamily:
                "'Aksioma Condensed', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            }}
          >
            {isAdmin ? 'Todas las Cotizaciones' : 'Mis Cotizaciones'}
          </h1>
          <p
            style={{
              color: '#6c757d',
              fontSize: '1rem',
              margin: 0,
              fontFamily:
                "'Aksioma Condensed', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            }}
          >
            {isAdmin
              ? 'Gestiona y revisa todas las cotizaciones de los clientes'
              : 'Revisa el estado de tus cotizaciones solicitadas'}
          </p>
        </div>

        {!quotes || quotes.length === 0 ? (
          <div
            style={{
              background: 'white',
              borderRadius: '3px',
              padding: '3rem 2rem',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
              border: '1px solid #e2e8f0',
            }}
          >
            <p
              style={{
                color: '#6c757d',
                fontSize: '1.125rem',
                margin: 0,
                fontFamily:
                  "'Aksioma Condensed', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              }}
            >
              No hay cotizaciones disponibles
            </p>
          </div>
        ) : (
          <div className="quotes-list">
            {quotes.map((quote) => {
              const isExpanded = expandedQuotes.has(quote.id);
              const itemCount = quote.items.length;

              return (
                <div key={quote.id} className="quote-card">
                  <div className="quote-header">
                    <div>
                      <h3>Cotización #{quote.id}</h3>
                      {isAdmin && quote.user && (
                        <p
                          style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}
                        >
                          <strong>Cliente:</strong> {quote.user.name} (
                          {quote.user.email})
                        </p>
                      )}
                    </div>
                    <span className={`status ${quote.status}`}>
                      {quote.status}
                    </span>
                  </div>

                  <div className="quote-summary">
                    <div className="quote-summary-info">
                      <span className="summary-label">Productos:</span>
                      <span className="summary-value">{itemCount}</span>
                    </div>
                    <div className="quote-summary-info">
                      <span className="summary-label">Total:</span>
                      <span className="summary-value total-amount">
                        ${parseFloat(String(quote.total)).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleQuoteExpansion(quote.id)}
                    className="toggle-products-btn"
                  >
                    {isExpanded ? (
                      <>
                        <ExpandLessIcon fontSize="small" />
                        Ocultar productos
                      </>
                    ) : (
                      <>
                        <ExpandMoreIcon fontSize="small" />
                        Ver productos ({itemCount})
                      </>
                    )}
                  </button>

                  {isExpanded && (
                    <div className="quote-items">
                      <div className="quote-items-grid">
                        {quote.items.map((item, idx) => (
                          <div key={idx} className="quote-item-compact">
                            <div className="item-name">{item.name}</div>
                            <div className="item-details">
                              <span className="item-qty">
                                Cant: {item.quantity}
                              </span>
                              <span className="item-price">${item.price}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="quote-actions">
                    {isAdmin && quote.status === 'pendiente' && (
                      <>
                        <button
                          onClick={() =>
                            handleUpdateStatus(String(quote.id), 'aprobada')
                          }
                          className="btn btn-success"
                        >
                          Aprobar
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateStatus(String(quote.id), 'rechazada')
                          }
                          className="btn btn-danger"
                        >
                          Rechazar
                        </button>
                      </>
                    )}
                    {quote.status === 'aprobada' && (
                      <button
                        onClick={() => handleDownloadPdf(String(quote.id))}
                        className="btn btn-primary"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          justifyContent: 'center',
                        }}
                      >
                        <DownloadIcon fontSize="small" />
                        Descargar PDF
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </Layout>
  );
}
