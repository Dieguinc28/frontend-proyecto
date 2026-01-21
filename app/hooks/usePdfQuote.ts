import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';

export interface PdfProduct {
  _id: string;
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  category: string;
  similarity: number;
}

export interface PdfQuoteResult {
  searchTerm: string;
  quantity: number;
  found: boolean;
  products: PdfProduct[];
}

export interface PdfQuoteResponse {
  success: boolean;
  extractedText: string;
  totalItems: number;
  results: PdfQuoteResult[];
}

export const useProcessPdfQuote = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('pdf', file);

      const { data } = await apiClient.post<PdfQuoteResponse>(
        '/pdf-quote/process',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return data;
    },
  });
};
