<template>
  <Avatar
    :image="image"
    :icon="icon || defaultIcon"
    :label="label"
    :size="size"
    :shape="shape"
    class="base-avatar"
    :class="avatarClasses"
    v-bind="$attrs">
    <!-- Slot para contenido custom -->
    <slot />

    <!-- Badge de estado online/offline -->
    <Badge
      v-if="showStatus && status"
      :value="status === 'online' ? '' : ''"
      :severity="status === 'online' ? 'success' : 'secondary'"
      class="base-avatar-status"
      :class="statusClasses" />

    <!-- Badge de verificado -->
    <Badge
      v-if="verified"
      value=""
      severity="info"
      class="base-avatar-verified">
      <Icon icon="mdi:check-decagram" class="text-xs" />
    </Badge>
  </Avatar>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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

const defaultIcon = computed(() => {
  return 'mdi:account'
})

const avatarClasses = computed(() => [
  'base-avatar-wrapper',
  {
    'cursor-pointer hover:opacity-80 transition-opacity': props.clickable,
    'opacity-50': props.loading,
  },
  props.class,
])

const statusClasses = computed(() => ({
  'base-avatar-status-small': props.size === 'small',
  'base-avatar-status-normal': props.size === 'normal',
  'base-avatar-status-large': props.size === 'large' || props.size === 'xlarge',
}))
</script>

<script lang="ts">
export default {
  name: 'BaseAvatar',
  inheritAttrs: false,
}
</script>

<style scoped>
/* Usar el diseño nativo de PrimeVue con extensiones */
.base-avatar {
  position: relative;
}

.base-avatar-wrapper {
  position: relative;
  display: inline-block;
}

/* Status badge positioning */
.base-avatar-status {
  position: absolute;
  border: 2px solid var(--p-surface-0);
  border-radius: 50%;
  width: 12px;
  height: 12px;
  bottom: 0;
  right: 0;
}

.base-avatar-status-small {
  width: 8px;
  height: 8px;
  border-width: 1px;
}

.base-avatar-status-normal {
  width: 12px;
  height: 12px;
  border-width: 2px;
}

.base-avatar-status-large {
  width: 16px;
  height: 16px;
  border-width: 2px;
}

/* Verified badge */
.base-avatar-verified {
  position: absolute;
  top: -2px;
  right: -2px;
  background: var(--p-blue-500);
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--p-surface-0);
}

/* Hover effects for clickable avatars */
.base-avatar-wrapper:hover .base-avatar {
  transform: scale(1.05);
  transition: transform 0.2s ease;
}

/* Loading state */
.base-avatar-wrapper.opacity-50 {
  pointer-events: none;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .base-avatar-verified {
    width: 16px;
    height: 16px;
  }

  .base-avatar-status-large {
    width: 14px;
    height: 14px;
  }
}
</style>
