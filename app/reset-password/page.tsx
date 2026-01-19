'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useVerifyResetToken, useResetPassword } from '../hooks/useAuth';
import Layout from '../components/Layout';
import Link from 'next/link';
import LockResetIcon from '@mui/icons-material/LockReset';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CircularProgress from '@mui/material/CircularProgress';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');

  const {
    data: tokenData,
    isLoading: verifying,
    isError: tokenInvalid,
  } = useVerifyResetToken(token);
  const resetPassword = useResetPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (password.length < 6) {
      setValidationError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Las contraseñas no coinciden');
      return;
    }

    if (!token) return;

    try {
      await resetPassword.mutateAsync({ token, password });
      setSuccess(true);
    } catch (error) {
      // El error se maneja en el mutation
    }
  };

  if (!token) {
    return (
      <div className="auth-container">
        <div className="error-state">
          <ErrorIcon className="error-icon" />
          <h2>Enlace inválido</h2>
          <p>El enlace de recuperación no es válido o ha expirado.</p>
          <Link href="/forgot-password" className="btn btn-primary">
            Solicitar nuevo enlace
          </Link>
        </div>
      </div>
    );
  }

  if (verifying) {
    return (
      <div className="auth-container">
        <div className="loading-state">
          <CircularProgress size={50} />
          <p>Verificando enlace...</p>
        </div>
      </div>
    );
  }

  if (tokenInvalid) {
    return (
      <div className="auth-container">
        <div className="error-state">
          <ErrorIcon className="error-icon" />
          <h2>Enlace expirado</h2>
          <p>Este enlace de recuperación ha expirado o ya fue utilizado.</p>
          <Link href="/forgot-password" className="btn btn-primary">
            Solicitar nuevo enlace
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="auth-container">
        <div className="success-message">
          <CheckCircleIcon className="success-icon" />
          <h2>¡Contraseña actualizada!</h2>
          <p>Tu contraseña ha sido restablecida exitosamente.</p>
          <p>Ya puedes iniciar sesión con tu nueva contraseña.</p>
          <Link href="/" className="btn btn-primary">
            Ir a iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-header">
        <LockResetIcon className="auth-icon" />
        <h1>Nueva contraseña</h1>
        <p>
          Ingresa tu nueva contraseña para la cuenta:{' '}
          <strong>{tokenData?.email}</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="password">Nueva contraseña</label>
          <div className="password-input">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
              disabled={resetPassword.isPending}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmar contraseña</label>
          <div className="password-input">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite tu contraseña"
              required
              disabled={resetPassword.isPending}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </button>
          </div>
        </div>

        {(validationError || resetPassword.isError) && (
          <div className="error-message">
            {validationError ||
              (resetPassword.error as Error)?.message ||
              'Error al restablecer contraseña'}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary btn-full"
          disabled={resetPassword.isPending || !password || !confirmPassword}
        >
          {resetPassword.isPending ? (
            <>
              <CircularProgress size={20} color="inherit" />
              Actualizando...
            </>
          ) : (
            'Restablecer contraseña'
          )}
        </button>
      </form>

      <div className="auth-footer">
        <Link href="/" className="back-link">
          <ArrowBackIcon fontSize="small" />
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Layout>
      <div className="auth-page">
        <Suspense
          fallback={
            <div className="auth-container">
              <div className="loading-state">
                <CircularProgress size={50} />
                <p>Cargando...</p>
              </div>
            </div>
          }
        >
          <ResetPasswordContent />
        </Suspense>
      </div>

      <style jsx global>{`
        .auth-page {
          min-height: calc(100vh - 200px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
        }

        .auth-container {
          background: white;
          border-radius: 16px;
          padding: 2.5rem;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }

        .auth-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .auth-header .auth-icon {
          font-size: 3rem;
          color: #4f46e5;
          margin-bottom: 1rem;
        }

        .auth-header h1 {
          font-size: 1.5rem;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .auth-header p {
          color: #6b7280;
          font-size: 0.95rem;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-weight: 500;
          color: #374151;
          font-size: 0.9rem;
        }

        .form-group input {
          padding: 0.875rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s;
          width: 100%;
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

        .password-input {
          position: relative;
          display: flex;
          align-items: center;
        }

        .password-input input {
          padding-right: 3rem;
        }

        .toggle-password {
          position: absolute;
          right: 0.75rem;
          background: none;
          border: none;
          cursor: pointer;
          color: #6b7280;
          display: flex;
          align-items: center;
          padding: 0.25rem;
        }

        .toggle-password:hover {
          color: #4f46e5;
        }

        .error-message {
          background: #fef2f2;
          color: #dc2626;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.9rem;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.875rem 1.5rem;
          border-radius: 8px;
          font-weight: 500;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          text-decoration: none;
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

        .btn-full {
          width: 100%;
        }

        .auth-footer {
          margin-top: 1.5rem;
          text-align: center;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          color: #6b7280;
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.2s;
        }

        .back-link:hover {
          color: #4f46e5;
        }

        .loading-state,
        .error-state,
        .success-message {
          text-align: center;
          padding: 2rem 0;
        }

        .loading-state p,
        .error-state p,
        .success-message p {
          color: #6b7280;
          margin: 0.5rem 0;
        }

        .error-state .error-icon {
          font-size: 4rem;
          color: #dc2626;
          margin-bottom: 1rem;
        }

        .error-state h2,
        .success-message h2 {
          font-size: 1.5rem;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .success-message .success-icon {
          font-size: 4rem;
          color: #10b981;
          margin-bottom: 1rem;
        }

        .success-message .btn,
        .error-state .btn {
          margin-top: 1.5rem;
        }
      `}</style>
    </Layout>
  );
}
