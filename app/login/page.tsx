'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLogin } from '../hooks/useAuth';
import Link from 'next/link';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import LoginIcon from '@mui/icons-material/Login';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import '../styles/auth-pages.css';

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useLogin();
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      await loginMutation.mutateAsync(formData);
      router.push('/');
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Error al iniciar sesión';
      setErrorMessage(message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="auth-overlay"></div>
      </div>

      <div className="auth-container">
        <Link href="/" className="back-button">
          <ArrowBackIcon />
          Volver al inicio
        </Link>

        <div className="auth-header">
          <h1>Iniciar Sesión</h1>
          <p>Ingresa tus credenciales para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {errorMessage && <div className="error-message">{errorMessage}</div>}

          <div className="form-group">
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
                placeholder="Ingresa tu correo electrónico"
              />
            </div>
          </div>

          <div className="form-group">
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
            <Link href="/forgot-password" className="forgot-link">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button
            type="submit"
            className="btn-submit"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              'Iniciando sesión...'
            ) : (
              <>
                <LoginIcon fontSize="small" />
                Iniciar sesión en tu cuenta
              </>
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>o</span>
        </div>

        <div className="auth-footer">
          <p>
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="link">
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
