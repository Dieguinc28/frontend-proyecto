'use client';

import { useState } from 'react';
import { useLogin, useRegister } from '../hooks/useAuth';
import SuccessModal from './SuccessModal';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import CloseIcon from '@mui/icons-material/Close';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Link from 'next/link';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = 'login',
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState({
    title: '',
    message: '',
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'cliente' as const,
  });

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  if (!isOpen && !showSuccess) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      if (mode === 'login') {
        const result = await loginMutation.mutateAsync({
          email: formData.email,
          password: formData.password,
        });
        console.log('Login exitoso:', result);
        setSuccessMessage({
          title: '¡Bienvenido!',
          message: 'Has iniciado sesión correctamente.',
        });
      } else {
        const result = await registerMutation.mutateAsync(formData);
        console.log('Registro exitoso:', result);
        setSuccessMessage({
          title: '¡Cuenta Creada!',
          message: 'Tu cuenta ha sido creada exitosamente.',
        });
      }
      onClose();
      setShowSuccess(true);
      // Dar más tiempo para que React Query actualice el estado
      setTimeout(() => {
        setShowSuccess(false);
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error('Error en autenticación:', error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Error al procesar la solicitud';
      setErrorMessage(message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      {isOpen && (
        <div className="modal-overlay" onClick={onClose}>
          <div
            className={`modal-content ${
              mode === 'register' ? 'modal-register' : 'modal-login'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={onClose}>
              <CloseIcon />
            </button>

            <div className="modal-header">
              <h2>{mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}</h2>
              <p className="modal-subtitle">
                {mode === 'login'
                  ? 'Ingresa tus credenciales para continuar'
                  : 'Completa el formulario para registrarte'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {errorMessage && (
                <div
                  style={{
                    padding: '0.75rem',
                    backgroundColor: '#fee',
                    border: '1px solid #fcc',
                    borderRadius: '8px',
                    color: '#c33',
                    fontSize: '0.875rem',
                    marginBottom: '1rem',
                  }}
                >
                  {errorMessage}
                </div>
              )}

              {mode === 'register' && (
                <div className="form-group full-width">
                  <label htmlFor="name">Nombre completo</label>
                  <div className="input-with-icon">
                    <PersonIcon className="input-icon" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Tu nombre completo"
                    />
                  </div>
                </div>
              )}

              <div
                className={`form-group ${mode === 'login' ? 'full-width' : ''}`}
              >
                <label htmlFor="email">Correo electrónico</label>
                <div className="input-with-icon">
                  <EmailIcon className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Ingresa tu correo"
                  />
                </div>
              </div>

              <div
                className={`form-group ${mode === 'login' ? 'full-width' : ''}`}
              >
                <label htmlFor="password">Contraseña</label>
                <div className="input-with-icon">
                  <LockIcon className="input-icon" />
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    minLength={6}
                  />
                </div>
                {mode === 'login' && (
                  <Link
                    href="/forgot-password"
                    className="forgot-password-link"
                    onClick={onClose}
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                )}
              </div>

              <button
                type="submit"
                className="btn-submit"
                disabled={loginMutation.isPending || registerMutation.isPending}
              >
                {loginMutation.isPending || registerMutation.isPending ? (
                  'Procesando...'
                ) : mode === 'login' ? (
                  <>
                    <LoginIcon fontSize="small" />
                    Iniciar Sesión
                  </>
                ) : (
                  <>
                    <PersonAddIcon fontSize="small" />
                    Crear Cuenta
                  </>
                )}
              </button>
            </form>

            <div className="modal-divider">
              <span>o</span>
            </div>

            <div className="modal-footer">
              {mode === 'login' ? (
                <p>
                  ¿No tienes cuenta?{' '}
                  <button
                    onClick={() => {
                      setMode('register');
                      setErrorMessage('');
                    }}
                    className="link-button"
                  >
                    Regístrate gratis
                  </button>
                </p>
              ) : (
                <p>
                  ¿Ya tienes cuenta?{' '}
                  <button
                    onClick={() => {
                      setMode('login');
                      setErrorMessage('');
                    }}
                    className="link-button"
                  >
                    Inicia sesión aquí
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          window.location.reload();
        }}
        title={successMessage.title}
        message={successMessage.message}
      />
    </>
  );
}
