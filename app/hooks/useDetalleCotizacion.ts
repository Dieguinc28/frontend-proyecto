import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';

export interface DetalleCotizacion {
  iddetalle: number;
  idcotizacion: number;
  idproducto: number;
  cantidad: number;
  preciounitario: number;
  subtotal: number;
  fechacreacion?: string;
  fechamodificacion?: string;
  Producto?: any;
  Cotizacion?: any;
}

export const useDetallesCotizacion = () => {
  return useQuery({
    queryKey: ['detalles'],
    queryFn: async () => {
      const { data } = await apiClient.get<DetalleCotizacion[]>('/detalles');
      return data;
    },
  });
};

export const useDetalleCotizacion = (id: number) => {
  return useQuery({
    queryKey: ['detalle', id],
    queryFn: async () => {
      const { data } = await apiClient.get<DetalleCotizacion>(
        `/detalles/${id}`
      );
      return data;
    },
    enabled: !!id,
  });
};

export const useDetallesByCotizacion = (idcotizacion: number) => {
  return useQuery({
    queryKey: ['detalles', 'cotizacion', idcotizacion],
    queryFn: async () => {
      const { data } = await apiClient.get<DetalleCotizacion[]>(
        `/detalles/cotizacion/${idcotizacion}`
      );
      return data;
    },
    enabled: !!idcotizacion,
  });
};

export const useCreateDetalleCotizacion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<DetalleCotizacion>) => {
      const response = await apiClient.post<DetalleCotizacion>(
        '/detalles',
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['detalles'] });
    },
  });
};

export const useUpdateDetalleCotizacion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<DetalleCotizacion>;
    }) => {
      const response = await apiClient.put<DetalleCotizacion>(
        `/detalles/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['detalles'] });
    },
  });
};

export const useDeleteDetalleCotizacion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/detalles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['detalles'] });
    },
  });
};
