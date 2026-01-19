'use client';

import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface Producto {
  idproducto: number;
  nombre: string;
  marca?: string;
  stock: number;
  activo: boolean;
}

interface Proveedor {
  idproveedor: number;
  nombre: string;
}

interface Usuario {
  idusuario: number;
  nombre: string;
}

interface Recomendacion {
  idrecomendacion: number;
  idproducto: number;
  idproveedor: number;
  precio: number;
  disponible: boolean;
  comprado: boolean;
  fechacompra?: string;
  idusuario?: number;
  Producto: Producto;
  Proveedor: Proveedor;
  Usuario?: Usuario;
}

interface HistorialCompra {
  idhistorial: number;
  idrecomendacion?: number;
  idproducto: number;
  idproveedor: number;
  precio: number;
  idusuario?: number;
  fechacompra: string;
  Producto: Producto;
  Proveedor: Proveedor;
  Usuario?: Usuario;
}

interface Estadisticas {
  totalCompras: number;
  totalGastado: number;
  productosMasComprados: Array<{
    idproducto: number;
    cantidad: number;
    total: number;
    Producto: Producto;
  }>;
}

interface ValidacionDisponibilidad {
  disponible: boolean;
  motivo?: string;
  producto?: string;
  proveedor?: string;
  precio?: number;
}

export function useRecomendaciones(idproducto?: number) {
  const [recomendaciones, setRecomendaciones] = useState<Recomendacion[]>([]);
  const [historial, setHistorial] = useState<HistorialCompra[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ||
    'http://localhost:5000';

  // 🔌 Conectar WebSocket
  useEffect(() => {
    const newSocket = io(API_URL);

    newSocket.on('connect', () => {
      setConnected(true);
      newSocket.emit('recomendaciones:subscribe');
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    newSocket.on('recomendacion:created', (data: Recomendacion) => {
      setRecomendaciones((prev) => [data, ...prev]);
    });

    newSocket.on('recomendacion:updated', (data: Recomendacion) => {
      setRecomendaciones((prev) =>
        prev.map((r) => (r.idrecomendacion === data.idrecomendacion ? data : r))
      );
    });

    newSocket.on('recomendacion:purchased', (data: any) => {
      setRecomendaciones((prev) =>
        prev.map((r) =>
          r.idrecomendacion === data.id ? data.recomendacion : r
        )
      );
    });

    newSocket.on('recomendacion:deleted', (data: any) => {
      setRecomendaciones((prev) =>
        prev.filter((r) => r.idrecomendacion !== data.id)
      );
    });

    newSocket.on('recomendaciones:synced', () => {
      fetchRecomendaciones();
    });

    newSocket.on('recomendaciones:cleaned', () => {
      fetchRecomendaciones();
    });

    setSocket(newSocket);

    // Fetch initial data if idproducto is provided
    if (idproducto) {
      fetchRecomendaciones({ idproducto });
    }

    return () => {
      newSocket.emit('recomendaciones:unsubscribe');
      newSocket.close();
    };
  }, [API_URL]);

  // 📋 Obtener recomendaciones
  const fetchRecomendaciones = useCallback(
    async (filters?: {
      disponible?: boolean;
      comprado?: boolean;
      idproducto?: number;
      idproveedor?: number;
    }) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (filters?.disponible !== undefined)
          params.append('disponible', String(filters.disponible));
        if (filters?.comprado !== undefined)
          params.append('comprado', String(filters.comprado));
        if (filters?.idproducto)
          params.append('idproducto', String(filters.idproducto));
        if (filters?.idproveedor)
          params.append('idproveedor', String(filters.idproveedor));

        const response = await fetch(
          `${API_URL}/api/recomendaciones?${params}`
        );
        if (!response.ok) throw new Error('Error al obtener recomendaciones');

        const data = await response.json();
        setRecomendaciones(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    },
    [API_URL]
  );

  // 📈 Obtener mejores ofertas
  const fetchMejoresOfertas = useCallback(
    async (limite: number = 10) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_URL}/api/recomendaciones/mejores-ofertas?limite=${limite}`
        );
        if (!response.ok) throw new Error('Error al obtener ofertas');

        const data = await response.json();
        setRecomendaciones(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    },
    [API_URL]
  );

  // ✅ Validar disponibilidad
  const validarDisponibilidad = useCallback(
    async (id: number): Promise<ValidacionDisponibilidad> => {
      try {
        const response = await fetch(
          `${API_URL}/api/recomendaciones/${id}/validar`
        );
        if (!response.ok) throw new Error('Error al validar disponibilidad');

        return await response.json();
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : 'Error desconocido'
        );
      }
    },
    [API_URL]
  );

  // 🛒 Marcar como comprado (con validación)
  const marcarComoComprado = useCallback(
    async (id: number, idusuario: number) => {
      setLoading(true);
      setError(null);

      try {
        // Primero validar disponibilidad
        const validacion = await validarDisponibilidad(id);

        if (!validacion.disponible) {
          throw new Error(validacion.motivo || 'Producto no disponible');
        }

        // Si está disponible, marcar como comprado
        const response = await fetch(
          `${API_URL}/api/recomendaciones/${id}/comprar`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idusuario }),
          }
        );

        if (!response.ok) throw new Error('Error al marcar como comprado');

        const data = await response.json();
        return data;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [API_URL, validarDisponibilidad]
  );

  // 📊 Obtener historial de compras
  const fetchHistorial = useCallback(
    async (filters?: {
      idusuario?: number;
      idproducto?: number;
      fechaDesde?: string;
      fechaHasta?: string;
    }) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (filters?.idusuario)
          params.append('idusuario', String(filters.idusuario));
        if (filters?.idproducto)
          params.append('idproducto', String(filters.idproducto));
        if (filters?.fechaDesde)
          params.append('fechaDesde', filters.fechaDesde);
        if (filters?.fechaHasta)
          params.append('fechaHasta', filters.fechaHasta);

        const response = await fetch(
          `${API_URL}/api/recomendaciones/historial/compras?${params}`
        );
        if (!response.ok) throw new Error('Error al obtener historial');

        const data = await response.json();
        setHistorial(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    },
    [API_URL]
  );

  // 📈 Obtener estadísticas
  const fetchEstadisticas = useCallback(
    async (idusuario?: number) => {
      setLoading(true);
      setError(null);

      try {
        const params = idusuario ? `?idusuario=${idusuario}` : '';
        const response = await fetch(
          `${API_URL}/api/recomendaciones/historial/estadisticas${params}`
        );
        if (!response.ok) throw new Error('Error al obtener estadísticas');

        const data = await response.json();
        setEstadisticas(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    },
    [API_URL]
  );

  // 🔄 Sincronizar manualmente
  const sincronizar = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_URL}/api/recomendaciones/sincronizar`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (!response.ok) throw new Error('Error al sincronizar');

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  return {
    recomendaciones,
    historial,
    estadisticas,
    loading,
    error,
    connected,
    fetchRecomendaciones,
    fetchMejoresOfertas,
    validarDisponibilidad,
    marcarComoComprado,
    fetchHistorial,
    fetchEstadisticas,
    sincronizar,
  };
}
