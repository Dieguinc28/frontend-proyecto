import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import type { Product } from '../types';

// Tipos para paginación
interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ProductsResponse {
  products: Product[];
  pagination: PaginationInfo;
}

interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoria?: string;
  marca?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

interface ProductosSimilaresResponse {
  principal: Product | null;
  variantes: Product[];
}

interface SearchResponse {
  suggestions: string[];
  products: Product[];
}

// Hook para obtener todos los productos (compatibilidad)
export const useProducts = () => {
  return useQuery({
    queryKey: ['products', 'all'],
    queryFn: async () => {
      const { data } = await apiClient.get<ProductsResponse | Product[]>(
        '/products?limit=999',
      );
      // Manejar ambos formatos de respuesta
      if (Array.isArray(data)) {
        return data;
      }
      return data.products || [];
    },
  });
};

// Hook para obtener productos con paginación y filtros
export const useProductsPaginated = (filters: ProductFilters = {}) => {
  const queryParams = new URLSearchParams();

  if (filters.page) queryParams.append('page', String(filters.page));
  if (filters.limit) queryParams.append('limit', String(filters.limit));
  if (filters.search) queryParams.append('search', filters.search);
  if (filters.categoria) queryParams.append('categoria', filters.categoria);
  if (filters.marca) queryParams.append('marca', filters.marca);
  if (filters.minPrice)
    queryParams.append('minPrice', String(filters.minPrice));
  if (filters.maxPrice)
    queryParams.append('maxPrice', String(filters.maxPrice));
  if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
  if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

  return useQuery({
    queryKey: ['products-paginated', filters],
    queryFn: async () => {
      const { data } = await apiClient.get<ProductsResponse>(
        `/products?${queryParams.toString()}`,
      );
      return data;
    },
  });
};

// Hook para scroll infinito de productos
export const useProductsInfinite = (
  filters: Omit<ProductFilters, 'page'> = {},
) => {
  return useInfiniteQuery({
    queryKey: ['products-infinite', filters],
    queryFn: async ({ pageParam = 1 }) => {
      const queryParams = new URLSearchParams();
      queryParams.append('page', String(pageParam));

      if (filters.limit) queryParams.append('limit', String(filters.limit));
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.categoria) queryParams.append('categoria', filters.categoria);
      if (filters.marca) queryParams.append('marca', filters.marca);
      if (filters.minPrice)
        queryParams.append('minPrice', String(filters.minPrice));
      if (filters.maxPrice)
        queryParams.append('maxPrice', String(filters.maxPrice));
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

      const { data } = await apiClient.get<ProductsResponse>(
        `/products?${queryParams.toString()}`,
      );
      return data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.hasNextPage) {
        return lastPage.pagination.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
};

// Hook para obtener categorías
export const useCategorias = () => {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: async () => {
      const { data } = await apiClient.get<string[]>('/products/categorias');
      return data;
    },
  });
};

// Hook para obtener marcas
export const useMarcas = () => {
  return useQuery({
    queryKey: ['marcas'],
    queryFn: async () => {
      const { data } = await apiClient.get<string[]>('/products/marcas');
      return data;
    },
  });
};

// Hook para buscar productos con autocompletado
export const useSearchProducts = (query: string, limit: number = 10) => {
  return useQuery({
    queryKey: ['search-products', query, limit],
    queryFn: async () => {
      const { data } = await apiClient.get<SearchResponse>(
        `/products/search?q=${encodeURIComponent(query)}&limit=${limit}`,
      );
      return data;
    },
    enabled: query.length >= 2,
  });
};

// Hook para obtener productos similares/variantes
export const useProductosSimilares = (
  productId: string,
  limit: number = 10,
) => {
  return useQuery({
    queryKey: ['productos-similares', productId, limit],
    queryFn: async () => {
      const { data } = await apiClient.get<ProductosSimilaresResponse>(
        `/products/similares/${productId}?limit=${limit}`,
      );
      return data;
    },
    enabled: !!productId,
  });
};

// Hook para obtener productos destacados (para la página de inicio)
export const useProductosDestacados = (limite: number = 8) => {
  return useQuery({
    queryKey: ['productos-destacados', limite],
    queryFn: async () => {
      const { data } = await apiClient.get<Product[]>(
        `/products/destacados?limite=${limite}`,
      );
      return data;
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
        },
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
