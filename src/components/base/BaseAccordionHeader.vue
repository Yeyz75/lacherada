<template>
  <AccordionHeader v-bind="headerBindings" :unstyled="true">
    <slot />
  </AccordionHeader>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import AccordionHeader from 'primevue/accordionheader'

interface Props {
  /** Clase CSS personalizada */
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  class: '',
})

const attrs = useAttrs()

const baseClass =
  'base-accordion-header flex w-full items-center justify-between gap-4 text-text-primary transition-colors duration-150'

const headerBindings = computed(() => ({
  ...attrs,
  class: [baseClass, props.class],
}))
</script>

<script lang="ts">
export default {
  name: 'BaseAccordionHeader',
  inheritAttrs: false,
}
</script>
