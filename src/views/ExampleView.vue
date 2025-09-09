<template>
  <div class="example-page">
    <div class="container">
      <h1>Ejemplo Rápido del Design System</h1>
      <p>Ejemplos básicos de los componentes más utilizados.</p>

      <!-- Botones Ejemplo -->
      <section class="example-section">
        <h2>Botones</h2>
        <div class="example-row">
          <BaseButton variant="primary">Primary</BaseButton>
          <BaseButton variant="secondary">Secondary</BaseButton>
          <BaseButton variant="ghost">Ghost</BaseButton>
          <BaseButton loading>Cargando...</BaseButton>
        </div>
      </section>

      <!-- Inputs Ejemplo -->
      <section class="example-section">
        <h2>Inputs</h2>
        <div class="example-column">
          <BaseInput
            v-model="exampleData.name"
            label="Nombre"
            placeholder="Tu nombre completo" />

          <BaseInput
            v-model="exampleData.email"
            type="email"
            label="Email"
            placeholder="ejemplo@correo.com"
            icon="mdi:email" />

          <BaseInput
            v-model="exampleData.password"
            type="password"
            label="Contraseña"
            placeholder="Tu contraseña segura"
            :show-password-toggle="true" />
        </div>
      </section>

      <!-- Card Ejemplo -->
      <section class="example-section">
        <h2>Cards</h2>
        <div class="example-grid">
          <BaseCard title="Tarjeta Básica">
            <p>Esta es una tarjeta con contenido de ejemplo.</p>
            <template #actions>
              <BaseButton size="sm">Acción</BaseButton>
            </template>
          </BaseCard>

          <BaseCard variant="glass" clickable @click="showAlert">
            <h3>Tarjeta Clickeable</h3>
            <p>Esta tarjeta tiene efecto glass y es clickeable.</p>
          </BaseCard>
        </div>
      </section>

      <!-- Form Ejemplo -->
      <section class="example-section">
        <h2>Formulario</h2>
        <div class="example-form">
          <BaseForm
            title="Formulario de Contacto"
            :fields="formFields"
            v-model="formData"
            @submit="handleFormSubmit" />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue'
  import {
    BaseButton,
    BaseInput,
    BaseCard,
    BaseForm,
    type FormField,
  } from '../components/base'

  // Datos de ejemplo
  const exampleData = reactive({
    name: '',
    email: '',
    password: '',
  })

  const formData = ref({})

  const formFields: FormField[] = [
    {
      name: 'nombre',
      label: 'Nombre Completo',
      type: 'input',
      required: true,
      placeholder: 'Tu nombre completo',
    },
    {
      name: 'email',
      label: 'Correo Electrónico',
      type: 'input',
      required: true,
      placeholder: 'ejemplo@correo.com',
    },
    {
      name: 'mensaje',
      label: 'Mensaje',
      type: 'textarea',
      required: true,
      placeholder: 'Escribe tu mensaje aquí...',
    },
  ]

  // Funciones
  const showAlert = () => {
    alert('¡Tarjeta clickeada!')
  }

  const handleFormSubmit = (data: any) => {
    console.log('Formulario enviado:', data)
    alert('¡Formulario enviado correctamente!')
  }
</script>

<style scoped>
  .example-page {
    padding: var(--space-xl) 0;
    min-height: 100vh;
    background: var(--color-background);
  }

  .example-page h1 {
    text-align: center;
    margin-bottom: var(--space-lg);
    color: var(--color-primary);
  }

  .example-page > div > p {
    text-align: center;
    margin-bottom: var(--space-3xl);
    color: var(--color-text-secondary);
  }

  .example-section {
    margin-bottom: var(--space-3xl);
    padding: var(--space-xl);
    background: var(--color-background-secondary);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
  }

  .example-section h2 {
    margin-bottom: var(--space-lg);
    color: var(--color-text-primary);
  }

  .example-row {
    display: flex;
    gap: var(--space-md);
    flex-wrap: wrap;
  }

  .example-column {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    max-width: 400px;
  }

  .example-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--space-lg);
  }

  .example-form {
    max-width: 500px;
    margin: 0 auto;
  }

  @media (max-width: 768px) {
    .example-row {
      flex-direction: column;
    }
  }
</style>
