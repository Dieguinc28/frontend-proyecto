import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';

export interface ItemLista {
  iditem: number;
  idlista: number;
  idproducto: number;
  cantidad: number;
  fechacreacion?: string;
  fechamodificacion?: string;
  Listaescolar?: any;
  Producto?: any;
}

export const useItemsLista = () => {
  return useQuery({
    queryKey: ['items'],
    queryFn: async () => {
      const { data } = await apiClient.get<ItemLista[]>('/items');
      return data;
    },
  });
};

export const useItemLista = (id: number) => {
  return useQuery({
    queryKey: ['item', id],
    queryFn: async () => {
      const { data } = await apiClient.get<ItemLista>(`/items/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useItemsByLista = (idlista: number) => {
  return useQuery({
    queryKey: ['items', 'lista', idlista],
    queryFn: async () => {
      const { data } = await apiClient.get<ItemLista[]>(
        `/items/lista/${idlista}`
      );
      return data;
    },
    enabled: !!idlista,
  });
};

export const useCreateItemLista = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<ItemLista>) => {
      const response = await apiClient.post<ItemLista>('/items', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
};

export const useUpdateItemLista = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<ItemLista>;
    }) => {
      const response = await apiClient.put<ItemLista>(`/items/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
};

export const useDeleteItemLista = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
};
