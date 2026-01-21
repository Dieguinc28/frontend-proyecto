'use client';

import { useEffect, useState } from 'react';
import { getSocket } from '../lib/socket';
import '../styles/notifications.css';

interface Notification {
  id: number;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export default function RecomendacionNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const socket = getSocket();

    socket.on('recomendacion:created', (data: any) => {
      addNotification({
        id: Date.now(),
        message: `Nueva recomendación: ${data.producto?.nombre || 'Producto'}`,
        type: 'info',
      });
    });

    socket.on('recomendacion:comprada', (data: any) => {
      addNotification({
        id: Date.now(),
        message: `Recomendación comprada: ${
          data.producto?.nombre || 'Producto'
        }`,
        type: 'success',
      });
    });

    socket.on('recomendacion:deleted', (data: any) => {
      addNotification({
        id: Date.now(),
        message: 'Recomendación eliminada',
        type: 'warning',
      });
    });

    socket.on('recomendacion:reactivada', (data: any) => {
      addNotification({
        id: Date.now(),
        message: `Recomendación reactivada: ${
          data.producto?.nombre || 'Producto'
        }`,
        type: 'info',
      });
    });

    socket.on('recomendacion:updated', (data: any) => {
      addNotification({
        id: Date.now(),
        message: `Precio actualizado: ${
          data.producto?.nombre || 'Producto'
        } - $${data.precio}`,
        type: 'info',
      });
    });

    return () => {
      socket.off('recomendacion:created');
      socket.off('recomendacion:comprada');
      socket.off('recomendacion:deleted');
      socket.off('recomendacion:reactivada');
      socket.off('recomendacion:updated');
    };
  }, []);

  const addNotification = (notification: Notification) => {
    setNotifications((prev) => [...prev, notification]);

    setTimeout(() => {
      removeNotification(notification.id);
    }, 5000);
  };

  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification notification-${notification.type}`}
          onClick={() => removeNotification(notification.id)}
        >
          <span className="notification-message">{notification.message}</span>
          <button
            className="notification-close"
            onClick={() => removeNotification(notification.id)}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
