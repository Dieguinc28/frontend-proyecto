'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '../../hooks/useAuth';
import { useListasEscolares } from '../../hooks/useListasEscolares';
import AdminLayout from '../../components/AdminLayout';

export default function AdminListas() {
  const { data: user } = useCurrentUser();
  const router = useRouter();
  const { data: listas, isLoading } = useListasEscolares();

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  if (!user || user.role !== 'admin') return null;

  return (
    <AdminLayout>
      <div className="admin-header">
        <h1>Gestión de Listas Escolares</h1>
        <p>Visualiza las listas escolares de los usuarios</p>
      </div>

      <div className="admin-table-container">
        <div className="table-header">
          <h2>Todas las Listas</h2>
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
                  <th>Nombre</th>
                  <th>Usuario</th>
                  <th>Estado</th>
                  <th>Tipo</th>
                  <th>Items</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {!listas || listas.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{ textAlign: 'center', padding: '2rem' }}
                    >
                      No hay listas escolares
                    </td>
                  </tr>
                ) : (
                  listas.map((lista) => (
                    <tr key={lista.idlista}>
                      <td data-label="ID">#{lista.idlista}</td>
                      <td data-label="Nombre">{lista.nombrelista}</td>
                      <td data-label="Usuario">
                        {lista.Usuario?.nombre || `Usuario #${lista.idusuario}`}
                      </td>
                      <td data-label="Estado">
                        <span className="status-badge pendiente">
                          {lista.Estado?.nombreestado || 'N/A'}
                        </span>
                      </td>
                      <td data-label="Tipo">{lista.tipo || 'N/A'}</td>
                      <td data-label="Items">{lista.Itemlista?.length || 0}</td>
                      <td data-label="Fecha">
                        {lista.fechacreacion
                          ? new Date(lista.fechacreacion).toLocaleDateString()
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
