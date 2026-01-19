'use client';

import { useState, useMemo } from 'react';
import { useProducts } from '../hooks/useProducts';
import Layout from '../components/Layout';
import ProductCard from '../components/ProductCard';
import ProductWithScrollableVariants from '../components/ProductWithScrollableVariants';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import CircularProgress from '@mui/material/CircularProgress';
import CloseIcon from '@mui/icons-material/Close';
import type { Product } from '../types';

// Función para extraer el nombre base del producto (sin color/variante/tamaño)
const getBaseProductName = (name: string): string => {
  // Remover colores
  const colorPatterns =
    /\s*(azul|rojo|negro|verde|amarillo|rosa|morado|naranja|blanco|gris)s?$/i;
  // Remover tamaños
  const sizePatterns =
    /\s*(grande|mediano|pequeño|chico|mini|xl|xxl|xs|pequeña|mediana|grande|extra)$/i;
  // Remover números de unidades al final
  const unitPatterns = /\s*\d+\s*(unidades|pzs|pz|pcs|pack|u)$/i;

  return name
    .replace(colorPatterns, '')
    .replace(sizePatterns, '')
    .replace(unitPatterns, '')
    .trim();
};

// Función para detectar si un producto tiene variantes
const hasVariant = (name: string): boolean => {
  const variantPatterns =
    /(azul|rojo|negro|verde|amarillo|rosa|morado|naranja|blanco|gris|grande|mediano|pequeño|chico|mini|xl|xxl|xs|pequeña|mediana|extra)s?$/i;
  return variantPatterns.test(name);
};

// Función para extraer el tipo de variante
const extractVariantType = (
  name: string,
): { type: string; value: string } | null => {
  const colorMatch = name.match(
    /(azul|rojo|negro|verde|amarillo|rosa|morado|naranja|blanco|gris)s?$/i,
  );
  if (colorMatch) {
    return { type: 'color', value: colorMatch[1].toLowerCase() };
  }

  const sizeMatch = name.match(
    /(grande|mediano|pequeño|chico|mini|xl|xxl|xs|pequeña|mediana|extra)$/i,
  );
  if (sizeMatch) {
    return { type: 'size', value: sizeMatch[1].toLowerCase() };
  }

  return null;
};

// Función para normalizar nombre para agrupación
const normalizeForGrouping = (name: string, marca: string): string => {
  // Extraer primera palabra significativa (tipo de producto)
  const baseName = getBaseProductName(name);
  const firstWord = baseName.split(/\s+/)[0].toLowerCase();

  // Productos que típicamente tienen variantes
  const groupableProducts = [
    'tijera',
    'lapiz',
    'boligrafo',
    'lapicero',
    'cuaderno',
    'libreta',
    'marcador',
    'plumon',
    'borrador',
    'regla',
    'carpeta',
    'folder',
    'cartuchera',
    'estuche',
    'mochila',
    'colores',
    'crayones',
    'goma',
  ];

  // Si es un producto agrupable, usar nombre base + marca
  if (
    groupableProducts.some(
      (p) => firstWord.includes(p) || p.includes(firstWord),
    )
  ) {
    return `${baseName}-${marca}`.toLowerCase();
  }

  return `${name}-${marca}-unique`.toLowerCase();
};

interface ProductGroup {
  baseProduct: Product;
  variants: Product[];
  hasVariants: boolean;
}

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
        products.map((p) => p.category || p.categoria).filter(Boolean),
      ),
    ];
    return cats;
  }, [products]);

  // Agrupar productos por nombre base similar (estilo Temu)
  const groupedProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];

    const groups: Map<string, ProductGroup> = new Map();

    // Primera pasada: agrupar todos los productos por nombre base
    products.forEach((product) => {
      const name = product.name || product.nombre || '';
      const marca = product.marca || '';
      const key = normalizeForGrouping(name, marca);

      if (groups.has(key)) {
        groups.get(key)!.variants.push(product);
      } else {
        groups.set(key, {
          baseProduct: product,
          variants: [product],
          hasVariants: false,
        });
      }
    });

    // Convertir grupos a array
    const result: ProductGroup[] = [];

    groups.forEach((group) => {
      if (group.variants.length > 1) {
        // Tiene múltiples variantes
        // Ordenar variantes por precio (menor primero como principal)
        group.variants.sort((a, b) => {
          const priceA = a.price || a.precioreferencial || 0;
          const priceB = b.price || b.precioreferencial || 0;
          return priceA - priceB;
        });

        // Calcular stock total
        const totalStock = group.variants.reduce(
          (sum, v) => sum + (v.stock || 0),
          0,
        );

        // El producto con mejor precio es el principal
        const baseProduct = { ...group.variants[0] };
        const baseName = getBaseProductName(
          baseProduct.name || baseProduct.nombre || '',
        );

        // Actualizar nombre base si hay variantes
        if (hasVariant(baseProduct.name || baseProduct.nombre || '')) {
          baseProduct.name = baseName;
          baseProduct.nombre = baseName;
        }
        baseProduct.stock = totalStock;

        result.push({
          baseProduct,
          variants: group.variants,
          hasVariants: true,
        });
      } else {
        // Solo un producto, mostrar normal
        result.push({
          baseProduct: group.variants[0],
          variants: [group.variants[0]],
          hasVariants: false,
        });
      }
    });

    return result;
  }, [products]);

  // Filtrar y ordenar productos agrupados
  const filteredProducts = useMemo(() => {
    if (!groupedProducts.length) return [];

    let filtered = groupedProducts.filter((group) => {
      const product = group.baseProduct;
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
            : parseFloat(
                String(product.price || product.precioreferencial || 0),
              );
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];

      return matchesSearch && matchesCategory && matchesPrice;
    });

    // Ordenar
    filtered.sort((a, b) => {
      const productA = a.baseProduct;
      const productB = b.baseProduct;

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
  }, [groupedProducts, searchTerm, selectedCategory, priceRange, sortBy]);

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
                            (p) => (p.category || p.categoria) === category,
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
                  {filteredProducts.map((group) =>
                    group.hasVariants && group.variants.length > 1 ? (
                      <ProductWithScrollableVariants
                        key={group.baseProduct._id}
                        principal={group.baseProduct}
                        variantes={group.variants}
                      />
                    ) : (
                      <ProductCard
                        key={group.baseProduct._id}
                        product={group.baseProduct}
                      />
                    ),
                  )}
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
