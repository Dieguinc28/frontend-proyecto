'use client';

import { useState } from 'react';
import { useForgotPassword } from '../hooks/useAuth';
import Link from 'next/link';
import EmailIcon from '@mui/icons-material/Email';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SendIcon from '@mui/icons-material/Send';
import '../styles/auth-pages.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const forgotPassword = useForgotPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      await forgotPassword.mutateAsync(email);
      setSubmitted(true);
    } catch (error) {
      // El error se maneja en el mutation
    }
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

        {submitted ? (
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
              Revisa tu correo
            </h2>
            <p
              style={{
                color: '#64748b',
                marginBottom: '0.5rem',
                lineHeight: 1.5,
              }}
            >
              Si existe una cuenta con el email <strong>{email}</strong>,
              recibirás un enlace para restablecer tu contraseña.
            </p>
            <p
              style={{
                fontSize: '0.85rem',
                color: '#94a3b8',
                marginBottom: '1.5rem',
              }}
            >
              El enlace expirará en 1 hora. Revisa también tu carpeta de spam.
            </p>
            <Link href="/login" className="btn-submit">
              Ir a iniciar sesión
            </Link>
          </div>
        ) : (
          <>
            <div className="auth-header">
              <EmailIcon
                style={{
                  fontSize: '3rem',
                  color: '#1a1a1a',
                  marginBottom: '1rem',
                }}
              />
              <h1>¿Olvidaste tu contraseña?</h1>
              <p>
                Ingresa tu email y te enviaremos un enlace para restablecer tu
                contraseña.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {forgotPassword.isError && (
                <div className="error-message">
                  {(forgotPassword.error as Error)?.message ||
                    'Error al enviar el correo'}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">Correo electrónico</label>
                <div className="input-with-icon">
                  <EmailIcon className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ingresa tu correo electrónico"
                    required
                    disabled={forgotPassword.isPending}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-submit"
                disabled={forgotPassword.isPending || !email.trim()}
              >
                {forgotPassword.isPending ? (
                  'Enviando...'
                ) : (
                  <>
                    <SendIcon fontSize="small" />
                    Enviar enlace de recuperación
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
          </>
        )}
      </div>
    </div>
  );
}
