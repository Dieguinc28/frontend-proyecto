'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useCurrentUser } from '../hooks/useAuth';
import { useCreateQuote } from '../hooks/useQuotes';
import Layout from '../components/Layout';
import CartItem from '../components/CartItem';
import CartSummary from '../components/CartSummary';
import EmptyCart from '../components/EmptyCart';
import Toast from '../components/Toast';
import FileQuoteUploader from '../components/FileQuoteUploader';
import '../styles/cart.css';
import '../styles/fileQuoteUploader.css';

export default function CartPage() {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    total,
    isLoading,
    addToCart,
  } = useCart();

  const { mutate: createQuote, isPending: isCreating } = useCreateQuote();

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  // Calcular totales
  const subtotal = total;
  const shipping = 0;
  const finalTotal = subtotal;

  // Handlers
  const handleCreateQuote = () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (cart.length === 0) {
      setToast({
        message: 'El carrito está vacío',
        type: 'error',
      });
      return;
    }

    const items = cart.map((item) => ({
      productId: item._id,
      quantity: item.quantity,
    }));

    createQuote(
      { items },
      {
        onSuccess: (data) => {
          setToast({
            message: `¡Cotización #${data.id} creada exitosamente!`,
            type: 'success',
          });
          clearCart();
          setTimeout(() => router.push('/quotes'), 1500);
        },
        onError: (error: any) => {
          const errorMsg =
            error.response?.data?.message ||
            'Error al crear cotización. Intenta de nuevo.';
          setToast({
            message: errorMsg,
            type: 'error',
          });
        },
      },
    );
  };

  const handleGoToProducts = () => {
    router.push('/');
  };

  const handleAddProductsFromPdf = async (
    productsWithQuantity: Array<{ product: any; quantity: number }>,
  ) => {
    let addedCount = 0;
    for (const item of productsWithQuantity) {
      try {
        await addToCart(item.product, item.quantity);
        addedCount++;
      } catch (error) {
        console.error('Error al agregar producto:', error);
      }
    }
    setToast({
      message: `${addedCount} producto(s) agregado(s) al carrito`,
      type: 'success',
    });
  };

  // Loading state
  const showLoading = isLoading && user;

  if (showLoading) {
    return (
      <Layout>
        <div className="cart-page">
          <div className="container">
            <div className="loading-state">
              <p>Cargando carrito...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Empty cart
  if (cart.length === 0) {
    return (
      <Layout>
        <div className="cart-page">
          <div className="container">
            <div className="cart-header">
              <h1>Mi Carrito</h1>
              <span className="cart-count">0 productos</span>
            </div>
            <EmptyCart onGoToProducts={handleGoToProducts} />
          </div>
        </div>

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </Layout>
    );
  }

  // Cart with items
  return (
    <Layout>
      <div className="cart-page">
        <div className="container">
          {/* Header */}
          <div className="cart-header">
            <h1>Mi Carrito</h1>
            <span className="cart-count">{cart.length} productos</span>
          </div>

          {/* File Quote Uploader (PDF & Images) */}
          <FileQuoteUploader onAddProducts={handleAddProductsFromPdf} />

          {/* Lista de productos */}
          <div className="cart-items-container">
            {cart.map((item, index) => (
              <CartItem
                key={`${item._id}-${index}`}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
                onAddAlternative={(product) => addToCart(product, 1)}
              />
            ))}
          </div>

          {/* Resumen del Pedido */}
          <div className="cart-summary-wrapper">
            <CartSummary
              subtotal={subtotal}
              shipping={shipping}
              total={finalTotal}
              isCreating={isCreating}
              onCreateQuote={handleCreateQuote}
              onContinueShopping={handleGoToProducts}
              itemCount={cart.length}
            />
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </Layout>
  );
}
