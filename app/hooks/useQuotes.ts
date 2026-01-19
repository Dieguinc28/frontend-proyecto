import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import type { Quote } from '../types';

interface CreateQuoteData {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}

interface UpdateQuoteStatusData {
  id: string;
  status: 'aprobada' | 'rechazada';
}

// Hook para obtener cotizaciones del usuario
export const useMyQuotes = () => {
  return useQuery({
    queryKey: ['myQuotes'],
    queryFn: async () => {
      const { data } = await apiClient.get<Quote[]>('/quotes/my-quotes');
      return data;
    },
  });
};

// Hook para obtener todas las cotizaciones (admin)
export const useAllQuotes = () => {
  return useQuery({
    queryKey: ['allQuotes'],
    queryFn: async () => {
      const { data } = await apiClient.get<Quote[]>('/quotes');
      return data;
    },
  });
};

// Hook para crear cotización
export const useCreateQuote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quoteData: CreateQuoteData) => {
      const { data } = await apiClient.post<Quote>('/quotes', quoteData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myQuotes'] });
      queryClient.invalidateQueries({ queryKey: ['allQuotes'] });
    },
  });
};

// Hook para subir PDF
export const useUploadPdf = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('pdf', file);
      const { data } = await apiClient.post('/quotes/upload-pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myQuotes'] });
      queryClient.invalidateQueries({ queryKey: ['allQuotes'] });
    },
  });
};

// Hook para actualizar estado de cotización
export const useUpdateQuoteStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: UpdateQuoteStatusData) => {
      const { data } = await apiClient.patch<Quote>(`/quotes/${id}/status`, {
        status,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myQuotes'] });
      queryClient.invalidateQueries({ queryKey: ['allQuotes'] });
    },
  });
};
