<template>
  <AccordionContent v-bind="contentBindings" :unstyled="true">
    <slot />
  </AccordionContent>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import AccordionContent from 'primevue/accordioncontent'

interface Props {
  /** Clase CSS personalizada */
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  class: '',
})

const attrs = useAttrs()

const baseClass = 'base-accordion-content text-text-secondary'

const contentBindings = computed(() => ({
  ...attrs,
  class: [baseClass, props.class],
}))
</script>

<script lang="ts">
export default {
  name: 'BaseAccordionContent',
  inheritAttrs: false,
}
</script>
