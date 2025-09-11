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
- Preparado para integración con Supabase

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
- **Supabase** (`@supabase/supabase-js`) - Autenticación y base de datos
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

3. **Configurar Supabase**
   
   a. Crear un proyecto en [Supabase](https://supabase.com)
   
   b. Ejecutar el esquema de base de datos:
   ```sql
   -- Copiar y ejecutar el contenido de supabase-schema.sql
   -- en el SQL Editor de tu proyecto Supabase
   ```
   
   c. Configurar variables de entorno:
   ```bash
   # Crear archivo .env en la raíz del proyecto
   cp .env.example .env
   
   # Configurar variables de Supabase
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu_clave_publica_anonima
   ```
   
   d. Configurar autenticación con Google (opcional):
   - En tu proyecto Supabase, ir a Authentication > Providers
   - Habilitar Google OAuth
   - Configurar Client ID y Client Secret de Google
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
├── supabase-config.ts  # Configuración de Supabase
└── services/
    └── authService.ts   # Servicio de autenticación
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

Sistema de autenticación completo con Supabase:
- **Registro con email/contraseña**: Creación de cuentas seguras
- **Inicio de sesión**: Autenticación con credenciales
- **OAuth con Google**: Login social integrado
- **Recuperación de contraseñas**: Reset por email
- **Gestión de perfiles**: Datos de usuario en base de datos
- **Row Level Security**: Seguridad a nivel de fila
- **Sesiones automáticas**: Manejo de estado de autenticación

### **Características Avanzadas**
- Usuarios de Google pueden establecer contraseña posteriormente
- Detección automática del método de login (email/google/mixto)
- Perfiles de usuario con información extendida
- Triggers automáticos para nuevos usuarios

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
- **Netlify** (recomendado)
- **Vercel**
- **GitHub Pages**
- **Supabase Edge Functions** (para funciones serverless)

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
- Supabase por los servicios backend
- Todos los contribuidores del proyecto

---

**¡Únete a la revolución del intercambio comunitario con LaCherada! 🚀**