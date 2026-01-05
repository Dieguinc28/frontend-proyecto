'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../components/Layout';
import { useCurrentUser } from '../hooks/useAuth';
import AuthModal from '../components/AuthModal';
import ListUploader from '../components/ListUploader';
import ListGenerator from '../components/ListGenerator';
import '../styles/lists.css';

export default function ListsPage() {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'cart' | 'generator' | 'upload'>(
    'upload'
  );

  const handleTabClick = (tab: 'cart' | 'generator' | 'upload') => {
    if (!user && tab !== 'upload') {
      setShowAuthModal(true);
      return;
    }
    setActiveTab(tab);
  };

  const handleGoToCart = () => {
    router.push('/cart');
  };

  return (
    <Layout>
      <div className="lists-page">
        <div className="container">
          {/* Header */}
          <div className="lists-header">
            <h1>PAPELERÍA LADY LAURA</h1>
          </div>

          {/* Tabs Navigation */}
          <div className="lists-tabs">
            <button
              className={`tab-btn ${activeTab === 'cart' ? 'active' : ''}`}
              onClick={() => handleTabClick('cart')}
            >
              Carrito
            </button>
            <button
              className={`tab-btn ${activeTab === 'generator' ? 'active' : ''}`}
              onClick={() => handleTabClick('generator')}
            >
              Generador de Listas
            </button>
            <button
              className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => handleTabClick('upload')}
            >
              Subir Archivos
            </button>
          </div>

          {/* Content */}
          <div className="lists-content">
            {activeTab === 'cart' && (
              <div className="tab-content">
                <p>Redirigiendo al carrito...</p>
                <button className="btn btn-primary" onClick={handleGoToCart}>
                  Ir al Carrito
                </button>
              </div>
            )}

            {activeTab === 'generator' && (
              <div className="tab-content">
                <ListGenerator />
              </div>
            )}

            {activeTab === 'upload' && (
              <div className="tab-content">
                <ListUploader />
              </div>
            )}
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="login"
      />
    </Layout>
  );
}
