'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '../../hooks/useAuth';
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useExportProducts,
} from '../../hooks/useProducts';
import AdminLayout from '../../components/AdminLayout';
import ProductModal from '../../components/ProductModal';
import ConfirmModal from '../../components/ConfirmModal';
import Toast from '../../components/Toast';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import type { Product } from '../../types';

export default function AdminProducts() {
  const { data: user } = useCurrentUser();
  const router = useRouter();
  const { data: products, isLoading } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const exportProducts = useExportProducts();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
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
    setSelectedProduct(null);
    setModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setModalMode('edit');
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleSave = (productData: any, imageFile?: File) => {
    if (modalMode === 'create') {
      createProduct.mutate(
        { productData, imageFile },
        {
          onSuccess: () => {
            setToast({
              message: '¡Producto creado exitosamente!',
              type: 'success',
            });
            setModalOpen(false);
          },
          onError: (error: any) => {
            setToast({
              message:
                'Error al crear producto: ' +
                (error.response?.data?.message || error.message),
              type: 'error',
            });
          },
        }
      );
    } else if (selectedProduct) {
      const productId = String(
        selectedProduct.idproducto || selectedProduct._id
      );
      updateProduct.mutate(
        { id: productId, productData, imageFile },
        {
          onSuccess: () => {
            setToast({
              message: '¡Producto actualizado exitosamente!',
              type: 'success',
            });
            setModalOpen(false);
          },
          onError: (error: any) => {
            setToast({
              message:
                'Error al actualizar producto: ' +
                (error.response?.data?.message || error.message),
              type: 'error',
            });
          },
        }
      );
    }
  };

  const handleDeleteClick = (productId: string | number) => {
    setProductToDelete(String(productId));
    setConfirmModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (productToDelete) {
      deleteProduct.mutate(productToDelete, {
        onSuccess: () => {
          setToast({
            message: '¡Producto eliminado exitosamente!',
            type: 'success',
          });
          setConfirmModalOpen(false);
          setProductToDelete(null);
        },
        onError: (error: any) => {
          setToast({
            message:
              'Error al eliminar producto: ' +
              (error.response?.data?.message || error.message),
            type: 'error',
          });
        },
      });
    }
  };

  const handleExportCSV = () => {
    exportProducts.mutate(undefined, {
      onSuccess: () => {
        setToast({
          message: '¡Lista de productos descargada!',
          type: 'success',
        });
      },
      onError: (error: any) => {
        setToast({
          message: error.message || 'Error al descargar la lista',
          type: 'error',
        });
      },
    });
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <AdminLayout>
      <div className="admin-header">
        <h1>Gestión de Productos</h1>
        <p>Administra el catálogo de productos</p>
      </div>

      <div className="admin-table-container">
        <div className="table-header">
          <h2>Todos los Productos</h2>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              className="btn-secondary"
              onClick={handleExportCSV}
              disabled={exportProducts.isPending}
            >
              <DownloadIcon fontSize="small" />
              {exportProducts.isPending ? 'Descargando...' : 'Exportar CSV'}
            </button>
            <button className="btn-primary" onClick={handleCreate}>
              <AddIcon fontSize="small" />
              Nuevo
            </button>
          </div>
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
                  <th>Marca</th>
                  <th>Descripción</th>
                  <th>Precio Ref.</th>
                  <th>Unidad</th>
                  <th>Stock</th>
                  <th>Categoría</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {!products || products.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      style={{ textAlign: 'center', padding: '2rem' }}
                    >
                      No hay productos
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.idproducto || product._id}>
                      <td data-label="ID">
                        #{product.idproducto || product._id}
                      </td>
                      <td data-label="Nombre">
                        {product.nombre || product.name}
                      </td>
                      <td data-label="Marca">{product.marca || 'N/A'}</td>
                      <td data-label="Descripción">
                        {product.descripcion || product.description || 'N/A'}
                      </td>
                      <td data-label="Precio Ref.">
                        $
                        {parseFloat(
                          String(
                            product.precioreferencial || product.price || 0
                          )
                        ).toFixed(2)}
                      </td>
                      <td data-label="Unidad">{product.unidad || 'unidad'}</td>
                      <td data-label="Stock">{product.stock}</td>
                      <td data-label="Categoría">
                        {product.categoria || product.category || 'N/A'}
                      </td>
                      <td data-label="Acciones">
                        <div className="table-actions">
                          <button
                            className="btn-icon edit"
                            onClick={() => handleEdit(product)}
                            title="Editar"
                          >
                            <EditIcon />
                          </button>
                          <button
                            className="btn-icon delete"
                            onClick={() =>
                              handleDeleteClick(
                                product.idproducto || product._id
                              )
                            }
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

      <ProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        product={selectedProduct}
        mode={modalMode}
      />

      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Producto"
        message="¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

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
