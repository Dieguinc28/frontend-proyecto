import { useState, useEffect } from 'react';
import { apiClient } from '../lib/apiClient';

interface HistorialCompra {
  idhistorial: number;
  idrecomendacion: number;
  idproducto: number;
  idproveedor: number;
  precio: number;
  idusuario: number;
  fechacompra: string;
  Producto?: {
    nombre: string;
    descripcion: string;
  };
  Proveedor?: {
    nombre: string;
  };
  Usuario?: {
    nombre: string;
    email: string;
  };
}

interface EstadisticasCompras {
  totalCompras: number;
  totalGastado: number;
  productosMasComprados: Array<{
    idproducto: number;
    cantidad: number;
    total: number;
    Producto: {
      nombre: string;
    };
  }>;
}

export function useHistorialCompras(filters?: {
  idusuario?: number;
  idproducto?: number;
  fechaDesde?: string;
  fechaHasta?: string;
}) {
  const [historial, setHistorial] = useState<HistorialCompra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistorial();
  }, [filters]);

  const fetchHistorial = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filters?.idusuario)
        params.append('idusuario', filters.idusuario.toString());
      if (filters?.idproducto)
        params.append('idproducto', filters.idproducto.toString());
      if (filters?.fechaDesde) params.append('fechaDesde', filters.fechaDesde);
      if (filters?.fechaHasta) params.append('fechaHasta', filters.fechaHasta);

      const response = await apiClient.get<HistorialCompra[]>(
        `/recomendaciones/historial/compras?${params}`
      );
      setHistorial(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar historial');
      console.error('Error fetching historial:', err);
    } finally {
      setLoading(false);
    }
  };

  return { historial, loading, error, refetch: fetchHistorial };
}

export function useEstadisticasCompras(idusuario?: number) {
  const [estadisticas, setEstadisticas] = useState<EstadisticasCompras | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEstadisticas();
  }, [idusuario]);

  const fetchEstadisticas = async () => {
    try {
      setLoading(true);
      const params = idusuario ? `?idusuario=${idusuario}` : '';
      const response = await apiClient.get<EstadisticasCompras>(
        `/recomendaciones/historial/estadisticas${params}`
      );
      setEstadisticas(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar estadísticas');
      console.error('Error fetching estadísticas:', err);
    } finally {
      setLoading(false);
    }
  };

  return { estadisticas, loading, error, refetch: fetchEstadisticas };
}
