<template>
  <Dialog
    :visible="visible"
    @update:visible="handleVisibilityChange"
    :header="title"
    :modal="modal"
    :closable="closable"
    :dismissable-mask="dismissableMask"
    :close-on-escape="closeOnEscape"
    :draggable="draggable"
    :resizable="resizable"
    :maximizable="maximizable"
    :position="position"
    :style="dialogStyle"
    class="base-modal"
    :class="modalClasses"
    v-bind="$attrs">
    <!-- Custom header template -->
    <template v-if="$slots.header" #header>
      <div class="base-modal-header">
        <slot name="header" />
      </div>
    </template>

    <!-- Default header with icon -->
    <template v-else-if="title || icon" #header>
      <div class="base-modal-header-default">
        <Icon v-if="icon" :icon="icon" class="base-modal-icon" />
        <h3 class="base-modal-title">{{ title }}</h3>
      </div>
    </template>

    <!-- Modal content -->
    <div class="base-modal-content" :class="contentClasses">
      <!-- Loading state -->
      <div v-if="loading" class="base-modal-loading">
        <Icon icon="mdi:loading" class="animate-spin text-2xl" />
        <span>{{ loadingText || 'Cargando...' }}</span>
      </div>

      <!-- Main content -->
      <div v-else class="base-modal-body">
        <slot />
      </div>
    </div>

    <!-- Footer template -->
    <template v-if="$slots.footer || showDefaultActions" #footer>
      <div class="base-modal-footer">
        <!-- Custom footer -->
        <slot v-if="$slots.footer" name="footer" />

        <!-- Default actions -->
        <div v-else-if="showDefaultActions" class="base-modal-actions">
          <Button
            v-if="showCancel"
            :label="cancelText || 'Cancelar'"
            severity="secondary"
            variant="outlined"
            @click="handleCancel"
            :disabled="actionLoading" />

          <Button
            v-if="showConfirm"
            :label="confirmText || 'Confirmar'"
            :severity="confirmSeverity"
            @click="handleConfirm"
            :loading="actionLoading" />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import type { BaseComponentProps } from '../../types'

interface Props extends BaseComponentProps {
  // Dialog props
  visible: boolean
  title?: string
  modal?: boolean
  closable?: boolean
  dismissableMask?: boolean
  closeOnEscape?: boolean
  draggable?: boolean
  resizable?: boolean
  maximizable?: boolean
  position?:
    | 'center'
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'topleft'
    | 'topright'
    | 'bottomleft'
    | 'bottomright'

  // Extended props
  size?: 'small' | 'medium' | 'large' | 'fullscreen'
  icon?: string
  loading?: boolean
  loadingText?: string

  // Footer actions
  showDefaultActions?: boolean
  showCancel?: boolean
  showConfirm?: boolean
  cancelText?: string
  confirmText?: string
  confirmSeverity?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'info'
    | 'warn'
    | 'danger'
  actionLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modal: true,
  closable: true,
  dismissableMask: false,
  closeOnEscape: true,
  draggable: false,
  resizable: false,
  maximizable: false,
  position: 'center',
  size: 'medium',
  loading: false,
  showDefaultActions: false,
  showCancel: true,
  showConfirm: true,
  confirmSeverity: 'primary',
  actionLoading: false,
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'cancel': []
  'confirm': []
  'close': []
}>()

const modalClasses = computed(() => [
  'base-modal-wrapper',
  {
    'base-modal-small': props.size === 'small',
    'base-modal-large': props.size === 'large',
    'base-modal-fullscreen': props.size === 'fullscreen',
    'base-modal-loading': props.loading,
  },
  props.class,
])

const contentClasses = computed(() => [
  {
    'p-0': props.loading,
  },
])

const dialogStyle = computed(() => {
  const styles: Record<string, string> = {}

  switch (props.size) {
    case 'small':
      styles.width = '320px'
      styles.maxWidth = '90vw'
      break
    case 'medium':
      styles.width = '560px'
      styles.maxWidth = '90vw'
      break
    case 'large':
      styles.width = '800px'
      styles.maxWidth = '95vw'
      break
    case 'fullscreen':
      styles.width = '100vw'
      styles.height = '100vh'
      styles.maxWidth = '100vw'
      styles.maxHeight = '100vh'
      break
  }

  return styles
})

const handleVisibilityChange = (value: boolean) => {
  emit('update:visible', value)
  if (!value) {
    emit('close')
  }
}

const handleCancel = () => {
  emit('cancel')
  emit('update:visible', false)
}

const handleConfirm = () => {
  emit('confirm')
}
</script>

<script lang="ts">
export default {
  name: 'BaseModal',
  inheritAttrs: false,
}
</script>

<style scoped>
/* Usar el diseño nativo de PrimeVue con extensiones */
.base-modal {
  /* PrimeVue ya maneja los estilos base */
}

.base-modal-wrapper {
  /* Extensiones específicas */
}

/* Header styling */
.base-modal-header {
  /* Custom header content */
}

.base-modal-header-default {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.base-modal-icon {
  font-size: 1.5rem;
  color: var(--p-primary-color);
}

.base-modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--p-text-color);
}

/* Content styling */
.base-modal-content {
  /* Contenido principal */
}

.base-modal-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 1rem;
  color: var(--p-text-muted-color);
}

.base-modal-body {
  /* Body content */
}

/* Footer styling */
.base-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid var(--p-surface-border);
}

.base-modal-actions {
  display: flex;
  gap: 0.75rem;
}

/* Size variants */
.base-modal-small :deep(.p-dialog-content) {
  padding: 1rem;
}

.base-modal-large :deep(.p-dialog-content) {
  padding: 2rem;
}

.base-modal-fullscreen :deep(.p-dialog) {
  border-radius: 0;
  margin: 0;
}

.base-modal-fullscreen :deep(.p-dialog-content) {
  height: calc(100vh - 120px); /* Ajustar por header y footer */
  overflow-y: auto;
}

/* Loading state */
.base-modal-loading :deep(.p-dialog-content) {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

/* Responsive */
@media (max-width: 768px) {
  .base-modal-wrapper :deep(.p-dialog) {
    width: 95vw !important;
    margin: 1rem;
  }

  .base-modal-fullscreen :deep(.p-dialog) {
    width: 100vw !important;
    height: 100vh !important;
    margin: 0;
  }

  .base-modal-actions {
    flex-direction: column;
  }

  .base-modal-header-default {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }

  .base-modal-title {
    font-size: 1.125rem;
  }
}

/* Animation enhancements */
.base-modal :deep(.p-dialog-enter-active),
.base-modal :deep(.p-dialog-leave-active) {
  transition: all 0.3s ease;
}

.base-modal :deep(.p-dialog-enter-from),
.base-modal :deep(.p-dialog-leave-to) {
  opacity: 0;
  transform: scale(0.9) translateY(-20px);
}

/* Focus trap and accessibility */
.base-modal :deep(.p-dialog) {
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.base-modal :deep(.p-dialog-header) {
  border-bottom: 1px solid var(--p-surface-border);
}

.base-modal :deep(.p-dialog-footer) {
  border-top: none; /* Ya lo manejamos en base-modal-footer */
}
</style>
