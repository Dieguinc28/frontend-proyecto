'use client';

import { useState, useMemo } from 'react';
import { useProducts } from '../hooks/useProducts';
import Layout from '../components/Layout';
import ProductCard from '../components/ProductCard';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import CircularProgress from '@mui/material/CircularProgress';
import CloseIcon from '@mui/icons-material/Close';

export default function ProductsPage() {
  const { data: products, isLoading } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Cerrar filtros al hacer clic en el overlay
  const handleOverlayClick = () => {
    setShowFilters(false);
  };

  // Obtener categorías únicas
  const categories = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];
    const cats = [
      ...new Set(
        products.map((p) => p.category || p.categoria).filter(Boolean)
      ),
    ];
    return cats;
  }, [products]);

  // Filtrar y ordenar productos
  const filteredProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];

    let filtered = products.filter((product) => {
      const name = product.name || product.nombre || '';
      const description = product.description || product.descripcion || '';

      const matchesSearch =
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        description.toLowerCase().includes(searchTerm.toLowerCase());

      const category = product.category || product.categoria;
      const matchesCategory =
        selectedCategory === 'all' || category === selectedCategory;

      const price =
        typeof product.price === 'number'
          ? product.price
          : typeof product.precioreferencial === 'number'
          ? product.precioreferencial
          : parseFloat(String(product.price || product.precioreferencial || 0));
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];

      return matchesSearch && matchesCategory && matchesPrice;
    });

    // Ordenar
    filtered.sort((a, b) => {
      const priceA =
        typeof a.price === 'number'
          ? a.price
          : typeof a.precioreferencial === 'number'
          ? a.precioreferencial
          : parseFloat(String(a.price || a.precioreferencial || 0));
      const priceB =
        typeof b.price === 'number'
          ? b.price
          : typeof b.precioreferencial === 'number'
          ? b.precioreferencial
          : parseFloat(String(b.price || b.precioreferencial || 0));

      switch (sortBy) {
        case 'price-asc':
          return priceA - priceB;
        case 'price-desc':
          return priceB - priceA;
        case 'name':
          const nameA = a.name || a.nombre || '';
          const nameB = b.name || b.nombre || '';
          return nameA.localeCompare(nameB);
        case 'newest':
          const dateA = a.createdAt || a.fechacreacion || '';
          const dateB = b.createdAt || b.fechacreacion || '';
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, searchTerm, selectedCategory, priceRange, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortBy('name');
  };

  return (
    <Layout>
      <div className="products-page">
        <div className="products-hero">
          <div className="container">
            <h1>Nuestros Productos</h1>
            <p>Encuentra todo lo que necesitas para tu oficina y escuela</p>
          </div>
        </div>

        <div className="container">
          <div className="products-toolbar">
            <div className="search-box">
              <SearchIcon className="search-icon" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input-products"
              />
              {searchTerm && (
                <button
                  className="clear-search"
                  onClick={() => setSearchTerm('')}
                >
                  <CloseIcon fontSize="small" />
                </button>
              )}
            </div>

            <div className="toolbar-actions">
              <button
                className="filter-toggle-btn"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FilterListIcon fontSize="small" />
                Filtros
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="name">Nombre A-Z</option>
                <option value="price-asc">Precio: Menor a Mayor</option>
                <option value="price-desc">Precio: Mayor a Menor</option>
                <option value="newest">Más Recientes</option>
              </select>

              <div className="view-toggle">
                <button
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <GridViewIcon fontSize="small" />
                </button>
                <button
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <ViewListIcon fontSize="small" />
                </button>
              </div>
            </div>
          </div>

          <div className="products-content">
            {showFilters && (
              <div
                className="filters-overlay"
                onClick={handleOverlayClick}
              ></div>
            )}
            <aside className={`filters-sidebar ${showFilters ? 'show' : ''}`}>
              <div className="filters-header">
                <h3>Filtros</h3>
                <button className="clear-filters-btn" onClick={clearFilters}>
                  Limpiar
                </button>
              </div>

              <div className="filter-section">
                <h4>Categorías</h4>
                <div className="filter-options">
                  <label className="filter-option">
                    <input
                      type="radio"
                      name="category"
                      value="all"
                      checked={selectedCategory === 'all'}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    />
                    <span>Todas</span>
                    <span className="count">{products?.length || 0}</span>
                  </label>
                  {categories.map((category) => (
                    <label key={category} className="filter-option">
                      <input
                        type="radio"
                        name="category"
                        value={category}
                        checked={selectedCategory === category}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                      />
                      <span>{category}</span>
                      <span className="count">
                        {
                          products?.filter(
                            (p) => (p.category || p.categoria) === category
                          ).length
                        }
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="filter-section">
                <h4>Disponibilidad</h4>
                <label className="filter-option">
                  <input type="checkbox" defaultChecked />
                  <span>En Stock</span>
                </label>
              </div>
            </aside>

            <div className="products-main">
              <div className="products-header">
                <p className="results-count">
                  {isLoading
                    ? 'Cargando...'
                    : `${filteredProducts.length} productos encontrados`}
                </p>
              </div>

              {isLoading ? (
                <div className="loading-state">
                  <CircularProgress size={50} />
                  <p>Cargando productos...</p>
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className={`products-display ${viewMode}`}>
                  {filteredProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="no-results">
                  <SearchIcon className="no-results-icon" />
                  <h3>No se encontraron productos</h3>
                  <p>Intenta ajustar los filtros o buscar otro término</p>
                  <button className="btn btn-primary" onClick={clearFilters}>
                    Limpiar Filtros
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
