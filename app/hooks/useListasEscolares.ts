import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';

export interface ListaEscolar {
  idlista: number;
  idusuario: number;
  idestado: number;
  nombrelista: string;
  tipo?: string;
  fechacreacion?: string;
  fechamodificacion?: string;
  Usuario?: any;
  Estado?: any;
  Itemlistas?: any[];
}

export const useListasEscolares = () => {
  return useQuery({
    queryKey: ['listas'],
    queryFn: async () => {
      const { data } = await apiClient.get<ListaEscolar[]>('/listas');
      return data;
    },
  });
};

export const useListaEscolar = (id: number) => {
  return useQuery({
    queryKey: ['lista', id],
    queryFn: async () => {
      const { data } = await apiClient.get<ListaEscolar>(`/listas/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useListasByUsuario = (idusuario: number) => {
  return useQuery({
    queryKey: ['listas', 'usuario', idusuario],
    queryFn: async () => {
      const { data } = await apiClient.get<ListaEscolar[]>(
        `/listas/usuario/${idusuario}`
      );
      return data;
    },
    enabled: !!idusuario,
  });
};

export const useCreateListaEscolar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<ListaEscolar>) => {
      const response = await apiClient.post<ListaEscolar>('/listas', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listas'] });
    },
  });
};

export const useUpdateListaEscolar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<ListaEscolar>;
    }) => {
      const response = await apiClient.put<ListaEscolar>(`/listas/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listas'] });
    },
  });
};

export const useDeleteListaEscolar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/listas/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listas'] });
    },
  });
};
