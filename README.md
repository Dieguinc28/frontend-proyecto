# Frontend - Papelería Lady Laura

Aplicación web desarrollada con Next.js 15, TypeScript y React Query para el sistema de gestión de papelería.

## Tecnologías

- **Next.js** v15.5 - Framework React
- **TypeScript** v5 - Tipado estático
- **React** v19 - Librería UI
- **React Query** v5 - Gestión de estado del servidor
- **Axios** - Cliente HTTP
- **Material-UI Icons** - Iconos
- **CSS Modules** - Estilos

## Estructura del Proyecto

```
frontend/
- app/
  - admin/                    # Panel administrativo
    - page.tsx             # Dashboard
    - products/            # Gestión de productos
    - users/               # Gestión de usuarios
    - quotes/              # Gestión de cotizaciones
  - cart/                    # Carrito de compras
    - page.tsx
  - quotes/                  # Cotizaciones del usuario
    - page.tsx
  - components/              # Componentes reutilizables
    - Layout.tsx           # Layout principal
│   │   ├── AdminLayout.tsx      # Layout del admin
│   │   ├── SimpleHeader.tsx     # Header
│   │   ├── ProductCard.tsx      # Tarjeta de producto
│   │   ├── CartItem.tsx         # Item del carrito
│   │   ├── CartSidebar.tsx      # Sidebar del carrito
│   │   ├── AuthModal.tsx        # Modal de autenticación
│   │   ├── PdfQuoteUploader.tsx # Subida de PDF
│   │   └── Toast.tsx            # Notificaciones
│   ├── context/                 # Context API
│   │   └── CartContext.tsx      # Estado del carrito
│   ├── hooks/                   # Custom hooks
│   │   ├── useAuth.ts           # Autenticación
│   │   ├── useProducts.ts       # Productos
│   │   ├── useUsers.ts          # Usuarios
│   │   └── useQuotes.ts         # Cotizaciones
│   ├── lib/                     # Utilidades
│   │   ├── apiClient.ts         # Cliente API
│   │   ├── token.ts             # Gestión de tokens
│   │   └── imageUtils.ts        # Utilidades de imágenes
│   ├── styles/                  # Estilos globales
│   │   ├── globals.css
│   │   ├── variables.css
│   │   ├── admin.css
│   │   ├── cart.css
│   │   ├── header.css
│   │   ├── modal.css
│   │   └── pdfQuote.css
│   ├── types/                   # Tipos TypeScript
│   │   └── index.ts
│   ├── layout.tsx               # Layout raíz
│   └── page.tsx                 # Página principal
├── public/                      # Archivos estáticos
│   └── logo.svg
├── .env.local                   # Variables de entorno
├── next.config.js               # Configuración de Next.js
├── tsconfig.json                # Configuración de TypeScript
└── package.json                 # Dependencias
```

## Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crear archivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Ejecución

### Desarrollo

```bash
npm run dev
```

Aplicación disponible en `http://localhost:3000`

### Producción

```bash
npm run build
npm start
```
