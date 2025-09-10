<template>
  <AccordionContent v-bind="$attrs" :class="contentClasses">
    <slot />
  </AccordionContent>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AccordionContent from 'primevue/accordioncontent'

interface Props {
  /** Clase CSS personalizada */
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  class: '',
})

const contentClasses = computed(() => ['base-accordion-content', props.class])
</script>

<script lang="ts">
export default {
  name: 'BaseAccordionContent',
  inheritAttrs: false,
}
</script>

<style scoped>
.base-accordion-content {
  /* Los estilos se aplican desde el componente padre BaseAccordion */
}
</style>
