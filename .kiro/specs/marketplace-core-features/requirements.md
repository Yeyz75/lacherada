# Requisitos - Funcionalidades Core del Marketplace LaCherada

## Introducción

Este documento define los requisitos para completar las funcionalidades core del marketplace
LaCherada. El proyecto ya cuenta con una base sólida de autenticación, esquema de base de datos
completo y servicios básicos. Ahora necesitamos implementar las funcionalidades principales que
permitan a los usuarios publicar, buscar, y gestionar items/servicios de manera efectiva.

## Requisitos

### Requisito 1 - Sistema de Publicación de Items

**Historia de Usuario:** Como usuario registrado, quiero poder publicar mis items/servicios de
manera fácil e intuitiva, para que otros usuarios puedan encontrarlos y contactarme.

#### Criterios de Aceptación

1. CUANDO el usuario acceda a PublishView ENTONCES el sistema DEBERÁ mostrar un formulario completo
   de publicación
2. CUANDO el usuario complete los campos obligatorios (título, descripción, categoría, precio)
   ENTONCES el sistema DEBERÁ permitir guardar el item
3. CUANDO el usuario suba imágenes ENTONCES el sistema DEBERÁ almacenarlas en Supabase Storage y
   asociarlas al item
4. CUANDO el usuario publique un item ENTONCES el sistema DEBERÁ generar un slug único y establecer
   el estado como "active"
5. CUANDO se publique exitosamente ENTONCES el sistema DEBERÁ redirigir al usuario a su dashboard
   con mensaje de confirmación

### Requisito 2 - Dashboard Funcional de Usuario

**Historia de Usuario:** Como usuario registrado, quiero ver y gestionar todos mis items publicados
desde un dashboard centralizado, para tener control total sobre mis publicaciones.

#### Criterios de Aceptación

1. CUANDO el usuario acceda a DashboardView ENTONCES el sistema DEBERÁ mostrar todos sus items
   publicados
2. CUANDO el usuario vea un item ENTONCES el sistema DEBERÁ mostrar estadísticas básicas (vistas,
   favoritos, mensajes)
3. CUANDO el usuario haga clic en "editar" ENTONCES el sistema DEBERÁ permitir modificar el item
4. CUANDO el usuario haga clic en "eliminar" ENTONCES el sistema DEBERÁ solicitar confirmación y
   eliminar el item
5. CUANDO el usuario cambie el estado de un item ENTONCES el sistema DEBERÁ actualizar la
   visibilidad pública

### Requisito 3 - Catálogo Público con Búsqueda

**Historia de Usuario:** Como visitante o usuario registrado, quiero explorar todos los items
disponibles con opciones de búsqueda y filtrado, para encontrar exactamente lo que necesito.

#### Criterios de Aceptación

1. CUANDO el usuario acceda a ExploreView ENTONCES el sistema DEBERÁ mostrar todos los items activos
   paginados
2. CUANDO el usuario escriba en el buscador ENTONCES el sistema DEBERÁ filtrar items por título y
   descripción en tiempo real
3. CUANDO el usuario seleccione una categoría ENTONCES el sistema DEBERÁ mostrar solo items de esa
   categoría
4. CUANDO el usuario aplique filtros de precio ENTONCES el sistema DEBERÁ mostrar items dentro del
   rango especificado
5. CUANDO el usuario haga clic en un item ENTONCES el sistema DEBERÁ mostrar la vista de detalle
   completa

### Requisito 4 - Vista de Detalle de Item

**Historia de Usuario:** Como usuario interesado, quiero ver todos los detalles de un item
incluyendo imágenes, descripción completa y opciones de contacto, para tomar una decisión informada.

#### Criterios de Aceptación

1. CUANDO el usuario acceda a la vista de detalle ENTONCES el sistema DEBERÁ mostrar toda la
   información del item
2. CUANDO el item tenga imágenes ENTONCES el sistema DEBERÁ mostrar una galería navegable
3. CUANDO el usuario esté autenticado ENTONCES el sistema DEBERÁ mostrar opciones para agregar a
   favoritos y contactar
4. CUANDO el usuario haga clic en "contactar" ENTONCES el sistema DEBERÁ abrir el chat con el
   vendedor
5. CUANDO el usuario agregue a favoritos ENTONCES el sistema DEBERÁ actualizar el contador y guardar
   la preferencia

### Requisito 5 - Sistema de Favoritos

**Historia de Usuario:** Como usuario registrado, quiero poder marcar items como favoritos y ver una
lista de todos mis favoritos, para acceder rápidamente a items de mi interés.

#### Criterios de Aceptación

1. CUANDO el usuario haga clic en el ícono de favorito ENTONCES el sistema DEBERÁ agregar/quitar el
   item de favoritos
2. CUANDO el usuario acceda a FavoritesView ENTONCES el sistema DEBERÁ mostrar todos sus items
   favoritos
3. CUANDO el usuario quite un favorito ENTONCES el sistema DEBERÁ actualizar la lista inmediatamente
4. CUANDO se actualice un favorito ENTONCES el sistema DEBERÁ actualizar el contador en el item
   original
5. CUANDO el item favorito sea eliminado por su dueño ENTONCES el sistema DEBERÁ removerlo
   automáticamente de favoritos

### Requisito 6 - Gestión de Categorías

**Historia de Usuario:** Como usuario, quiero poder seleccionar categorías apropiadas para mis items
y filtrar por categorías al buscar, para una mejor organización del marketplace.

#### Criterios de Aceptación

1. CUANDO el usuario publique un item ENTONCES el sistema DEBERÁ mostrar todas las categorías
   activas disponibles
2. CUANDO el usuario filtre por categoría ENTONCES el sistema DEBERÁ mostrar solo items de esa
   categoría
3. CUANDO se muestre una categoría ENTONCES el sistema DEBERÁ incluir el ícono y descripción
   correspondiente
4. CUANDO una categoría tenga subcategorías ENTONCES el sistema DEBERÁ mostrar la jerarquía
   correctamente
5. CUANDO se seleccione una categoría padre ENTONCES el sistema DEBERÁ incluir items de todas las
   subcategorías

### Requisito 7 - Upload y Gestión de Imágenes

**Historia de Usuario:** Como usuario que publica items, quiero poder subir múltiples imágenes de
alta calidad y gestionarlas fácilmente, para mostrar mis items de la mejor manera posible.

#### Criterios de Aceptación

1. CUANDO el usuario suba imágenes ENTONCES el sistema DEBERÁ validar formato y tamaño máximo
2. CUANDO se suba una imagen ENTONCES el sistema DEBERÁ almacenarla en Supabase Storage con nombre
   único
3. CUANDO el usuario suba múltiples imágenes ENTONCES el sistema DEBERÁ permitir reordenarlas
4. CUANDO el usuario elimine una imagen ENTONCES el sistema DEBERÁ removerla del storage y base de
   datos
5. CUANDO se muestre un item ENTONCES el sistema DEBERÁ cargar las imágenes optimizadas y con lazy
   loading

### Requisito 8 - Mensajería Básica

**Historia de Usuario:** Como usuario interesado en un item, quiero poder contactar directamente al
vendedor a través de un sistema de mensajes interno, para coordinar la transacción de manera segura.

#### Criterios de Aceptación

1. CUANDO el usuario haga clic en "contactar" ENTONCES el sistema DEBERÁ abrir/crear una
   conversación
2. CUANDO el usuario envíe un mensaje ENTONCES el sistema DEBERÁ almacenarlo y notificar al
   destinatario
3. CUANDO el usuario acceda a MessagesView ENTONCES el sistema DEBERÁ mostrar todas sus
   conversaciones
4. CUANDO llegue un mensaje nuevo ENTONCES el sistema DEBERÁ mostrar indicador de no leído
5. CUANDO se elimine un item ENTONCES el sistema DEBERÁ mantener las conversaciones existentes pero
   marcarlas como archivadas
