'use client';

import { useCurrentUser, useLogout } from '../hooks/useAuth';
import { useCart } from '../context/CartContext';
import { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import SimpleHeader from './SimpleHeader';
import Footer from './Footer';
import FloatingQuoteButton from './FloatingQuoteButton';
import '../styles/footer.css';

export default function Layout({ children }: { children: ReactNode }) {
  const { data: user, isLoading, error } = useCurrentUser();
  const logout = useLogout();
  const { cart } = useCart();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navItems = user
    ? [
        { label: 'Productos', href: '/' },
        { label: `Carrito (${cart.length})`, href: '/cart' },
        { label: 'Cotizaciones', href: '/quotes' },
        ...(user.role === 'admin' ? [{ label: 'Admin', href: '/admin' }] : []),
      ]
    : [{ label: 'Productos', href: '/' }];

  // Páginas que no necesitan padding superior
  const noPaddingPages = ['/', '/products'];
  const needsPadding = !noPaddingPages.includes(pathname);

  // No mostrar botón flotante en páginas de carrito/cotización
  const hideFloatingButton = ['/cart', '/quotes'].includes(pathname);

  return (
    <div className="layout">
      <SimpleHeader
        items={navItems}
        activeHref={pathname}
        user={user}
        onLogout={handleLogout}
      />
      <main
        style={{
          paddingTop: needsPadding ? '5.5rem' : '0',
          minHeight: 'calc(100vh - 5.5rem)',
        }}
      >
        {children}
      </main>
      <Footer />
      {!hideFloatingButton && <FloatingQuoteButton />}
    </div>
  );
}
