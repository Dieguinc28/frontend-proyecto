'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../components/Layout';
import { useCurrentUser } from '../hooks/useAuth';
import ListUploader from '../components/ListUploader';
import ListGenerator from '../components/ListGenerator';
import CalculateIcon from '@mui/icons-material/Calculate';
import ListAltIcon from '@mui/icons-material/ListAlt';
import '../styles/lists.css';

export default function ListsPage() {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const [activeTab, setActiveTab] = useState<'cotizador' | 'generator'>(
    'cotizador',
  );

  const handleTabClick = (tab: 'cotizador' | 'generator') => {
    if (!user && tab === 'generator') {
      router.push('/login');
      return;
    }
    setActiveTab(tab);
  };

  return (
    <Layout>
      <div className="lists-page">
        {/* Hero Section */}
        <div className="lists-hero">
          <div className="lists-hero-content">
            <h1>CENTRO DE COTIZACIONES</h1>
            <p>Sube tu lista escolar o crea una nueva desde cero</p>
          </div>
        </div>

        <div className="container">
          {/* Tabs Navigation */}
          <div className="lists-tabs">
            <button
              className={`tab-btn ${activeTab === 'cotizador' ? 'active' : ''}`}
              onClick={() => handleTabClick('cotizador')}
            >
              <CalculateIcon fontSize="small" />
              Cotizador
            </button>
            <button
              className={`tab-btn ${activeTab === 'generator' ? 'active' : ''}`}
              onClick={() => handleTabClick('generator')}
            >
              <ListAltIcon fontSize="small" />
              Generador de Listas
            </button>
          </div>

          {/* Content */}
          <div className="lists-content">
            {activeTab === 'cotizador' && (
              <div className="tab-content">
                <ListUploader />
              </div>
            )}

            {activeTab === 'generator' && (
              <div className="tab-content">
                <ListGenerator />
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
