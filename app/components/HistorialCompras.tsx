'use client';

import { useEffect, useState } from 'react';
import { useRecomendaciones } from '../hooks/useRecomendaciones';

export default function HistorialCompras({
  idusuario,
}: {
  idusuario?: number;
}) {
  const {
    historial,
    estadisticas,
    loading,
    error,
    fetchHistorial,
    fetchEstadisticas,
  } = useRecomendaciones();

  const [filtros, setFiltros] = useState({
    fechaDesde: '',
    fechaHasta: '',
  });

  useEffect(() => {
    fetchHistorial({ idusuario, ...filtros });
    fetchEstadisticas(idusuario);
  }, [idusuario]);

  const handleFiltrar = () => {
    fetchHistorial({ idusuario, ...filtros });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && !historial.length) {
    return <div className="loading">Cargando historial...</div>;
  }

  return (
    <div className="historial-compras">
      <h2>📊 Historial de Compras</h2>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="estadisticas-grid">
          <div className="stat-card">
            <h3>Total Compras</h3>
            <p className="stat-value">{estadisticas.totalCompras}</p>
          </div>
          <div className="stat-card">
            <h3>Total Gastado</h3>
            <p className="stat-value">
              {formatCurrency(estadisticas.totalGastado)}
            </p>
          </div>
          <div className="stat-card">
            <h3>Promedio por Compra</h3>
            <p className="stat-value">
              {formatCurrency(
                estadisticas.totalGastado / (estadisticas.totalCompras || 1)
              )}
            </p>
          </div>
        </div>
      )}

      {/* Productos más comprados */}
      {estadisticas && estadisticas.productosMasComprados.length > 0 && (
        <div className="productos-mas-comprados">
          <h3>🏆 Productos Más Comprados</h3>
          <div className="productos-grid">
            {estadisticas.productosMasComprados.slice(0, 5).map((item) => (
              <div key={item.idproducto} className="producto-card">
                <h4>{item.Producto.nombre}</h4>
                <p>Cantidad: {item.cantidad}</p>
                <p>Total: {formatCurrency(Number(item.total))}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="filtros">
        <h3>🔍 Filtrar por Fecha</h3>
        <div className="filtros-grid">
          <input
            type="date"
            value={filtros.fechaDesde}
            onChange={(e) =>
              setFiltros({ ...filtros, fechaDesde: e.target.value })
            }
            placeholder="Fecha desde"
          />
          <input
            type="date"
            value={filtros.fechaHasta}
            onChange={(e) =>
              setFiltros({ ...filtros, fechaHasta: e.target.value })
            }
            placeholder="Fecha hasta"
          />
          <button onClick={handleFiltrar} className="btn-primary">
            Filtrar
          </button>
          <button
            onClick={() => {
              setFiltros({ fechaDesde: '', fechaHasta: '' });
              fetchHistorial({ idusuario });
            }}
            className="btn-secondary"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Tabla de historial */}
      {error && <div className="error">{error}</div>}

      {historial.length === 0 ? (
        <div className="empty-state">
          <p>No hay compras registradas</p>
        </div>
      ) : (
        <div className="historial-table">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Producto</th>
                <th>Proveedor</th>
                <th>Precio</th>
                <th>Usuario</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((compra) => (
                <tr key={compra.idhistorial}>
                  <td>{formatDate(compra.fechacompra)}</td>
                  <td>
                    <strong>{compra.Producto.nombre}</strong>
                    {compra.Producto.marca && (
                      <span className="marca"> - {compra.Producto.marca}</span>
                    )}
                  </td>
                  <td>{compra.Proveedor.nombre}</td>
                  <td className="precio">
                    {formatCurrency(Number(compra.precio))}
                  </td>
                  <td>{compra.Usuario?.nombre || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .historial-compras {
          padding: 20px;
        }

        h2 {
          margin-bottom: 20px;
          color: #333;
        }

        .estadisticas-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 10px;
          text-align: center;
        }

        .stat-card h3 {
          font-size: 14px;
          margin-bottom: 10px;
          opacity: 0.9;
        }

        .stat-value {
          font-size: 28px;
          font-weight: bold;
          margin: 0;
        }

        .productos-mas-comprados {
          margin-bottom: 30px;
        }

        .productos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 15px;
          margin-top: 15px;
        }

        .producto-card {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }

        .producto-card h4 {
          margin: 0 0 10px 0;
          color: #333;
          font-size: 14px;
        }

        .producto-card p {
          margin: 5px 0;
          font-size: 13px;
          color: #666;
        }

        .filtros {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .filtros h3 {
          margin-top: 0;
          margin-bottom: 15px;
        }

        .filtros-grid {
          display: grid;
          grid-template-columns: 1fr 1fr auto auto;
          gap: 10px;
        }

        .filtros-grid input {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 14px;
        }

        .btn-primary,
        .btn-secondary {
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }

        .btn-primary {
          background: #667eea;
          color: white;
        }

        .btn-primary:hover {
          background: #5568d3;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background: #5a6268;
        }

        .historial-table {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        thead {
          background: #667eea;
          color: white;
        }

        th,
        td {
          padding: 12px 15px;
          text-align: left;
        }

        tbody tr {
          border-bottom: 1px solid #f0f0f0;
        }

        tbody tr:hover {
          background: #f8f9fa;
        }

        .marca {
          color: #666;
          font-size: 13px;
        }

        .precio {
          font-weight: bold;
          color: #28a745;
        }

        .empty-state {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        .error {
          background: #f8d7da;
          color: #721c24;
          padding: 12px;
          border-radius: 5px;
          margin-bottom: 20px;
        }

        .loading {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        @media (max-width: 768px) {
          .filtros-grid {
            grid-template-columns: 1fr;
          }

          .estadisticas-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
