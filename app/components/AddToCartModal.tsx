'use client';

import { useEffect, useState } from 'react';
import { getImageUrl } from '../lib/imageUtils';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useProducts } from '../hooks/useProducts';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import '../styles/modal.css';

interface AddToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quantity: number) => void;
  product: Product | null;
}

export default function AddToCartModal({
  isOpen,
  onClose,
  onConfirm,
  product,
}: AddToCartModalProps) {
  const { addToCart } = useCart();
  const { data: allProducts } = useProducts();
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);

  // Función para obtener el nombre base del producto (sin color/variante)
  const getBaseName = (name: string): string => {
    return name
      .replace(
        /\b(azul|negro|rojo|verde|amarillo|blanco|rosa|morado|naranja)\b/gi,
        '',
      )
      .replace(/\b(pequeño|mediano|grande|chico|ch|md|gde)\b/gi, '')
      .replace(/\d+\s*(cm|mm|pulgadas|")/gi, '')
      .trim()
      .toLowerCase();
  };

  // Efecto para cargar productos relacionados cuando se abre el modal
  useEffect(() => {
    if (isOpen && product && allProducts) {
      setQuantity(1);

      const productName = product.name || product.nombre || '';
      const baseName = getBaseName(productName);
      const productId = product._id || String(product.idproducto);
      const productBrand = (product.marca || '').toLowerCase();

      // Buscar productos similares (mismo nombre base y marca, pero diferente variante)
      const related = allProducts.filter((p) => {
        const pId = p._id || String(p.idproducto);
        if (pId === productId) return false;

        const pName = p.name || p.nombre || '';
        const pBaseName = getBaseName(pName);
        const pBrand = (p.marca || '').toLowerCase();

        // Mismo nombre base y marca, pero nombre completo diferente
        return (
          pBaseName === baseName &&
          pBrand === productBrand &&
          pName.toLowerCase() !== productName.toLowerCase()
        );
      });

      setRelatedProducts(related.slice(0, 3)); // Máximo 3 recomendaciones
    } else {
      setRelatedProducts([]);
      setQuantity(1);
    }
  }, [isOpen, product, allProducts]);

  if (!isOpen || !product) return null;

  const price =
    typeof product.price === 'number'
      ? product.price
      : typeof product.precioreferencial === 'number'
        ? product.precioreferencial
        : parseFloat(String(product.price || product.precioreferencial || 0));

  const maxStock = product.stock || 99;

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(maxStock, prev + delta)));
  };

  const handleConfirm = () => {
    onConfirm(quantity);
  };

  const handleAddRelated = (relatedProduct: Product) => {
    addToCart(relatedProduct, 1);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content add-to-cart-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}
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

        {/* Productos relacionados (otras variantes) */}
        {relatedProducts.length > 0 && (
          <div
            style={{
              marginTop: '20px',
              borderTop: '2px solid #e5e7eb',
              paddingTop: '15px',
            }}
          >
            <p
              style={{
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '12px',
              }}
            >
              🎨 También disponible en:
            </p>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
            >
              {relatedProducts.map((related) => {
                const relatedPrice =
                  typeof related.price === 'number'
                    ? related.price
                    : typeof related.precioreferencial === 'number'
                      ? related.precioreferencial
                      : parseFloat(
                          String(
                            related.price || related.precioreferencial || 0,
                          ),
                        );

                return (
                  <div
                    key={related._id || related.idproducto}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      background: '#fafafa',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#3b82f6';
                      e.currentTarget.style.background = '#eff6ff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.background = '#fafafa';
                    }}
                  >
                    <img
                      src={getImageUrl(related.image)}
                      alt={related.nombre || related.name}
                      style={{
                        width: '50px',
                        height: '50px',
                        objectFit: 'contain',
                        borderRadius: '4px',
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          margin: 0,
                          color: '#1f2937',
                        }}
                      >
                        {related.nombre || related.name}
                      </p>
                      <p
                        style={{
                          fontSize: '0.9rem',
                          color: '#2563eb',
                          margin: '2px 0 0',
                          fontWeight: '600',
                        }}
                      >
                        ${relatedPrice.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAddRelated(related)}
                      style={{
                        padding: '8px 14px',
                        fontSize: '0.8rem',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#059669';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#10b981';
                      }}
                    >
                      + Agregar
                    </button>
                  </div>
                );
              })}
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
