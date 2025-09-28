<template>
  <div class="relative inline-flex">
    <!-- Custom avatar implementation -->
    <div class="base-avatar" :class="avatarClasses">
      <!-- Image if available -->
      <img
        v-if="image"
        :src="image"
        :alt="label || 'Avatar'"
        class="h-full w-full object-cover"
        @error="handleImageError" />
      <!-- Icon fallback -->
      <Icon
        v-else-if="icon || defaultIcon"
        :icon="icon || defaultIcon"
        class="text-current" />
      <!-- Label fallback -->
      <span v-else-if="label" class="text-current font-medium">
        {{ label.charAt(0).toUpperCase() }}
      </span>
      <!-- Slot para contenido custom -->
      <slot />
    </div>

    <!-- Badge de estado online/offline -->
    <Badge
      v-if="showStatus && status"
      :value="''"
      :severity="statusSeverity"
      :unstyled="true"
      :class="statusClasses" />

    <!-- Badge de verificado -->
    <Badge
      v-if="verified"
      value=""
      severity="info"
      :unstyled="true"
      class="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-surface-primary bg-success-500 text-white shadow-sm">
      <Icon icon="mdi:check-decagram" class="text-xs" />
    </Badge>
  </div>
</template>

<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { Icon } from '@iconify/vue'
// import Avatar from 'primevue/avatar' // Not using PrimeVue Avatar anymore
import Badge from 'primevue/badge'
import type { BaseComponentProps } from '../../types'

interface Props extends BaseComponentProps {
  // Avatar props
  image?: string
  icon?: string
  label?: string
  size?: 'small' | 'normal' | 'large' | 'xlarge'
  shape?: 'square' | 'circle'

  // Extended props
  status?: 'online' | 'offline' | 'away' | 'busy'
  showStatus?: boolean
  verified?: boolean
  clickable?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'normal',
  shape: 'circle',
  showStatus: false,
  verified: false,
  clickable: false,
  loading: false,
})

// Debug: Log image prop changes
watchEffect(() => {
  if (props.image) {
    console.log('BaseAvatar image prop:', props.image)
  }
})

const handleImageError = (event: Event) => {
  console.error('Image failed to load:', props.image, event)
}

// attrs removed - no longer needed with custom implementation

const defaultIcon = computed(() => 'mdi:account')

const sizeTokenMap: Record<NonNullable<Props['size']>, string> = {
  small: 'h-8 w-8 text-xs',
  normal: 'h-10 w-10 text-sm',
  large: 'h-12 w-12 text-base',
  xlarge: 'h-16 w-16 text-lg',
}

const avatarWrapperClass =
  'base-avatar relative inline-flex items-center justify-center overflow-hidden rounded-full bg-surface-secondary text-text-primary'

const avatarClasses = computed(() => [
  avatarWrapperClass,
  sizeTokenMap[props.size ?? 'normal'],
  {
    'rounded-md': props.shape === 'square',
    'cursor-pointer transition duration-150 hover:scale-[1.02]':
      props.clickable,
    'opacity-50 pointer-events-none': props.loading,
  },
  props.class,
])

const statusSeverity = computed(() => {
  switch (props.status) {
    case 'online':
      return 'success'
    case 'busy':
      return 'danger'
    case 'away':
      return 'warn'
    default:
      return 'secondary'
  }
})

const statusClasses = computed(() => [
  'absolute rounded-full border-2 border-surface-primary shadow-sm',
  props.size === 'small'
    ? 'bottom-0 right-0 h-2 w-2 border-[1.5px]'
    : props.size === 'normal'
      ? 'bottom-0 right-0 h-2.5 w-2.5'
      : 'bottom-1 right-1 h-3 w-3',
  {
    'bg-success-500': props.status === 'online',
    'bg-warning-500': props.status === 'away',
    'bg-error-500': props.status === 'busy',
    'bg-text-muted': props.status === 'offline',
  },
])

// avatarBindings removed - no longer needed with custom implementation
</script>

<script lang="ts">
export default {
  name: 'BaseAvatar',
  inheritAttrs: false,
}
</script>
