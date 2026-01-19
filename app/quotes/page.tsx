'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '../hooks/useAuth';
import {
  useMyQuotes,
  useAllQuotes,
  useUpdateQuoteStatus,
} from '../hooks/useQuotes';
import Layout from '../components/Layout';

export default function Quotes() {
  const { data: user } = useCurrentUser();
  const router = useRouter();

  const { data: myQuotes, isLoading: loadingMy } = useMyQuotes();
  const { data: allQuotes, isLoading: loadingAll } = useAllQuotes();
  const { mutate: updateStatus } = useUpdateQuoteStatus();

  const isAdmin = user?.role === 'admin';
  const quotes = isAdmin ? allQuotes : myQuotes;
  const isLoading = isAdmin ? loadingAll : loadingMy;

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  const handleUpdateStatus = (
    quoteId: string,
    status: 'aprobada' | 'rechazada'
  ) => {
    updateStatus(
      { id: quoteId, status },
      {
        onError: () => {
          alert('Error al actualizar estado');
        },
      }
    );
  };

  if (isLoading)
    return (
      <Layout>
        <p>Cargando...</p>
      </Layout>
    );

  return (
    <Layout>
      <div className="container">
        <h1>Cotizaciones</h1>
        {!quotes || quotes.length === 0 ? (
          <p>No hay cotizaciones</p>
        ) : (
          <div className="quotes-list">
            {quotes.map((quote) => (
              <div key={quote.id} className="quote-card">
                <div className="quote-header">
                  <h3>Cotización #{quote.id}</h3>
                  <span className={`status ${quote.status}`}>
                    {quote.status}
                  </span>
                </div>
                {isAdmin && quote.user && (
                  <p>
                    Cliente: {quote.user.name} ({quote.user.email})
                  </p>
                )}
                <div className="quote-items">
                  {quote.items.map((item, idx) => (
                    <div key={idx} className="quote-item">
                      <span>{item.name}</span>
                      <span>x{item.quantity}</span>
                      <span>${item.price}</span>
                    </div>
                  ))}
                </div>
                <div className="quote-total">
                  <strong>
                    Total: ${parseFloat(String(quote.total)).toFixed(2)}
                  </strong>
                </div>
                {isAdmin && (
                  <div className="quote-actions">
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
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
