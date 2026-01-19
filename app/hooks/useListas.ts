import { useState } from 'react';
import { apiClient } from '../lib/apiClient';

export interface Lista {
  idlista: number;
  idusuario: number;
  idestado: number;
  nombrelista: string;
  tipo: string;
  fechacreacion: string;
  fechamodificacion: string;
  Estado?: {
    idestado: number;
    nombre: string;
  };
  Itemlistas?: ItemLista[];
}

export interface ItemLista {
  iditem: number;
  idlista: number;
  idproducto: number;
  descripcion: string;
  cantidad: number;
  Producto?: {
    idproducto: number;
    nombre: string;
    descripcion: string;
    precio: number;
    marca: string;
    stock: number;
    imagen: string;
  };
}

export interface CreateListaData {
  nombrelista: string;
  tipo?: string;
  idestado: number;
  idusuario: number;
}

export interface CreateItemListaData {
  idlista: number;
  idproducto: number;
  cantidad: number;
  descripcion?: string;
}

export function useListas() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getListasByUsuario = async (idusuario: number): Promise<Lista[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<Lista[]>(
        `/listas/usuario/${idusuario}`
      );
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Error al obtener listas';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getListaById = async (idlista: number): Promise<Lista> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<Lista>(`/listas/${idlista}`);
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Error al obtener lista';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const createLista = async (data: CreateListaData): Promise<Lista> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<Lista>('/listas', data);
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Error al crear lista';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const updateLista = async (
    idlista: number,
    data: Partial<CreateListaData>
  ): Promise<Lista> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.put<Lista>(`/listas/${idlista}`, data);
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Error al actualizar lista';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const deleteLista = async (idlista: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.delete(`/listas/${idlista}`);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Error al eliminar lista';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const addItemToLista = async (
    data: CreateItemListaData
  ): Promise<ItemLista> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<ItemLista>('/items', data);
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Error al agregar item';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const updateItemLista = async (
    iditem: number,
    data: Partial<CreateItemListaData>
  ): Promise<ItemLista> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.put<ItemLista>(`/items/${iditem}`, data);
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Error al actualizar item';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const deleteItemLista = async (iditem: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.delete(`/items/${iditem}`);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Error al eliminar item';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getItemsByLista = async (idlista: number): Promise<ItemLista[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<ItemLista[]>(
        `/items/lista/${idlista}`
      );
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Error al obtener items';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getListasByUsuario,
    getListaById,
    createLista,
    updateLista,
    deleteLista,
    addItemToLista,
    updateItemLista,
    deleteItemLista,
    getItemsByLista,
  };
}
