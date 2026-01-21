'use client';

import { useEffect, useState, useCallback } from 'react';
import { getSocket } from '../lib/socket';
import { useCurrentUser } from './useAuth';

export interface CotizacionNotification {
  id: number;
  userId: number;
  userName: string;
  total: number;
  itemsCount: number;
  createdAt: string;
}

export const useAdminNotifications = () => {
  const { data: user } = useCurrentUser();
  const [notification, setNotification] =
    useState<CotizacionNotification | null>(null);

  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  useEffect(() => {
    // Solo suscribirse si el usuario es admin
    if (!user || user.role !== 'admin') return;

    const socket = getSocket();

    // Suscribirse al room de notificaciones de admin
    socket.emit('admin:subscribe');

    // Escuchar nuevas cotizaciones
    const handleNuevaCotizacion = (data: CotizacionNotification) => {
      setNotification(data);
    };

    socket.on('cotizacion:nueva', handleNuevaCotizacion);

    return () => {
      socket.emit('admin:unsubscribe');
      socket.off('cotizacion:nueva', handleNuevaCotizacion);
    };
  }, [user]);

  return {
    notification,
    clearNotification,
  };
};
