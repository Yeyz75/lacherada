<template>
  <AccordionHeader v-bind="$attrs" :class="headerClasses">
    <slot />
  </AccordionHeader>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AccordionHeader from 'primevue/accordionheader'

interface Props {
  /** Clase CSS personalizada */
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  class: '',
})

const headerClasses = computed(() => ['base-accordion-header', props.class])
</script>

<script lang="ts">
export default {
  name: 'BaseAccordionHeader',
  inheritAttrs: false,
}
</script>

<style scoped>
.base-accordion-header {
  /* Los estilos se aplican desde el componente padre BaseAccordion */
}
</style>
