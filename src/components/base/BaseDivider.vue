<template>
  <Divider
    :align="align"
    :layout="layout"
    :type="type"
    v-bind="dividerBindings"
    :class="dividerClasses"
    :unstyled="true">
    <!-- Custom content slot -->
    <template v-if="$slots.default">
      <div :class="contentClasses">
        <slot />
      </div>
    </template>

    <!-- Text content -->
    <template v-else-if="text">
      <div :class="contentClasses">
        <span :class="textClasses">{{ text }}</span>
      </div>
    </template>

    <!-- Icon content -->
    <template v-else-if="icon">
      <div :class="contentClasses">
        <Icon :icon="icon" :class="iconClasses" />
      </div>
    </template>
  </Divider>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { Icon } from '@iconify/vue'
import Divider from 'primevue/divider'
import type { BaseComponentProps } from '../../types'

interface Props extends BaseComponentProps {
  align?: 'left' | 'center' | 'right'
  layout?: 'horizontal' | 'vertical'
  type?: 'solid' | 'dashed' | 'dotted'
  text?: string
  icon?: string
  variant?: 'default' | 'subtle' | 'bold'
}

const props = withDefaults(defineProps<Props>(), {
  align: 'center',
  layout: 'horizontal',
  type: 'solid',
  variant: 'default',
})

const attrs = useAttrs()

const dividerBindings = computed(() => {
  const { class: _class, ...rest } = Object.assign({}, attrs)
  return rest
})

const baseDividerClasses =
  'relative flex w-full items-center before:content-["" ] before:flex-1 before:border-current before:border-t after:content-["" ] after:flex-1 after:border-current after:border-t'

const layoutClasses: Record<NonNullable<Props['layout']>, string> = {
  horizontal: 'flex-row gap-3',
  vertical:
    'flex-col items-center justify-center gap-3 before:h-full before:w-px before:border-l after:h-full after:w-px after:border-l',
}

const variantClasses: Record<NonNullable<Props['variant']>, string> = {
  default: 'text-border',
  subtle: 'text-border-muted',
  bold: 'text-primary-500',
}

const dividerClasses = computed(() => [
  baseDividerClasses,
  layoutClasses[props.layout ?? 'horizontal'],
  variantClasses[props.variant ?? 'default'],
  props.class,
])

const contentBaseClasses =
  'flex items-center justify-center rounded-full bg-surface-primary px-3 py-1 text-sm font-medium'

const contentClasses = computed(() => [
  contentBaseClasses,
  {
    'px-3 py-1': props.layout === 'horizontal',
    'px-2 py-2': props.layout === 'vertical',
  },
])

const textClasses = computed(() => 'text-text-muted')

const iconClasses = computed(() => 'text-text-muted text-base')
</script>

<script lang="ts">
export default {
  name: 'BaseDivider',
  inheritAttrs: false,
}
</script>
