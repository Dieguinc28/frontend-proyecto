'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  useCurrentUser,
  useUpdateProfile,
  useChangePassword,
} from '../hooks/useAuth';
import Layout from '../components/Layout';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CircularProgress from '@mui/material/CircularProgress';
import Link from 'next/link';

export default function SettingsPage() {
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  // Profile form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/');
    }
  }, [user, userLoading, router]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(false);
    try {
      await updateProfile.mutateAsync({ name, email });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(false);
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (userLoading) {
    return (
      <Layout>
        <div className="loading-container">
          <CircularProgress />
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  return (
    <Layout>
      <div className="settings-page">
        <div className="settings-container">
          <div className="settings-header">
            <SettingsIcon className="settings-icon" />
            <h1>Configuración</h1>
            <p>Administra tu cuenta y preferencias</p>
          </div>

          <div className="settings-tabs">
            <button
              className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <PersonIcon fontSize="small" />
              Perfil
            </button>
            <button
              className={`tab ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => setActiveTab('password')}
            >
              <LockIcon fontSize="small" />
              Contraseña
            </button>
          </div>

          <div className="settings-content">
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSubmit} className="settings-form">
                <h2>Información del perfil</h2>

                <div className="form-group">
                  <label htmlFor="name">Nombre</label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre"
                    required
                    disabled={updateProfile.isPending}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Correo electrónico</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    disabled={updateProfile.isPending}
                  />
                </div>

                <div className="form-group">
                  <label>Rol</label>
                  <input
                    type="text"
                    value={user.role === 'admin' ? 'Administrador' : 'Cliente'}
                    disabled
                    className="disabled-input"
                  />
                  <span className="hint">El rol no puede ser modificado</span>
                </div>

                {updateProfile.isError && (
                  <div className="error-message">
                    {(updateProfile.error as Error)?.message ||
                      'Error al actualizar perfil'}
                  </div>
                )}

                {profileSuccess && (
                  <div className="success-message">
                    <CheckCircleIcon fontSize="small" />
                    Perfil actualizado correctamente
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updateProfile.isPending}
                >
                  {updateProfile.isPending ? (
                    <>
                      <CircularProgress size={20} color="inherit" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar cambios'
                  )}
                </button>
              </form>
            )}

            {activeTab === 'password' && (
              <form onSubmit={handlePasswordSubmit} className="settings-form">
                <h2>Cambiar contraseña</h2>

                <div className="form-group">
                  <label htmlFor="currentPassword">Contraseña actual</label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={changePassword.isPending}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">Nueva contraseña</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    disabled={changePassword.isPending}
                  />
                  <span className="hint">Mínimo 6 caracteres</span>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">
                    Confirmar nueva contraseña
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={changePassword.isPending}
                  />
                </div>

                {(changePassword.isError || passwordError) && (
                  <div className="error-message">
                    {passwordError ||
                      (changePassword.error as Error)?.message ||
                      'Error al cambiar contraseña'}
                  </div>
                )}

                {passwordSuccess && (
                  <div className="success-message">
                    <CheckCircleIcon fontSize="small" />
                    Contraseña actualizada correctamente
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={changePassword.isPending}
                >
                  {changePassword.isPending ? (
                    <>
                      <CircularProgress size={20} color="inherit" />
                      Cambiando...
                    </>
                  ) : (
                    'Cambiar contraseña'
                  )}
                </button>
              </form>
            )}
          </div>

          <div className="settings-footer">
            <Link href="/" className="back-link">
              <ArrowBackIcon fontSize="small" />
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .settings-page {
          min-height: calc(100vh - 200px);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 2rem;
          background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
        }

        .settings-container {
          background: white;
          border-radius: 16px;
          padding: 2.5rem;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }

        .settings-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .settings-header :global(.settings-icon) {
          font-size: 2.5rem;
          color: #4f46e5;
          margin-bottom: 0.75rem;
        }

        .settings-header h1 {
          font-size: 1.4rem;
          color: #1f2937;
          margin-bottom: 0.4rem;
        }

        .settings-header p {
          color: #6b7280;
          font-size: 0.85rem;
        }

        .settings-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 0;
        }

        .tab {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.65rem 1rem;
          background: none;
          border: none;
          color: #6b7280;
          font-size: 0.85rem;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          margin-bottom: -1px;
          transition: all 0.2s;
        }

        .tab:hover {
          color: #4f46e5;
        }

        .tab.active {
          color: #4f46e5;
          border-bottom-color: #4f46e5;
        }

        .settings-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .settings-form h2 {
          font-size: 0.95rem;
          color: #374151;
          margin-bottom: 0.4rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .form-group label {
          font-weight: 500;
          color: #374151;
          font-size: 0.8rem;
        }

        .form-group input {
          padding: 0.75rem 0.875rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .form-group input:disabled {
          background: #f3f4f6;
          cursor: not-allowed;
        }

        .disabled-input {
          background: #f3f4f6 !important;
          color: #6b7280;
        }

        .hint {
          font-size: 0.7rem;
          color: #9ca3af;
        }

        .error-message {
          background: #fef2f2;
          color: #dc2626;
          padding: 0.6rem 0.875rem;
          border-radius: 8px;
          font-size: 0.8rem;
        }

        .success-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #ecfdf5;
          color: #059669;
          padding: 0.6rem 0.875rem;
          border-radius: 8px;
          font-size: 0.8rem;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          border-radius: 8px;
          font-weight: 500;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          margin-top: 0.5rem;
        }

        .btn-primary {
          background: #4f46e5;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #4338ca;
        }

        .btn-primary:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .settings-footer {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e5e7eb;
          text-align: center;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          color: #6b7280;
          text-decoration: none;
          font-size: 0.8rem;
          transition: color 0.2s;
        }

        .back-link:hover {
          color: #4f46e5;
        }

        .loading-container {
          min-height: calc(100vh - 200px);
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </Layout>
  );
}
