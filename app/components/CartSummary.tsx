'use client';

interface CartSummaryProps {
  subtotal: number;
  shipping: number;
  total: number;
  isCreating: boolean;
  onCreateQuote: () => void;
  onContinueShopping: () => void;
  itemCount?: number;
}

export default function CartSummary({
  subtotal,
  shipping,
  total,
  isCreating,
  onCreateQuote,
  onContinueShopping,
  itemCount = 0,
}: CartSummaryProps) {
  return (
    <div className="cart-summary-card">
      <h2>Resumen de Cotización</h2>

      {itemCount > 0 && (
        <div className="summary-info">
          <span className="summary-info-label">Productos en carrito:</span>
          <span className="summary-info-value">{itemCount}</span>
        </div>
      )}

      <div className="summary-row">
        <span>Subtotal</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>

      {shipping > 0 && (
        <div className="summary-row">
          <span>Envío</span>
          <span>${shipping.toFixed(2)}</span>
        </div>
      )}

      <div className="summary-divider"></div>

      <div className="summary-total">
        <span>Total Estimado</span>
        <span className="total-amount">${total.toFixed(2)}</span>
      </div>

      <div className="summary-note">
        <small>* El precio final será confirmado por el proveedor</small>
      </div>

      <button
        onClick={onCreateQuote}
        className="btn btn-primary btn-block"
        disabled={isCreating}
      >
        {isCreating ? 'Creando Cotización...' : 'Solicitar Cotización'}
      </button>

      <button
        onClick={onContinueShopping}
        className="btn btn-secondary btn-block"
      >
        Seguir Comprando
      </button>
    </div>
  );
}
