import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import { tokenManager } from '../lib/token';
import type { User } from '../types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

// Hook para obtener el usuario actual
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      console.log('useCurrentUser - Haciendo petición a /auth/me');
      const token = tokenManager.get();
      console.log('Token actual:', token);
      const { data } = await apiClient.get<User>('/auth/me');
      console.log('Datos del usuario recibidos:', data);
      return data;
    },
    enabled: tokenManager.exists(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para login
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const { data } = await apiClient.post<AuthResponse>(
        '/auth/login',
        credentials
      );
      return data;
    },
    onSuccess: (data) => {
      console.log('Login onSuccess - Data recibida:', data);
      console.log('Token:', data.token);
      console.log('Usuario:', data.user);
      tokenManager.set(data.token);
      console.log('Token guardado en localStorage');
      queryClient.setQueryData(['currentUser'], data.user);
      console.log('Usuario guardado en React Query');
      // Invalidar la query para forzar una recarga
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      console.log('Query invalidada');
    },
  });
};

// Hook para registro
export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (registerData: RegisterData) => {
      const { data } = await apiClient.post<AuthResponse>(
        '/auth/register',
        registerData
      );
      return data;
    },
    onSuccess: (data) => {
      console.log('Register onSuccess - Data recibida:', data);
      console.log('Token:', data.token);
      console.log('Usuario:', data.user);
      tokenManager.set(data.token);
      console.log('Token guardado en localStorage');
      queryClient.setQueryData(['currentUser'], data.user);
      console.log('Usuario guardado en React Query');
      // Invalidar la query para forzar una recarga
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      console.log('Query invalidada');
    },
  });
};

// Hook para logout
export const useLogout = () => {
  const queryClient = useQueryClient();

  return () => {
    tokenManager.remove();
    queryClient.setQueryData(['currentUser'], null);
    queryClient.clear();
  };
};
