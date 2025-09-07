# LaCherada 🌟

> Una aplicación web moderna para compartir y descubrir elementos y servicios en tu comunidad.

## 📖 Descripción del Proyecto

**LaCherada** es una plataforma web innovadora diseñada para conectar a las personas de una comunidad, permitiéndoles compartir, prestar, vender y descubrir elementos y servicios locales. La aplicación fomenta la economía colaborativa y el intercambio comunitario, creando un ecosistema sostenible donde los vecinos pueden ayudarse mutuamente.

### 🎯 Objetivo Principal

Crear una red comunitaria que facilite:
- **Préstamo de objetos** entre vecinos
- **Venta de artículos** locales
- **Intercambio de servicios** comunitarios
- **Descubrimiento** de recursos disponibles en el área

## ✨ Características Principales

### 🔍 **Exploración y Búsqueda**
- Sistema de búsqueda avanzada por categorías, tipo y ubicación
- Filtros inteligentes para encontrar exactamente lo que necesitas
- Interfaz intuitiva para navegar por elementos y servicios disponibles

### 🌍 **Internacionalización**
- Soporte completo para múltiples idiomas (Español e Inglés)
- Interfaz adaptativa según preferencias del usuario
- Textos y contenido completamente localizados

### 🔐 **Sistema de Autenticación**
- Registro e inicio de sesión seguro
- Gestión de perfiles de usuario
- Recuperación de contraseñas
- Integración con Firebase para autenticación robusta

### 🎨 **Diseño Moderno**
- Interfaz responsive para desktop y móvil
- Sistema de temas (claro/oscuro)
- Componentes reutilizables y consistentes
- Experiencia de usuario optimizada

### 📱 **Componentes Principales**
- **NavBar**: Navegación principal con autenticación
- **HeroSection**: Presentación atractiva de la plataforma
- **Categories**: Exploración por categorías de productos/servicios
- **Testimonials**: Experiencias de usuarios reales
- **Stats**: Estadísticas de la comunidad
- **Footer**: Información adicional y enlaces

## 🛠️ Stack Tecnológico

### **Frontend Core**
- **Vue 3** (`^3.4.38`) - Framework principal con Composition API
- **TypeScript** (`^5.5.3`) - Tipado estático para mayor robustez
- **Vite** (`^5.4.2`) - Build tool ultrarrápido con HMR

### **UI y Componentes**
- **PrimeVue** (`^4.3.9`) - Biblioteca de componentes UI moderna
- **PrimeVue Themes** (`^4.3.9`) - Sistema de temas personalizable
- **Iconify Vue** (`^5.0.0`) - Iconos vectoriales optimizados

### **Enrutamiento y Estado**
- **Vue Router** (`^4.5.1`) - Navegación SPA
- **Vue i18n** (`^11.1.12`) - Internacionalización completa

### **Backend y Servicios**
- **Firebase** - Autenticación y servicios en la nube
- Variables de entorno configurables

### **Herramientas de Desarrollo**
- **ESLint** (`^9.35.0`) - Linting de código
- **Prettier** (`^3.6.2`) - Formateo de código
- **Stylelint** (`^14.16.1`) - Linting de estilos
- **TypeScript ESLint** - Reglas específicas para TS

## 🚀 Instalación y Configuración

### **Prerrequisitos**
- Node.js 18+ 
- npm, yarn o pnpm
- Git

### **Pasos de Instalación**

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd lacherada
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   # o
   yarn install
   # o
   pnpm install
   ```

3. **Configurar variables de entorno**
   ```bash
   # Crear archivo .env en la raíz del proyecto
   cp .env.example .env
   
   # Configurar variables de Firebase
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   ```

5. **Acceder a la aplicación**
   ```
   http://localhost:5173
   ```

## 📜 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Construye la aplicación para producción |
| `npm run preview` | Previsualiza el build de producción |
| `npm run lint` | Ejecuta el linter de código |
| `npm run lint:fix` | Corrige automáticamente errores de linting |
| `npm run format` | Formatea el código con Prettier |
| `npm run format:check` | Verifica el formateo del código |
| `npm run style` | Ejecuta Stylelint |
| `npm run style:fix` | Corrige automáticamente errores de estilo |
| `npm run check-all` | Ejecuta todas las verificaciones |
| `npm run fix-all` | Corrige automáticamente todos los errores |

## 🏗️ Arquitectura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Categories/      # Exploración por categorías
│   ├── Footer/          # Pie de página
│   ├── HeroSections/    # Sección principal
│   ├── HowItWorks/      # Explicación del funcionamiento
│   ├── NavBar/          # Barra de navegación
│   ├── PrimeVueDemo/    # Demostración de componentes
│   ├── StatsSection/    # Estadísticas de la plataforma
│   └── Testimonials/    # Testimonios de usuarios
├── composables/         # Lógica reutilizable
│   ├── useAuth.ts       # Gestión de autenticación
│   └── useTheme.ts      # Gestión de temas
├── i18n/               # Configuración de internacionalización
├── locales/            # Archivos de traducción
│   ├── en.json         # Traducciones en inglés
│   └── es.json         # Traducciones en español
├── router/             # Configuración de rutas
├── styles/             # Estilos globales y variables CSS
├── types/              # Definiciones de tipos TypeScript
├── views/              # Vistas principales de la aplicación
│   ├── auth/           # Vistas de autenticación
│   └── home/           # Vista principal
├── App.vue             # Componente raíz
├── main.ts             # Punto de entrada de la aplicación
└── firebase-config.ts  # Configuración de Firebase
```

## 🔧 Configuración de Desarrollo

### **ESLint**
Configurado con reglas estrictas para Vue 3 + TypeScript:
- PascalCase para nombres de componentes
- Ordenamiento estricto de imports
- Prohibición de `var`, preferencia por `const`

### **Prettier**
- Comillas simples
- Sin punto y coma
- Comas finales en multilínea
- Paréntesis siempre en arrow functions

### **Stylelint**
- Extensiones recomendadas para SCSS y Vue
- Reglas personalizadas para Tailwind CSS

## 🌐 Internacionalización

La aplicación soporta múltiples idiomas con `vue-i18n`:
- **Español (es)**: Idioma predeterminado
- **Inglés (en)**: Idioma alternativo

Todas las interfaces, formularios y mensajes están completamente traducidos.

## 🔐 Autenticación

Sistema de autenticación robusto con Firebase:
- Registro de nuevos usuarios
- Inicio de sesión
- Recuperación de contraseñas
- Gestión de sesiones
- Protección de rutas

## 🎨 Sistema de Temas

- **Tema Claro**: Diseño limpio y profesional
- **Tema Oscuro**: Modo nocturno para mejor experiencia
- **Personalización**: Variables CSS para fácil modificación
- **Persistencia**: Preferencias guardadas localmente

## 🚀 Despliegue

### **Build de Producción**
```bash
npm run build
```

### **Opciones de Hosting**
- **Firebase Hosting** (recomendado)
- **Netlify**
- **Vercel**
- **GitHub Pages**

Los archivos se generan en el directorio `dist/` listo para cualquier servidor web estático.

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'Añadir nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Autores

- **Equipo de Desarrollo** - *Desarrollo inicial* - LaCherada Team

## 🙏 Agradecimientos

- Comunidad Vue.js por el excelente framework
- PrimeVue por los componentes UI
- Firebase por los servicios backend
- Todos los contribuidores del proyecto

---

**¡Únete a la revolución del intercambio comunitario con LaCherada! 🚀**