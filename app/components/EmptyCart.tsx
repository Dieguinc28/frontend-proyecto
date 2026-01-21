'use client';

interface EmptyCartProps {
  onGoToProducts: () => void;
}

export default function EmptyCart({ onGoToProducts }: EmptyCartProps) {
  return (
    <div className="cart-empty">
      <h2>Tu carrito está vacío</h2>
      <p>Agrega productos para comenzar tu cotización</p>
      <button onClick={onGoToProducts} className="btn btn-primary">
        Ver Productos
      </button>
    </div>
  );
}
