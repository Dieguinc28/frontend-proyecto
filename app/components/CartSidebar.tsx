'use client';

import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../lib/imageUtils';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { cart, updateQuantity, removeFromCart, total } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    onClose();
    router.push('/cart');
  };

  const handleIncrement = (itemId: string, currentQty: number) => {
    updateQuantity(itemId, currentQty + 1);
  };

  const handleDecrement = (itemId: string, currentQty: number) => {
    if (currentQty > 1) {
      updateQuantity(itemId, currentQty - 1);
    }
  };

  return (
    <>
      <div
        className={`cart-sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />
      <div className={`cart-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="cart-sidebar-header">
          <h2>
            <ShoppingBagIcon /> Mi Carrito
          </h2>
          <button className="cart-close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="cart-sidebar-content">
          {cart.length === 0 ? (
            <div className="cart-sidebar-empty">
              <ShoppingBagIcon className="empty-icon" />
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            <>
              <div className="cart-sidebar-items">
                {cart.map((item, index) => {
                  const price =
                    typeof item.price === 'number'
                      ? item.price
                      : parseFloat(item.price ?? '0');
                  const itemTotal = price * item.quantity;

                  return (
                    <div
                      key={`${item._id}-${index}`}
                      className="cart-sidebar-item"
                    >
                      <img src={getImageUrl(item.image)} alt={item.name} />
                      <div className="cart-sidebar-item-info">
                        <h4>{item.name}</h4>
                        <p className="item-price">${price.toFixed(2)}</p>
                        <div className="cart-sidebar-quantity">
                          <button
                            className="qty-btn-small"
                            onClick={() =>
                              handleDecrement(item._id, item.quantity)
                            }
                          >
                            <RemoveIcon fontSize="small" />
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            className="qty-btn-small"
                            onClick={() =>
                              handleIncrement(item._id, item.quantity)
                            }
                          >
                            <AddIcon fontSize="small" />
                          </button>
                        </div>
                      </div>
                      <div className="cart-sidebar-item-actions">
                        <span className="item-total">
                          ${itemTotal.toFixed(2)}
                        </span>
                        <button
                          className="remove-btn-small"
                          onClick={() => removeFromCart(item._id)}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-sidebar-footer">
            <div className="cart-sidebar-total">
              <span>Total:</span>
              <span className="total-amount">${total.toFixed(2)}</span>
            </div>
            <button
              className="btn btn-primary btn-block"
              onClick={handleCheckout}
            >
              Ver Carrito Completo
            </button>
          </div>
        )}
      </div>
    </>
  );
}
