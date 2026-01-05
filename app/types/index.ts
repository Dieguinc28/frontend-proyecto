export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'cliente';
  createdAt: string;
}

export interface Product {
  _id: string;
  idproducto?: number;
  // Campos del backend (español)
  nombre?: string;
  marca?: string;
  descripcion?: string;
  precioreferencial?: number;
  unidad?: string;
  categoria?: string;
  // Campos legacy (inglés) - mantener compatibilidad
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  // Campos comunes
  image: string;
  stock: number;
  createdAt?: string;
  fechacreacion?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface QuoteItem {
  productId: string;
  name: string;
  brand?: string;
  quantity: number;
  price: number;
}

export interface Quote {
  id: number;
  userId: number;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  items: QuoteItem[];
  total: number;
  status: 'pendiente' | 'aprobada' | 'rechazada';
  pdfFile?: string;
  createdAt: string;
  updatedAt: string;
}
