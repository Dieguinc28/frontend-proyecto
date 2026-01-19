'use client';

import { useState } from 'react';
import { apiClient } from '../lib/apiClient';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

interface Product {
  _id: string;
  name?: string;
  nombre?: string;
  description?: string;
  descripcion?: string;
  price?: number;
  precioreferencial?: number;
  stock: number;
  image: string;
  category?: string;
  categoria?: string;
  marca?: string;
}

interface SearchResult {
  searchTerm: string;
  quantity: number;
  found: boolean;
  products: Product[];
}

interface ProductWithQuantity {
  product: Product;
  quantity: number;
}

interface PdfQuoteUploaderProps {
  onAddProducts: (products: ProductWithQuantity[]) => void;
}

interface PdfProcessResponse {
  results: SearchResult[];
}

export default function PdfQuoteUploader({
  onAddProducts,
}: PdfQuoteUploaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set()
  );

  // --- NUEVO: Estado para el filtro activo ('todos', 'encontrados', 'no_encontrados') ---
  const [filterMode, setFilterMode] = useState<'all' | 'found' | 'not_found'>('all');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Por favor selecciona un archivo PDF válido');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Por favor selecciona un archivo PDF');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResults(null);
    setFilterMode('all'); // Resetear filtro al subir nuevo

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const { data } = await apiClient.post<PdfProcessResponse>(
        '/pdf-quote/process',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setResults(data.results);

      // Auto-seleccionar el primer producto de cada resultado encontrado
      const autoSelected = new Set<string>();
      data.results.forEach((result) => {
        if (result.found && result.products.length > 0) {
          autoSelected.add(result.products[0]._id);
        }
      });
      setSelectedProducts(autoSelected);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al procesar el PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleProductSelection = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleAddToCart = () => {
    if (!results) return;

    const productsToAdd: ProductWithQuantity[] = [];
    const addedIds = new Set<string>();

    results.forEach((result) => {
      result.products.forEach((product) => {
        if (selectedProducts.has(product._id) && !addedIds.has(product._id)) {
          productsToAdd.push({
            product: product,
            quantity: result.quantity || 1,
          });
          addedIds.add(product._id);
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
    setError(null);
    setSelectedProducts(new Set());
    setFilterMode('all');
  };

  // --- LÓGICA DE FILTRADO ---
  const foundCount = results?.filter((r) => r.found).length || 0;
  const notFoundCount = results?.filter((r) => !r.found).length || 0;
  const totalCount = results?.length || 0;

  // Filtramos la lista según el modo seleccionado
  const filteredResults = results?.filter(r => {
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
        Cotizar desde PDF
      </button>

      {isOpen && (
        <div className="modal-overlay" onClick={handleClose}>
          <div
            className="modal-content pdf-quote-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Cotización desde PDF</h3>
              <button className="modal-close" onClick={handleClose}>
                <CloseIcon />
              </button>
            </div>

            <div className="modal-body">
              {!results ? (
                <>
                  <p className="pdf-instructions">
                    Sube un PDF con la lista de materiales que necesitas. El
                    sistema buscará automáticamente los productos en nuestro
                    catálogo.
                  </p>

                  <div className="pdf-upload-area">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      id="pdf-upload"
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="pdf-upload" className="pdf-upload-label">
                      <UploadFileIcon style={{ fontSize: '3rem' }} />
                      <span>
                        {file ? file.name : 'Seleccionar archivo PDF'}
                      </span>
                    </label>
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
                    {isProcessing ? 'Procesando...' : 'Procesar PDF'}
                  </button>
                </>
              ) : (
                <>
                  {/* --- BARRA DE FILTROS --- */}
                  <div className="pdf-results-summary-interactive">
                    <div className="filter-group">
                      <button 
                        className={`filter-chip ${filterMode === 'all' ? 'active' : ''}`}
                        onClick={() => setFilterMode('all')}
                      >
                        Todos ({totalCount})
                      </button>
                      
                      <button 
                        className={`filter-chip found ${filterMode === 'found' ? 'active' : ''}`}
                        onClick={() => setFilterMode('found')}
                      >
                        <CheckCircleIcon fontSize="inherit" style={{marginRight: 4}}/>
                        Encontrados ({foundCount})
                      </button>

                      <button 
                        className={`filter-chip not-found ${filterMode === 'not_found' ? 'active' : ''}`}
                        onClick={() => setFilterMode('not_found')}
                      >
                        <WarningAmberIcon fontSize="inherit" style={{marginRight: 4}}/>
                        No encontrados ({notFoundCount})
                      </button>
                    </div>
                  </div>

                  <div className="pdf-results-list">
                    {filteredResults.length === 0 ? (
                      <div className="empty-state-filter">
                        <p>No hay productos en esta categoría.</p>
                      </div>
                    ) : (
                      filteredResults.map((result, index) => (
                        <div key={index} className="pdf-result-item">
                          <div className="result-header">
                            <span className="search-term">
                              {result.quantity > 1 && (
                                <strong style={{ color: 'var(--primary)' }}>
                                  {result.quantity}x{' '}
                                </strong>
                              )}
                              {result.searchTerm}
                            </span>
                            {!result.found && (
                              <span className="not-found-badge">
                                No encontrado
                              </span>
                            )}
                          </div>

                          {result.found && (
                            <div className="result-products">
                              {result.products.map((product) => (
                                <div
                                  key={product._id}
                                  className={`result-product ${
                                    selectedProducts.has(product._id)
                                      ? 'selected'
                                      : ''
                                  }`}
                                  onClick={() =>
                                    toggleProductSelection(product._id)
                                  }
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedProducts.has(product._id)}
                                    onChange={() => {}}
                                  />
                                  <div className="product-info-compact">
                                    <span className="product-name">
                                      {product.name || product.nombre}
                                      {product.marca && (
                                        <span className="product-brand-badge">
                                          {' '}
                                          - {product.marca}
                                        </span>
                                      )}
                                    </span>
                                    <span className="product-price">
                                      $
                                      {(
                                        product.price ||
                                        product.precioreferencial ||
                                        0
                                      ).toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Mensaje de ayuda si no se encontró y estamos filtrando por ello */}
                          {!result.found && filterMode === 'not_found' && (
                             <div style={{fontSize: '0.85rem', color: '#666', marginTop: 5, padding: '5px 10px', background: '#f9fafb', borderRadius: 4}}>
                               Intenta buscar manualmente este producto en la barra de búsqueda principal.
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

      <style jsx>{`
        .pdf-results-summary-interactive {
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #eee;
        }

        .filter-group {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .filter-chip {
          display: flex;
          align-items: center;
          padding: 6px 12px;
          border-radius: 20px;
          border: 1px solid #e5e7eb;
          background: white;
          color: #374151;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-chip:hover {
          background: #f3f4f6;
        }

        .filter-chip.active {
          background: #3b82f6; /* Azul primario */
          color: white;
          border-color: #3b82f6;
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
        }

        /* Estilos específicos para Encontrados cuando está activo */
        .filter-chip.found.active {
          background: #10b981; /* Verde */
          border-color: #10b981;
          box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
        }

        /* Estilos específicos para No Encontrados cuando está activo */
        .filter-chip.not-found.active {
          background: #ef4444; /* Rojo */
          border-color: #ef4444;
          box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
        }

        .empty-state-filter {
          text-align: center;
          padding: 30px;
          color: #9ca3af;
          font-style: italic;
        }
      `}</style>
    </>
  );
}