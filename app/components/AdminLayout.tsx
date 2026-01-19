'use client';

import { ReactNode, useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser, useLogout } from '../hooks/useAuth';
import { useAdminNotifications } from '../hooks/useAdminNotifications';
import Toast from './Toast';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import RecommendIcon from '@mui/icons-material/Recommend';
import '../styles/admin.css';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const router = useRouter();
  const { notification, clearNotification } = useAdminNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Cargar estado del sidebar desde localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('adminSidebarOpen');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Guardar estado del sidebar en localStorage cuando cambie
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminSidebarOpen', String(sidebarOpen));
    }
  }, [sidebarOpen]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const menuItems = [
    { icon: <DashboardIcon />, label: 'Dashboard', path: '/admin' },
    { icon: <PeopleIcon />, label: 'Usuarios', path: '/admin/users' },
    { icon: <InventoryIcon />, label: 'Productos', path: '/admin/products' },
    {
      icon: <RequestQuoteIcon />,
      label: 'Cotizaciones',
      path: '/admin/quotes',
    },
    { icon: <ListAltIcon />, label: 'Listas', path: '/admin/listas' },
    {
      icon: <LocalShippingIcon />,
      label: 'Proveedores',
      path: '/admin/proveedores',
    },
    { icon: <PointOfSaleIcon />, label: 'Ventas', path: '/admin/ventas' },
    {
      icon: <RecommendIcon />,
      label: 'Recomendaciones',
      path: '/admin/recomendaciones',
    },
  ];

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="admin-layout">
      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">LL</div>
          <span className="brand-text">Lady Laura</span>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className="nav-item"
              title={item.label}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Header */}
      <header
        className={`admin-header-bar ${sidebarOpen ? '' : 'sidebar-closed'}`}
      >
        <button
          className="sidebar-toggle-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <MenuIcon />
        </button>

        <div className="admin-header-spacer"></div>

        <div className="admin-header-user" ref={userMenuRef}>
          <button
            className="user-menu-btn"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <AccountCircleIcon />
            <span>{user?.name}</span>
            <KeyboardArrowDownIcon
              className={`dropdown-arrow ${userMenuOpen ? 'open' : ''}`}
            />
          </button>

          {userMenuOpen && (
            <div className="user-dropdown">
              <div className="user-dropdown-header">
                <p className="user-dropdown-name">{user?.name}</p>
                <p className="user-dropdown-email">{user?.email}</p>
              </div>
              <div className="user-dropdown-divider"></div>
              <button className="user-dropdown-item" onClick={handleLogout}>
                <LogoutIcon fontSize="small" />
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className={`admin-main ${sidebarOpen ? '' : 'sidebar-closed'}`}>
        {children}
      </main>

      {/* Toast de notificación de nueva cotización */}
      {notification && (
        <Toast
          message={`Nueva cotización de ${
            notification.userName
          } - $${notification.total.toFixed(2)} (${
            notification.itemsCount
          } productos)`}
          type="info"
          onClose={clearNotification}
          duration={5000}
        />
      )}
    </div>
  );
}
