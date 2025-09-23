# Diseño - Funcionalidades Core del Marketplace LaCherada

## Visión General

Este documento define el diseño técnico para completar las funcionalidades core del marketplace
LaCherada. El proyecto ya cuenta con una arquitectura sólida basada en Vue 3 + TypeScript +
Supabase, con esquema de base de datos completo y servicios básicos implementados. El diseño se
enfoca en completar las vistas y funcionalidades que actualmente están como "coming soon".

## Arquitectura

### Stack Tecnológico Existente

- **Frontend**: Vue 3 + TypeScript + Vite
- **UI Framework**: PrimeVue + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Estado**: Composables de Vue 3 (Composition API)
- **Routing**: Vue Router 4
- **Internacionalización**: Vue I18n

### Patrones de Diseño Utilizados

- **Composables Pattern**: Para lógica reutilizable (useItems, useAuth)
- **Service Layer**: Para comunicación con Supabase (ItemService, AuthService)
- **Repository Pattern**: Implementado en los servicios para abstracción de datos
- **Component-Based Architecture**: Componentes Vue reutilizables

## Componentes y Interfaces

### 1. Sistema de Publicación de Items (PublishView)

**Componentes Principales:**

```
PublishView.vue
├── ItemForm.vue (formulario principal)
├── ImageUploader.vue (gestión de imágenes)
├── CategorySelector.vue (selector de categorías)
└── LocationPicker.vue (selector de ubicación)
```

**Funcionalidades:**

- Formulario reactivo con validación en tiempo real
- Upload múltiple de imágenes con preview y reordenamiento
- Selector de categorías con jerarquía
- Campos dinámicos según el tipo de listing
- Autoguardado como borrador
- Preview antes de publicar

**Integración con Servicios:**

- `useItems.createItem()` para crear el item
- `ItemService.uploadImages()` para subir imágenes
- `ItemService.getCategories()` para cargar categorías

### 2. Dashboard Funcional (DashboardView)

**Componentes Principales:**

```
DashboardView.vue
├── StatsCards.vue (estadísticas generales)
├── ItemsGrid.vue (grid de items del usuario)
├── ItemCard.vue (tarjeta individual de item)
└── QuickActions.vue (acciones rápidas)
```

**Funcionalidades:**

- Vista general de estadísticas (total items, vistas, favoritos)
- Grid responsivo de items del usuario
- Filtros por estado (draft, published, paused)
- Acciones rápidas (editar, pausar, eliminar, destacar)
- Indicadores visuales de rendimiento

**Estados de Items:**

- **Draft**: Items guardados pero no publicados
- **Published**: Items activos y visibles públicamente
- **Paused**: Items temporalmente ocultos
- **Completed**: Items que ya fueron vendidos/prestados
- **Archived**: Items archivados por el usuario

### 3. Catálogo Público (ExploreView)

**Componentes Principales:**

```
ExploreView.vue
├── SearchBar.vue (barra de búsqueda)
├── FilterSidebar.vue (filtros laterales)
├── ItemsGrid.vue (grid de resultados)
├── ItemCard.vue (tarjeta de item)
├── Pagination.vue (paginación)
└── SortOptions.vue (opciones de ordenamiento)
```

**Funcionalidades de Búsqueda:**

- Búsqueda por texto (título, descripción, tags)
- Filtros por categoría (con jerarquía)
- Filtros por precio (rango)
- Filtros por ubicación (ciudad, estado)
- Filtros por tipo de listing
- Filtros por condición del item
- Ordenamiento (más reciente, precio, popularidad)

**Optimizaciones:**

- Búsqueda con debounce (300ms)
- Paginación infinita opcional
- Lazy loading de imágenes
- Cache de resultados de búsqueda

### 4. Vista de Detalle de Item (ItemDetailView)

**Componentes Principales:**

```
ItemDetailView.vue
├── ImageGallery.vue (galería de imágenes)
├── ItemInfo.vue (información principal)
├── SellerCard.vue (información del vendedor)
├── ActionButtons.vue (botones de acción)
└── RelatedItems.vue (items relacionados)
```

**Funcionalidades:**

- Galería de imágenes con zoom y navegación
- Información completa del item
- Perfil básico del vendedor
- Botones de acción (favorito, contactar, compartir)
- Items relacionados por categoría
- Breadcrumb de navegación

### 5. Sistema de Favoritos (FavoritesView)

**Componentes Principales:**

```
FavoritesView.vue
├── FavoritesGrid.vue (grid de favoritos)
├── FavoriteCard.vue (tarjeta de favorito)
└── EmptyState.vue (estado vacío)
```

**Funcionalidades:**

- Lista de todos los items favoritos del usuario
- Filtros por categoría y estado
- Acciones rápidas (quitar favorito, contactar)
- Indicadores de disponibilidad
- Notificaciones de cambios en favoritos

### 6. Gestión de Imágenes

**Componente Principal:**

```
ImageUploader.vue
├── DropZone.vue (zona de arrastrar y soltar)
├── ImagePreview.vue (preview de imagen)
├── ProgressBar.vue (barra de progreso)
└── ImageEditor.vue (editor básico)
```

**Funcionalidades:**

- Drag & drop de múltiples imágenes
- Validación de formato y tamaño
- Compresión automática de imágenes
- Reordenamiento de imágenes
- Eliminación individual
- Preview en tiempo real

**Configuración de Storage:**

- Bucket: `item-images`
- Formatos permitidos: JPG, PNG, WebP
- Tamaño máximo: 5MB por imagen
- Máximo 10 imágenes por item
- Compresión automática a 1920x1080

### 7. Sistema de Mensajería (MessagesView)

**Componentes Principales:**

```
MessagesView.vue
├── ConversationsList.vue (lista de conversaciones)
├── ChatWindow.vue (ventana de chat)
├── MessageBubble.vue (burbuja de mensaje)
└── MessageInput.vue (input de mensaje)
```

**Funcionalidades:**

- Lista de conversaciones con preview
- Chat en tiempo real
- Indicadores de mensajes no leídos
- Referencia al item en contexto
- Historial completo de mensajes

## Modelos de Datos

### Estructura de Item Completa

```typescript
interface Item {
  // Identificación
  id: string
  userId: string
  categoryId?: string

  // Información básica
  title: string
  slug: string
  description?: string

  // Tipo y precio
  listingType: ListingType
  pricingMode: PricingModel
  price?: number
  currency: string
  allowNegotiation: boolean

  // Detalles
  quantity: number
  condition?: ItemCondition
  fulfillmentOptions: FulfillmentOption[]

  // Estado y disponibilidad
  status: ItemStatus
  isActive: boolean
  availabilityStart?: string
  availabilityEnd?: string

  // Ubicación
  locationCity?: string
  locationState?: string
  locationCountry?: string

  // Metadatos
  tags: string[]
  metadata: Record<string, unknown>

  // Estadísticas
  viewCount: number
  favoriteCount: number
  lastMessageAt?: string

  // Timestamps
  publishedAt?: string
  createdAt: string
  updatedAt: string

  // Relaciones
  category?: Category
  images?: ItemImage[]
}
```

### Filtros de Búsqueda

```typescript
interface ItemFilters {
  search?: string
  categoryId?: string
  listingType?: ListingType[]
  pricingMode?: PricingModel[]
  priceMin?: number
  priceMax?: number
  condition?: ItemCondition[]
  locationCity?: string
  locationState?: string
  fulfillmentOptions?: FulfillmentOption[]
  tags?: string[]
  userId?: string
  status?: ItemStatus[]
  isActive?: boolean
}
```

## Manejo de Errores

### Estrategia de Manejo de Errores

1. **Errores de Validación**: Mostrar en el formulario en tiempo real
2. **Errores de Red**: Toast notifications con opción de reintentar
3. **Errores de Autenticación**: Redirección automática al login
4. **Errores de Permisos**: Mensajes informativos claros
5. **Errores de Storage**: Fallbacks y mensajes específicos

### Tipos de Error Personalizados

```typescript
interface ItemServiceError {
  code: string
  message: string
  details?: Record<string, unknown>
  field?: string // Para errores de validación
}
```

## Estrategia de Testing

### Testing de Componentes

- **Unit Tests**: Lógica de composables y servicios
- **Component Tests**: Comportamiento de componentes individuales
- **Integration Tests**: Flujos completos de usuario

### Testing de Servicios

- **ItemService**: CRUD operations, filtros, paginación
- **ImageService**: Upload, validación, eliminación
- **AuthService**: Autenticación y autorización

### E2E Testing

- Flujo completo de publicación de item
- Búsqueda y filtrado
- Sistema de favoritos
- Mensajería básica

## Optimizaciones de Rendimiento

### Frontend

- **Lazy Loading**: Componentes y rutas
- **Image Optimization**: Compresión y lazy loading
- **Virtual Scrolling**: Para listas largas
- **Debouncing**: En búsquedas y filtros
- **Caching**: Resultados de búsqueda y categorías

### Backend (Supabase)

- **Índices de Base de Datos**: En campos de búsqueda frecuente
- **RLS Policies**: Optimizadas para rendimiento
- **Paginación**: Cursor-based para mejor rendimiento
- **Full-Text Search**: Usando PostgreSQL trgm

### Storage

- **CDN**: Para imágenes optimizadas
- **Compresión**: Automática de imágenes
- **Lazy Loading**: De imágenes en grids
- **Progressive Loading**: Placeholder → Low-res → High-res

## Consideraciones de Seguridad

### Validación de Datos

- Validación en frontend y backend
- Sanitización de inputs de usuario
- Validación de tipos de archivo
- Límites de tamaño y cantidad

### Autorización

- RLS policies en todas las tablas
- Verificación de ownership en operaciones
- Rate limiting en uploads
- Validación de permisos en cada operación

### Protección de Datos

- No exposición de datos sensibles
- Encriptación de datos en tránsito
- Logs de auditoría para operaciones críticas
- Backup automático de datos
