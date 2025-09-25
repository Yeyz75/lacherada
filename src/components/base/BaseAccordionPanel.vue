<template>
  <AccordionPanel
    v-bind="panelBindings"
    :value="value"
    :disabled="disabled"
    :unstyled="true">
    <slot />
  </AccordionPanel>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import AccordionPanel from 'primevue/accordionpanel'

interface Props {
  /** Valor único del panel */
  value: string
  /** Deshabilitar este panel específico */
  disabled?: boolean
  /** Clase CSS personalizada */
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  class: '',
})

const attrs = useAttrs()

const baseClass = 'base-accordion-panel'

const panelBindings = computed(() => ({
  ...attrs,
  class: [
    baseClass,
    props.disabled ? 'opacity-60 pointer-events-none' : '',
    props.class,
  ],
}))
</script>

<script lang="ts">
export default {
  name: 'BaseAccordionPanel',
  inheritAttrs: false,
}
</script>
