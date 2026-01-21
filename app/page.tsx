'use client';

import { useRef } from 'react';
import { useProductosDestacados } from './hooks/useProducts';
import Layout from './components/Layout';
import ProductCard from './components/ProductCard';
import HeroCarousel from './components/HeroCarousel';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from 'next/link';

export default function Home() {
  const { data: productos, isLoading } = useProductosDestacados(8);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === 'right' ? scrollAmount : -scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    }
  };

  return (
    <Layout>
      <HeroCarousel />

      {/* Cotizador Info Section */}
      <section className="home-cotizador-section">
        <div className="container">
          <div className="home-cotizador-content">
            <h2 className="home-cotizador-subtitle">
              REALIZA UNA COTIZACIÓN ONLINE
            </h2>
            <h3 className="home-cotizador-title">
              Y LLÉVATE TUS ÚTILES ESCOLARES AL MEJOR PRECIO
            </h3>
          </div>
        </div>
      </section>

      <section className="products-section">
        <div className="container">
          <div className="section-header">
            <h2>Productos Recomendados</h2>
            <p className="section-subtitle">
              Los mejores productos con los mejores precios para ti
            </p>
          </div>
          {isLoading ? (
            <div className="loading-state">
              <CircularProgress size={50} />
              <p>Cargando productos...</p>
            </div>
          ) : productos && productos.length > 0 ? (
            <div className="products-carousel-wrapper">
              <button
                className="carousel-scroll-btn left"
                onClick={() => scroll('left')}
                aria-label="Anterior"
              >
                <ArrowBackIcon />
              </button>
              <div className="products-carousel" ref={scrollContainerRef}>
                {productos.map((product, index) => (
                  <div
                    key={product._id || `product-${index}`}
                    className="product-carousel-item"
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
              <button
                className="carousel-scroll-btn right"
                onClick={() => scroll('right')}
                aria-label="Siguiente"
              >
                <ArrowForwardIcon />
              </button>
            </div>
          ) : (
            <div className="empty-state">
              <SearchOffIcon className="empty-icon" />
              <h3>No hay productos disponibles</h3>
              <p>
                Actualmente no tenemos productos en stock. Vuelve pronto para
                ver nuestras novedades.
              </p>
            </div>
          )}
          {productos && productos.length > 0 && (
            <div className="view-all-products">
              <Link href="/products" className="btn btn-primary">
                Ver Todos los Productos
                <ArrowForwardIcon fontSize="small" />
              </Link>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
