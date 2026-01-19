'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CloseIcon from '@mui/icons-material/Close';
import Badge from '@mui/material/Badge';

export default function FloatingQuoteButton() {
  const router = useRouter();
  const { cart, total } = useCart();
  const [isExpanded, setIsExpanded] = useState(false);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = total;

  if (totalItems === 0) return null;

  const handleQuote = () => {
    router.push('/cart');
  };

  return (
    <>
      {/* Botón flotante principal */}
      <div className="floating-quote-container">
        {isExpanded && (
          <div className="floating-quote-expanded">
            <div className="floating-quote-header">
              <span>Tu Cotización</span>
              <button
                className="close-btn"
                onClick={() => setIsExpanded(false)}
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>
            <div className="floating-quote-content">
              <div className="quote-summary">
                <div className="summary-row">
                  <span>Productos:</span>
                  <span>{totalItems}</span>
                </div>
                <div className="summary-row total">
                  <span>Total:</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>
              <button
                className="btn btn-primary quote-action-btn"
                onClick={handleQuote}
              >
                <ReceiptLongIcon fontSize="small" />
                Ver y Cotizar
              </button>
            </div>
          </div>
        )}

        <button
          className="floating-quote-btn"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Badge badgeContent={totalItems} color="error" max={99}>
            <ShoppingCartCheckoutIcon />
          </Badge>
          <span className="floating-btn-text">Cotizar</span>
          <span className="floating-btn-price">${totalPrice.toFixed(2)}</span>
        </button>
      </div>

      <style jsx>{`
        .floating-quote-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 12px;
        }

        .floating-quote-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 24px;
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
          border: none;
          border-radius: 50px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(79, 70, 229, 0.4);
          transition: all 0.3s ease;
          animation: pulse 2s infinite;
        }

        .floating-quote-btn:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 6px 30px rgba(79, 70, 229, 0.5);
        }

        @keyframes pulse {
          0%,
          100% {
            box-shadow: 0 4px 20px rgba(79, 70, 229, 0.4);
          }
          50% {
            box-shadow: 0 4px 30px rgba(79, 70, 229, 0.6);
          }
        }

        .floating-btn-text {
          margin-left: 4px;
        }

        .floating-btn-price {
          background: rgba(255, 255, 255, 0.2);
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.9rem;
        }

        .floating-quote-expanded {
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          width: 280px;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .floating-quote-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 16px;
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
          font-weight: 600;
        }

        .close-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: white;
          transition: background 0.2s;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .floating-quote-content {
          padding: 16px;
        }

        .quote-summary {
          margin-bottom: 16px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          color: #666;
          font-size: 0.95rem;
        }

        .summary-row.total {
          border-top: 1px solid #eee;
          margin-top: 8px;
          padding-top: 12px;
          font-weight: 700;
          color: #1a1a2e;
          font-size: 1.1rem;
        }

        .quote-action-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
        }

        /* Responsive */
        @media (max-width: 480px) {
          .floating-quote-container {
            bottom: 16px;
            right: 16px;
            left: 16px;
          }

          .floating-quote-btn {
            width: 100%;
            justify-content: center;
          }

          .floating-quote-expanded {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
