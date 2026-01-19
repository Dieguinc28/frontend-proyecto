'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '../../hooks/useAuth';
import { useVentas } from '../../hooks/useVentas';
import AdminLayout from '../../components/AdminLayout';

export default function AdminVentas() {
  const { data: user } = useCurrentUser();
  const router = useRouter();
  const { data: ventas, isLoading } = useVentas();

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  if (!user || user.role !== 'admin') return null;

  return (
    <AdminLayout>
      <div className="admin-header">
        <h1>Gestión de Ventas</h1>
        <p>Visualiza las ventas realizadas</p>
      </div>

      <div className="admin-table-container">
        <div className="table-header">
          <h2>Todas las Ventas</h2>
        </div>
        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            Cargando...
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Detalle Cotización</th>
                  <th>Descripción</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {!ventas || ventas.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      style={{ textAlign: 'center', padding: '2rem' }}
                    >
                      No hay ventas registradas
                    </td>
                  </tr>
                ) : (
                  ventas.map((venta) => (
                    <tr key={venta.idventa}>
                      <td data-label="ID">#{venta.idventa}</td>
                      <td data-label="Detalle">#{venta.iddetalle}</td>
                      <td data-label="Descripción">
                        {venta.descripcion || 'N/A'}
                      </td>
                      <td data-label="Fecha">
                        {venta.fechacreacion
                          ? new Date(venta.fechacreacion).toLocaleDateString()
                          : 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
