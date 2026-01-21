'use client';

import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../lib/imageUtils';
import type { Product } from '../types';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface ProductCardWithVariantsProps {
  baseProduct: Product;
  variants: Product[];
}

// Mapeo de colores a códigos hex
const COLOR_MAP: Record<string, string> = {
  azul: '#2563eb',
  rojo: '#dc2626',
  negro: '#1a1a1a',
  verde: '#16a34a',
  amarillo: '#eab308',
  rosa: '#ec4899',
  morado: '#9333ea',
  naranja: '#f97316',
  blanco: '#f5f5f5',
  gris: '#6b7280',
};

// Extraer color del nombre del producto
const extractColor = (name: string): string | null => {
  const match = name.match(
    /(azul|rojo|negro|verde|amarillo|rosa|morado|naranja|blanco|gris)s?$/i,
  );
  return match ? match[1].toLowerCase() : null;
};

export default function ProductCardWithVariants({
  baseProduct,
  variants,
}: ProductCardWithVariantsProps) {
  const { addToCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<Product>(variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  const name = baseProduct.name || baseProduct.nombre || 'Producto';
  const description = baseProduct.description || baseProduct.descripcion || '';

  const price =
    typeof selectedVariant.price === 'number'
      ? selectedVariant.price
      : typeof selectedVariant.precioreferencial === 'number'
        ? selectedVariant.precioreferencial
        : parseFloat(
            String(
              selectedVariant.price || selectedVariant.precioreferencial || 0,
            ),
          );

  const stock = selectedVariant.stock || 0;
  const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(stock, prev + delta)));
  };

  const handleAddToCart = () => {
    addToCart(selectedVariant, quantity);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
    setQuantity(1);
  };

  const handleSelectVariant = (variant: Product) => {
    setSelectedVariant(variant);
    setQuantity(1);
  };

  // Obtener colores disponibles
  const availableColors = variants
    .map((v) => {
      const variantName = v.name || v.nombre || '';
      const color = extractColor(variantName);
      return {
        variant: v,
        color,
        hex: color ? COLOR_MAP[color] : '#ccc',
        name: color
          ? color.charAt(0).toUpperCase() + color.slice(1)
          : 'Default',
        stock: v.stock || 0,
      };
    })
    .filter((c) => c.color);

  const selectedColor = extractColor(
    selectedVariant.name || selectedVariant.nombre || '',
  );

  return (
    <div className="product-card">
      <img src={getImageUrl(selectedVariant.image)} alt={name} />
      <div className="product-card-content">
        <h3>{name}</h3>
        {baseProduct.marca && (
          <span className="product-brand">{baseProduct.marca}</span>
        )}
        <p className="description">{description}</p>
        <p className="price">${price.toFixed(2)}</p>

        {/* Selector de colores */}
        <div style={{ marginBottom: '12px' }}>
          <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '8px' }}>
            Color:{' '}
            <strong>
              {selectedColor
                ? selectedColor.charAt(0).toUpperCase() + selectedColor.slice(1)
                : ''}
            </strong>
          </p>
          <div
            style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}
          >
            {availableColors.map(
              ({
                variant,
                color,
                hex,
                name: colorName,
                stock: variantStock,
              }) => (
                <button
                  key={variant._id}
                  onClick={() => handleSelectVariant(variant)}
                  disabled={variantStock === 0}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: hex,
                    border:
                      selectedVariant._id === variant._id
                        ? '3px solid #4f46e5'
                        : '2px solid #e5e7eb',
                    cursor: variantStock === 0 ? 'not-allowed' : 'pointer',
                    opacity: variantStock === 0 ? 0.4 : 1,
                    boxShadow:
                      selectedVariant._id === variant._id
                        ? '0 0 0 2px white, 0 0 0 4px #4f46e5'
                        : 'none',
                    transition: 'all 0.2s',
                  }}
                  title={`${colorName} (${variantStock} disponibles)`}
                />
              ),
            )}
          </div>
        </div>

        {/* Selector de cantidad */}
        {stock > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              marginBottom: '12px',
            }}
          >
            <button
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                border: '1px solid #d1d5db',
                background: quantity <= 1 ? '#f3f4f6' : 'white',
                cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <RemoveIcon style={{ fontSize: '16px' }} />
            </button>
            <span
              style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                minWidth: '30px',
                textAlign: 'center',
              }}
            >
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= stock}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                border: '1px solid #d1d5db',
                background: quantity >= stock ? '#f3f4f6' : 'white',
                cursor: quantity >= stock ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AddIcon style={{ fontSize: '16px' }} />
            </button>
          </div>
        )}

        {stock > 0 ? (
          <button
            onClick={handleAddToCart}
            className="btn btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            {showSuccess ? (
              <>
                <CheckCircleIcon fontSize="small" />
                ¡Agregado!
              </>
            ) : (
              `Agregar ${quantity > 1 ? quantity + ' ' : ''}al Carrito`
            )}
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
  );
}
