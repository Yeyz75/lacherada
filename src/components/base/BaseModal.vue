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
    :unstyled="true"
    class="base-modal"
    :class="modalClasses"
    v-bind="dialogBindings">
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
        <div v-else-if="showDefaultActions" class="flex items-center gap-3">
          <BaseButton
            v-if="showCancel"
            :label="cancelText || 'Cancelar'"
            variant="outlined"
            @click="handleCancel"
            :disabled="actionLoading" />

          <BaseButton
            v-if="showConfirm"
            :label="confirmText || 'Confirmar'"
            :variant="confirmButtonVariant"
            @click="handleConfirm"
            :loading="actionLoading" />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { Icon } from '@iconify/vue'
import Dialog from 'primevue/dialog'
import type { BaseComponentProps } from '../../types'
import BaseButton from './BaseButton.vue'
import type { ButtonVariant } from '../../types'

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

const attrs = useAttrs()

const sizeClassMap: Record<NonNullable<Props['size']>, string> = {
  small: 'max-w-md w-full',
  medium: 'max-w-2xl w-full',
  large: 'max-w-4xl w-full',
  fullscreen: 'w-screen h-screen max-w-none',
}

const modalClasses = computed(() => [
  'base-modal',
  sizeClassMap[props.size ?? 'medium'],
  {
    'pointer-events-none': props.loading && !props.showDefaultActions,
    'rounded-none border-0 sm:rounded-2xl': props.size !== 'fullscreen',
  },
  props.class,
])

const contentClasses = computed(() => (props.loading ? 'p-0' : ''))

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

const dialogBindings = computed(() => ({
  ...attrs,
  class: undefined,
  pt: {
    mask: 'bg-black/50 backdrop-blur-sm',
    root: [
      'relative m-4 overflow-hidden border border-border bg-surface-primary text-text-primary shadow-2xl transition duration-200',
      props.size === 'fullscreen'
        ? 'h-full rounded-none border-0 sm:m-6'
        : 'rounded-2xl',
    ],
    header:
      'flex items-center justify-between gap-3 border-b border-border bg-surface-primary px-6 py-4',
    headerTitle: 'text-lg font-semibold text-text-primary',
    headerIcon: 'text-primary-500 text-2xl',
    closeButton:
      'inline-flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition hover:bg-surface-tertiary',
    content: [
      'px-6 py-5 text-text-secondary',
      props.loading ? 'flex items-center justify-center' : '',
    ],
    footer:
      'flex items-center justify-end gap-3 border-t border-border bg-surface-primary px-6 py-4',
  },
}))

const confirmButtonVariant = computed<ButtonVariant>(() => {
  switch (props.confirmSeverity) {
    case 'success':
      return 'success'
    case 'info':
      return 'secondary'
    case 'warn':
      return 'warning'
    case 'danger':
      return 'danger'
    case 'secondary':
      return 'secondary'
    default:
      return 'primary'
  }
})
</script>

<script lang="ts">
export default {
  name: 'BaseModal',
  inheritAttrs: false,
}
</script>
