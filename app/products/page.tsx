'use client';

import { useState, useMemo, useEffect } from 'react';
import { useProducts } from '../hooks/useProducts';
import Layout from '../components/Layout';
import ProductGroupCard from '../components/ProductGroupCard';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import CircularProgress from '@mui/material/CircularProgress';
import CloseIcon from '@mui/icons-material/Close';
import type { Product } from '../types';

interface ProductGroup {
  mainProduct: Product;
  variants: Product[];
}

export default function ProductsPage() {
  const { data: products, isLoading } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Debug: Log products count
  useEffect(() => {
    if (products) {
      console.log(`Total products loaded: ${products.length}`);
    }
  }, [products]);

  const handleOverlayClick = () => {
    setShowFilters(false);
  };

  // Función para obtener el nombre base del producto (sin color, tamaño, etc.)
  const getBaseProductName = (name: string): string => {
    let baseName = name.toLowerCase().trim();

    // Eliminar emojis y símbolos
    baseName = baseName.replace(/[⬛⬜🟦🟥🟩🟨🟪🟧]/g, '').trim();

    // Eliminar colores comunes
    const colorsToRemove = [
      'negro',
      'negra',
      'azul',
      'rojo',
      'roja',
      'verde',
      'amarillo',
      'amarilla',
      'blanco',
      'blanca',
      'rosa',
      'rosada',
      'morado',
      'morada',
      'naranja',
      'gris',
      'celeste',
    ];

    colorsToRemove.forEach((color) => {
      baseName = baseName.replace(new RegExp(`\\b${color}\\b`, 'gi'), '');
    });

    // Eliminar tamaños y tipos
    const sizesToRemove = [
      'pliego',
      'a4',
      'punta fina',
      'punta gruesa',
      'x12',
      'x24',
      'x4',
      'x6',
    ];
    sizesToRemove.forEach((size) => {
      baseName = baseName.replace(new RegExp(`\\b${size}\\b`, 'gi'), '');
    });

    // Eliminar paquete/caja
    baseName = baseName.replace(/\bpaquete\b/gi, '');
    baseName = baseName.replace(/\bcaja\b/gi, '');

    // Normalizar espacios
    baseName = baseName.replace(/\s+/g, ' ').trim();

    return baseName;
  };

  // Agrupar productos por nombre base y marca
  const groupedProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];

    const groups: ProductGroup[] = [];
    const processedIds = new Set<string>();

    products.forEach((product) => {
      const productId = product._id || String(product.idproducto);

      if (processedIds.has(productId)) return;

      const productName = product.name || product.nombre || '';
      const baseName = getBaseProductName(productName);
      const productBrand = (product.marca || '').toLowerCase().trim();

      // Buscar productos similares (mismo nombre base y misma marca)
      const variants = products.filter((p) => {
        const pId = p._id || String(p.idproducto);
        if (pId === productId || processedIds.has(pId)) return false;

        const pName = p.name || p.nombre || '';
        const pBaseName = getBaseProductName(pName);
        const pBrand = (p.marca || '').toLowerCase().trim();

        // Agrupar si tienen el mismo nombre base Y la misma marca
        return pBaseName === baseName && productBrand === pBrand;
      });

      // Marcar todos los productos del grupo como procesados
      processedIds.add(productId);
      variants.forEach((v) => {
        const vId = v._id || String(v.idproducto);
        processedIds.add(vId);
      });

      groups.push({
        mainProduct: product,
        variants: variants,
      });
    });

    console.log(
      `Agrupados ${products.length} productos en ${groups.length} grupos`,
    );
    return groups;
  }, [products]);

  // Obtener categorías únicas
  const categories = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];
    const cats = [
      ...new Set(
        products.map((p) => p.category || p.categoria).filter(Boolean),
      ),
    ];
    return cats;
  }, [products]);

  // Filtrar y ordenar grupos de productos
  const filteredGroups = useMemo(() => {
    if (!groupedProducts || groupedProducts.length === 0) return [];

    let filtered = groupedProducts.filter((group) => {
      const product = group.mainProduct;
      const name = product.name || product.nombre || '';
      const description = product.description || product.descripcion || '';

      const matchesSearch =
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        description.toLowerCase().includes(searchTerm.toLowerCase());

      const category = product.category || product.categoria;
      const matchesCategory =
        selectedCategory === 'all' || category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    // Ordenar grupos
    filtered.sort((a, b) => {
      const productA = a.mainProduct;
      const productB = b.mainProduct;

      const priceA =
        typeof productA.price === 'number'
          ? productA.price
          : typeof productA.precioreferencial === 'number'
            ? productA.precioreferencial
            : parseFloat(
                String(productA.price || productA.precioreferencial || 0),
              );
      const priceB =
        typeof productB.price === 'number'
          ? productB.price
          : typeof productB.precioreferencial === 'number'
            ? productB.precioreferencial
            : parseFloat(
                String(productB.price || productB.precioreferencial || 0),
              );

      switch (sortBy) {
        case 'price-asc':
          return priceA - priceB;
        case 'price-desc':
          return priceB - priceA;
        case 'name':
          const nameA = productA.name || productA.nombre || '';
          const nameB = productB.name || productB.nombre || '';
          return nameA.localeCompare(nameB);
        case 'newest':
          const dateA = productA.createdAt || productA.fechacreacion || '';
          const dateB = productB.createdAt || productB.fechacreacion || '';
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [groupedProducts, searchTerm, selectedCategory, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortBy('name');
    setCurrentPage(1);
  };

  // Calcular grupos paginados
  const totalPages = Math.ceil(filteredGroups.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedGroups = filteredGroups.slice(startIndex, endIndex);

  // Resetear a página 1 cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, sortBy]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
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
                            (p) => (p.category || p.categoria) === category,
                          ).length
                        }
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </aside>

            <div className="products-main">
              <div className="products-header">
                <p className="results-count">
                  {isLoading
                    ? 'Cargando...'
                    : `${filteredGroups.length} productos encontrados`}
                </p>
                {filteredGroups.length > 0 && (
                  <div className="items-per-page">
                    <label>Mostrar:</label>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="items-select"
                    >
                      <option value={12}>12</option>
                      <option value={24}>24</option>
                      <option value={36}>36</option>
                      <option value={48}>48</option>
                    </select>
                  </div>
                )}
              </div>

              {isLoading ? (
                <div className="loading-state">
                  <CircularProgress size={50} />
                  <p>Cargando productos...</p>
                </div>
              ) : filteredGroups.length > 0 ? (
                <>
                  <div className={`products-display ${viewMode}`}>
                    {paginatedGroups.map((group, index) => (
                      <ProductGroupCard
                        key={
                          group.mainProduct._id ||
                          group.mainProduct.idproducto ||
                          index
                        }
                        mainProduct={group.mainProduct}
                        variants={group.variants}
                      />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="pagination">
                      <button
                        className="pagination-btn"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Anterior
                      </button>

                      <div className="pagination-numbers">
                        {getPageNumbers().map((page, index) =>
                          page === '...' ? (
                            <span
                              key={`ellipsis-${index}`}
                              className="pagination-ellipsis"
                            >
                              ...
                            </span>
                          ) : (
                            <button
                              key={page}
                              className={`pagination-number ${
                                currentPage === page ? 'active' : ''
                              }`}
                              onClick={() => handlePageChange(page as number)}
                            >
                              {page}
                            </button>
                          ),
                        )}
                      </div>

                      <button
                        className="pagination-btn"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Siguiente
                      </button>
                    </div>
                  )}
                </>
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
