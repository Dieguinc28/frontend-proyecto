'use client';

import { useState } from 'react';
import { useRecomendaciones } from '@/app/hooks/useRecomendaciones';
import RecomendacionesPrecio from '@/app/components/RecomendacionesPrecio';
import AdminLayout from '@/app/components/AdminLayout';
import '../../styles/admin.css';

export default function RecomendacionesAdmin() {
  const { sincronizar, loading } = useRecomendaciones();
  const [sincronizando, setSincronizando] = useState(false);
  const [limpiando, setLimpiando] = useState(false);
  const [mensaje, setMensaje] = useState<{
    tipo: 'success' | 'error';
    texto: string;
  } | null>(null);

  const handleSincronizar = async () => {
    if (!confirm('¿Sincronizar recomendaciones desde precios de proveedores?'))
      return;

    try {
      setSincronizando(true);
      setMensaje(null);
      const result = await sincronizar();
      setMensaje({
        tipo: 'success',
        texto: `Sincronización completada. ${result.nuevasRecomendaciones} nuevas recomendaciones creadas.`,
      });
    } catch (err) {
      setMensaje({
        tipo: 'error',
        texto: 'Error al sincronizar recomendaciones',
      });
    } finally {
      setSincronizando(false);
    }
  };

  const handleLimpiar = async () => {
    const dias = prompt(
      '¿Cuántos días de antigüedad para limpiar? (default: 30)',
      '30'
    );
    if (!dias) return;

    try {
      setLimpiando(true);
      setMensaje(null);
      const token = localStorage.getItem('token');
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ||
        'http://localhost:5000';
      const response = await fetch(
        `${API_URL}/api/recomendaciones/limpiar?dias=${dias}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Error al limpiar');

      const result = await response.json();
      setMensaje({
        tipo: 'success',
        texto: `Limpieza completada. ${result.eliminados} recomendaciones eliminadas.`,
      });
    } catch (err) {
      setMensaje({
        tipo: 'error',
        texto: 'Error al limpiar recomendaciones',
      });
    } finally {
      setLimpiando(false);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-container">
        <div className="admin-header">
          <h1>Gestión de Recomendaciones de Precios</h1>
          <p>Sistema de recomendaciones con actualización en tiempo real</p>
        </div>

        <div className="admin-actions">
          <button
            onClick={handleSincronizar}
            disabled={sincronizando || loading}
            className="btn btn-primary"
          >
            {sincronizando ? 'Sincronizando...' : 'Sincronizar desde Precios'}
          </button>
          <button
            onClick={handleLimpiar}
            disabled={limpiando || loading}
            className="btn btn-secondary"
          >
            {limpiando ? 'Limpiando...' : 'Limpiar Comprados Antiguos'}
          </button>
        </div>

        {mensaje && (
          <div className={`mensaje mensaje-${mensaje.tipo}`}>
            {mensaje.texto}
          </div>
        )}

        <div className="admin-content">
          <RecomendacionesPrecio showAll={true} />
        </div>

        <style jsx>{`
          .admin-container {
            padding: 20px;
            max-width: 1400px;
            margin: 0 auto;
          }

          .admin-header {
            margin-bottom: 30px;
          }

          .admin-header h1 {
            color: #333;
            margin-bottom: 10px;
          }

          .admin-header p {
            color: #666;
            font-size: 16px;
          }

          .admin-actions {
            display: flex;
            gap: 15px;
            margin-bottom: 30px;
            padding: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .btn-primary {
            background: #007bff;
            color: white;
          }

          .btn-primary:hover:not(:disabled) {
            background: #0056b3;
          }

          .btn-secondary {
            background: #6c757d;
            color: white;
          }

          .btn-secondary:hover:not(:disabled) {
            background: #545b62;
          }

          .mensaje {
            padding: 15px 20px;
            margin-bottom: 20px;
            border-radius: 6px;
            font-size: 16px;
          }

          .mensaje-success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
          }

          .mensaje-error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
          }

          .admin-content {
            margin-top: 20px;
          }
        `}</style>
      </div>
    </AdminLayout>
  );
}
