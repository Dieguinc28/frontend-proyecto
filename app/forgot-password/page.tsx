'use client';

import { useState } from 'react';
import { useForgotPassword } from '../hooks/useAuth';
import Layout from '../components/Layout';
import Link from 'next/link';
import EmailIcon from '@mui/icons-material/Email';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircularProgress from '@mui/material/CircularProgress';

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
    <Layout>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem 2rem',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)',
          minHeight: 'calc(100vh - 88px)',
          width: '100%',
        }}
      >
        <div
          style={{
            background: 'white',
            borderRadius: '20px',
            padding: '3rem',
            width: '100%',
            maxWidth: '450px',
            boxShadow: '0 15px 50px rgba(0, 0, 0, 0.12)',
          }}
        >
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
                  color: '#1f2937',
                  marginBottom: '1rem',
                }}
              >
                Revisa tu correo
              </h2>
              <p
                style={{
                  color: '#6b7280',
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
                  color: '#9ca3af',
                  marginBottom: '1.5rem',
                }}
              >
                El enlace expirará en 1 hora. Revisa también tu carpeta de spam.
              </p>
              <Link
                href="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.875rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: 500,
                  fontSize: '1rem',
                  background: '#4f46e5',
                  color: 'white',
                  textDecoration: 'none',
                }}
              >
                <ArrowBackIcon fontSize="small" />
                Volver al inicio
              </Link>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <EmailIcon
                  style={{
                    fontSize: '4rem',
                    color: '#4f46e5',
                    marginBottom: '1rem',
                    display: 'block',
                    margin: '0 auto 1rem',
                  }}
                />
                <h1
                  style={{
                    fontSize: '1.75rem',
                    color: '#1f2937',
                    marginBottom: '0.75rem',
                    margin: '0 0 0.75rem 0',
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </h1>
                <p
                  style={{
                    color: '#6b7280',
                    fontSize: '1rem',
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  Ingresa tu email y te enviaremos un enlace para restablecer tu
                  contraseña.
                </p>
              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.5rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <label
                    htmlFor="email"
                    style={{
                      fontWeight: 500,
                      color: '#374151',
                      fontSize: '1rem',
                    }}
                  >
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    disabled={forgotPassword.isPending}
                    style={{
                      padding: '1rem 1.25rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '1rem',
                      width: '100%',
                      boxSizing: 'border-box',
                      outline: 'none',
                      background: forgotPassword.isPending
                        ? '#f3f4f6'
                        : 'white',
                    }}
                  />
                </div>

                {forgotPassword.isError && (
                  <div
                    style={{
                      background: '#fef2f2',
                      color: '#dc2626',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                    }}
                  >
                    {(forgotPassword.error as Error)?.message ||
                      'Error al enviar el correo'}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={forgotPassword.isPending || !email.trim()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '1rem 1.5rem',
                    borderRadius: '10px',
                    fontWeight: 600,
                    fontSize: '1rem',
                    cursor:
                      forgotPassword.isPending || !email.trim()
                        ? 'not-allowed'
                        : 'pointer',
                    border: 'none',
                    background:
                      forgotPassword.isPending || !email.trim()
                        ? '#9ca3af'
                        : '#4f46e5',
                    color: 'white',
                    width: '100%',
                  }}
                >
                  {forgotPassword.isPending ? (
                    <>
                      <CircularProgress size={20} color="inherit" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar enlace de recuperación'
                  )}
                </button>
              </form>

              {/* Footer */}
              <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <Link
                  href="/"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    color: '#6b7280',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                  }}
                >
                  <ArrowBackIcon fontSize="small" />
                  Volver al inicio
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
