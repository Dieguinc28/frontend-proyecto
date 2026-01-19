'use client';

import { useState } from 'react';
import { useCart } from '../context/CartContext';
import AddToCartModal from './AddToCartModal';
import ImageZoomModal from './ImageZoomModal';
import { getImageUrl } from '../lib/imageUtils';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import type { Product } from '../types';

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [showModal, setShowModal] = useState(false);
  const [showZoom, setShowZoom] = useState(false);

  const handleAddToCart = () => {
    setShowModal(true);
  };

  const confirmAddToCart = (quantity: number) => {
    addToCart(product, quantity);
    setShowModal(false);
  };

  const name = product.name || product.nombre || 'Producto';
  const description = product.description || product.descripcion || '';

  // Lógica de precio robusta
  const price =
    typeof product.price === 'number'
      ? product.price
      : typeof product.precioreferencial === 'number'
        ? product.precioreferencial
        : parseFloat(String(product.price || product.precioreferencial || 0));

  // Aseguramos que el stock sea un número válido. Si es undefined, es 0.
  const stock = product.stock || 0;

  return (
    <>
      <div className="product-card">
        <div
          className="product-image-container"
          onClick={() => setShowZoom(true)}
        >
          <img src={getImageUrl(product.image)} alt={name} />
          <div className="zoom-overlay">
            <ZoomInIcon />
            <span>Ver imagen</span>
          </div>
        </div>
        <div className="product-card-content">
          <h3>{name}</h3>
          {product.marca && (
            <span className="product-brand">{product.marca}</span>
          )}
          <p className="description">{description}</p>
          <p className="price">${price.toFixed(2)}</p>

          {/* --- CÓDIGO NUEVO: ETIQUETA DE STOCK --- */}
          <div style={{ marginBottom: '12px', marginTop: '5px' }}>
            {stock > 0 ? (
              <span
                style={{
                  color: '#15803d', // Verde oscuro
                  backgroundColor: '#dcfce7', // Verde claro fondo
                  padding: '4px 8px',
                  borderRadius: '15px',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                }}
              >
                En Stock: {stock}
              </span>
            ) : (
              <span
                style={{
                  color: '#b91c1c', // Rojo oscuro
                  backgroundColor: '#fee2e2', // Rojo claro fondo
                  padding: '4px 8px',
                  borderRadius: '15px',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                }}
              >
                Agotado
              </span>
            )}
          </div>
          {/* --------------------------------------- */}

          {stock > 0 ? (
            <button onClick={handleAddToCart} className="btn btn-primary">
              Agregar al Carrito
            </button>
          ) : (
            <button
              className="btn btn-secondary"
              disabled
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            >
              Sin Stock
            </button>
          )}
        </div>
      </div>

      <AddToCartModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={confirmAddToCart}
        product={product}
      />

      <ImageZoomModal
        isOpen={showZoom}
        onClose={() => setShowZoom(false)}
        imageUrl={product.image || ''}
        alt={name}
      />
    </>
  );
}
