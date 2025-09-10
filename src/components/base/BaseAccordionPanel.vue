<template>
  <AccordionPanel
    v-bind="$attrs"
    :value="value"
    :disabled="disabled"
    :class="panelClasses">
    <slot />
  </AccordionPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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

const panelClasses = computed(() => [
  'base-accordion-panel',
  {
    'base-accordion-panel-disabled': props.disabled,
  },
  props.class,
])
</script>

<script lang="ts">
export default {
  name: 'BaseAccordionPanel',
  inheritAttrs: false,
}
</script>

<style scoped>
.base-accordion-panel {
  /* Los estilos se aplican desde el componente padre BaseAccordion */
}

.base-accordion-panel-disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>
