'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../components/Layout';
import { useCurrentUser } from '../hooks/useAuth';
import {
  useListasByUsuario,
  useCreateListaEscolar,
  useDeleteListaEscolar,
} from '../hooks/useListasEscolares';
import { useEstados } from '../hooks/useEstados';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import '../styles/pages.css';

export default function MisListasPage() {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { data: listas, isLoading: listasLoading } = useListasByUsuario(
    user?.id || 0,
  );
  const { data: estados } = useEstados();
  const createLista = useCreateListaEscolar();
  const deleteLista = useDeleteListaEscolar();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedLista, setSelectedLista] = useState<any>(null);
  const [formData, setFormData] = useState({
    nombrelista: '',
    tipo: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/');
    }
  }, [user, userLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      console.error('Usuario no autenticado');
      alert('Debes iniciar sesión para crear una lista');
      return;
    }

    const dataToSend = {
      ...formData,
      idusuario: user.id,
      idestado: 1, // Estado inicial
    };

    try {
      await createLista.mutateAsync(dataToSend);
      setShowModal(false);
      setFormData({ nombrelista: '', tipo: '' });
    } catch (error: any) {
      console.error('Error creando lista:', error);
      const errorMsg =
        error?.response?.data?.error || error?.message || 'Error desconocido';
      alert(`Error al crear la lista: ${errorMsg}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar esta lista?')) {
      await deleteLista.mutateAsync(id);
    }
  };

  const getEstadoNombre = (idestado: number) => {
    return estados?.find((e) => e.idestado === idestado)?.nombreestado || 'N/A';
  };

  if (!mounted || userLoading || listasLoading) {
    return (
      <Layout>
        <div className="loading-container">Cargando...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container" style={{ padding: '2rem' }}>
        <div className="page-header">
          <h1>Mis Listas Escolares</h1>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <AddIcon /> Nueva Lista
          </button>
        </div>

        {listas && listas.length > 0 ? (
          <div className="listas-grid">
            {listas.map((lista) => (
              <div key={lista.idlista} className="lista-card">
                <div className="lista-card-header">
                  <h3>{lista.nombrelista}</h3>
                  <span
                    className={`status-badge ${lista.Estado?.nombreestado?.toLowerCase()}`}
                  >
                    {getEstadoNombre(lista.idestado)}
                  </span>
                </div>
                <div className="lista-card-body">
                  <p>
                    <strong>Tipo:</strong> {lista.tipo || 'General'}
                  </p>
                  <p>
                    <strong>Items:</strong> {lista.Itemlista?.length || 0}
                  </p>
                  <p>
                    <strong>Creada:</strong>{' '}
                    {new Date(lista.fechacreacion || '').toLocaleDateString()}
                  </p>
                </div>
                <div className="lista-card-actions">
                  <button
                    className="btn-icon view"
                    onClick={() => setSelectedLista(lista)}
                    title="Ver detalles"
                  >
                    <VisibilityIcon />
                  </button>
                  <button
                    className="btn-icon delete"
                    onClick={() => handleDelete(lista.idlista)}
                    title="Eliminar"
                  >
                    <DeleteIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No tienes listas escolares aún</p>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              Crear mi primera lista
            </button>
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Nueva Lista Escolar</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Nombre de la Lista *</label>
                  <input
                    type="text"
                    value={formData.nombrelista}
                    onChange={(e) =>
                      setFormData({ ...formData, nombrelista: e.target.value })
                    }
                    placeholder="Ej: Lista 1er Grado"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Tipo</label>
                  <input
                    type="text"
                    value={formData.tipo}
                    onChange={(e) =>
                      setFormData({ ...formData, tipo: e.target.value })
                    }
                    placeholder="Ej: Primaria, Secundaria"
                  />
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    Crear Lista
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {selectedLista && (
          <div className="modal-overlay" onClick={() => setSelectedLista(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{selectedLista.nombrelista}</h2>
              <div style={{ marginBottom: '1rem' }}>
                <p>
                  <strong>Estado:</strong>{' '}
                  {getEstadoNombre(selectedLista.idestado)}
                </p>
                <p>
                  <strong>Tipo:</strong> {selectedLista.tipo || 'General'}
                </p>
                <p>
                  <strong>Creada:</strong>{' '}
                  {new Date(selectedLista.fechacreacion || '').toLocaleString()}
                </p>
              </div>
              <h3>Items ({selectedLista.Itemlista?.length || 0})</h3>
              {selectedLista.Itemlista && selectedLista.Itemlista.length > 0 ? (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Descripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedLista.Itemlista.map((item: any) => (
                      <tr key={item.iditem}>
                        <td>{item.Producto?.nombre || 'N/A'}</td>
                        <td>{item.cantidad}</td>
                        <td>{item.descripcion || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ textAlign: 'center', padding: '1rem' }}>
                  No hay items en esta lista
                </p>
              )}
              <div className="modal-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setSelectedLista(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .listas-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .lista-card {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s;
        }

        .lista-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        .lista-card-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 1rem;
        }

        .lista-card-header h3 {
          margin: 0;
          font-size: 1.25rem;
          color: #333;
        }

        .lista-card-body {
          margin-bottom: 1rem;
        }

        .lista-card-body p {
          margin: 0.5rem 0;
          color: #666;
        }

        .lista-card-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 8px;
          margin-top: 2rem;
        }

        .empty-state p {
          font-size: 1.1rem;
          color: #666;
          margin-bottom: 1.5rem;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .listas-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Layout>
  );
}
