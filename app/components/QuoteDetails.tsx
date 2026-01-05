'use client';

import type { Quote } from '../types';

interface QuoteDetailsProps {
  quote: Quote;
}

export default function QuoteDetails({ quote }: QuoteDetailsProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      pendiente: { label: 'Pendiente', className: 'status-pending' },
      aprobada: { label: 'Aprobada', className: 'status-approved' },
      rechazada: { label: 'Rechazada', className: 'status-rejected' },
    };

    const statusInfo = statusMap[status] || statusMap.pendiente;
    return (
      <span className={`status-badge ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  return (
    <div className="quote-details-card">
      <div className="quote-header">
        <div>
          <h3>Cotización #{quote.id}</h3>
          <p className="quote-date">{formatDate(quote.createdAt)}</p>
        </div>
        {getStatusBadge(quote.status)}
      </div>

      <div className="quote-items">
        <h4>Productos</h4>
        <table className="quote-items-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Marca</th>
              <th>Cantidad</th>
              <th>Precio Unit.</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {quote.items.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.brand}</td>
                <td>{item.quantity}</td>
                <td>${item.price.toFixed(2)}</td>
                <td>${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="quote-total">
        <span>Total:</span>
        <span className="total-amount">${quote.total.toFixed(2)}</span>
      </div>
    </div>
  );
}
