'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import { apiClient } from '../lib/apiClient';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../lib/imageUtils';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  image?: string;
  category?: string;
  marca?: string;
  similarity?: number;
}

interface SearchResult {
  searchTerm: string;
  quantity: number;
  found: boolean;
  confidence: 'high' | 'medium' | 'low' | 'none';
  products: Product[];
}

interface ProcessResponse {
  success: boolean;
  stats: {
    total: number;
    found: number;
    notFound: number;
    highConfidence: number;
    mediumConfidence: number;
    lowConfidence: number;
    successRate: number;
  };
  results: SearchResult[];
  method: string;
  extractedText?: string;
}

export default function ListUploader() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<'pdf' | 'image' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ProcessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<
    Map<string, { product: Product; quantity: number }>
  >(new Map());

  // --- ESTADO DEL FILTRO ---
  const [filterMode, setFilterMode] = useState<'all' | 'found' | 'not_found'>('all');

  const handleFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'pdf' | 'image'
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadType(type);
      setError(null);
      setResults(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent, type: 'pdf' | 'image') => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      const validTypes =
        type === 'pdf'
          ? ['application/pdf']
          : ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

      if (validTypes.includes(file.type)) {
        setSelectedFile(file);
        setUploadType(type);
        setError(null);
        setResults(null);
      } else {
        setError(
          `Por favor selecciona un archivo ${
            type === 'pdf' ? 'PDF' : 'de imagen'
          } válido`
        );
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadType) return;

    setIsProcessing(true);
    setError(null);
    setResults(null);
    setSelectedProducts(new Map());
    setFilterMode('all');

    try {
      const formData = new FormData();
      const endpoint =
        uploadType === 'pdf' ? '/pdf-quote/process' : '/image-quote/process';
      const fieldName = uploadType === 'pdf' ? 'pdf' : 'image';

      formData.append(fieldName, selectedFile);

      const { data } = await apiClient.post<ProcessResponse>(
        endpoint,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setResults(data);

      const autoSelected = new Map<
        string,
        { product: Product; quantity: number }
      >();
      data.results.forEach((result) => {
        if (
          result.found &&
          result.products.length > 0 &&
          (result.confidence === 'high' || result.confidence === 'medium')
        ) {
          const bestProduct = result.products[0];
          autoSelected.set(bestProduct.id, {
            product: bestProduct,
            quantity: result.quantity,
          });
        }
      });
      setSelectedProducts(autoSelected);
    } catch (err: any) {
      console.error('Error procesando archivo:', err);
      setError(
        err.response?.data?.message ||
          `Error al procesar el ${uploadType === 'pdf' ? 'PDF' : 'imagen'}`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleProductSelection = (productId: string, result: SearchResult) => {
    const newSelected = new Map(selectedProducts);
    const product = result.products.find((p) => p.id === productId);

    if (!product) return;

    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.set(productId, {
        product,
        quantity: result.quantity,
      });
    }
    setSelectedProducts(newSelected);
  };

  const handleAddToCart = async () => {
    if (selectedProducts.size === 0) return;

    const consolidatedProducts = new Map<
      string,
      { product: Product; totalQuantity: number }
    >();

    selectedProducts.forEach(({ product, quantity }) => {
      const existing = consolidatedProducts.get(product.id);
      if (existing) {
        existing.totalQuantity += quantity;
      } else {
        consolidatedProducts.set(product.id, {
          product,
          totalQuantity: quantity,
        });
      }
    });

    for (const { product, totalQuantity } of consolidatedProducts.values()) {
      await addToCart(
        {
          _id: product.id,
          name: product.name,
          description: product.description || '',
          price: product.price,
          stock: product.stock,
          image: product.image || '',
          category: product.category || '',
          createdAt: '',
        },
        totalQuantity
      );
    }

    setSelectedFile(null);
    setUploadType(null);
    setResults(null);
    setSelectedProducts(new Map());
    router.push('/cart');
  };

  const getConfidenceBadge = (confidence: string) => {
    const badges = {
      high: { text: 'Alta confianza', color: '#10b981', icon: '✓' },
      medium: { text: 'Media confianza', color: '#f59e0b', icon: '~' },
      low: { text: 'Baja confianza', color: '#ef4444', icon: '?' },
      none: { text: 'No encontrado', color: '#6b7280', icon: '✗' },
    };
    return badges[confidence as keyof typeof badges] || badges.none;
  };

  // --- LÓGICA DE FILTRADO ---
  const filteredResults = results?.results.filter(r => {
      if (filterMode === 'found') return r.found;
      if (filterMode === 'not_found') return !r.found;
      return true; // 'all'
  }) || [];

  return (
    <div className="list-uploader">
      {/* Header */}
      <div className="uploader-header">
        <h2>Subir Archivos</h2>
        <p className="uploader-subtitle">
          Sube proformas en PDF o imágenes para extraer automáticamente los
          productos
        </p>
      </div>

      {/* Upload Options */}
      <div className="upload-options">
        {/* PDF Upload */}
        <div
          className={`upload-card ${
            isDragging && uploadType === 'pdf' ? 'dragging' : ''
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'pdf')}
        >
          <div className="upload-icon">
            <DescriptionIcon sx={{ fontSize: 64, color: '#2e86ab' }} />
          </div>
          <h3>Subir PDF</h3>
          <p className="upload-description">Proformas o facturas</p>

          <label className="upload-btn">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => handleFileSelect(e, 'pdf')}
              style={{ display: 'none' }}
            />
            <CloudUploadIcon sx={{ mr: 1 }} />
            Seleccionar PDF
          </label>

          {selectedFile && uploadType === 'pdf' && (
            <div className="selected-file">
              <p>{selectedFile.name}</p>
            </div>
          )}
        </div>

        {/* Image Upload */}
        <div
          className={`upload-card ${
            isDragging && uploadType === 'image' ? 'dragging' : ''
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'image')}
        >
          <div className="upload-icon">
            <ImageIcon sx={{ fontSize: 64, color: '#2e86ab' }} />
          </div>
          <h3>Subir Imagen</h3>
          <p className="upload-description">Fotos de listas o proformas</p>

          <label className="upload-btn">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e, 'image')}
              style={{ display: 'none' }}
            />
            <CloudUploadIcon sx={{ mr: 1 }} />
            Seleccionar Imagen
          </label>

          {selectedFile && uploadType === 'image' && (
            <div className="selected-file">
              <p>{selectedFile.name}</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Button */}
      {selectedFile && !results && (
        <div className="upload-action">
          <button
            className="btn btn-primary btn-upload"
            onClick={handleUpload}
            disabled={isProcessing}
          >
            <CloudUploadIcon sx={{ mr: 1 }} />
            {isProcessing ? 'Procesando...' : 'Procesar Archivo'}
          </button>
        </div>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="processing-indicator">
          <div className="spinner"></div>
          <p>
            Extrayendo productos con OCR...
            <br />
            <small>Esto puede tomar unos segundos</small>
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-alert">
          <ErrorIcon sx={{ mr: 1 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="results-container">
          {/* Stats Summary */}
          <div className="results-stats">
            <div className="stat-card success">
              <CheckCircleIcon sx={{ fontSize: 32 }} />
              <div>
                <div className="stat-number">{results.stats.found}</div>
                <div className="stat-label">Encontrados</div>
              </div>
            </div>
            <div className="stat-card total">
              <div>
                <div className="stat-number">{results.stats.total}</div>
                <div className="stat-label">Total extraídos</div>
              </div>
            </div>
            <div className="stat-card rate">
              <div>
                <div className="stat-number">{results.stats.successRate}%</div>
                <div className="stat-label">Tasa de éxito</div>
              </div>
            </div>
          </div>

          {/* --- BOTONES DE FILTRO --- */}
          <div className="confidence-breakdown" style={{display: 'block', textAlign: 'left', padding: '10px 0'}}>
             <div style={{display: 'flex', gap: '15px', flexWrap: 'wrap'}}>
                
                {/* Botón Ver Encontrados */}
                <button 
                    onClick={() => setFilterMode('found')}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: filterMode === 'found' ? '2px solid #10b981' : '1px solid #ddd',
                        background: filterMode === 'found' ? '#ecfdf5' : 'white',
                        color: filterMode === 'found' ? '#065f46' : '#666',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s'
                    }}
                >
                    <VisibilityIcon fontSize="small" />
                    Ver Encontrados ({results.stats.found})
                </button>

                {/* Botón Ver No Encontrados */}
                <button 
                    onClick={() => setFilterMode('not_found')}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: filterMode === 'not_found' ? '2px solid #ef4444' : '1px solid #ddd',
                        background: filterMode === 'not_found' ? '#fef2f2' : 'white',
                        color: filterMode === 'not_found' ? '#991b1b' : '#666',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s'
                    }}
                >
                    <VisibilityOffIcon fontSize="small" />
                    Ver No Encontrados ({results.stats.notFound})
                </button>

                 {/* Botón Ver Todos */}
                 <button 
                    onClick={() => setFilterMode('all')}
                    style={{
                        padding: '10px',
                        borderRadius: '8px',
                        border: filterMode === 'all' ? '2px solid #3b82f6' : '1px solid #ddd',
                        background: filterMode === 'all' ? '#eff6ff' : 'white',
                        color: filterMode === 'all' ? '#1e40af' : '#666',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    title="Ver Todos"
                >
                    <RefreshIcon fontSize="small" />
                </button>
             </div>
          </div>

          {/* Products List */}
          <div className="results-list">
            <h3>Productos Detectados ({filteredResults.length})</h3>
            
            {filteredResults.length === 0 ? (
                <div style={{padding: '30px', textAlign: 'center', color: '#666', background: '#f9fafb', borderRadius: '8px'}}>
                    {filterMode === 'found' ? 'No se encontraron productos exitosos.' : '¡Genial! No hay productos faltantes.'}
                </div>
            ) : (
                filteredResults.map((result, index) => {
                const badge = getConfidenceBadge(result.confidence);
                return (
                    <div key={index} className="result-item">
                    <div className="result-header">
                        <div className="result-search-term">
                        {result.quantity > 1 && (
                            <span className="quantity-badge">
                            {result.quantity}x
                            </span>
                        )}
                        <span className="search-term">{result.searchTerm}</span>
                        </div>
                        <span
                        className="confidence-badge"
                        style={{ backgroundColor: badge.color }}
                        >
                        {badge.icon} {badge.text}
                        </span>
                    </div>

                    {result.found && result.products.length > 0 && (
                        <div className="result-products">
                        {result.products.map((product) => {
                            const isSelected = selectedProducts.has(product.id);
                            return (
                            <div
                                key={product.id}
                                className={`product-match ${
                                isSelected ? 'selected' : ''
                                }`}
                                onClick={() =>
                                toggleProductSelection(product.id, result)
                                }
                                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                            >
                                {/* 1. IMAGEN */}
                                <img
                                src={getImageUrl(product.image)}
                                alt={product.name}
                                className="product-thumb"
                                />

                                {/* 2. DETALLES (FLEX 1 PARA OCUPAR ESPACIO) */}
                                <div className="product-details" style={{ flex: 1 }}>
                                    <div className="product-name">
                                        {product.name}
                                        {product.marca && (
                                        <span className="product-brand">
                                            {product.marca}
                                        </span>
                                        )}
                                    </div>
                                    {product.description && (
                                        <div className="product-description">
                                        {product.description}
                                        </div>
                                    )}
                                    <div className="product-meta">
                                        <span className="product-price">
                                        ${product.price.toFixed(2)}
                                        </span>
                                        <span className="product-stock">
                                        Stock: {product.stock}
                                        </span>
                                        {product.similarity && (
                                        <span className="similarity-badge">
                                            {product.similarity}% similar
                                        </span>
                                        )}
                                    </div>
                                </div>

                                {/* 3. CHECKBOX AL FINAL (DERECHA) */}
                                <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className="product-checkbox"
                                style={{ marginLeft: '10px', width: '20px', height: '20px', cursor: 'pointer' }}
                                />
                            </div>
                            );
                        })}
                        </div>
                    )}

                    {!result.found && (
                        <div className="not-found-message">
                        <ErrorIcon sx={{ fontSize: 18, mr: 1 }} />
                        No se encontraron productos similares en el catálogo
                        </div>
                    )}
                    </div>
                );
                })
            )}
          </div>

          {/* Action Buttons */}
          <div className="results-actions">
            <button
              className="btn btn-secondary"
              onClick={() => {
                setResults(null);
                setSelectedFile(null);
                setUploadType(null);
                setSelectedProducts(new Map());
              }}
            >
              <CloseIcon sx={{ mr: 1 }} />
              Cancelar
            </button>
            <button
              className="btn btn-primary"
              onClick={handleAddToCart}
              disabled={selectedProducts.size === 0}
            >
              <AddShoppingCartIcon sx={{ mr: 1 }} />
              Agregar {selectedProducts.size} al Carrito
            </button>
          </div>
        </div>
      )}

      {/* How it works */}
      {!results && (
        <div className="how-it-works">
          <div className="info-header">
            <InfoIcon sx={{ color: '#2e86ab', mr: 1 }} />
            <h3>Cómo funciona</h3>
          </div>
          <ul className="info-list">
            <li>Sube una proforma en PDF o una foto de tu lista de compras</li>
            <li>
              El sistema usa OCR para extraer automáticamente los productos y
              cantidades
            </li>
            <li>
              Algoritmos inteligentes buscan coincidencias en nuestro catálogo
            </li>
            <li>Revisa los productos encontrados y agrégalos a tu carrito</li>
            <li>
              Sistema 100% local - tus archivos se procesan de forma segura
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
