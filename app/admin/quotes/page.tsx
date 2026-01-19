'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '../../hooks/useAuth';
import { useAllQuotes, useUpdateQuoteStatus } from '../../hooks/useQuotes';
import AdminLayout from '../../components/AdminLayout';
import QuoteDetailModal from '../../components/QuoteDetailModal';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import type { Quote } from '../../types';

export default function AdminQuotes() {
  const { data: user } = useCurrentUser();
  const router = useRouter();
  const { data: quotes, isLoading } = useAllQuotes();
  const { mutate: updateStatus } = useUpdateQuoteStatus();
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  const handleViewDetails = (quote: Quote) => {
    setSelectedQuote(quote);
    setDetailModalOpen(true);
  };

  const handleUpdateStatus = (
    quoteId: number,
    status: 'aprobada' | 'rechazada'
  ) => {
    const message =
      status === 'aprobada'
        ? '¿Aprobar esta cotización?'
        : '¿Rechazar esta cotización?';

    if (window.confirm(message)) {
      updateStatus(
        { id: String(quoteId), status },
        {
          onSuccess: () => {
            // Éxito silencioso, la tabla se actualizará automáticamente
          },
          onError: () => {
            alert('Error al actualizar estado');
          },
        }
      );
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <AdminLayout>
      <div className="admin-header">
        <h1>Gestión de Cotizaciones</h1>
        <p>Administra todas las cotizaciones de los clientes</p>
      </div>

      <div className="admin-table-container">
        <div className="table-header">
          <h2>Todas las Cotizaciones</h2>
        </div>
        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            Cargando...
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Email</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {!quotes || quotes.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      style={{ textAlign: 'center', padding: '2rem' }}
                    >
                      No hay cotizaciones
                    </td>
                  </tr>
                ) : (
                  quotes.map((quote) => (
                    <tr key={quote.id}>
                      <td data-label="ID">#{quote.id}</td>
                      <td data-label="Cliente">{quote.user?.name || 'N/A'}</td>
                      <td data-label="Email">{quote.user?.email || 'N/A'}</td>
                      <td data-label="Items">{quote.items.length} productos</td>
                      <td data-label="Total">
                        ${parseFloat(String(quote.total)).toFixed(2)}
                      </td>
                      <td data-label="Estado">
                        <span className={`status-badge ${quote.status}`}>
                          {quote.status}
                        </span>
                      </td>
                      <td data-label="Fecha">
                        {new Date(quote.createdAt).toLocaleDateString()}
                      </td>
                      <td data-label="Acciones">
                        <div className="table-actions">
                          {quote.status === 'pendiente' && (
                            <>
                              <button
                                className="btn-icon edit"
                                onClick={() =>
                                  handleUpdateStatus(quote.id, 'aprobada')
                                }
                                title="Aprobar"
                              >
                                <CheckCircleIcon />
                              </button>
                              <button
                                className="btn-icon delete"
                                onClick={() =>
                                  handleUpdateStatus(quote.id, 'rechazada')
                                }
                                title="Rechazar"
                              >
                                <CancelIcon />
                              </button>
                            </>
                          )}
                          <button
                            className="btn-icon"
                            onClick={() => handleViewDetails(quote)}
                            title="Ver detalles"
                          >
                            <VisibilityIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <QuoteDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        quote={selectedQuote}
      />
    </AdminLayout>
  );
}
