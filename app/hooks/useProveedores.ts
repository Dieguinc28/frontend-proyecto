import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';

export interface Proveedor {
  idproveedor: number;
  nombre: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  fechacreacion?: string;
  fechamodificacion?: string;
}

export const useProveedores = () => {
  return useQuery({
    queryKey: ['proveedores'],
    queryFn: async () => {
      const { data } = await apiClient.get<Proveedor[]>('/proveedores');
      return data;
    },
  });
};

export const useProveedor = (id: number) => {
  return useQuery({
    queryKey: ['proveedor', id],
    queryFn: async () => {
      const { data } = await apiClient.get<Proveedor>(`/proveedores/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateProveedor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Proveedor>) => {
      const response = await apiClient.post<Proveedor>('/proveedores', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proveedores'] });
    },
  });
};

export const useUpdateProveedor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<Proveedor>;
    }) => {
      const response = await apiClient.put<Proveedor>(
        `/proveedores/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proveedores'] });
    },
  });
};

export const useDeleteProveedor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/proveedores/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proveedores'] });
    },
  });
};
