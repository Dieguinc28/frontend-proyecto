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
import AuthModal from './AuthModal';
import CartSidebar from './CartSidebar';
import { useCart } from '../context/CartContext';
import '../styles/header.css';
import '../styles/modal.css';

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
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const { cart } = useCart();
  const accountMenuRef = useRef<HTMLDivElement>(null);

  const openModal = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
    setAccountMenuOpen(false);
  };

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
              src="/logo.svg"
              alt="Papelería Lady Laura"
              width={40}
              height={40}
            />
            <span className="logo-text">PAPELERÍA LADY LAURA</span>
          </Link>

          <div className="header-center desktop-nav">
            <Link href="/" className="nav-link">
              Inicio
            </Link>
            <Link href="/products" className="nav-link">
              <MenuBookIcon fontSize="small" />
              Productos
            </Link>
            <Link href="/lists" className="nav-link-highlight">
              Cotizador
            </Link>
          </div>

          <div className="header-actions desktop-nav">
            <button
              className="action-button cart-button"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCartIcon fontSize="small" />
              Carrito
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
                        href="/mis-listas"
                        className="dropdown-item"
                        onClick={() => setAccountMenuOpen(false)}
                      >
                        <MenuBookIcon fontSize="small" />
                        Mis Listas
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
                      <button
                        className="dropdown-item"
                        onClick={() => openModal('login')}
                      >
                        <LoginIcon fontSize="small" />
                        Iniciar Sesión
                      </button>
                      <button
                        className="dropdown-item"
                        onClick={() => openModal('register')}
                      >
                        <PersonAddIcon fontSize="small" />
                        Registrarse
                      </button>
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
            <MenuBookIcon fontSize="small" />
            Productos
          </Link>
          <Link
            href="/lists"
            className="mobile-nav-link-highlight"
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
                href="/mis-listas"
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <MenuBookIcon fontSize="small" />
                Mis Listas
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
              <button
                className="mobile-nav-link"
                onClick={() => {
                  openModal('login');
                  setMobileMenuOpen(false);
                }}
              >
                <LoginIcon fontSize="small" />
                Iniciar Sesión
              </button>
              <button
                className="mobile-nav-link"
                onClick={() => {
                  openModal('register');
                  setMobileMenuOpen(false);
                }}
              >
                <PersonAddIcon fontSize="small" />
                Registrarse
              </button>
            </>
          )}
        </div>
      )}

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />

      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}
