'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '../hooks/useAuth';
import { useAllQuotes } from '../hooks/useQuotes';
import { useProducts } from '../hooks/useProducts';
import { useListasEscolares } from '../hooks/useListasEscolares';
import { useProveedores } from '../hooks/useProveedores';
import { useVentas } from '../hooks/useVentas';
import AdminLayout from '../components/AdminLayout';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

export default function AdminDashboard() {
  const { data: user } = useCurrentUser();
  const router = useRouter();
  const { data: quotes } = useAllQuotes();
  const { data: products } = useProducts();
  const { data: proveedores } = useProveedores();
  const { data: listas } = useListasEscolares();
  const { data: ventas } = useVentas();

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  const stats = [
    {
      icon: <InventoryIcon />,
      label: 'Productos',
      value: products?.length || 0,
      color: 'green',
    },
    {
      icon: <RequestQuoteIcon />,
      label: 'Cotizaciones',
      value: quotes?.length || 0,
      color: 'purple',
    },
    {
      icon: <ListAltIcon />,
      label: 'Listas',
      value: listas?.length || 0,
      color: 'blue',
    },
    {
      icon: <LocalShippingIcon />,
      label: 'Proveedores',
      value: proveedores?.length || 0,
      color: 'orange',
    },
    {
      icon: <TrendingUpIcon />,
      label: 'Ventas',
      value: ventas?.length || 0,
      color: 'red',
    },
    {
      icon: <PeopleIcon />,
      label: 'Pendientes',
      value: quotes?.filter((q) => q.status === 'pendiente').length || 0,
      color: 'yellow',
    },
  ];

  const recentQuotes = quotes?.slice(0, 5) || [];

  return (
    <AdminLayout>
      <div className="admin-header">
        <h1>Dashboard</h1>
        <p>Bienvenido al panel de administración</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className={`stat-icon ${stat.color}`}>{stat.icon}</div>
            <div className="stat-info">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-table-container">
        <div className="table-header">
          <h2>Cotizaciones Recientes</h2>
          <button
            className="btn-primary"
            onClick={() => router.push('/admin/quotes')}
          >
            Ver Todas
          </button>
        </div>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {recentQuotes.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{ textAlign: 'center', padding: '2rem' }}
                  >
                    No hay cotizaciones
                  </td>
                </tr>
              ) : (
                recentQuotes.map((quote) => (
                  <tr key={quote.id}>
                    <td data-label="ID">#{quote.id}</td>
                    <td data-label="Cliente">{quote.user?.name || 'N/A'}</td>
                    <td data-label="Total">
                      ${parseFloat(String(quote.total)).toFixed(2)}
                    </td>
                    <td data-label="Estado">
                      <span className={`status-badge ${quote.status}`}>
                        {quote.status}
                      </span>
                    </td>
                    <td data-label="Fecha">
                      {new Date(quote.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
