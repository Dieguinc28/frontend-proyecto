'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { apiClient } from '../lib/apiClient';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import RefreshIcon from '@mui/icons-material/Refresh';

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  image: string;
  category?: string;
  marca?: string;
  similarity: number;
}

interface SearchResult {
  searchTerm: string;
  quantity: number;
  found: boolean;
  confidence?: 'high' | 'medium' | 'none';
  products: Product[];
}

interface Stats {
  total: number;
  found: number;
  notFound: number;
  highConfidence: number;
  mediumConfidence: number;
  successRate: number;
}

interface ProductWithQuantity {
  product: Product;
  quantity: number;
}

interface FileQuoteUploaderProps {
  onAddProducts: (products: ProductWithQuantity[]) => void;
}

interface ProcessResponse {
  success: boolean;
  stats: Stats;
  results: SearchResult[];
  extractedText?: string;
}

export default function FileQuoteUploader({
  onAddProducts,
}: FileQuoteUploaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Map<string, number>>(
    new Map(),
  );

  // ESTADO DEL FILTRO: 'all' (todos), 'found' (encontrados), 'not_found' (no encontrados)
  const [filterMode, setFilterMode] = useState<'all' | 'found' | 'not_found'>(
    'all',
  );

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles: 1,
    maxSize: 15 * 1024 * 1024, // 15MB
  });

  const handleUpload = async () => {
    if (!file) {
      setError('Por favor selecciona un archivo');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResults(null);
    setStats(null);
    setFilterMode('all'); // Reset al subir nuevo

    try {
      const formData = new FormData();
      const isPdf = file.type === 'application/pdf';

      if (isPdf) {
        formData.append('pdf', file);
      } else {
        formData.append('image', file);
      }

      const endpoint = isPdf ? '/pdf-quote/process' : '/image-quote/process';

      const { data } = await apiClient.post<ProcessResponse>(
        endpoint,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      setResults(data.results);
      setStats(data.stats);

      const autoSelected = new Map<string, number>();
      data.results.forEach((result) => {
        if (result.found && result.products.length > 0) {
          const bestMatch = result.products[0];
          if (result.confidence === 'high' || bestMatch.similarity >= 70) {
            autoSelected.set(
              `${result.searchTerm}-${bestMatch.id}`,
              bestMatch.id,
            );
          }
        }
      });
      setSelectedProducts(autoSelected);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al procesar el archivo');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleProductSelection = (searchTerm: string, productId: number) => {
    const key = `${searchTerm}-${productId}`;
    const newSelected = new Map(selectedProducts);

    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.set(key, productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleAddToCart = () => {
    if (!results) return;

    const productsToAdd: ProductWithQuantity[] = [];
    const addedIds = new Set<number>();

    results.forEach((result) => {
      result.products.forEach((product) => {
        const key = `${result.searchTerm}-${product.id}`;
        if (selectedProducts.has(key) && !addedIds.has(product.id)) {
          productsToAdd.push({
            product: product,
            quantity: result.quantity || 1,
          });
          addedIds.add(product.id);
        }
      });
    });

    onAddProducts(productsToAdd);
    handleClose();
  };

  const handleClose = () => {
    setIsOpen(false);
    setFile(null);
    setResults(null);
    setStats(null);
    setError(null);
    setSelectedProducts(new Map());
    setFilterMode('all');
  };

  const getFileIcon = () => {
    if (!file) return <UploadFileIcon style={{ fontSize: '3rem' }} />;
    return file.type === 'application/pdf' ? (
      <PictureAsPdfIcon style={{ fontSize: '3rem', color: '#ef4444' }} />
    ) : (
      <ImageIcon style={{ fontSize: '3rem', color: '#3b82f6' }} />
    );
  };

  const getConfidenceBadge = (confidence?: string, similarity?: number) => {
    // No mostrar badges de confianza
    return null;
  };

  // --- FILTRADO DE LA LISTA ---
  const filteredResults =
    results?.filter((r) => {
      if (filterMode === 'found') return r.found;
      if (filterMode === 'not_found') return !r.found;
      return true; // 'all'
    }) || [];

  return (
    <>
      <button
        className="btn btn-secondary pdf-quote-btn"
        onClick={() => setIsOpen(true)}
      >
        <UploadFileIcon fontSize="small" />
        Subir Lista (PDF/Imagen)
      </button>

      {isOpen && (
        <div className="modal-overlay" onClick={handleClose}>
          <div
            className="modal-content file-quote-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>📋 Cotización Automática</h3>
              <button className="modal-close" onClick={handleClose}>
                <CloseIcon />
              </button>
            </div>

            <div className="modal-body">
              {!results ? (
                <>
                  <p className="file-instructions">
                    Sube una <strong>foto de tu lista</strong> o un{' '}
                    <strong>PDF con los materiales</strong>.
                  </p>

                  <div
                    {...getRootProps()}
                    className={`file-dropzone ${isDragActive ? 'active' : ''} ${
                      file ? 'has-file' : ''
                    }`}
                  >
                    <input {...getInputProps()} />
                    {getFileIcon()}
                    <span className="dropzone-text">
                      {file ? (
                        <>
                          <strong>{file.name}</strong>
                          <small>
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </small>
                        </>
                      ) : (
                        'Arrastra un archivo aquí...'
                      )}
                    </span>
                  </div>

                  {error && (
                    <div className="error-message">
                      <ErrorIcon fontSize="small" />
                      {error}
                    </div>
                  )}

                  <button
                    className="btn btn-primary btn-block"
                    onClick={handleUpload}
                    disabled={!file || isProcessing}
                  >
                    {isProcessing ? '🔄 Procesando...' : '🚀 Procesar Archivo'}
                  </button>
                </>
              ) : (
                <>
                  {stats && (
                    <div className="file-results-summary">
                      {/* --- AQUÍ ESTÁN LOS NUEVOS BOTONES --- */}
                      <div className="filter-buttons-container">
                        {/* Botón 1: VER ENCONTRADOS */}
                        <button
                          className={`main-filter-btn found ${filterMode === 'found' ? 'active' : ''}`}
                          onClick={() => setFilterMode('found')}
                        >
                          <VisibilityIcon fontSize="small" />
                          <span>Ver Encontrados ({stats.found})</span>
                        </button>

                        {/* Botón 2: VER NO ENCONTRADOS */}
                        <button
                          className={`main-filter-btn not-found ${filterMode === 'not_found' ? 'active' : ''}`}
                          onClick={() => setFilterMode('not_found')}
                        >
                          <VisibilityOffIcon fontSize="small" />
                          <span>No Encontrados ({stats.notFound})</span>
                        </button>

                        {/* Botón 3: RESETEAR (VER TODOS) */}
                        <button
                          className={`main-filter-btn all ${filterMode === 'all' ? 'active' : ''}`}
                          onClick={() => setFilterMode('all')}
                          title="Ver Todos"
                        >
                          <RefreshIcon fontSize="small" />
                        </button>
                      </div>

                      <div className="stats-badges-simple">
                        <small>
                          Tasa de éxito: <strong>{stats.successRate}%</strong>
                        </small>
                      </div>
                    </div>
                  )}

                  <div className="file-results-list">
                    {filteredResults.length === 0 ? (
                      <div className="empty-filter-msg">
                        {filterMode === 'found'
                          ? 'No se encontraron productos exitosos.'
                          : filterMode === 'not_found'
                            ? '¡Excelente! Todos los productos fueron encontrados.'
                            : 'Lista vacía'}
                      </div>
                    ) : (
                      filteredResults.map((result, index) => (
                        <div key={index} className="file-result-item">
                          <div className="result-header">
                            <span className="search-term">
                              {result.quantity > 1 && (
                                <strong className="quantity-badge">
                                  {result.quantity}x{' '}
                                </strong>
                              )}
                              {result.searchTerm}
                            </span>
                            {!result.found ? (
                              <span className="not-found-badge">
                                ❌ No encontrado
                              </span>
                            ) : (
                              getConfidenceBadge(
                                result.confidence,
                                result.products[0]?.similarity,
                              )
                            )}
                          </div>

                          {result.found && (
                            <div className="result-products">
                              {result.products.map((product) => {
                                const key = `${result.searchTerm}-${product.id}`;
                                const isSelected = selectedProducts.has(key);

                                return (
                                  <div
                                    key={product.id}
                                    className={`result-product ${
                                      isSelected ? 'selected' : ''
                                    }`}
                                    onClick={() =>
                                      toggleProductSelection(
                                        result.searchTerm,
                                        product.id,
                                      )
                                    }
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => {}}
                                    />
                                    <div className="product-info-compact">
                                      <div className="product-name-row">
                                        <span className="product-name">
                                          {product.name}
                                        </span>
                                        {product.marca && (
                                          <span className="product-brand-badge">
                                            {product.marca}
                                          </span>
                                        )}
                                      </div>
                                      <div className="product-meta">
                                        <span className="product-price">
                                          ${product.price.toFixed(2)}
                                        </span>
                                        <span className="similarity-score">
                                          {product.similarity}% similar
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={handleClose}>
                      Cancelar
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={handleAddToCart}
                      disabled={selectedProducts.size === 0}
                    >
                      <AddShoppingCartIcon fontSize="small" />
                      Agregar {selectedProducts.size} al Carrito
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ESTILOS DE LOS BOTONES */}
      <style jsx>{`
        .file-results-summary {
          background: #fff;
          padding-bottom: 10px;
          margin-bottom: 15px;
          border-bottom: 1px solid #eee;
        }

        .filter-buttons-container {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        }

        .main-filter-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          border-radius: 8px;
          border: 2px solid transparent;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #f3f4f6;
          color: #6b7280;
        }

        .main-filter-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        /* Botón Encontrados (Verde) */
        .main-filter-btn.found.active {
          background: #ecfdf5;
          color: #059669;
          border-color: #059669;
          box-shadow: inset 0 0 0 1px #059669;
        }

        /* Botón No Encontrados (Rojo) */
        .main-filter-btn.not-found.active {
          background: #fef2f2;
          color: #dc2626;
          border-color: #dc2626;
          box-shadow: inset 0 0 0 1px #dc2626;
        }

        /* Botón Todos (Gris) - Pequeño */
        .main-filter-btn.all {
          flex: 0 0 50px;
        }
        .main-filter-btn.all.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .stats-badges-simple {
          text-align: center;
          color: #6b7280;
          margin-top: 5px;
        }

        .empty-filter-msg {
          padding: 40px;
          text-align: center;
          color: #9ca3af;
          font-style: italic;
          background: #f9fafb;
          border-radius: 8px;
          margin-bottom: 15px;
        }
      `}</style>
    </>
  );
}
