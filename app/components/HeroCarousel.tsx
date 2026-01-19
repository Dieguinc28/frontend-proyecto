'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const images = [
  { src: '/imagen-1.jpg', alt: 'Productos de papelería' },
  { src: '/imagen2.jpg', alt: 'Útiles escolares' },
  { src: '/imagen3.jpg', alt: 'Material de oficina' },
  { src: '/imagen4.jpg', alt: 'Artículos de papelería' },
];

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="hero-carousel">
      <div className="carousel-container">
        <div className="carousel-slides">
          {images.map((image, index) => (
            <div
              key={index}
              className={`carousel-slide ${
                index === currentIndex ? 'active' : ''
              }`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                priority={index === 0}
                className="carousel-image"
              />
              <div className="carousel-overlay">
                <div className="carousel-content">
                  <h1>Papelería Lady Laura</h1>
                  <p>Todo lo que necesitas para tu oficina y escuela</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          className="carousel-button prev"
          onClick={goToPrevious}
          aria-label="Anterior"
        >
          ‹
        </button>
        <button
          className="carousel-button next"
          onClick={goToNext}
          aria-label="Siguiente"
        >
          ›
        </button>

        <div className="carousel-dots">
          {images.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Ir a imagen ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
