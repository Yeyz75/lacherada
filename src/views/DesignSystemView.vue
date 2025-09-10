<template>
  <div class="design-system-container">
    <h1>Design System - Componentes Base</h1>

    <div class="component-section">
      <h2>BaseFileUpload</h2>
      <p>Componente para la carga de archivos con PrimeVue FileUpload</p>

      <div class="demo-section">
        <h3>Ejemplo básico</h3>
        <BaseFileUpload
          v-model="basicFile"
          label="Selecciona una imagen"
          helper-text="Formatos permitidos: JPG, PNG, GIF (máx. 2MB)"
          accept="image/*"
          :max-file-size="2000000"
          mode="basic"
          @select="handleBasicSelect"
          @upload="handleBasicUpload"
          @error="handleBasicError" />
      </div>

      <div class="demo-section">
        <h3>Ejemplo avanzado</h3>
        <BaseFileUpload
          v-model="advancedFiles"
          label="Sube tus documentos"
          helper-text="Puedes seleccionar múltiples archivos"
          accept="image/*"
          :max-file-size="2000000"
          :multiple="true"
          mode="advanced"
          :file-limit="5"
          @select="handleAdvancedSelect"
          @upload="handleAdvancedUpload"
          @error="handleAdvancedError" />
      </div>

      <div class="demo-section">
        <h3>Ejemplo con carga personalizada</h3>
        <BaseFileUpload
          v-model="customFiles"
          label="Sube archivos con procesamiento personalizado"
          accept="image/*"
          :max-file-size="2000000"
          :multiple="true"
          mode="advanced"
          :custom-upload="true"
          @select="handleCustomSelect"
          @error="handleCustomError" />

        <div
          class="custom-upload-actions"
          v-if="
            customFiles &&
            (Array.isArray(customFiles) ? customFiles.length > 0 : customFiles)
          ">
          <BaseButton @click="processCustomUpload" variant="primary">
            Procesar archivos
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseFileUpload from '../components/base/BaseFileUpload.vue'
import BaseButton from '../components/base/BaseButton.vue'

// Basic file upload
const basicFile = ref<File | null>(null)

// Advanced file upload
const advancedFiles = ref<File[]>([])

// Custom file upload
const customFiles = ref<File[]>([])

// Handlers for basic upload
const handleBasicSelect = (event: { files: FileList }) => {
  console.log('Basic file selected:', event.files)
}

const handleBasicUpload = (event: any) => {
  console.log('Basic file uploaded:', event)
}

const handleBasicError = (error: any) => {
  console.error('Basic file upload error:', error)
}

// Handlers for advanced upload
const handleAdvancedSelect = (event: { files: FileList }) => {
  console.log('Advanced files selected:', event.files)
}

const handleAdvancedUpload = (event: any) => {
  console.log('Advanced files uploaded:', event)
}

const handleAdvancedError = (error: any) => {
  console.error('Advanced file upload error:', error)
}

// Handlers for custom upload
const handleCustomSelect = (event: { files: FileList }) => {
  console.log('Custom files selected:', event.files)
  // In a real app, you might want to process these files immediately
  // or store them for later processing
}

const handleCustomError = (error: any) => {
  console.error('Custom file upload error:', error)
}

const processCustomUpload = () => {
  console.log('Processing custom upload with files:', customFiles.value)
  // Simulate processing
  setTimeout(() => {
    console.log('Custom upload processed successfully')
    // Clear the files after processing
    customFiles.value = []
  }, 1500)
}
</script>

<style scoped>
.design-system-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.component-section {
  margin-bottom: 3rem;
}

.component-section h2 {
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.component-section p {
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
}

.demo-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--color-background-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.demo-section h3 {
  margin-bottom: 1rem;
  color: var(--color-text-primary);
}

.custom-upload-actions {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}
</style>
