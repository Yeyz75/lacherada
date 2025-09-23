<template>
  <div class="category-selector">
    <BaseSelect
      v-model="selectedCategoryId"
      :label="label"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled || loading"
      :error="error"
      :options="categoryOptions"
      @change="handleCategoryChange" />

    <!-- Mostrar subcategorías si hay una categoría padre seleccionada -->
    <div v-if="selectedCategoryId && subcategories.length > 0" class="mt-4">
      <BaseSelect
        v-model="selectedSubcategoryId"
        label="Subcategoría"
        placeholder="Seleccionar subcategoría (opcional)"
        :disabled="disabled || loading"
        :options="subcategoryOptions"
        @change="handleSubcategoryChange" />
    </div>

    <!-- Preview de la categoría seleccionada -->
    <div v-if="selectedCategory" class="mt-4 p-3 bg-gray-50 rounded-lg border">
      <div class="flex items-center gap-2">
        <Icon
          v-if="selectedCategory.icon"
          :icon="selectedCategory.icon"
          class="text-lg text-primary" />
        <div>
          <div class="font-medium text-gray-900">
            {{ selectedCategory.name }}
          </div>
          <div
            v-if="selectedCategory.description"
            class="text-sm text-gray-600">
            {{ selectedCategory.description }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useItems } from '@/composables/useItems'
import BaseSelect from '@/components/base/BaseSelect.vue'

// Props
interface Props {
  modelValue?: string | null
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  label: 'Categoría',
  placeholder: 'Seleccionar categoría',
  required: false,
  disabled: false,
  error: undefined,
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

// Composables
const { categories, loadCategories, isLoading } = useItems()

// Estado local
const selectedCategoryId = ref<string | null>(props.modelValue)
const selectedSubcategoryId = ref<string | null>(null)

// Computed
const loading = computed(() => isLoading.value)

const categoryOptions = computed(() => {
  // Solo categorías padre (sin parent_id)
  const parentCategories = categories.value.filter((cat) => !cat.parentId)

  return parentCategories.map((cat) => ({
    value: cat.id,
    label: cat.name,
    icon: cat.icon,
  }))
})

const subcategories = computed(() => {
  if (!selectedCategoryId.value) return []

  return categories.value.filter(
    (cat) => cat.parentId === selectedCategoryId.value,
  )
})

const subcategoryOptions = computed(() => {
  return subcategories.value.map((cat) => ({
    value: cat.id,
    label: cat.name,
    icon: cat.icon,
  }))
})

const selectedCategory = computed(() => {
  if (!selectedCategoryId.value) return null

  // Primero buscar en subcategorías
  let category = categories.value.find(
    (cat) => cat.id === selectedSubcategoryId.value,
  )
  if (category) return category

  // Si no hay subcategoría seleccionada, buscar la categoría principal
  return (
    categories.value.find((cat) => cat.id === selectedCategoryId.value) || null
  )
})

// Watchers
watch(
  () => props.modelValue,
  (newValue) => {
    selectedCategoryId.value = newValue

    // Si hay un valor, determinar si es una subcategoría
    if (newValue) {
      const category = categories.value.find((cat) => cat.id === newValue)
      if (category?.parentId) {
        selectedCategoryId.value = category.parentId
        selectedSubcategoryId.value = newValue
      } else {
        selectedSubcategoryId.value = null
      }
    } else {
      selectedSubcategoryId.value = null
    }
  },
)

watch(selectedCategory, (newCategory) => {
  const value = newCategory?.id || null
  emit('update:modelValue', value)
})

// Métodos
const handleCategoryChange = () => {
  // Reset subcategoría cuando cambia la categoría principal
  selectedSubcategoryId.value = null
}

const handleSubcategoryChange = () => {
  // La subcategoría seleccionada se maneja en el watcher de selectedCategory
}

// Lifecycle
onMounted(async () => {
  if (categories.value.length === 0) {
    await loadCategories()
  }
})
</script>

<style scoped>
@reference;
.category-selector {
  @apply space-y-4;
}
</style>
