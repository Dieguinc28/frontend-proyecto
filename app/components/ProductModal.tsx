'use client';

import { useState, useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import ImageIcon from '@mui/icons-material/Image';
import type { Product } from '../types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: any, imageFile?: File) => void;
  product?: Product | null;
  mode: 'create' | 'edit';
}

export default function ProductModal({
  isOpen,
  onClose,
  onSave,
  product,
  mode,
}: ProductModalProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    marca: '',
    descripcion: '',
    precioreferencial: '',
    unidad: 'unidad',
    stock: '',
    categoria: '',
    image: '/placeholder.png',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (product && mode === 'edit') {
      setFormData({
        nombre: product.nombre || product.name || '',
        marca: product.marca || '',
        descripcion: product.descripcion || product.description || '',
        precioreferencial: String(
          product.precioreferencial || product.price || '',
        ),
        unidad: product.unidad || 'unidad',
        stock: String(product.stock || ''),
        categoria: product.categoria || product.category || '',
        image: product.image || '/placeholder.png',
      });
      setImagePreview(product.image || '');
    } else {
      setFormData({
        nombre: '',
        marca: '',
        descripcion: '',
        precioreferencial: '',
        unidad: 'unidad',
        stock: '',
        categoria: '',
        image: '/placeholder.png',
      });
      setImagePreview('');
    }
    setImageFile(null);
  }, [product, mode, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar campos requeridos
    if (!formData.nombre.trim()) {
      alert('El nombre del producto es requerido');
      return;
    }

    if (
      !formData.precioreferencial ||
      parseFloat(formData.precioreferencial) <= 0
    ) {
      alert('El precio referencial debe ser mayor a 0');
      return;
    }

    if (!formData.stock || parseInt(formData.stock) < 0) {
      alert('El stock debe ser un número válido (0 o mayor)');
      return;
    }

    onSave(
      {
        ...formData,
        nombre: formData.nombre.trim(),
        marca: formData.marca.trim(),
        descripcion: formData.descripcion.trim(),
        precioreferencial: parseFloat(formData.precioreferencial),
        stock: parseInt(formData.stock),
        categoria: formData.categoria.trim(),
        unidad: formData.unidad || 'unidad',
      },
      imageFile || undefined,
    );
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 2000 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ zIndex: 2001 }}
      >
        <div className="modal-header">
          <h3>{mode === 'create' ? 'Nuevo Producto' : 'Editar Producto'}</h3>
          <button className="modal-close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Nombre *</label>
              <input
                type="text"
                className="form-input"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Marca</label>
              <input
                type="text"
                className="form-input"
                value={formData.marca}
                onChange={(e) =>
                  setFormData({ ...formData, marca: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Descripción</label>
              <textarea
                className="form-textarea"
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
                rows={3}
                style={{
                  resize: 'vertical',
                  minHeight: '60px',
                }}
              />
            </div>

            <div className="form-group">
              <label>Precio Referencial *</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={formData.precioreferencial}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    precioreferencial: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Unidad de Venta *</label>
              <select
                className="form-select"
                value={formData.unidad}
                onChange={(e) =>
                  setFormData({ ...formData, unidad: e.target.value })
                }
                required
              >
                <option value="unidad">Unidad</option>
                <option value="paquete">Paquete</option>
                <option value="caja">Caja</option>
                <option value="docena">Docena</option>
                <option value="metro">Metro</option>
                <option value="litro">Litro</option>
              </select>
            </div>

            <div className="form-group">
              <label>Stock *</label>
              <input
                type="number"
                className="form-input"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Categoría</label>
              <select
                className="form-select"
                value={formData.categoria}
                onChange={(e) =>
                  setFormData({ ...formData, categoria: e.target.value })
                }
              >
                <option value="">Seleccionar...</option>
                <option value="Cuadernos">Cuadernos</option>
                <option value="Escritura">Escritura</option>
                <option value="Organización">Organización</option>
                <option value="Herramientas">Herramientas</option>
                <option value="Arte">Arte</option>
              </select>
            </div>

            <div className="form-group">
              <label>Imagen del Producto</label>
              <div className="image-upload-container">
                {imagePreview && (
                  <div className="image-preview">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        width: '100%',
                        maxHeight: '200px',
                        objectFit: 'contain',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                      }}
                    />
                  </div>
                )}
                <label className="file-input-label">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file-input-hidden"
                  />
                  <span className="file-input-text">
                    <ImageIcon style={{ marginRight: '0.5rem' }} />
                    {imageFile
                      ? imageFile.name
                      : 'Seleccionar imagen (opcional)'}
                  </span>
                </label>
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: '#6c757d',
                    marginTop: '0.5rem',
                  }}
                >
                  Formatos: JPG, PNG, GIF, WEBP (máx. 5MB)
                </p>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {mode === 'create' ? 'Crear' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
