import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';

export interface Venta {
  idventa: number;
  iddetalle: number;
  descripcion?: string;
  fechacreacion?: string;
  fechamodificacion?: string;
  Detallecotizacion?: any;
}

export const useVentas = () => {
  return useQuery({
    queryKey: ['ventas'],
    queryFn: async () => {
      const { data } = await apiClient.get<Venta[]>('/ventas');
      return data;
    },
  });
};

export const useVenta = (id: number) => {
  return useQuery({
    queryKey: ['venta', id],
    queryFn: async () => {
      const { data } = await apiClient.get<Venta>(`/ventas/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateVenta = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Venta>) => {
      const response = await apiClient.post<Venta>('/ventas', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
    },
  });
};

export const useUpdateVenta = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Venta> }) => {
      const response = await apiClient.put<Venta>(`/ventas/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
    },
  });
};

export const useDeleteVenta = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/ventas/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
    },
  });
};
