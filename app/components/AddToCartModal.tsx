'use client';

import { useEffect, useState } from 'react';
import { getImageUrl } from '../lib/imageUtils';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

interface AddToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quantity: number) => void;
  product: Product | null;
}

// Colores disponibles para bolígrafos
const BOLIGRAFO_COLORS = [
  { name: 'Negro', hex: '#1a1a1a' },
  { name: 'Azul', hex: '#2563eb' },
  { name: 'Rojo', hex: '#dc2626' },
  { name: 'Verde', hex: '#16a34a' },
];

export default function AddToCartModal({
  isOpen,
  onClose,
  onConfirm,
  product,
}: AddToCartModalProps) {
  const { addToCart } = useCart();
  const [alternativa, setAlternativa] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // Detectar si es un bolígrafo
  const isBoligrafo =
    product?.nombre?.toLowerCase().includes('bolígrafo') ||
    product?.nombre?.toLowerCase().includes('boligrafo') ||
    product?.name?.toLowerCase().includes('bolígrafo') ||
    product?.name?.toLowerCase().includes('boligrafo');

  // Efecto para cargar UNA recomendación cuando se abre el modal
  useEffect(() => {
    if (isOpen && product) {
      // Reset estados
      setQuantity(1);
      setSelectedColor(isBoligrafo ? BOLIGRAFO_COLORS[0].name : null);

      const id = (product as any).id || (product as any).idproducto;
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

      fetch(`${API_URL}/recomendaciones/producto/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            // Solo tomamos la primera alternativa
            setAlternativa(data[0]);
          } else {
            setAlternativa(null);
          }
        })
        .catch((err) => {
          console.error('Error cargando recomendaciones:', err);
          setAlternativa(null);
        });
    } else {
      setAlternativa(null);
      setQuantity(1);
      setSelectedColor(null);
    }
  }, [isOpen, product, isBoligrafo]);

  if (!isOpen || !product) return null;

  const price =
    typeof product.price === 'number'
      ? product.price
      : parseFloat(product.price as any);

  const maxStock = product.stock || 99;

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(maxStock, prev + delta)));
  };

  const handleConfirm = () => {
    onConfirm(quantity);
  };

  const handleAddAlternativa = () => {
    if (alternativa) {
      const formattedProduct: Product = {
        ...alternativa,
        _id: alternativa._id || String(alternativa.idproducto),
        name: alternativa.nombre || alternativa.name || 'Producto',
        price: alternativa.precioreferencial || alternativa.price || 0,
        description: alternativa.descripcion || alternativa.description || '',
      };
      addToCart(formattedProduct, 1);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content add-to-cart-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '450px' }}
      >
        <button className="modal-close" onClick={onClose}>
          <CloseIcon />
        </button>

        <div className="modal-icon success">
          <ShoppingCartIcon />
        </div>

        <h2>¿Agregar al Carrito?</h2>

        <div className="product-preview">
          <img src={getImageUrl(product.image)} alt={product.name} />
          <div className="product-info">
            <h3>{product.name || product.nombre}</h3>
            <p className="product-description">
              {product.description || product.descripcion}
            </p>
            <p className="product-price">${price.toFixed(2)}</p>
          </div>
        </div>

        {/* Selector de color para bolígrafos */}
        {isBoligrafo && (
          <div
            style={{
              marginTop: '15px',
              padding: '12px',
              background: '#f8fafc',
              borderRadius: '8px',
            }}
          >
            <p
              style={{
                fontSize: '0.85rem',
                fontWeight: '600',
                marginBottom: '10px',
                color: '#374151',
              }}
            >
              Selecciona el color:
            </p>
            <div
              style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}
            >
              {BOLIGRAFO_COLORS.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.name)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: color.hex,
                    border:
                      selectedColor === color.name
                        ? '3px solid #4f46e5'
                        : '2px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow:
                      selectedColor === color.name
                        ? '0 0 0 2px white, 0 0 0 4px #4f46e5'
                        : 'none',
                  }}
                  title={color.name}
                />
              ))}
            </div>
            {selectedColor && (
              <p
                style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  marginTop: '8px',
                  textAlign: 'center',
                }}
              >
                Color seleccionado: {selectedColor}
              </p>
            )}
          </div>
        )}

        {/* Selector de cantidad */}
        <div
          style={{
            marginTop: '15px',
            padding: '12px',
            background: '#f8fafc',
            borderRadius: '8px',
          }}
        >
          <p
            style={{
              fontSize: '0.85rem',
              fontWeight: '600',
              marginBottom: '10px',
              color: '#374151',
            }}
          >
            Cantidad:
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '15px',
            }}
          >
            <button
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: '1px solid #d1d5db',
                background: quantity <= 1 ? '#f3f4f6' : 'white',
                cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <RemoveIcon fontSize="small" />
            </button>
            <span
              style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                minWidth: '40px',
                textAlign: 'center',
              }}
            >
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= maxStock}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: '1px solid #d1d5db',
                background: quantity >= maxStock ? '#f3f4f6' : 'white',
                cursor: quantity >= maxStock ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AddIcon fontSize="small" />
            </button>
          </div>
          <p
            style={{
              fontSize: '0.75rem',
              color: '#6b7280',
              marginTop: '8px',
              textAlign: 'center',
            }}
          >
            Total: ${(price * quantity).toFixed(2)} ({maxStock} disponibles)
          </p>
        </div>

        {/* Alternativa única */}
        {alternativa && (
          <div
            style={{
              marginTop: '15px',
              borderTop: '1px solid #eee',
              paddingTop: '15px',
            }}
          >
            <p
              style={{
                fontSize: '0.85rem',
                color: '#666',
                marginBottom: '10px',
              }}
            >
              También te podría interesar:
            </p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                background: '#fafafa',
              }}
            >
              <img
                src={getImageUrl(alternativa.image)}
                alt={alternativa.nombre || alternativa.name}
                style={{
                  width: '50px',
                  height: '50px',
                  objectFit: 'contain',
                  borderRadius: '4px',
                }}
              />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.8rem', fontWeight: '600', margin: 0 }}>
                  {alternativa.nombre || alternativa.name}
                </p>
                <p
                  style={{
                    fontSize: '0.85rem',
                    color: '#2563eb',
                    margin: '2px 0 0',
                  }}
                >
                  ${alternativa.precioreferencial || alternativa.price}
                </p>
              </div>
              <button
                onClick={handleAddAlternativa}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Agregar
              </button>
            </div>
          </div>
        )}

        <div className="modal-actions" style={{ marginTop: '20px' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={handleConfirm}>
            <CheckCircleIcon fontSize="small" />
            Agregar {quantity} al Carrito
          </button>
        </div>
      </div>
    </div>
  );
}
