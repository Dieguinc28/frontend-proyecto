'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRegister } from '../hooks/useAuth';
import Link from 'next/link';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import '../styles/auth-pages.css';

export default function RegisterPage() {
  const router = useRouter();
  const registerMutation = useRegister();
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'cliente' as const,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      await registerMutation.mutateAsync(formData);
      router.push('/');
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Error al crear la cuenta';
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
          <h1>Crear Cuenta</h1>
          <p>Completa el formulario para registrarte</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {errorMessage && <div className="error-message">{errorMessage}</div>}

          <div className="form-group">
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
            <small className="input-hint">Mínimo 6 caracteres</small>
          </div>

          <button
            type="submit"
            className="btn-submit"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? (
              'Creando cuenta...'
            ) : (
              <>
                <PersonAddIcon fontSize="small" />
                Crear cuenta nueva
              </>
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>o</span>
        </div>

        <div className="auth-footer">
          <p>
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="link">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
