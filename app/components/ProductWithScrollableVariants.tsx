'use client';

import { useState, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../lib/imageUtils';
import type { Product } from '../types';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ImageZoomModal from './ImageZoomModal';

interface ProductWithScrollableVariantsProps {
  principal: Product;
  variantes: Product[];
  onSelectVariant?: (product: Product) => void;
}

export default function ProductWithScrollableVariants({
  principal,
  variantes,
  onSelectVariant,
}: ProductWithScrollableVariantsProps) {
  const { addToCart } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<Product>(principal);
  const [quantity, setQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showZoom, setShowZoom] = useState(false);
  const variantsRef = useRef<HTMLDivElement>(null);

  const getProductName = (p: Product) => p.name || p.nombre || 'Producto';
  const getProductDescription = (p: Product) =>
    p.description || p.descripcion || '';
  const getProductPrice = (p: Product) => {
    return typeof p.price === 'number'
      ? p.price
      : typeof p.precioreferencial === 'number'
        ? p.precioreferencial
        : parseFloat(String(p.price || p.precioreferencial || 0));
  };

  const name = getProductName(selectedProduct);
  const description = getProductDescription(selectedProduct);
  const price = getProductPrice(selectedProduct);
  const stock = selectedProduct.stock || 0;

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(stock, prev + delta)));
  };

  const handleAddToCart = () => {
    addToCart(selectedProduct, quantity);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
    setQuantity(1);
  };

  const handleSelectVariant = (variant: Product) => {
    setSelectedProduct(variant);
    setQuantity(1);
    onSelectVariant?.(variant);
  };

  const totalVariantes = variantes.length;

  return (
    <>
      <div className="product-variants-card">
        {/* Producto Principal - Más Grande */}
        <div className="principal-product">
          <div
            className="principal-image-container"
            onClick={() => setShowZoom(true)}
          >
            <img
              src={getImageUrl(selectedProduct.image)}
              alt={name}
              className="principal-image"
            />
            <div className="zoom-overlay-variants">
              <ZoomInIcon />
            </div>
            {totalVariantes > 0 && (
              <span className="variants-badge">+{totalVariantes} opciones</span>
            )}
          </div>

          <div className="principal-content">
            <h3 className="principal-name">{name}</h3>
            {selectedProduct.marca && (
              <span className="principal-brand">{selectedProduct.marca}</span>
            )}
            <p className="principal-description">{description}</p>

            <div className="principal-price-stock">
              <span className="principal-price">${price.toFixed(2)}</span>
            </div>

            {/* Selector de cantidad */}
            {stock > 0 && (
              <div className="quantity-selector">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="qty-btn"
                >
                  <RemoveIcon style={{ fontSize: '16px' }} />
                </button>
                <span className="qty-value">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= stock}
                  className="qty-btn"
                >
                  <AddIcon style={{ fontSize: '16px' }} />
                </button>
              </div>
            )}

            {stock > 0 ? (
              <button
                onClick={handleAddToCart}
                className="btn btn-primary add-cart-btn"
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
              <button className="btn btn-secondary" disabled>
                Sin Stock
              </button>
            )}
          </div>
        </div>

        {/* Sección de Variantes Scrolleable */}
        {totalVariantes > 0 && (
          <div className="variants-section">
            <button
              className="variants-toggle"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <span>Ver otras opciones ({totalVariantes})</span>
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </button>

            <div
              ref={variantsRef}
              className={`variants-scroll-container ${isExpanded ? 'expanded' : ''}`}
            >
              <div className="variants-list">
                {variantes.map((variant) => {
                  const variantName = getProductName(variant);
                  const variantPrice = getProductPrice(variant);
                  const variantStock = variant.stock || 0;
                  const isSelected =
                    selectedProduct._id === variant._id ||
                    selectedProduct.idproducto === variant.idproducto;

                  return (
                    <div
                      key={variant._id || variant.idproducto}
                      className={`variant-item ${isSelected ? 'selected' : ''} ${variantStock === 0 ? 'out-of-stock' : ''}`}
                      onClick={() =>
                        variantStock > 0 && handleSelectVariant(variant)
                      }
                    >
                      <img
                        src={getImageUrl(variant.image)}
                        alt={variantName}
                        className="variant-image"
                      />
                      <div className="variant-info">
                        <span className="variant-name">{variantName}</span>
                        <span className="variant-price">
                          ${variantPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="variant-stock">
                        {variantStock > 0 ? (
                          <span className="stock-mini in-stock">
                            {variantStock} disp.
                          </span>
                        ) : (
                          <span className="stock-mini out-of-stock">
                            Agotado
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <CheckCircleIcon className="selected-icon" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          .product-variants-card {
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            overflow: hidden;
            transition: all 0.3s ease;
          }

          .product-variants-card:hover {
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
          }

          /* Producto Principal */
          .principal-product {
            padding: 20px;
          }

          .principal-image-container {
            position: relative;
            width: 100%;
            aspect-ratio: 1;
            border-radius: 12px;
            overflow: hidden;
            background: #f8f9fa;
            margin-bottom: 16px;
          }

          .principal-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
          }

          .principal-image-container:hover .principal-image {
            transform: scale(1.05);
          }

          .variants-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            background: linear-gradient(135deg, #4f46e5, #7c3aed);
            color: white;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
          }

          .principal-content {
            text-align: center;
          }

          .principal-name {
            font-size: 1.1rem;
            font-weight: 700;
            color: #1a1a2e;
            margin: 0 0 8px 0;
            line-height: 1.3;
          }

          .principal-brand {
            display: inline-block;
            background: #f0f0f5;
            color: #666;
            padding: 2px 10px;
            border-radius: 12px;
            font-size: 0.75rem;
            margin-bottom: 8px;
          }

          .principal-description {
            font-size: 0.85rem;
            color: #666;
            margin: 0 0 12px 0;
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .principal-price-stock {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 12px;
          }

          .principal-price {
            font-size: 1.5rem;
            font-weight: 800;
            color: #4f46e5;
          }

          .stock-badge {
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
          }

          .stock-badge.in-stock {
            background: #dcfce7;
            color: #15803d;
          }

          .stock-badge.out-of-stock {
            background: #fee2e2;
            color: #b91c1c;
          }

          /* Selector de cantidad */
          .quantity-selector {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 12px;
          }

          .qty-btn {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 1px solid #e5e7eb;
            background: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
          }

          .qty-btn:hover:not(:disabled) {
            background: #f3f4f6;
            border-color: #4f46e5;
          }

          .qty-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .qty-value {
            font-size: 1.1rem;
            font-weight: 700;
            min-width: 30px;
            text-align: center;
          }

          .add-cart-btn {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 12px;
            font-weight: 600;
          }

          /* Sección de Variantes */
          .variants-section {
            border-top: 1px solid #eee;
          }

          .variants-toggle {
            width: 100%;
            padding: 12px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #f8f9fa;
            border: none;
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: 600;
            color: #4f46e5;
            transition: background 0.2s;
          }

          .variants-toggle:hover {
            background: #f0f0f5;
          }

          .variants-scroll-container {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease-out;
          }

          .variants-scroll-container.expanded {
            max-height: 250px;
            overflow-y: auto;
          }

          /* Scrollbar personalizado */
          .variants-scroll-container::-webkit-scrollbar {
            width: 6px;
          }

          .variants-scroll-container::-webkit-scrollbar-track {
            background: #f1f1f1;
          }

          .variants-scroll-container::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 3px;
          }

          .variants-scroll-container::-webkit-scrollbar-thumb:hover {
            background: #a1a1a1;
          }

          .variants-list {
            padding: 8px;
          }

          .variant-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 12px;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.2s;
            position: relative;
            border: 2px solid transparent;
          }

          .variant-item:hover:not(.out-of-stock) {
            background: #f8f9fa;
          }

          .variant-item.selected {
            background: #eef2ff;
            border-color: #4f46e5;
          }

          .variant-item.out-of-stock {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .variant-image {
            width: 50px;
            height: 50px;
            border-radius: 8px;
            object-fit: cover;
            background: #f0f0f0;
          }

          .variant-info {
            flex: 1;
            min-width: 0;
          }

          .variant-name {
            display: block;
            font-size: 0.85rem;
            font-weight: 600;
            color: #333;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .variant-price {
            font-size: 0.9rem;
            font-weight: 700;
            color: #4f46e5;
          }

          .variant-stock {
            text-align: right;
          }

          .stock-mini {
            font-size: 0.7rem;
            padding: 2px 6px;
            border-radius: 10px;
          }

          .stock-mini.in-stock {
            background: #dcfce7;
            color: #15803d;
          }

          .stock-mini.out-of-stock {
            background: #fee2e2;
            color: #b91c1c;
          }

          .selected-icon {
            color: #4f46e5;
            font-size: 20px !important;
          }

          .zoom-overlay-variants {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
            color: white;
            cursor: pointer;
          }

          .principal-image-container:hover .zoom-overlay-variants {
            opacity: 1;
          }

          .zoom-overlay-variants svg {
            font-size: 2.5rem;
          }
        `}</style>
      </div>

      <ImageZoomModal
        isOpen={showZoom}
        onClose={() => setShowZoom(false)}
        imageUrl={selectedProduct.image || ''}
        alt={name}
      />
    </>
  );
}
