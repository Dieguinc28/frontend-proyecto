import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';

export interface PrecioProveedor {
  idprecio: number;
  idproducto: number;
  idproveedor: number;
  precio: number;
  fechacreacion?: string;
  fechamodificacion?: string;
  Producto?: any;
  Proveedor?: any;
}

export const usePreciosProveedor = () => {
  return useQuery({
    queryKey: ['precios'],
    queryFn: async () => {
      const { data } = await apiClient.get<PrecioProveedor[]>('/precios');
      return data;
    },
  });
};

export const usePrecioProveedor = (id: number) => {
  return useQuery({
    queryKey: ['precio', id],
    queryFn: async () => {
      const { data } = await apiClient.get<PrecioProveedor>(`/precios/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const usePreciosByProducto = (idproducto: number) => {
  return useQuery({
    queryKey: ['precios', 'producto', idproducto],
    queryFn: async () => {
      const { data } = await apiClient.get<PrecioProveedor[]>(
        `/precios/producto/${idproducto}`
      );
      return data;
    },
    enabled: !!idproducto,
  });
};

export const usePreciosByProveedor = (idproveedor: number) => {
  return useQuery({
    queryKey: ['precios', 'proveedor', idproveedor],
    queryFn: async () => {
      const { data } = await apiClient.get<PrecioProveedor[]>(
        `/precios/proveedor/${idproveedor}`
      );
      return data;
    },
    enabled: !!idproveedor,
  });
};

export const useCreatePrecioProveedor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<PrecioProveedor>) => {
      const response = await apiClient.post<PrecioProveedor>('/precios', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['precios'] });
    },
  });
};

export const useUpdatePrecioProveedor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<PrecioProveedor>;
    }) => {
      const response = await apiClient.put<PrecioProveedor>(
        `/precios/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['precios'] });
    },
  });
};

export const useDeletePrecioProveedor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/precios/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['precios'] });
    },
  });
};
