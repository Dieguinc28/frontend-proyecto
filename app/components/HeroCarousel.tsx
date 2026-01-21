'use client';

import Image from 'next/image';

export default function HeroCarousel() {
  return (
    <div className="hero-banner">
      <Image
        src="/header-papeleria.jpg"
        alt="Productos de papelería"
        fill
        priority
        className="hero-image"
        style={{ objectFit: 'cover' }}
      />
      <div className="hero-overlay">
        <div className="hero-content">
          <h1 className="hero-title">COTIZADOR ONLINE</h1>
        </div>
      </div>
    </div>
  );
}
