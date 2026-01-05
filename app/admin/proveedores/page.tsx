'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '../../hooks/useAuth';
import {
  useProveedores,
  useCreateProveedor,
  useUpdateProveedor,
  useDeleteProveedor,
  type Proveedor,
} from '../../hooks/useProveedores';
import AdminLayout from '../../components/AdminLayout';
import Toast from '../../components/Toast';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

export default function AdminProveedores() {
  const { data: user } = useCurrentUser();
  const router = useRouter();
  const { data: proveedores, isLoading } = useProveedores();
  const createProveedor = useCreateProveedor();
  const updateProveedor = useUpdateProveedor();
  const deleteProveedor = useDeleteProveedor();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedProveedor, setSelectedProveedor] = useState<Proveedor | null>(
    null
  );
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
  });
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  const handleCreate = () => {
    setModalMode('create');
    setSelectedProveedor(null);
    setFormData({ nombre: '', direccion: '', telefono: '', email: '' });
    setModalOpen(true);
  };

  const handleEdit = (proveedor: Proveedor) => {
    setModalMode('edit');
    setSelectedProveedor(proveedor);
    setFormData({
      nombre: proveedor.nombre,
      direccion: proveedor.direccion || '',
      telefono: proveedor.telefono || '',
      email: proveedor.email || '',
    });
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'create') {
      createProveedor.mutate(formData, {
        onSuccess: () => {
          setToast({ message: '¡Proveedor creado!', type: 'success' });
          setModalOpen(false);
        },
        onError: (error: any) => {
          setToast({ message: error.message, type: 'error' });
        },
      });
    } else if (selectedProveedor) {
      updateProveedor.mutate(
        { id: selectedProveedor.idproveedor, data: formData },
        {
          onSuccess: () => {
            setToast({ message: '¡Proveedor actualizado!', type: 'success' });
            setModalOpen(false);
          },
          onError: (error: any) => {
            setToast({ message: error.message, type: 'error' });
          },
        }
      );
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Eliminar este proveedor?')) {
      deleteProveedor.mutate(id, {
        onSuccess: () => {
          setToast({ message: '¡Proveedor eliminado!', type: 'success' });
        },
        onError: (error: any) => {
          setToast({ message: error.message, type: 'error' });
        },
      });
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <AdminLayout>
      <div className="admin-header">
        <h1>Gestión de Proveedores</h1>
        <p>Administra los proveedores del sistema</p>
      </div>

      <div className="admin-table-container">
        <div className="table-header">
          <h2>Todos los Proveedores</h2>
          <button className="btn-primary" onClick={handleCreate}>
            <AddIcon fontSize="small" />
            Nuevo
          </button>
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
                  <th>Dirección</th>
                  <th>Teléfono</th>
                  <th>Email</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {!proveedores || proveedores.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{ textAlign: 'center', padding: '2rem' }}
                    >
                      No hay proveedores
                    </td>
                  </tr>
                ) : (
                  proveedores.map((proveedor) => (
                    <tr key={proveedor.idproveedor}>
                      <td data-label="ID">#{proveedor.idproveedor}</td>
                      <td data-label="Nombre">{proveedor.nombre}</td>
                      <td data-label="Dirección">
                        {proveedor.direccion || 'N/A'}
                      </td>
                      <td data-label="Teléfono">
                        {proveedor.telefono || 'N/A'}
                      </td>
                      <td data-label="Email">{proveedor.email || 'N/A'}</td>
                      <td data-label="Acciones">
                        <div className="table-actions">
                          <button
                            className="btn-icon edit"
                            onClick={() => handleEdit(proveedor)}
                            title="Editar"
                          >
                            <EditIcon />
                          </button>
                          <button
                            className="btn-icon delete"
                            onClick={() => handleDelete(proveedor.idproveedor)}
                            title="Eliminar"
                          >
                            <DeleteIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>
              {modalMode === 'create' ? 'Nuevo Proveedor' : 'Editar Proveedor'}
            </h2>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Dirección</label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) =>
                    setFormData({ ...formData, direccion: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="text"
                  value={formData.telefono}
                  onChange={(e) =>
                    setFormData({ ...formData, telefono: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </AdminLayout>
  );
}
