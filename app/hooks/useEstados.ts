import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';

export interface Estado {
  idestado: number;
  nombreestado: string;
  fechacreacion?: string;
  fechamodificacion?: string;
}

export const useEstados = () => {
  return useQuery({
    queryKey: ['estados'],
    queryFn: async () => {
      const { data } = await apiClient.get<Estado[]>('/estados');
      return data;
    },
  });
};

export const useEstado = (id: number) => {
  return useQuery({
    queryKey: ['estado', id],
    queryFn: async () => {
      const { data } = await apiClient.get<Estado>(`/estados/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateEstado = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Estado>) => {
      const response = await apiClient.post<Estado>('/estados', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estados'] });
    },
  });
};

export const useUpdateEstado = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Estado> }) => {
      const response = await apiClient.put<Estado>(`/estados/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estados'] });
    },
  });
};

export const useDeleteEstado = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/estados/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estados'] });
    },
  });
};
