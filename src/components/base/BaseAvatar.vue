<template>
  <Avatar
    :image="image"
    :icon="icon || defaultIcon"
    :label="label"
    :size="size"
    :shape="shape"
    :unstyled="true"
    class="base-avatar"
    :class="avatarClasses"
    v-bind="avatarBindings">
    <!-- Slot para contenido custom -->
    <slot />

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
      class="base-avatar-verified">
      <Icon icon="mdi:check-decagram" class="text-xs" />
    </Badge>
  </Avatar>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { Icon } from '@iconify/vue'
import Avatar from 'primevue/avatar'
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

const attrs = useAttrs()

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

const avatarBindings = computed(() => ({
  ...attrs,
  class: undefined,
}))
</script>

<script lang="ts">
export default {
  name: 'BaseAvatar',
  inheritAttrs: false,
}
</script>
