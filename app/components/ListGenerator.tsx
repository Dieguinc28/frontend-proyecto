'use client';

import { useState, useEffect } from 'react';
import { useCurrentUser } from '../hooks/useAuth';
import { useListas, Lista, ItemLista } from '../hooks/useListas';
import { useProducts } from '../hooks/useProducts';
import { useEstados } from '../hooks/useEstados';
import { getImageUrl } from '../lib/imageUtils';
import '../styles/listgenerator.css';

interface ProductInList {
  iditem: number;
  idproducto: number;
  nombre: string;
  descripcion: string;
  precio: number;
  marca: string;
  stock: number;
  imagen: string;
  cantidad: number;
}

export default function ListGenerator() {
  const { data: user } = useCurrentUser();
  const {
    loading: loadingListas,
    createLista,
    getListasByUsuario,
    getListaById,
    deleteLista,
    addItemToLista,
    updateItemLista,
    deleteItemLista,
  } = useListas();
  const { data: products = [], isLoading: loadingProducts } = useProducts();
  const { data: estados = [], isLoading: loadingEstados } = useEstados();

  const [misListas, setMisListas] = useState<Lista[]>([]);
  const [listaActual, setListaActual] = useState<Lista | null>(null);
  const [nombreNuevaLista, setNombreNuevaLista] = useState('');
  const [tipoLista, setTipoLista] = useState('escolar');
  const [searchTerm, setSearchTerm] = useState('');
  const [productosEnLista, setProductosEnLista] = useState<ProductInList[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [expandedListCategories, setExpandedListCategories] = useState<
    Set<string>
  >(new Set());

  // Estados are automatically fetched by React Query

  useEffect(() => {
    if (user) {
      loadMisListas();
    }
  }, [user]);

  // Cargar la última lista seleccionada desde localStorage
  useEffect(() => {
    const cargarListaGuardada = async () => {
      const listaIdGuardada = localStorage.getItem('ultimaListaSeleccionada');
      if (listaIdGuardada && user && misListas.length > 0) {
        try {
          const lista = misListas.find(
            (l) => l.idlista === parseInt(listaIdGuardada),
          );
          if (lista) {
            await handleSeleccionarLista(lista);
          }
        } catch (err) {
          console.error('Error cargando lista guardada:', err);
          localStorage.removeItem('ultimaListaSeleccionada');
        }
      }
    };

    if (user && misListas.length > 0 && !listaActual) {
      cargarListaGuardada();
    }
  }, [user, misListas.length]);

  // Cargar la última lista seleccionada al montar el componente
  useEffect(() => {
    const ultimaListaId = localStorage.getItem('ultimaListaSeleccionada');
    if (ultimaListaId && misListas.length > 0) {
      const lista = misListas.find(
        (l) => l.idlista === parseInt(ultimaListaId),
      );
      if (lista) {
        handleSeleccionarLista(lista);
      }
    }
  }, [misListas]);

  const loadMisListas = async () => {
    if (!user) return;
    try {
      const listas = await getListasByUsuario(user.id);
      setMisListas(listas);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCrearLista = async () => {
    if (!nombreNuevaLista.trim()) {
      setError('El nombre de la lista es requerido');
      return;
    }

    if (!user) {
      setError('Debes iniciar sesión para crear una lista');
      return;
    }

    // Estado por defecto: "Pendiente" (idestado: 1)
    const estadoPendiente =
      estados.find((e) => e.nombreestado.toLowerCase() === 'pendiente') ||
      estados[0];

    try {
      const nuevaLista = await createLista({
        nombrelista: nombreNuevaLista,
        tipo: tipoLista,
        idestado: estadoPendiente?.idestado || 1,
        idusuario: user.id,
      });

      console.log('Lista creada:', nuevaLista);
      setSuccess('Lista creada exitosamente');
      setNombreNuevaLista('');
      setShowCreateForm(false);

      // Recargar la lista completa desde el servidor para asegurar que tenga la estructura correcta
      const listaCompleta = await getListaById(nuevaLista.idlista);
      setListaActual(listaCompleta);
      setProductosEnLista([]);
      await loadMisListas();
    } catch (err: any) {
      console.error('Error creando lista:', err);
      setError(err.message);
    }
  };

  const handleSeleccionarLista = async (lista: Lista) => {
    setListaActual(lista);

    // Guardar en localStorage para persistir la selección
    localStorage.setItem('ultimaListaSeleccionada', lista.idlista.toString());

    // Recargar la lista completa desde el servidor para obtener datos actualizados
    try {
      const listaActualizada = await getListaById(lista.idlista);

      // Cargar productos de la lista con el iditem incluido
      const productos =
        listaActualizada.Itemlista?.map((item) => ({
          iditem: item.iditem, // Incluir el ID del item
          idproducto: item.Producto!.idproducto,
          nombre: item.Producto!.nombre,
          descripcion: item.Producto!.descripcion,
          precio:
            (item.Producto as any).precio ||
            (item.Producto as any).precioreferencial ||
            0,
          marca: item.Producto!.marca,
          stock: item.Producto!.stock,
          imagen:
            (item.Producto as any).imagen || (item.Producto as any).image || '',
          cantidad: item.cantidad,
        })) || [];
      setProductosEnLista(productos);
      setListaActual(listaActualizada);
    } catch (err: any) {
      setError(err.message);
      // Fallback al método anterior si falla
      const productos =
        lista.Itemlista?.map((item) => ({
          iditem: item.iditem, // Incluir el ID del item
          idproducto: item.Producto!.idproducto,
          nombre: item.Producto!.nombre,
          descripcion: item.Producto!.descripcion,
          precio:
            (item.Producto as any).precio ||
            (item.Producto as any).precioreferencial ||
            0,
          marca: item.Producto!.marca,
          stock: item.Producto!.stock,
          imagen:
            (item.Producto as any).imagen || (item.Producto as any).image || '',
          cantidad: item.cantidad,
        })) || [];
      setProductosEnLista(productos);
    }
  };

  const handleAgregarProducto = async (producto: any) => {
    if (!listaActual) {
      setError('Debes seleccionar o crear una lista primero');
      return;
    }

    // Verificar si el producto ya está en la lista
    const productoExistente = productosEnLista.find(
      (p) => p.idproducto === producto.idproducto,
    );
    if (productoExistente) {
      setError('Este producto ya está en la lista');
      return;
    }

    try {
      console.log('Agregando producto a lista:', {
        idlista: listaActual.idlista,
        idproducto: producto.idproducto,
        cantidad: 1,
      });

      const nuevoItem = await addItemToLista({
        idlista: listaActual.idlista,
        idproducto: producto.idproducto,
        cantidad: 1,
      });

      console.log('Item creado:', nuevoItem);

      // Agregar el producto con el iditem del backend
      const nuevoProducto = {
        iditem: nuevoItem.iditem,
        idproducto: producto.idproducto,
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: producto.precio || producto.precioreferencial || 0,
        marca: producto.marca,
        stock: producto.stock,
        imagen: (producto as any).image || (producto as any).imagen || '',
        cantidad: 1,
      };

      setProductosEnLista([...productosEnLista, nuevoProducto]);
      setSuccess('Producto agregado a la lista');

      // Recargar la lista completa para asegurar sincronización
      const listaActualizada = await getListaById(listaActual.idlista);
      setListaActual(listaActualizada);
      await loadMisListas();
    } catch (err: any) {
      console.error('Error agregando producto:', err);
      setError(err.message);
    }
  };

  const handleEliminarProducto = async (iditem: number) => {
    if (!listaActual) return;

    try {
      await deleteItemLista(iditem);
      setProductosEnLista(productosEnLista.filter((p) => p.iditem !== iditem));
      setSuccess('Producto eliminado de la lista');
      await loadMisListas();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCambiarCantidad = async (
    iditem: number,
    nuevaCantidad: number,
  ) => {
    if (nuevaCantidad < 1) return;
    if (!listaActual) return;

    try {
      // Actualizar en el backend
      await updateItemLista(iditem, { cantidad: nuevaCantidad });

      // Actualizar en el estado local
      setProductosEnLista(
        productosEnLista.map((p) =>
          p.iditem === iditem ? { ...p, cantidad: nuevaCantidad } : p,
        ),
      );

      // Recargar las listas para mantener sincronización
      await loadMisListas();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEliminarLista = async (idlista: number) => {
    if (!confirm('¿Estás seguro de eliminar esta lista?')) return;

    try {
      await deleteLista(idlista);
      setSuccess('Lista eliminada exitosamente');
      if (listaActual?.idlista === idlista) {
        setListaActual(null);
        setProductosEnLista([]);
        // Limpiar localStorage si se elimina la lista actual
        localStorage.removeItem('ultimaListaSeleccionada');
      }
      await loadMisListas();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const productosFiltrados = products.filter(
    (p) =>
      p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.marca?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Agrupar productos por categoría
  const productosAgrupados = productosFiltrados.reduce(
    (grupos, producto) => {
      const categoria = producto.categoria || 'Sin categoría';
      if (!grupos[categoria]) {
        grupos[categoria] = [];
      }
      grupos[categoria].push(producto);
      return grupos;
    },
    {} as Record<string, typeof products>,
  );

  const toggleCategory = (categoria: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoria)) {
      newExpanded.delete(categoria);
    } else {
      newExpanded.add(categoria);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleListCategory = (categoria: string) => {
    const newExpanded = new Set(expandedListCategories);
    if (newExpanded.has(categoria)) {
      newExpanded.delete(categoria);
    } else {
      newExpanded.add(categoria);
    }
    setExpandedListCategories(newExpanded);
  };

  const calcularTotal = () => {
    return productosEnLista.reduce(
      (total, p) => total + (p.precio || 0) * p.cantidad,
      0,
    );
  };

  // Agrupar productos en lista por categoría (basado en marca como categoría)
  const productosEnListaAgrupados = productosEnLista.reduce(
    (grupos, producto) => {
      // Buscar el producto completo para obtener su categoría
      const productoCompleto = products.find(
        (p) => p.idproducto === producto.idproducto,
      );
      const categoria =
        productoCompleto?.categoria || producto.marca || 'Sin categoría';

      if (!grupos[categoria]) {
        grupos[categoria] = [];
      }
      grupos[categoria].push(producto);
      return grupos;
    },
    {} as Record<string, ProductInList[]>,
  );

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <div className="list-generator">
      {error && (
        <div className="alert alert-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span>✓</span>
          <span>{success}</span>
        </div>
      )}

      <div className="generator-layout">
        {/* Sidebar - Mis Listas */}
        <div className="sidebar-listas">
          <div className="sidebar-header">
            <h3>Mis Listas</h3>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              + Nueva Lista
            </button>
          </div>

          {showCreateForm && (
            <div className="create-form">
              <input
                type="text"
                placeholder="Nombre de la lista"
                value={nombreNuevaLista}
                onChange={(e) => setNombreNuevaLista(e.target.value)}
                className="form-input"
              />
              <select
                value={tipoLista}
                onChange={(e) => setTipoLista(e.target.value)}
                className="form-select"
              >
                <option value="escolar">Escolar</option>
                <option value="oficina">Oficina</option>
                <option value="personal">Personal</option>
                <option value="otro">Otro</option>
              </select>
              <div className="form-actions">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleCrearLista}
                  disabled={loadingListas}
                >
                  Crear
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <div className="listas-list">
            {loadingListas ? (
              <p className="loading-text">Cargando...</p>
            ) : misListas.length === 0 ? (
              <p className="empty-text">No tienes listas creadas</p>
            ) : (
              misListas.map((lista) => (
                <div
                  key={lista.idlista}
                  className={`lista-item ${
                    listaActual?.idlista === lista.idlista ? 'active' : ''
                  }`}
                  onClick={() => handleSeleccionarLista(lista)}
                >
                  <div className="lista-info">
                    <h4>{lista.nombrelista}</h4>
                    <p className="lista-meta">
                      {lista.tipo} • {lista.Itemlista?.length || 0} items
                    </p>
                  </div>
                  <button
                    className="btn-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEliminarLista(lista.idlista);
                    }}
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {!listaActual ? (
            <div className="empty-state">
              <h2>Selecciona o crea una lista para comenzar</h2>
              <p>Podrás agregar productos y gestionar tu lista escolar</p>
            </div>
          ) : (
            <>
              <div className="lista-header">
                <div>
                  <h2>{listaActual.nombrelista}</h2>
                  <p className="lista-subtitle">
                    {listaActual.tipo} • {productosEnLista.length} productos
                  </p>
                </div>
                <div className="lista-total">
                  <span className="total-label">Total:</span>
                  <span className="total-amount">
                    ${calcularTotal().toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Productos en la lista */}
              <div className="productos-en-lista">
                <h3>Productos en la lista</h3>
                {productosEnLista.length === 0 ? (
                  <p className="empty-text">No hay productos en esta lista</p>
                ) : (
                  <div className="productos-lista-agrupados">
                    {Object.entries(productosEnListaAgrupados).map(
                      ([categoria, productosCategoria]) => {
                        const isExpanded =
                          expandedListCategories.has(categoria);
                        const primerProducto = productosCategoria[0];
                        const productosRestantes = productosCategoria.slice(1);
                        const totalProductos = productosCategoria.length;

                        return (
                          <div
                            key={categoria}
                            className="categoria-grupo-lista"
                          >
                            <div className="categoria-header-lista">
                              <h4 className="categoria-titulo-lista">
                                {categoria}
                              </h4>
                              {totalProductos > 1 && (
                                <button
                                  className="btn-expand-categoria-lista"
                                  onClick={() => toggleListCategory(categoria)}
                                >
                                  {isExpanded ? '▲' : '▼'} {totalProductos}{' '}
                                  productos
                                </button>
                              )}
                            </div>

                            {/* Primer producto siempre visible */}
                            <div className="producto-card">
                              <img
                                src={getImageUrl(primerProducto.imagen)}
                                alt={primerProducto.nombre}
                                className="producto-img"
                              />
                              <div className="producto-info">
                                <h4>{primerProducto.nombre}</h4>
                                <p className="producto-marca">
                                  {primerProducto.marca}
                                </p>
                                <p className="producto-precio">
                                  $
                                  {primerProducto.precio
                                    ? primerProducto.precio
                                    : '0.00'}
                                </p>
                                <div className="cantidad-control">
                                  <button
                                    onClick={() =>
                                      handleCambiarCantidad(
                                        primerProducto.iditem,
                                        primerProducto.cantidad - 1,
                                      )
                                    }
                                  >
                                    -
                                  </button>
                                  <span>{primerProducto.cantidad}</span>
                                  <button
                                    onClick={() =>
                                      handleCambiarCantidad(
                                        primerProducto.iditem,
                                        primerProducto.cantidad + 1,
                                      )
                                    }
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                              <button
                                className="btn-remove"
                                onClick={() =>
                                  handleEliminarProducto(primerProducto.iditem)
                                }
                              >
                                ✕
                              </button>
                            </div>

                            {/* Productos restantes (expandibles) */}
                            {isExpanded && productosRestantes.length > 0 && (
                              <div className="productos-lista-expandidos">
                                {productosRestantes.map((producto) => (
                                  <div
                                    key={producto.iditem}
                                    className="producto-card producto-card-secundario"
                                  >
                                    <img
                                      src={getImageUrl(producto.imagen)}
                                      alt={producto.nombre}
                                      className="producto-img"
                                    />
                                    <div className="producto-info">
                                      <h4>{producto.nombre}</h4>
                                      <p className="producto-marca">
                                        {producto.marca}
                                      </p>
                                      <p className="producto-precio">
                                        $
                                        {producto.precio
                                          ? producto.precio.toFixed(2)
                                          : '0.00'}
                                      </p>
                                      <div className="cantidad-control">
                                        <button
                                          onClick={() =>
                                            handleCambiarCantidad(
                                              producto.iditem,
                                              producto.cantidad - 1,
                                            )
                                          }
                                        >
                                          -
                                        </button>
                                        <span>{producto.cantidad}</span>
                                        <button
                                          onClick={() =>
                                            handleCambiarCantidad(
                                              producto.iditem,
                                              producto.cantidad + 1,
                                            )
                                          }
                                        >
                                          +
                                        </button>
                                      </div>
                                    </div>
                                    <button
                                      className="btn-remove"
                                      onClick={() =>
                                        handleEliminarProducto(producto.iditem)
                                      }
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      },
                    )}
                  </div>
                )}
              </div>

              {/* Buscar y agregar productos */}
              <div className="agregar-productos">
                <h3>Agregar productos</h3>
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <div className="productos-disponibles">
                  {loadingProducts ? (
                    <p className="loading-text">Cargando productos...</p>
                  ) : Object.keys(productosAgrupados).length === 0 ? (
                    <p className="empty-text">No se encontraron productos</p>
                  ) : (
                    Object.entries(productosAgrupados).map(
                      ([categoria, productosCategoria]) => {
                        const isExpanded = expandedCategories.has(categoria);
                        const primerProducto = productosCategoria[0];
                        const productosRestantes = productosCategoria.slice(1);
                        const totalProductos = productosCategoria.length;

                        return (
                          <div key={categoria} className="categoria-grupo">
                            <div className="categoria-header">
                              <h4 className="categoria-titulo">{categoria}</h4>
                              {totalProductos > 1 && (
                                <button
                                  className="btn-expand-categoria"
                                  onClick={() => toggleCategory(categoria)}
                                >
                                  {isExpanded ? '▲' : '▼'} {totalProductos}{' '}
                                  productos
                                </button>
                              )}
                            </div>

                            {/* Primer producto siempre visible */}
                            <div className="producto-disponible">
                              <img
                                src={getImageUrl(primerProducto.image)}
                                alt={primerProducto.nombre}
                                className="producto-img-small"
                              />
                              <div className="producto-info-small">
                                <h5>{primerProducto.nombre}</h5>
                                <p className="producto-marca-small">
                                  {primerProducto.marca}
                                </p>
                                <p className="producto-precio-small">
                                  $
                                  {primerProducto.precioreferencial
                                    ? primerProducto.precioreferencial.toFixed(
                                        2,
                                      )
                                    : '0.00'}
                                </p>
                              </div>
                              <button
                                className="btn btn-add"
                                onClick={() =>
                                  handleAgregarProducto(primerProducto)
                                }
                                disabled={productosEnLista.some(
                                  (p) =>
                                    p.idproducto === primerProducto.idproducto,
                                )}
                              >
                                {productosEnLista.some(
                                  (p) =>
                                    p.idproducto === primerProducto.idproducto,
                                )
                                  ? '✓'
                                  : '+'}
                              </button>
                            </div>

                            {/* Productos restantes (expandibles) */}
                            {isExpanded && productosRestantes.length > 0 && (
                              <div className="productos-expandidos">
                                {productosRestantes.map((producto) => (
                                  <div
                                    key={producto.idproducto}
                                    className="producto-disponible producto-secundario"
                                  >
                                    <img
                                      src={getImageUrl(producto.image)}
                                      alt={producto.nombre}
                                      className="producto-img-small"
                                    />
                                    <div className="producto-info-small">
                                      <h5>{producto.nombre}</h5>
                                      <p className="producto-marca-small">
                                        {producto.marca}
                                      </p>
                                      <p className="producto-precio-small">
                                        $
                                        {producto.precioreferencial
                                          ? producto.precioreferencial.toFixed(
                                              2,
                                            )
                                          : '0.00'}
                                      </p>
                                    </div>
                                    <button
                                      className="btn btn-add"
                                      onClick={() =>
                                        handleAgregarProducto(producto)
                                      }
                                      disabled={productosEnLista.some(
                                        (p) =>
                                          p.idproducto === producto.idproducto,
                                      )}
                                    >
                                      {productosEnLista.some(
                                        (p) =>
                                          p.idproducto === producto.idproducto,
                                      )
                                        ? '✓'
                                        : '+'}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      },
                    )
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
