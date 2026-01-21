'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SettingsIcon from '@mui/icons-material/Settings';
import CartSidebar from './CartSidebar';
import { useCart } from '../context/CartContext';
import '../styles/header.css';

interface HeaderProps {
  items: Array<{ label: string; href: string }>;
  activeHref?: string;
  user?: { name: string; role: string } | null;
  onLogout?: () => void;
}

export default function SimpleHeader({
  items,
  activeHref,
  user,
  onLogout,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const { cart } = useCart();
  const accountMenuRef = useRef<HTMLDivElement>(null);

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="simple-header">
      <div className="header-top">
        <div className="header-container">
          <Link href="/" className="header-logo">
            <Image
              src="/logo-text.svg"
              alt="Papelería Lady Laura"
              width={240}
              height={50}
              priority
            />
          </Link>

          <div className="header-center desktop-nav">
            <Link href="/" className="nav-link">
              Inicio
            </Link>
            <Link href="/products" className="nav-link">
              Productos
            </Link>
            <Link href="/lists" className="nav-link cotizador-btn">
              Cotizador
            </Link>
          </div>

          <div className="header-actions desktop-nav">
            <button
              className="action-button cart-button cart-icon-only"
              onClick={() => setCartOpen(true)}
              aria-label="Carrito de compras"
            >
              <ShoppingCartIcon fontSize="medium" />
              {cartItemsCount > 0 && (
                <span className="cart-badge">{cartItemsCount}</span>
              )}
            </button>
            <div className="account-menu-wrapper" ref={accountMenuRef}>
              <button
                className="action-button account-button"
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
              >
                <AccountCircleIcon fontSize="small" />
                {user ? user.name : 'Mi cuenta'}
                <KeyboardArrowDownIcon
                  fontSize="small"
                  className={`dropdown-arrow ${accountMenuOpen ? 'open' : ''}`}
                />
              </button>
              {accountMenuOpen && (
                <div className="account-dropdown">
                  {user ? (
                    <>
                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          className="dropdown-item"
                          onClick={() => setAccountMenuOpen(false)}
                        >
                          <AdminPanelSettingsIcon fontSize="small" />
                          Administrador
                        </Link>
                      )}
                      <Link
                        href="/quotes"
                        className="dropdown-item"
                        onClick={() => setAccountMenuOpen(false)}
                      >
                        <MenuBookIcon fontSize="small" />
                        Mis Cotizaciones
                      </Link>
                      <Link
                        href="/settings"
                        className="dropdown-item"
                        onClick={() => setAccountMenuOpen(false)}
                      >
                        <SettingsIcon fontSize="small" />
                        Configuración
                      </Link>
                      <div className="dropdown-divider"></div>
                      <button
                        className="dropdown-item logout-item"
                        onClick={() => {
                          onLogout?.();
                          setAccountMenuOpen(false);
                        }}
                      >
                        <LogoutIcon fontSize="small" />
                        Cerrar Sesión
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="dropdown-item"
                        onClick={() => setAccountMenuOpen(false)}
                      >
                        <LoginIcon fontSize="small" />
                        Iniciar Sesión
                      </Link>
                      <Link
                        href="/register"
                        className="dropdown-item"
                        onClick={() => setAccountMenuOpen(false)}
                      >
                        <PersonAddIcon fontSize="small" />
                        Registrarse
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-nav">
          <Link
            href="/"
            className="mobile-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Inicio
          </Link>
          <Link
            href="/products"
            className="mobile-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Productos
          </Link>
          <Link
            href="/lists"
            className="mobile-nav-link cotizador-btn-mobile"
            onClick={() => setMobileMenuOpen(false)}
          >
            Cotizador
          </Link>
          <button
            className="mobile-nav-link cart-mobile-btn"
            onClick={() => {
              setCartOpen(true);
              setMobileMenuOpen(false);
            }}
          >
            <ShoppingCartIcon fontSize="small" />
            Carrito
            {cartItemsCount > 0 && (
              <span className="cart-badge-mobile">{cartItemsCount}</span>
            )}
          </button>

          {user ? (
            <>
              <div className="mobile-nav-section">
                <span className="mobile-nav-label">
                  <AccountCircleIcon fontSize="small" />
                  {user.name}
                </span>
              </div>
              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  className="mobile-nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <AdminPanelSettingsIcon fontSize="small" />
                  Administrador
                </Link>
              )}
              <Link
                href="/quotes"
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <MenuBookIcon fontSize="small" />
                Mis Cotizaciones
              </Link>
              <Link
                href="/settings"
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <SettingsIcon fontSize="small" />
                Configuración
              </Link>
              <button
                className="mobile-nav-link logout-mobile"
                onClick={() => {
                  onLogout?.();
                  setMobileMenuOpen(false);
                }}
              >
                <LogoutIcon fontSize="small" />
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LoginIcon fontSize="small" />
                Iniciar Sesión
              </Link>
              <Link
                href="/register"
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <PersonAddIcon fontSize="small" />
                Registrarse
              </Link>
            </>
          )}
        </div>
      )}

      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}
