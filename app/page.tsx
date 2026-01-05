'use client';

import { useRef } from 'react';
import { useProducts } from './hooks/useProducts';
import Layout from './components/Layout';
import ProductCard from './components/ProductCard';
import HeroCarousel from './components/HeroCarousel';
import InventoryIcon from '@mui/icons-material/Inventory';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from 'next/link';

export default function Home() {
  const { data: products, isLoading } = useProducts();
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

      <section className="products-section">
        <div className="container">
          <div className="section-header">
            <InventoryIcon className="section-icon" />
            <h2>Nuestros Productos</h2>
            <p className="section-subtitle">
              Encuentra todo lo que necesitas para tu oficina y escuela
            </p>
          </div>
          {isLoading ? (
            <div className="loading-state">
              <CircularProgress size={50} />
              <p>Cargando productos...</p>
            </div>
          ) : products && products.length > 0 ? (
            <div className="products-carousel-wrapper">
              <button
                className="carousel-scroll-btn left"
                onClick={() => scroll('left')}
                aria-label="Anterior"
              >
                <ArrowBackIcon />
              </button>
              <div className="products-carousel" ref={scrollContainerRef}>
                {products.map((product, index) => (
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
          {products && products.length > 0 && (
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
