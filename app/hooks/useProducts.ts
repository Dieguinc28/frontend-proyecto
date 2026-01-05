import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import type { Product } from '../types';

// Hook para obtener todos los productos
export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ products: Product[] } | Product[]>(
        '/products'
      );
      // Manejar ambos formatos de respuesta
      if (Array.isArray(data)) {
        return data;
      }
      return data.products || [];
    },
  });
};

// Hook para obtener un producto por ID
export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await apiClient.get<Product>(`/products/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

// Hook para crear producto
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productData,
      imageFile,
    }: {
      productData: Partial<Product>;
      imageFile?: File;
    }) => {
      const formData = new FormData();

      // Agregar datos del producto
      Object.keys(productData).forEach((key) => {
        const value = productData[key as keyof Product];
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, String(value));
        }
      });

      // Agregar imagen si existe
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const { data } = await apiClient.post<Product>('/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

// Hook para actualizar producto
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      productData,
      imageFile,
    }: {
      id: string;
      productData: Partial<Product>;
      imageFile?: File;
    }) => {
      const formData = new FormData();

      // Agregar datos del producto
      Object.keys(productData).forEach((key) => {
        const value = productData[key as keyof Product];
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, String(value));
        }
      });

      // Agregar imagen si existe
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const { data } = await apiClient.put<Product>(
        `/products/${id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
    },
  });
};

// Hook para eliminar producto
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useExportProducts = () => {
  return useMutation({
    mutationFn: async () => {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ||
        'http://localhost:5000';
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No estás autenticado');
      }

      const response = await fetch(`${API_URL}/api/products/export/csv`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Error al exportar';

        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        }

        throw new Error(`${errorMessage} (Status: ${response.status})`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `productos_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return true;
    },
  });
};
