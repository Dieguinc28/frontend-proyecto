'use client';

import { useState } from 'react';
import { getImageUrl } from '../lib/imageUtils';
import { apiClient } from '../lib/apiClient';
import type { CartItem as CartItemType, Product } from '../types';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onAddAlternative?: (product: Product) => void;
}

export default function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
  onAddAlternative,
}: CartItemProps) {
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [alternatives, setAlternatives] = useState<Product[]>([]);
  const [loadingAlternatives, setLoadingAlternatives] = useState(false);

  const price =
    typeof item.price === 'number' ? item.price : parseFloat(item.price || '0');
  const itemTotal = price * item.quantity;

  const handleIncrement = () => {
    onUpdateQuantity(item._id, item.quantity + 1);
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item._id, item.quantity - 1);
    }
  };

  // --- AQUÍ ESTÁ LA CORRECCIÓN CLAVE ---
  const loadAlternatives = async () => {
    // Si ya las cargamos y se están mostrando, las ocultamos
    if (showAlternatives) {
      setShowAlternatives(false);
      return;
    }

    // Si ya existen datos guardados pero estaban ocultos, solo los mostramos
    if (alternatives.length > 0) {
      setShowAlternatives(true);
      return;
    }

    setLoadingAlternatives(true);
    try {
      // ANTES (Causaba el error de los cuadernos):
      // const { data } = await apiClient.get('/products', { params: { categoria, limit: 4 } });

      // AHORA (Usa la ruta blindada que filtra por nombre y marca):
      // Asumimos que item._id es el ID del producto.
      const { data } = await apiClient.get(
        `/recomendaciones/producto/${item._id}`
      );

      if (Array.isArray(data)) {
        setAlternatives(data);
      } else {
        setAlternatives([]);
      }

      setShowAlternatives(true);
    } catch (error) {
      console.error('Error al cargar alternativas:', error);
      setAlternatives([]);
    } finally {
      setLoadingAlternatives(false);
    }
  };
  // -------------------------------------

  return (
    <div className="cart-item-enhanced">
      <div className="cart-item-main">
        <div className="cart-item-image">
          <img src={getImageUrl(item.image)} alt={item.name || item.nombre} />
        </div>

        <div className="cart-item-details">
          <h3>{item.name || item.nombre}</h3>
          {(item.marca || item.description || item.descripcion) && (
            <p className="cart-item-description">
              {item.marca && <span className="item-brand">{item.marca}</span>}
              {item.description || item.descripcion}
            </p>
          )}
          <div className="cart-item-price-mobile">${price.toFixed(2)}</div>
        </div>

        <div className="cart-item-quantity">
          <button
            className="qty-btn qty-btn-minus"
            onClick={handleDecrement}
            disabled={item.quantity <= 1}
          >
            −
          </button>
          <span className="qty-display">{item.quantity}</span>
          <button className="qty-btn qty-btn-plus" onClick={handleIncrement}>
            +
          </button>
        </div>

        <div className="cart-item-total">
          <div className="item-price">${price.toFixed(2)} c/u</div>
          <div className="item-subtotal">${itemTotal.toFixed(2)}</div>
        </div>

        <button
          className="cart-item-remove"
          onClick={() => onRemove(item._id)}
          title="Eliminar producto"
        >
          X
        </button>
      </div>

      {/* Botón de alternativas */}
      <div className="cart-item-actions">
        <button
          className="btn-alternatives"
          onClick={loadAlternatives}
          disabled={loadingAlternatives}
        >
          {loadingAlternatives
            ? 'Cargando...'
            : showAlternatives
            ? 'Ocultar alternativas'
            : 'Ver alternativas de otras marcas'}
        </button>
      </div>

      {/* Sección de alternativas */}
      {showAlternatives && alternatives.length > 0 && (
        <div className="cart-item-alternatives">
          <h4>Alternativas recomendadas:</h4>
          <div className="alternatives-grid">
            {alternatives.map((alt) => {
              const altPrice =
                typeof alt.precioreferencial === 'number'
                  ? alt.precioreferencial
                  : typeof alt.price === 'number'
                  ? alt.price
                  : 0;

              return (
                <div key={alt._id} className="alternative-card">
                  <div className="alternative-image">
                    <img
                      src={getImageUrl(alt.image)}
                      alt={alt.nombre || alt.name}
                    />
                  </div>
                  <div className="alternative-info">
                    <h5>{alt.nombre || alt.name}</h5>
                    {alt.marca && (
                      <span className="alt-brand">{alt.marca}</span>
                    )}
                    <div className="alternative-price">
                      ${altPrice.toFixed(2)}
                    </div>
                    {altPrice < price && (
                      <span className="price-badge savings">
                        Ahorra ${(price - altPrice).toFixed(2)}
                      </span>
                    )}
                  </div>
                  <button
                    className="btn-add-alternative"
                    onClick={() => onAddAlternative?.(alt)}
                  >
                    + Agregar
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showAlternatives &&
        alternatives.length === 0 &&
        !loadingAlternatives && (
          <div className="cart-item-alternatives">
            <p className="no-alternatives">
              No se encontraron alternativas similares de otras marcas.
            </p>
          </div>
        )}
    </div>
  );
}
