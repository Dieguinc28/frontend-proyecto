'use client';

import { useState } from 'react';
import ProductCard from './ProductCard';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CloseIcon from '@mui/icons-material/Close';
import type { Product } from '../types';

interface ProductGroupCardProps {
  mainProduct: Product;
  variants: Product[];
}

export default function ProductGroupCard({
  mainProduct,
  variants,
}: ProductGroupCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Si no hay variantes o el array está vacío, mostrar solo el producto principal
  if (!variants || variants.length === 0) {
    return <ProductCard product={mainProduct} />;
  }

  return (
    <div className="product-group-card">
      {/* Producto principal */}
      <div className="main-product-wrapper">
        <ProductCard product={mainProduct} />
      </div>

      {/* Botón para expandir variantes */}
      {variants.length > 0 && (
        <button
          className="expand-variants-btn"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span>
            {isExpanded ? 'Ocultar' : 'Ver'} {variants.length} opción
            {variants.length > 1 ? 'es' : ''} más
          </span>
          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </button>
      )}

      {/* Overlay de fondo */}
      {isExpanded && (
        <div
          className="variants-overlay"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Modal de variantes mejorado */}
      {isExpanded && variants.length > 0 && (
        <div className="variants-modal">
          <div className="variants-modal-content">
            {/* Header del modal */}
            <div className="variants-modal-header">
              <div className="header-content">
                <h2>Opciones Disponibles</h2>
                <p>Selecciona la variante que prefieras</p>
              </div>
              <button
                className="variants-modal-close"
                onClick={() => setIsExpanded(false)}
                aria-label="Cerrar"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Grid de variantes */}
            <div className="variants-grid">
              {/* Producto principal */}
              <div className="variant-card-wrapper featured">
                <div className="variant-badge">Opción Principal</div>
                <ProductCard product={mainProduct} />
              </div>

              {/* Variantes */}
              {variants.map((variant, index) => (
                <div
                  key={variant._id || variant.idproducto}
                  className="variant-card-wrapper"
                >
                  <div className="variant-badge">Opción {index + 2}</div>
                  <ProductCard product={variant} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .product-group-card {
          display: flex;
          flex-direction: column;
          height: 100%;
          position: relative;
        }

        .main-product-wrapper {
          flex: 1;
        }

        .expand-variants-btn {
          width: 100%;
          padding: 10px 14px;
          margin-top: 10px;
          background: linear-gradient(135deg, #2e86ab 0%, #1e5a7a 100%);
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 3px 10px rgba(46, 134, 171, 0.3);
          position: relative;
          z-index: 2;
          letter-spacing: 0.2px;
        }

        .expand-variants-btn :global(svg) {
          font-size: 18px;
        }

        .expand-variants-btn:hover {
          background: linear-gradient(135deg, #1e5a7a 0%, #0d3d52 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(46, 134, 171, 0.4);
        }

        .expand-variants-btn:active {
          transform: translateY(-1px);
        }

        .variants-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.65);
          z-index: 999;
          animation: fadeIn 0.3s ease;
          backdrop-filter: blur(6px);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .variants-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          animation: modalFadeIn 0.3s ease;
        }

        @keyframes modalFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .variants-modal-content {
          background: white;
          border-radius: 20px;
          width: 100%;
          max-width: 1200px;
          max-height: 92vh;
          overflow: hidden;
          box-shadow: 0 25px 70px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .variants-modal-header {
          background: linear-gradient(135deg, #2e86ab 0%, #1e5a7a 100%);
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid rgba(255, 255, 255, 0.15);
          position: relative;
          overflow: hidden;
        }

        .variants-modal-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.1) 0%,
            transparent 100%
          );
          pointer-events: none;
        }

        .header-content {
          position: relative;
          z-index: 1;
        }

        .variants-modal-header h2 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 700;
          color: white;
          letter-spacing: -0.3px;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .variants-modal-header p {
          margin: 4px 0 0;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 400;
        }

        .variants-modal-close {
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          z-index: 1;
        }

        .variants-modal-close :global(svg) {
          font-size: 18px;
        }

        .variants-modal-close:hover {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.5);
          transform: rotate(90deg) scale(1.1);
        }

        .variants-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          padding: 20px;
          overflow-y: auto;
          background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
        }

        .variant-card-wrapper {
          position: relative;
          animation: fadeInUp 0.5s ease forwards;
          opacity: 0;
          transition: transform 0.3s ease;
        }

        .variant-card-wrapper:hover {
          transform: translateY(-4px);
        }

        .variant-card-wrapper:nth-child(1) {
          animation-delay: 0.1s;
        }

        .variant-card-wrapper:nth-child(2) {
          animation-delay: 0.15s;
        }

        .variant-card-wrapper:nth-child(3) {
          animation-delay: 0.2s;
        }

        .variant-card-wrapper:nth-child(4) {
          animation-delay: 0.25s;
        }

        .variant-card-wrapper:nth-child(5) {
          animation-delay: 0.3s;
        }

        .variant-card-wrapper:nth-child(n + 6) {
          animation-delay: 0.35s;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .variant-badge {
          position: absolute;
          top: -10px;
          left: 10px;
          background: linear-gradient(135deg, #2e86ab 0%, #1e5a7a 100%);
          color: white;
          padding: 4px 10px;
          border-radius: 16px;
          font-size: 0.65rem;
          font-weight: 600;
          z-index: 10;
          box-shadow: 0 4px 12px rgba(46, 134, 171, 0.3);
          letter-spacing: 0.3px;
          text-transform: uppercase;
          border: 1.5px solid rgba(255, 255, 255, 0.3);
        }

        .variant-card-wrapper.featured .variant-badge {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.35);
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        /* Scrollbar personalizado */
        .variants-grid::-webkit-scrollbar {
          width: 10px;
        }

        .variants-grid::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .variants-grid::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #2e86ab 0%, #1e5a7a 100%);
          border-radius: 10px;
        }

        .variants-grid::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #1e5a7a 0%, #0d3d52 100%);
        }

        @media (max-width: 1200px) {
          .variants-grid {
            grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
            gap: 24px;
            padding: 28px;
          }
        }

        @media (max-width: 1024px) {
          .variants-modal-header h2 {
            font-size: 1rem;
          }

          .variants-grid {
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 18px;
            padding: 18px;
          }
        }

        @media (max-width: 768px) {
          .variants-modal {
            padding: 12px;
          }

          .variants-modal-header {
            padding: 14px 16px;
          }

          .variants-modal-header h2 {
            font-size: 0.95rem;
          }

          .variants-modal-header p {
            font-size: 0.75rem;
          }

          .variants-modal-close {
            width: 28px;
            height: 28px;
          }

          .variants-modal-close :global(svg) {
            font-size: 16px;
          }

          .variants-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 14px;
            padding: 16px;
          }

          .expand-variants-btn {
            font-size: 0.8rem;
            padding: 9px 12px;
          }

          .variant-badge {
            font-size: 0.6rem;
            padding: 3px 8px;
          }
        }

        @media (max-width: 640px) {
          .variants-modal-header {
            padding: 12px 14px;
          }

          .variants-modal-header h2 {
            font-size: 0.9rem;
          }

          .variants-grid {
            grid-template-columns: 1fr;
            padding: 14px;
          }
        }
      `}</style>
    </div>
  );
}
