'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import type { Product, CartItem } from '../types';
import { useCurrentUser } from '../hooks/useAuth';
import { apiClient } from '../lib/apiClient';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [localCart, setLocalCart] = useState<CartItem[]>([]);
  const [serverCart, setServerCart] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { data: user } = useCurrentUser();

  // Cargar carrito desde localStorage al inicio
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          setLocalCart(JSON.parse(savedCart));
        } catch (error) {
          setLocalCart([]);
        }
      }
    }
  }, []);

  // Cargar carrito del servidor cuando el usuario está logueado
  useEffect(() => {
    const loadServerCart = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            setIsLoading(false);
            return;
          }

          const { data } = await apiClient.get('/cart');
          setServerCart(data);

          // Sincronizar carrito local con servidor si hay items locales
          if (localCart.length > 0) {
            const items = localCart.map((item) => ({
              productId: item._id,
              name: item.name,
              description: item.description,
              price:
                typeof item.price === 'number'
                  ? item.price
                  : parseFloat(item.price || '0'),
              image: item.image,
              quantity: item.quantity,
            }));

            await apiClient.post('/cart/sync', { items });
            const { data: updatedCart } = await apiClient.get('/cart');
            setServerCart(updatedCart);

            // Limpiar localStorage después de sincronizar
            localStorage.removeItem('cart');
            setLocalCart([]);
          }
        } catch (error: any) {
          // Si hay error, usar carrito local
        } finally {
          setIsLoading(false);
        }
      } else {
        setServerCart(null);
      }
    };

    loadServerCart();
  }, [user]);

  // Guardar carrito local en localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && !user) {
      localStorage.setItem('cart', JSON.stringify(localCart));
    }
  }, [localCart, user]);

  // Determinar qué carrito usar
  const cart: CartItem[] =
    user && serverCart
      ? (serverCart.items || []).map((item: any) => ({
          _id: item.productId,
          name: item.name,
          description: item.description,
          price: item.price,
          image: item.image,
          stock: 0,
          category: '',
          createdAt: '',
          quantity: item.quantity,
        }))
      : localCart;

  const addToCart = async (product: Product, quantity: number = 1) => {
    if (user) {
      try {
        const { data } = await apiClient.post('/cart/add', {
          productId: product._id,
          quantity,
        });
        setServerCart(data);
      } catch (error: any) {
        alert(
          'Error al agregar al carrito: ' +
            (error.response?.data?.message || error.message)
        );
      }
    } else {
      setLocalCart((prev) => {
        const existing = prev.find((item) => item._id === product._id);
        if (existing) {
          return prev.map((item) =>
            item._id === product._id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prev, { ...product, quantity }];
      });
    }
  };

  const removeFromCart = async (productId: string) => {
    if (user) {
      try {
        const { data } = await apiClient.delete(`/cart/remove/${productId}`);
        setServerCart(data);
      } catch (error) {
        // Error handled
      }
    } else {
      setLocalCart((prev) => prev.filter((item) => item._id !== productId));
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (user) {
      try {
        const { data } = await apiClient.put('/cart/update', {
          productId,
          quantity,
        });
        setServerCart(data);
      } catch (error) {
        // Error handled
      }
    } else {
      if (quantity <= 0) {
        removeFromCart(productId);
        return;
      }
      setLocalCart((prev) =>
        prev.map((item) =>
          item._id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = async () => {
    if (user) {
      try {
        const { data } = await apiClient.delete('/cart/clear');
        setServerCart(data);
      } catch (error) {
        // Error handled
      }
    } else {
      setLocalCart([]);
    }
  };

  const total = cart.reduce((sum, item) => {
    const price =
      typeof item.price === 'number'
        ? item.price
        : parseFloat(item.price || '0');
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
