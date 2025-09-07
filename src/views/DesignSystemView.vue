<template>
  <div class="design-system-demo">
    <div class="container">
      <!-- Header -->
      <header class="demo-header">
        <h1>LaCherada Design System</h1>
        <p>
          Componentes base estandarizados para mantener consistencia visual y
          mejorar la experiencia del desarrollador.
        </p>
      </header>

      <!-- Navigation -->
      <nav class="demo-nav">
        <button
          v-for="section in sections"
          :key="section.id"
          class="demo-nav-btn"
          :class="{ active: activeSection === section.id }"
          @click="activeSection = section.id">
          {{ section.title }}
        </button>
      </nav>

      <!-- Content -->
      <main class="demo-content">
        <!-- Buttons Section -->
        <section v-if="activeSection === 'buttons'" class="demo-section">
          <h2>BaseButton</h2>
          <p>
            Botones consistentes con múltiples variantes, tamaños y estados.
          </p>

          <div class="demo-group">
            <h3>Variantes</h3>
            <div class="demo-row">
              <BaseButton variant="primary">Primary</BaseButton>
              <BaseButton variant="secondary">Secondary</BaseButton>
              <BaseButton variant="ghost">Ghost</BaseButton>
              <BaseButton variant="danger">Danger</BaseButton>
              <BaseButton variant="success">Success</BaseButton>
              <BaseButton variant="warning">Warning</BaseButton>
            </div>
          </div>

          <div class="demo-group">
            <h3>Tamaños</h3>
            <div class="demo-row">
              <BaseButton size="xs">Extra Small</BaseButton>
              <BaseButton size="sm">Small</BaseButton>
              <BaseButton size="md">Medium</BaseButton>
              <BaseButton size="lg">Large</BaseButton>
              <BaseButton size="xl">Extra Large</BaseButton>
            </div>
          </div>

          <div class="demo-group">
            <h3>Con Iconos</h3>
            <div class="demo-row">
              <BaseButton icon="mdi:plus" icon-position="left">
                Agregar
              </BaseButton>
              <BaseButton icon="mdi:download" icon-position="right">
                Descargar
              </BaseButton>
              <BaseButton icon="mdi:heart" variant="ghost" />
              <BaseButton icon="mdi:loading" loading> Cargando... </BaseButton>
            </div>
          </div>

          <div class="demo-group">
            <h3>Estados</h3>
            <div class="demo-row">
              <BaseButton disabled>Deshabilitado</BaseButton>
              <BaseButton loading>Cargando</BaseButton>
              <BaseButton full-width>Ancho Completo</BaseButton>
            </div>
          </div>

          <!-- Code Example -->
          <div class="demo-code">
            <h4>Código de Ejemplo:</h4>
            <pre><code>&lt;BaseButton variant="primary" size="md" icon="mdi:plus"&gt;
  Agregar Elemento
&lt;/BaseButton&gt;</code></pre>
          </div>
        </section>

        <!-- Inputs Section -->
        <section v-if="activeSection === 'inputs'" class="demo-section">
          <h2>BaseInput</h2>
          <p>Campos de entrada con validación, iconos y múltiples estados.</p>

          <div class="demo-group">
            <h3>Tipos Básicos</h3>
            <div class="demo-column">
              <BaseInput
                v-model="demoData.name"
                label="Nombre Completo"
                placeholder="Ingresa tu nombre"
                required />

              <BaseInput
                v-model="demoData.email"
                type="email"
                label="Correo Electrónico"
                placeholder="ejemplo@correo.com"
                icon="mdi:email"
                required />

              <BaseInput
                v-model="demoData.phone"
                type="tel"
                label="Teléfono"
                placeholder="+52 999 999 9999"
                icon="mdi:phone"
                icon-position="left" />
            </div>
          </div>

          <div class="demo-group">
            <h3>Estados</h3>
            <div class="demo-column">
              <BaseInput
                label="Campo con Error"
                error="Este campo es requerido"
                placeholder="Campo inválido" />

              <BaseInput
                label="Campo Exitoso"
                success
                placeholder="Campo válido"
                model-value="Valor válido" />

              <BaseInput
                label="Campo Deshabilitado"
                disabled
                placeholder="No editable" />
            </div>
          </div>

          <div class="demo-group">
            <h3>Tamaños</h3>
            <div class="demo-column">
              <BaseInput size="sm" placeholder="Pequeño" />
              <BaseInput size="md" placeholder="Mediano" />
              <BaseInput size="lg" placeholder="Grande" />
            </div>
          </div>

          <!-- Code Example -->
          <div class="demo-code">
            <h4>Código de Ejemplo:</h4>
            <pre><code>&lt;BaseInput
  v-model="email"
  type="email"
  label="Correo Electrónico"
  placeholder="ejemplo@correo.com"
  icon="mdi:email"
  required
  :error="emailError" /&gt;</code></pre>
          </div>
        </section>

        <!-- Cards Section -->
        <section v-if="activeSection === 'cards'" class="demo-section">
          <h2>BaseCard</h2>
          <p>Contenedores versátiles para organizar contenido.</p>

          <div class="demo-group">
            <h3>Variantes</h3>
            <div class="demo-grid">
              <BaseCard variant="default" title="Card Default">
                <p>Contenido de la tarjeta con borde sólido y sombra sutil.</p>
                <template #actions>
                  <BaseButton size="sm">Acción</BaseButton>
                </template>
              </BaseCard>

              <BaseCard variant="glass" title="Card Glass">
                <p>Efecto glassmorphism con transparencia y blur.</p>
                <template #actions>
                  <BaseButton size="sm" variant="ghost"> Acción </BaseButton>
                </template>
              </BaseCard>

              <BaseCard variant="elevated" title="Card Elevated">
                <p>Tarjeta elevada con sombra prominente.</p>
              </BaseCard>

              <BaseCard variant="outlined" title="Card Outlined">
                <p>Tarjeta con borde grueso sin sombra.</p>
              </BaseCard>
            </div>
          </div>

          <div class="demo-group">
            <h3>Tarjeta Interactiva</h3>
            <div class="demo-row">
              <BaseCard
                clickable
                title="Tarjeta Clickeable"
                subtitle="Hace hover para ver el efecto"
                @click="showMessage('¡Tarjeta clickeada!')">
                <p>Esta tarjeta es clickeable y muestra efectos de hover.</p>
              </BaseCard>
            </div>
          </div>

          <div class="demo-group">
            <h3>Estados</h3>
            <div class="demo-row">
              <BaseCard title="Tarjeta Cargando" loading>
                <p>Contenido oculto mientras carga...</p>
              </BaseCard>
            </div>
          </div>

          <!-- Code Example -->
          <div class="demo-code">
            <h4>Código de Ejemplo:</h4>
            <pre><code>&lt;BaseCard variant="glass" title="Mi Tarjeta" clickable&gt;
  &lt;p&gt;Contenido de la tarjeta&lt;/p&gt;
  &lt;template #actions&gt;
    &lt;BaseButton size="sm"&gt;Acción&lt;/BaseButton&gt;
  &lt;/template&gt;
&lt;/BaseCard&gt;</code></pre>
          </div>
        </section>

        <!-- Table Section -->
        <section v-if="activeSection === 'tables'" class="demo-section">
          <h2>BaseTable</h2>
          <p>Tablas de datos con ordenamiento, selección y paginación.</p>

          <div class="demo-group">
            <BaseTable
              title="Usuarios del Sistema"
              :columns="tableColumns"
              :data="tableData"
              :loading="tableLoading"
              selectable
              :pagination="tablePagination"
              @sort="handleSort"
              @row-select="handleRowSelect"
              @page-change="handlePageChange">
              <template #actions>
                <BaseButton size="sm" icon="mdi:plus"> Agregar </BaseButton>
                <BaseButton
                  size="sm"
                  variant="ghost"
                  icon="mdi:refresh"
                  @click="refreshTable">
                  Actualizar
                </BaseButton>
              </template>
            </BaseTable>
          </div>

          <!-- Code Example -->
          <div class="demo-code">
            <h4>Código de Ejemplo:</h4>
            <pre><code>&lt;BaseTable
  title="Mis Datos"
  :columns="columns"
  :data="data"
  selectable
  :pagination="pagination"
  @sort="handleSort"
  @row-select="handleRowSelect" /&gt;</code></pre>
          </div>
        </section>

        <!-- Forms Section -->
        <section v-if="activeSection === 'forms'" class="demo-section">
          <h2>BaseForm</h2>
          <p>Formularios consistentes con validación automática.</p>

          <div class="demo-group">
            <h3>Formulario Dinámico</h3>
            <div class="demo-form-container">
              <BaseForm
                title="Contactar Usuario"
                subtitle="Completa el formulario para enviar un mensaje"
                :fields="formFields"
                v-model="formData"
                :loading="formLoading"
                @submit="handleFormSubmit"
                @cancel="handleFormCancel" />
            </div>
          </div>

          <div class="demo-group">
            <h3>Formulario Custom</h3>
            <div class="demo-form-container">
              <BaseForm
                title="Registro Manual"
                :loading="customFormLoading"
                @submit="handleCustomSubmit">
                <BaseInput
                  v-model="customForm.username"
                  label="Nombre de Usuario"
                  placeholder="usuario123"
                  required />

                <BaseInput
                  v-model="customForm.email"
                  type="email"
                  label="Email"
                  placeholder="email@ejemplo.com"
                  required />

                <div class="form-row">
                  <BaseInput
                    v-model="customForm.firstName"
                    label="Nombre"
                    placeholder="Juan" />

                  <BaseInput
                    v-model="customForm.lastName"
                    label="Apellido"
                    placeholder="Pérez" />
                </div>
              </BaseForm>
            </div>
          </div>

          <!-- Code Example -->
          <div class="demo-code">
            <h4>Código de Ejemplo:</h4>
            <pre><code>&lt;BaseForm
  title="Mi Formulario"
  :fields="formFields"
  v-model="formData"
  @submit="handleSubmit" /&gt;</code></pre>
          </div>
        </section>

        <!-- Design Tokens -->
        <section v-if="activeSection === 'tokens'" class="demo-section">
          <h2>Design Tokens</h2>
          <p>Variables CSS y tokens de diseño para mantener consistencia.</p>

          <div class="demo-group">
            <h3>Colores</h3>
            <div class="color-palette">
              <div class="color-item">
                <div
                  class="color-swatch"
                  style="background: var(--color-primary)"></div>
                <span>Primary</span>
                <code>--color-primary</code>
              </div>
              <div class="color-item">
                <div
                  class="color-swatch"
                  style="background: var(--color-secondary)"></div>
                <span>Secondary</span>
                <code>--color-secondary</code>
              </div>
              <div class="color-item">
                <div
                  class="color-swatch"
                  style="background: var(--color-success)"></div>
                <span>Success</span>
                <code>--color-success</code>
              </div>
              <div class="color-item">
                <div
                  class="color-swatch"
                  style="background: var(--color-warning)"></div>
                <span>Warning</span>
                <code>--color-warning</code>
              </div>
              <div class="color-item">
                <div
                  class="color-swatch"
                  style="background: var(--color-error)"></div>
                <span>Error</span>
                <code>--color-error</code>
              </div>
            </div>
          </div>

          <div class="demo-group">
            <h3>Tipografía</h3>
            <div class="typography-demo">
              <h1>Heading 1 - var(--font-size-5xl)</h1>
              <h2>Heading 2 - var(--font-size-4xl)</h2>
              <h3>Heading 3 - var(--font-size-3xl)</h3>
              <h4>Heading 4 - var(--font-size-2xl)</h4>
              <h5>Heading 5 - var(--font-size-xl)</h5>
              <h6>Heading 6 - var(--font-size-lg)</h6>
              <p>Texto base - var(--font-size-base)</p>
              <small>Texto pequeño - var(--font-size-sm)</small>
            </div>
          </div>

          <div class="demo-group">
            <h3>Espaciado</h3>
            <div class="spacing-demo">
              <div class="spacing-item" style="padding: var(--space-xs)">
                xs (8px)
              </div>
              <div class="spacing-item" style="padding: var(--space-sm)">
                sm (16px)
              </div>
              <div class="spacing-item" style="padding: var(--space-md)">
                md (24px)
              </div>
              <div class="spacing-item" style="padding: var(--space-lg)">
                lg (32px)
              </div>
              <div class="spacing-item" style="padding: var(--space-xl)">
                xl (48px)
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive } from 'vue'
  import {
    BaseButton,
    BaseInput,
    BaseCard,
    BaseTable,
    BaseForm,
    type TableColumn,
    type FormField,
  } from '../components/base'

  // Navigation
  const activeSection = ref('buttons')

  const sections = [
    { id: 'buttons', title: 'Botones' },
    { id: 'inputs', title: 'Inputs' },
    { id: 'cards', title: 'Tarjetas' },
    { id: 'tables', title: 'Tablas' },
    { id: 'forms', title: 'Formularios' },
    { id: 'tokens', title: 'Tokens' },
  ]

  // Demo data
  const demoData = reactive({
    name: '',
    email: '',
    phone: '',
  })

  // Table demo
  const tableLoading = ref(false)
  const tableColumns: TableColumn[] = [
    { key: 'name', label: 'Nombre', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Rol' },
    {
      key: 'status',
      label: 'Estado',
      render: (value) => (value === 'active' ? '✅ Activo' : '⏸️ Inactivo'),
    },
    { key: 'actions', label: 'Acciones', render: () => '⚙️' },
  ]

  const tableData = [
    {
      id: 1,
      name: 'Juan Pérez',
      email: 'juan@ejemplo.com',
      role: 'Admin',
      status: 'active',
    },
    {
      id: 2,
      name: 'María García',
      email: 'maria@ejemplo.com',
      role: 'User',
      status: 'active',
    },
    {
      id: 3,
      name: 'Carlos López',
      email: 'carlos@ejemplo.com',
      role: 'User',
      status: 'inactive',
    },
    {
      id: 4,
      name: 'Ana Martínez',
      email: 'ana@ejemplo.com',
      role: 'Moderator',
      status: 'active',
    },
  ]

  const tablePagination = reactive({
    page: 1,
    size: 10,
    total: 100,
  })

  // Form demo
  const formLoading = ref(false)
  const formData = ref({})

  const formFields: FormField[] = [
    {
      name: 'name',
      label: 'Nombre Completo',
      type: 'input',
      required: true,
      placeholder: 'Ingresa tu nombre',
    },
    {
      name: 'email',
      label: 'Correo Electrónico',
      type: 'input',
      required: true,
      placeholder: 'ejemplo@correo.com',
    },
    {
      name: 'category',
      label: 'Categoría',
      type: 'select',
      required: true,
      options: [
        { label: 'General', value: 'general' },
        { label: 'Soporte', value: 'support' },
        { label: 'Ventas', value: 'sales' },
      ],
    },
    {
      name: 'message',
      label: 'Mensaje',
      type: 'textarea',
      required: true,
      placeholder: 'Escribe tu mensaje...',
    },
    {
      name: 'newsletter',
      label: 'Suscribirse al newsletter',
      type: 'checkbox',
    },
  ]

  // Custom form
  const customFormLoading = ref(false)
  const customForm = reactive({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
  })

  // Event handlers
  const showMessage = (message: string) => {
    alert(message)
  }

  const handleSort = (column: string, order: 'asc' | 'desc') => {
    console.log('Sort:', column, order)
  }

  const handleRowSelect = (selectedRows: any[]) => {
    console.log('Selected rows:', selectedRows)
  }

  const handlePageChange = (page: number) => {
    tablePagination.page = page
  }

  const refreshTable = () => {
    tableLoading.value = true
    setTimeout(() => {
      tableLoading.value = false
    }, 1000)
  }

  const handleFormSubmit = (data: any) => {
    console.log('Form submitted:', data)
    formLoading.value = true
    setTimeout(() => {
      formLoading.value = false
      showMessage('Formulario enviado correctamente!')
    }, 1500)
  }

  const handleFormCancel = () => {
    showMessage('Formulario cancelado')
  }

  const handleCustomSubmit = (data: any) => {
    console.log('Custom form submitted:', data)
    customFormLoading.value = true
    setTimeout(() => {
      customFormLoading.value = false
      showMessage('Registro completado!')
    }, 1500)
  }
</script>

<style scoped>
  .design-system-demo {
    min-height: 100vh;
    background: var(--color-background);
  }

  .demo-header {
    text-align: center;
    padding: var(--space-3xl) 0;
    border-bottom: 1px solid var(--color-border);
    margin-bottom: var(--space-xl);
  }

  .demo-header h1 {
    font-size: var(--font-size-5xl);
    margin-bottom: var(--space-md);
    background: linear-gradient(
      135deg,
      var(--color-primary),
      var(--color-secondary)
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .demo-nav {
    display: flex;
    gap: var(--space-sm);
    margin-bottom: var(--space-xl);
    overflow-x: auto;
    padding-bottom: var(--space-sm);
  }

  .demo-nav-btn {
    padding: var(--space-sm) var(--space-lg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-background-secondary);
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
    white-space: nowrap;
  }

  .demo-nav-btn:hover,
  .demo-nav-btn.active {
    background: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
  }

  .demo-section {
    margin-bottom: var(--space-3xl);
  }

  .demo-section h2 {
    font-size: var(--font-size-3xl);
    margin-bottom: var(--space-md);
    color: var(--color-text-primary);
  }

  .demo-section > p {
    font-size: var(--font-size-lg);
    color: var(--color-text-secondary);
    margin-bottom: var(--space-xl);
  }

  .demo-group {
    margin-bottom: var(--space-xl);
  }

  .demo-group h3 {
    font-size: var(--font-size-xl);
    margin-bottom: var(--space-lg);
    color: var(--color-text-primary);
  }

  .demo-group h4 {
    font-size: var(--font-size-lg);
    margin-bottom: var(--space-md);
    color: var(--color-text-primary);
  }

  .demo-row {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    flex-wrap: wrap;
    margin-bottom: var(--space-lg);
  }

  .demo-column {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    max-width: 400px;
  }

  .demo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--space-lg);
  }

  .demo-code {
    background: var(--color-background-secondary);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
    margin-top: var(--space-xl);
  }

  .demo-code pre {
    margin: 0;
    overflow-x: auto;
  }

  .demo-code code {
    font-family: 'Courier New', monospace;
    font-size: var(--font-size-sm);
    color: var(--color-text-primary);
  }

  .demo-form-container {
    max-width: 600px;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-md);
  }

  /* Design Tokens Styles */
  .color-palette {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: var(--space-lg);
  }

  .color-item {
    text-align: center;
  }

  .color-swatch {
    width: 100%;
    height: 80px;
    border-radius: var(--radius-lg);
    margin-bottom: var(--space-sm);
    border: 1px solid var(--color-border);
  }

  .color-item span {
    display: block;
    font-weight: var(--font-weight-medium);
    margin-bottom: var(--space-xs);
  }

  .color-item code {
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
    background: var(--color-background-tertiary);
    padding: 2px 6px;
    border-radius: var(--radius-sm);
  }

  .typography-demo {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .spacing-demo {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .spacing-item {
    background: var(--color-background-tertiary);
    border: 1px dashed var(--color-border);
    border-radius: var(--radius-md);
    text-align: center;
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
  }

  @media (max-width: 768px) {
    .demo-nav {
      justify-content: flex-start;
    }

    .demo-row {
      flex-direction: column;
      align-items: stretch;
    }

    .form-row {
      grid-template-columns: 1fr;
    }
  }
</style>
