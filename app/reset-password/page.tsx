'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useVerifyResetToken, useResetPassword } from '../hooks/useAuth';
import Link from 'next/link';
import LockResetIcon from '@mui/icons-material/LockReset';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import '../styles/auth-pages.css';

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
      <div className="auth-page">
        <div className="auth-background">
          <div className="auth-overlay"></div>
        </div>
        <div className="auth-container">
          <Link href="/" className="back-button">
            <ArrowBackIcon />
            Volver al inicio
          </Link>
          <div className="auth-card">
            <div style={{ textAlign: 'center' }}>
              <ErrorIcon
                style={{
                  fontSize: '4rem',
                  color: '#ef4444',
                  marginBottom: '1rem',
                }}
              />
              <h2
                style={{
                  fontSize: '1.5rem',
                  color: '#1a1a1a',
                  marginBottom: '1rem',
                  fontFamily: 'Aksioma, sans-serif',
                }}
              >
                Enlace inválido
              </h2>
              <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                El enlace de recuperación no es válido o ha expirado.
              </p>
              <Link href="/forgot-password" className="btn-submit">
                Solicitar nuevo enlace
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (verifying) {
    return (
      <div className="auth-page">
        <div className="auth-background">
          <div className="auth-overlay"></div>
        </div>
        <div className="auth-container">
          <div className="auth-card">
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  border: '4px solid #e2e8f0',
                  borderTop: '4px solid var(--primary)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 1rem',
                }}
              />
              <p style={{ color: '#64748b' }}>Verificando enlace...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tokenInvalid) {
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
          <div className="auth-card">
            <div style={{ textAlign: 'center' }}>
              <ErrorIcon
                style={{
                  fontSize: '4rem',
                  color: '#ef4444',
                  marginBottom: '1rem',
                }}
              />
              <h2
                style={{
                  fontSize: '1.5rem',
                  color: '#1a1a1a',
                  marginBottom: '1rem',
                  fontFamily: 'Aksioma, sans-serif',
                }}
              >
                Enlace expirado
              </h2>
              <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                Este enlace de recuperación ha expirado o ya fue utilizado.
              </p>
              <Link href="/forgot-password" className="btn-submit">
                Solicitar nuevo enlace
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
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
          <div className="auth-card">
            <div style={{ textAlign: 'center' }}>
              <CheckCircleIcon
                style={{
                  fontSize: '4rem',
                  color: '#10b981',
                  marginBottom: '1rem',
                }}
              />
              <h2
                style={{
                  fontSize: '1.5rem',
                  color: '#1a1a1a',
                  marginBottom: '1rem',
                  fontFamily: 'Aksioma, sans-serif',
                }}
              >
                ¡Contraseña actualizada!
              </h2>
              <p style={{ color: '#64748b', marginBottom: '0.5rem' }}>
                Tu contraseña ha sido restablecida exitosamente.
              </p>
              <p
                style={{
                  color: '#64748b',
                  marginBottom: '1.5rem',
                }}
              >
                Ya puedes iniciar sesión con tu nueva contraseña.
              </p>
              <Link href="/login" className="btn-submit">
                Ir a iniciar sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

        <div className="auth-card">
          <div className="auth-header">
            <LockResetIcon
              style={{
                fontSize: '3rem',
                color: 'var(--primary)',
                marginBottom: '1rem',
              }}
            />
            <h1>Nueva contraseña</h1>
            <p>
              Ingresa tu nueva contraseña para la cuenta:{' '}
              <strong>{tokenData?.email}</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="password">Nueva contraseña</label>
              <div className="input-with-icon">
                <LockIcon className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  disabled={resetPassword.isPending}
                  style={{ paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.25rem',
                  }}
                >
                  {showPassword ? (
                    <VisibilityOffIcon fontSize="small" />
                  ) : (
                    <VisibilityIcon fontSize="small" />
                  )}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar contraseña</label>
              <div className="input-with-icon">
                <LockIcon className="input-icon" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
                  required
                  disabled={resetPassword.isPending}
                  style={{ paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.25rem',
                  }}
                >
                  {showConfirmPassword ? (
                    <VisibilityOffIcon fontSize="small" />
                  ) : (
                    <VisibilityIcon fontSize="small" />
                  )}
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
              className="btn-submit"
              disabled={
                resetPassword.isPending || !password || !confirmPassword
              }
            >
              {resetPassword.isPending ? (
                'Actualizando...'
              ) : (
                <>
                  <LockResetIcon fontSize="small" />
                  Restablecer contraseña
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
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="auth-page">
          <div className="auth-background">
            <div className="auth-overlay"></div>
          </div>
          <div className="auth-container">
            <div className="auth-card">
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    border: '4px solid #e2e8f0',
                    borderTop: '4px solid var(--primary)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 1rem',
                  }}
                />
                <p style={{ color: '#64748b' }}>Cargando...</p>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
