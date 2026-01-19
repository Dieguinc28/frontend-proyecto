'use client';

import { useRecomendaciones } from '../hooks/useRecomendaciones';
import { useState, useEffect } from 'react';

interface RecomendacionesPrecioProps {
  idproducto?: number;
  showAll?: boolean;
}

export default function RecomendacionesPrecio({
  idproducto,
  showAll = false,
}: RecomendacionesPrecioProps) {
  const {
    recomendaciones,
    loading,
    error,
    connected,
    fetchRecomendaciones,
    marcarComoComprado,
    sincronizar,
  } = useRecomendaciones();
  const [procesando, setProcesando] = useState<number | null>(null);

  // Fetch recomendaciones filtered by idproducto if provided
  useEffect(() => {
    if (idproducto) {
      fetchRecomendaciones({ idproducto });
    } else {
      fetchRecomendaciones();
    }
  }, [idproducto, fetchRecomendaciones]);

  const handleComprar = async (idrecomendacion: number) => {
    if (!confirm('¿Marcar esta recomendación como comprada?')) return;

    try {
      setProcesando(idrecomendacion);
      // Get user ID from localStorage
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const idusuario = user?.id || user?.idusuario || 1;
      await marcarComoComprado(idrecomendacion, idusuario);
    } catch (err) {
      alert('Error al marcar como comprado');
    } finally {
      setProcesando(null);
    }
  };

  const handleSincronizar = async () => {
    try {
      await sincronizar();
      alert('Sincronización completada');
    } catch (err) {
      alert('Error al sincronizar');
    }
  };

  if (loading) {
    return <div className="loading">Cargando recomendaciones...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="recomendaciones-container">
      <div className="recomendaciones-header">
        <h3>Recomendaciones de Precios</h3>
        <div className="status-indicators">
          <span
            className={`ws-status ${connected ? 'connected' : 'disconnected'}`}
          >
            {connected ? '● Conectado' : '○ Desconectado'}
          </span>
          <button onClick={handleSincronizar} className="btn-sync">
            Sincronizar
          </button>
        </div>
      </div>

      {recomendaciones.length === 0 ? (
        <p className="no-data">No hay recomendaciones disponibles</p>
      ) : (
        <div className="recomendaciones-list">
          {recomendaciones.map((rec) => (
            <div key={rec.idrecomendacion} className="recomendacion-card">
              <div className="recomendacion-info">
                {showAll && rec.Producto && (
                  <div className="producto-info">
                    <strong>{rec.Producto.nombre}</strong>
                    {rec.Producto.marca && <span> - {rec.Producto.marca}</span>}
                  </div>
                )}
                <div className="proveedor-info">
                  Proveedor: <strong>{rec.Proveedor?.nombre}</strong>
                </div>
                <div className="precio-info">
                  Precio: <strong>${rec.precio}</strong>
                </div>
              </div>
              <div className="recomendacion-actions">
                <button
                  onClick={() => handleComprar(rec.idrecomendacion)}
                  disabled={procesando === rec.idrecomendacion}
                  className="btn-comprar"
                >
                  {procesando === rec.idrecomendacion
                    ? 'Procesando...'
                    : 'Marcar como Comprado'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .recomendaciones-container {
          padding: 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .recomendaciones-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #e0e0e0;
        }

        .recomendaciones-header h3 {
          margin: 0;
          color: #333;
        }

        .status-indicators {
          display: flex;
          gap: 15px;
          align-items: center;
        }

        .ws-status {
          font-size: 14px;
          padding: 5px 10px;
          border-radius: 4px;
        }

        .ws-status.connected {
          color: #28a745;
          background: #d4edda;
        }

        .ws-status.disconnected {
          color: #dc3545;
          background: #f8d7da;
        }

        .btn-sync {
          padding: 8px 16px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .btn-sync:hover {
          background: #0056b3;
        }

        .loading,
        .error,
        .no-data {
          padding: 20px;
          text-align: center;
          color: #666;
        }

        .error {
          color: #dc3545;
        }

        .recomendaciones-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .recomendacion-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          transition: all 0.3s ease;
        }

        .recomendacion-card:hover {
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          border-color: #007bff;
        }

        .recomendacion-info {
          flex: 1;
        }

        .producto-info {
          margin-bottom: 8px;
          font-size: 16px;
        }

        .proveedor-info,
        .precio-info {
          margin: 5px 0;
          color: #555;
        }

        .precio-info strong {
          color: #28a745;
          font-size: 18px;
        }

        .recomendacion-actions {
          margin-left: 20px;
        }

        .btn-comprar {
          padding: 10px 20px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          white-space: nowrap;
        }

        .btn-comprar:hover:not(:disabled) {
          background: #218838;
        }

        .btn-comprar:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
