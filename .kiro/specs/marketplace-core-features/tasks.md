# Plan de Implementación - Funcionalidades Core del Marketplace

- [ ] 1. Completar funcionalidad de PublishView
  - Reemplazar el contenido "coming soon" con formulario funcional de publicación
  - Integrar BaseFileUpload existente para gestión de imágenes del item
  - Implementar validación de formulario en tiempo real usando componentes base existentes
  - Conectar con ItemService.createItem() y uploadItemImage() que ya existen
  - _Requisitos: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 2. Crear selector de categorías para PublishView
  - Crear CategorySelector.vue que use ItemService.getCategories() existente
  - Implementar selección jerárquica de categorías con componentes base
  - Integrar selector de categorías en el formulario de PublishView
  - _Requisitos: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 3. Completar DashboardView funcional
  - Reemplazar contenido "coming soon" con dashboard real usando useItems existente
  - Crear ItemsGrid.vue para mostrar items del usuario con BaseCard
  - Crear ItemCard.vue con acciones (editar, eliminar, pausar) usando BaseButton
  - Agregar estadísticas básicas usando datos del composable useItems
  - _Requisitos: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 4. Implementar vista de detalle de items
  - Crear ItemDetailView.vue usando ItemService.getItemBySlug() existente
  - Implementar ImageGallery.vue para navegación de imágenes
  - Agregar ruta dinámica /item/:slug en el router existente
  - Integrar botones de favorito usando addToFavorites/removeFromFavorites existentes
  - _Requisitos: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 5. Completar ExploreView con búsqueda y filtros
  - Reemplazar contenido básico con funcionalidad completa usando useItems.loadItems()
  - Implementar SearchBar.vue con búsqueda en tiempo real
  - Crear FilterSidebar.vue usando categorías de ItemService.getCategories()
  - Agregar paginación usando la paginación existente en useItems
  - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 6. Completar FavoritesView funcional
  - Reemplazar contenido "coming soon" usando useItems.loadUserFavorites() existente
  - Crear grid de favoritos reutilizando ItemCard.vue
  - Integrar botones para quitar favoritos usando removeFromFavorites existente
  - Mostrar estado vacío cuando no hay favoritos
  - _Requisitos: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 7. Implementar mensajería básica
  - Completar MessagesView.vue con lista de conversaciones
  - Crear ChatWindow.vue para ventana de chat individual
  - Implementar messageService.ts para envío y recepción de mensajes (la tabla ya existe)
  - Agregar botón "contactar" en ItemDetailView que abra chat
  - _Requisitos: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 8. Agregar funcionalidad de edición de items
  - Crear EditItemView.vue reutilizando componentes de PublishView
  - Usar ItemService.updateItem() existente para actualizar items
  - Agregar ruta /edit-item/:id en el router existente
  - Conectar botón "editar" del dashboard con la vista de edición
  - _Requisitos: 2.3_

- [ ] 9. Implementar gestión de estados de items
  - Usar ItemService.updateItem() para cambiar estado de items (pausar, activar, archivar)
  - Implementar filtros por estado en DashboardView usando filtros existentes
  - Crear indicadores visuales para diferentes estados usando BaseBadge
  - Agregar validaciones de estado usando tipos existentes
  - _Requisitos: 2.5_

- [ ] 10. Optimizar rendimiento y experiencia de usuario
  - Implementar lazy loading de imágenes en grids
  - Agregar debounce a la búsqueda en ExploreView
  - Implementar loading states usando isLoading de useItems
  - Agregar toast notifications usando PrimeVue ToastService ya configurado
  - _Requisitos: Todos los requisitos de UX_

- [ ] 11. Integrar componentes y finalizar flujos
  - Conectar todas las vistas con navegación coherente usando router existente
  - Implementar breadcrumbs en vistas de detalle
  - Agregar enlaces entre vistas relacionadas (dashboard → edit, explore → detail)
  - Verificar que todos los flujos de usuario funcionen end-to-end
  - _Requisitos: Todos los requisitos de navegación_
