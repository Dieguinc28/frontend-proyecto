'use client';

import { useEffect, useState } from 'react'; // <--- Importamos hooks necesarios
import { getImageUrl } from '../lib/imageUtils';
import { Product } from '../types';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'; // Icono para las alternativas

interface AddToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  product: Product | null;
}

export default function AddToCartModal({
  isOpen,
  onClose,
  onConfirm,
  product,
}: AddToCartModalProps) {
  // Estado para guardar las recomendaciones filtradas (SIN cuadernos)
  const [alternativas, setAlternativas] = useState<Product[]>([]);

  // Efecto para cargar recomendaciones CADA VEZ que se abre el modal con un producto
  useEffect(() => {
    if (isOpen && product) {
      const id = (product as any).id || (product as any).idproducto;
      // REEMPLAZA CON TU PUERTO CORRECTO (Usualmente 4000 para el backend)
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

      // LLAMADA A LA RUTA BLINDADA QUE HICIMOS
      fetch(`${API_URL}/recomendaciones/producto/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setAlternativas(data);
          } else {
            setAlternativas([]);
          }
        })
        .catch((err) => {
          console.error('Error cargando recomendaciones:', err);
          setAlternativas([]);
        });
    } else {
      // Limpiamos si se cierra
      setAlternativas([]);
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const price =
    typeof product.price === 'number'
      ? product.price
      : parseFloat(product.price as any);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content add-to-cart-modal"
        onClick={(e) => e.stopPropagation()}
        // Ajustamos un poco el ancho por si salen recomendaciones
        style={{ maxWidth: alternativas.length > 0 ? '600px' : '400px' }}
      >
        <button className="modal-close" onClick={onClose}>
          <CloseIcon />
        </button>

        <div className="modal-icon success">
          <ShoppingCartIcon />
        </div>

        <h2>¿Agregar al Carrito?</h2>

        <div className="product-preview">
          <img src={getImageUrl(product.image)} alt={product.name} />
          <div className="product-info">
            <h3>{product.name}</h3>
            <p className="product-description">{product.description}</p>
            <p className="product-price">${price.toFixed(2)}</p>
          </div>
        </div>

        {/* --- SECCIÓN DE RECOMENDACIONES (SOLO SI HAY DATOS) --- */}
        {alternativas.length > 0 && (
          <div
            style={{
              marginTop: '20px',
              borderTop: '1px solid #eee',
              paddingTop: '15px',
            }}
          >
            <h4
              style={{
                fontSize: '0.9rem',
                color: '#666',
                marginBottom: '10px',
              }}
            >
              También te podría interesar (Otras marcas):
            </h4>
            <div
              style={{
                display: 'flex',
                gap: '10px',
                overflowX: 'auto',
                paddingBottom: '5px',
              }}
            >
              {alternativas.map((alt) => (
                <div
                  key={alt._id || alt.idproducto}
                  style={{
                    minWidth: '100px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '8px',
                    textAlign: 'center',
                    background: '#f9fafb',
                  }}
                >
                  <img
                    src={getImageUrl(alt.image)}
                    alt={alt.name}
                    style={{
                      width: '100%',
                      height: '60px',
                      objectFit: 'contain',
                      marginBottom: '5px',
                    }}
                  />
                  <p
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      margin: 0,
                      height: '30px',
                      overflow: 'hidden',
                    }}
                  >
                    {alt.name}
                  </p>
                  <p
                    style={{
                      fontSize: '0.8rem',
                      color: '#2563eb',
                      margin: '4px 0',
                    }}
                  >
                    $
                    {typeof alt.price === 'number'
                      ? alt.price
                      : (alt as any).precioreferencial}
                  </p>
                  {/* Aquí podrías poner lógica para agregar ESTE producto alternativo */}
                </div>
              ))}
            </div>
          </div>
        )}
        {/* ----------------------------------------------------- */}

        <div className="modal-actions" style={{ marginTop: '20px' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={onConfirm}>
            <CheckCircleIcon fontSize="small" />
            Confirmar y Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
