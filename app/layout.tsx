import { QueryProvider } from './providers/QueryProvider';
import { CartProvider } from './context/CartContext';
import { AuthModalProvider } from './context/AuthModalContext';
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Papelería Lady Laura',
  description: 'Sistema de cotización para papelería',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body className={inter.className}>
        <QueryProvider>
          <CartProvider>
            <AuthModalProvider>{children}</AuthModalProvider>
          </CartProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
