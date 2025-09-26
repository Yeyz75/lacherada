<template>
  <div class="publish-container">
    <div class="publish-header">
      <div class="header-content">
        <h1 class="page-title">
          <Icon icon="mdi:plus-circle" class="title-icon" />
          {{ t('publish.title') }}
        </h1>
        <p class="page-subtitle">
          {{ t('publish.subtitle') }}
        </p>
      </div>
    </div>

    <div class="publish-content">
      <form @submit.prevent="handleSubmit" class="publish-form">
        <!-- Información básica -->
        <BaseCard :title="t('publish.sections.basicInfo')" class="form-section">
          <div class="form-grid">
            <div class="form-row">
              <BaseInput
                v-model="formData.title"
                :label="t('publish.fields.title.label')"
                :placeholder="t('publish.fields.title.placeholder')"
                required
                :error="errors.title"
                :maxlength="100"
                class="form-field"
                @blur="validateField('title')" />

              <CategorySelector
                v-model="formData.categoryId"
                :error="errors.categoryId"
                required
                class="form-field" />
            </div>

            <BaseTextarea
              v-model="descriptionValue"
              :label="t('publish.fields.description.label')"
              :placeholder="t('publish.fields.description.placeholder')"
              required
              :error="errors.description"
              :maxlength="2000"
              :rows="4"
              class="form-field"
              @blur="validateField('description')" />

            <div class="form-row">
              <BaseSelect
                v-model="formData.listingType"
                :label="t('publish.fields.listingType.label')"
                :placeholder="t('publish.fields.listingType.placeholder')"
                required
                :error="errors.listingType"
                :options="listingTypeOptions"
                class="form-field"
                @change="validateField('listingType')" />

              <BaseSelect
                v-model="formData.pricingMode"
                :label="t('publish.fields.pricingMode.label')"
                :placeholder="t('publish.fields.pricingMode.placeholder')"
                required
                :error="errors.pricingMode"
                :options="pricingModeOptions"
                class="form-field"
                @change="validateField('pricingMode')" />

              <BaseInput
                v-if="showPriceField"
                v-model.number="priceValue"
                :label="t('publish.fields.price.label')"
                :placeholder="t('publish.fields.price.placeholder')"
                type="number"
                step="0.01"
                min="0"
                :error="errors.price"
                class="form-field"
                @blur="validateField('price')" />
            </div>
          </div>
        </BaseCard>

        <!-- Detalles adicionales -->
        <BaseCard :title="t('publish.sections.details')" class="form-section">
          <div class="form-grid">
            <div class="form-row">
              <BaseInput
                v-model.number="formData.quantity"
                :label="t('publish.fields.quantity.label')"
                :placeholder="t('publish.fields.quantity.placeholder')"
                type="number"
                min="1"
                :error="errors.quantity"
                class="form-field"
                @blur="validateField('quantity')" />

              <BaseSelect
                v-model="formData.condition"
                :label="t('publish.fields.condition.label')"
                :placeholder="t('publish.fields.condition.placeholder')"
                :error="errors.condition"
                :options="conditionOptions"
                class="form-field"
                @change="validateField('condition')" />

              <BaseSelect
                v-model="formData.fulfillmentOptions"
                :label="t('publish.fields.fulfillmentOptions.label')"
                :placeholder="
                  t('publish.fields.fulfillmentOptions.placeholder')
                "
                multiple
                :error="errors.fulfillmentOptions"
                :options="fulfillmentOptions"
                class="form-field"
                @change="validateField('fulfillmentOptions')" />
            </div>

            <div class="form-checkbox">
              <input
                id="allowNegotiation"
                v-model="formData.allowNegotiation"
                type="checkbox"
                class="checkbox-input" />
              <label for="allowNegotiation" class="checkbox-label">
                {{ t('publish.fields.allowNegotiation') }}
              </label>
            </div>
          </div>
        </BaseCard>

        <!-- Ubicación -->
        <BaseCard :title="t('publish.sections.location')" class="form-section">
          <div class="form-grid">
            <div class="form-row">
              <BaseInput
                v-model="locationCityValue"
                :label="t('publish.fields.locationCity.label')"
                :placeholder="t('publish.fields.locationCity.placeholder')"
                :error="errors.locationCity"
                class="form-field"
                @blur="validateField('locationCity')" />

              <BaseInput
                v-model="locationStateValue"
                :label="t('publish.fields.locationState.label')"
                :placeholder="t('publish.fields.locationState.placeholder')"
                :error="errors.locationState"
                class="form-field"
                @blur="validateField('locationState')" />

              <BaseInput
                v-model="locationCountryValue"
                :label="t('publish.fields.locationCountry.label')"
                :placeholder="t('publish.fields.locationCountry.placeholder')"
                :error="errors.locationCountry"
                class="form-field"
                @blur="validateField('locationCountry')" />
            </div>
          </div>
        </BaseCard>

        <!-- Imágenes -->
        <BaseCard :title="t('publish.sections.images')" class="form-section">
          <div class="form-grid">
            <BaseFileUpload
              ref="fileUploadRef"
              v-model="selectedFiles"
              :label="t('publish.fields.images.label')"
              :accept="acceptedImageTypes"
              :max-file-size="maxFileSize"
              multiple
              :file-limit="maxImages"
              :show-upload-button="false"
              :custom-upload="true"
              class="form-field"
              @select="handleFileSelect"
              @remove="handleFileRemove" />

            <div v-if="imagePreviews.length > 0" class="image-previews">
              <div
                v-for="(preview, index) in imagePreviews"
                :key="index"
                class="preview-item">
                <img
                  :src="preview.url"
                  :alt="`Preview ${index + 1}`"
                  class="preview-image" />
                <button
                  type="button"
                  @click="removeImagePreview(index)"
                  class="remove-preview-btn">
                  <Icon icon="mdi:close" class="remove-icon" />
                </button>
              </div>
            </div>
          </div>
        </BaseCard>

        <!-- Etiquetas -->
        <BaseCard :title="t('publish.sections.tags')" class="form-section">
          <div class="form-grid">
            <BaseInput
              v-model="tagsInput"
              :label="t('publish.fields.tags.label')"
              :placeholder="t('publish.fields.tags.placeholder')"
              :error="errors.tags"
              class="form-field"
              @keydown.enter.prevent="addTag"
              @blur="validateField('tags')" />

            <div v-if="tagsValue.length > 0" class="tags-display">
              <BaseChip
                v-for="(tag, index) in tagsValue"
                :key="index"
                :label="tag"
                removable
                @remove="removeTag(index)" />
            </div>
          </div>
        </BaseCard>

        <!-- Acciones del formulario -->
        <div class="form-actions">
          <BaseButton
            type="button"
            variant="secondary"
            @click="handleCancel"
            :disabled="isSubmitting">
            {{ t('common.cancel') }}
          </BaseButton>

          <BaseButton
            type="submit"
            variant="primary"
            :loading="isSubmitting"
            :disabled="!isFormValid">
            {{ t('publish.actions.publish') }}
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useAuth } from '@/composables/useAuth'
import { useItems } from '@/composables/useItems'
import { useToast } from 'primevue/usetoast'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseTextarea from '@/components/base/BaseTextarea.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseChip from '@/components/base/BaseChip.vue'
import BaseFileUpload from '@/components/base/BaseFileUpload.vue'
import CategorySelector from '@/components/CategorySelector.vue'
import type {
  CreateItemInput,
  ListingType,
  PricingModel,
  FulfillmentOption,
} from '@/types/marketplace'
import type { FileUploadRemoveEvent } from 'primevue/fileupload'

const { t } = useI18n()
const router = useRouter()
const { user } = useAuth()
const { createItem, uploadItemImage, isSubmitting } = useItems()
const toast = useToast()

// Estado del formulario
const formData = reactive<CreateItemInput>({
  userId: user.value?.uid || '',
  title: '',
  description: '',
  categoryId: null,
  listingType: 'sell' as ListingType,
  pricingMode: 'fixed' as PricingModel,
  price: 0,
  currency: 'USD',
  allowNegotiation: false,
  quantity: 1,
  condition: null,
  fulfillmentOptions: ['pickup'] as FulfillmentOption[],
  status: 'draft',
  isActive: true,
  tags: [],
  metadata: {},
  locationCity: '',
  locationState: '',
  locationCountry: '',
})

// Estado de validación
const errors = reactive<Record<string, string>>({})

// Estado de archivos
const selectedFiles = ref<File[]>([])
const imagePreviews = ref<Array<{ file: File; url: string }>>([])
const fileUploadRef = ref()

// Estado de etiquetas
const tagsInput = ref('')

// Constantes
const acceptedImageTypes = 'image/*'
const maxFileSize = 5 * 1024 * 1024 // 5MB
const maxImages = 10

// Opciones para selects
const listingTypeOptions = [
  { value: 'sell', label: t('publish.options.listingType.sell') },
  { value: 'lend', label: t('publish.options.listingType.lend') },
  { value: 'borrow', label: t('publish.options.listingType.borrow') },
  { value: 'donate', label: t('publish.options.listingType.donate') },
  { value: 'exchange', label: t('publish.options.listingType.exchange') },
  { value: 'service', label: t('publish.options.listingType.service') },
]

const pricingModeOptions = [
  { value: 'free', label: t('publish.options.pricingMode.free') },
  { value: 'fixed', label: t('publish.options.pricingMode.fixed') },
  { value: 'negotiable', label: t('publish.options.pricingMode.negotiable') },
  { value: 'donation', label: t('publish.options.pricingMode.donation') },
  { value: 'request', label: t('publish.options.pricingMode.request') },
]

const conditionOptions = [
  { value: 'new', label: t('publish.options.condition.new') },
  { value: 'like_new', label: t('publish.options.condition.likeNew') },
  { value: 'good', label: t('publish.options.condition.good') },
  { value: 'fair', label: t('publish.options.condition.fair') },
  { value: 'poor', label: t('publish.options.condition.poor') },
]

const fulfillmentOptions = [
  { value: 'in_person', label: t('publish.options.fulfillment.inPerson') },
  { value: 'pickup', label: t('publish.options.fulfillment.pickup') },
  { value: 'delivery', label: t('publish.options.fulfillment.delivery') },
  { value: 'shipping', label: t('publish.options.fulfillment.shipping') },
  { value: 'digital', label: t('publish.options.fulfillment.digital') },
]

// Computed para manejar valores del formulario
const showPriceField = computed(() => {
  return (
    formData.pricingMode === 'fixed' || formData.pricingMode === 'negotiable'
  )
})

const priceValue = computed({
  get: () => formData.price || 0,
  set: (value: number) => {
    formData.price = value > 0 ? value : 0
  },
})

const descriptionValue = computed({
  get: () => formData.description || '',
  set: (value: string) => {
    formData.description = value
  },
})

const locationCityValue = computed({
  get: () => formData.locationCity || '',
  set: (value: string) => {
    formData.locationCity = value
  },
})

const locationStateValue = computed({
  get: () => formData.locationState || '',
  set: (value: string) => {
    formData.locationState = value
  },
})

const locationCountryValue = computed({
  get: () => formData.locationCountry || '',
  set: (value: string) => {
    formData.locationCountry = value
  },
})

const tagsValue = computed(() => formData.tags || [])

const isFormValid = computed(() => {
  return (
    formData.title.trim() &&
    (formData.description?.trim() || '') &&
    formData.categoryId &&
    formData.listingType &&
    formData.pricingMode &&
    (!showPriceField.value ||
      (formData.price !== null &&
        formData.price !== undefined &&
        formData.price >= 0)) &&
    Object.keys(errors).length === 0
  )
})

// Métodos de validación
const validateField = (field: string) => {
  errors[field] = ''

  switch (field) {
    case 'title':
      if (!formData.title.trim()) {
        errors.title = t('validation.required', {
          field: t('publish.fields.title.label'),
        })
      } else if (formData.title.length < 3) {
        errors.title = t('validation.minLength', {
          field: t('publish.fields.title.label'),
          min: 3,
        })
      } else if (formData.title.length > 100) {
        errors.title = t('validation.maxLength', {
          field: t('publish.fields.title.label'),
          max: 100,
        })
      }
      break

    case 'description':
      if (!formData.description?.trim()) {
        errors.description = t('validation.required', {
          field: t('publish.fields.description.label'),
        })
      } else if (formData.description.length < 10) {
        errors.description = t('validation.minLength', {
          field: t('publish.fields.description.label'),
          min: 10,
        })
      } else if (formData.description.length > 2000) {
        errors.description = t('validation.maxLength', {
          field: t('publish.fields.description.label'),
          max: 2000,
        })
      }
      break

    case 'categoryId':
      if (!formData.categoryId) {
        errors.categoryId = t('validation.required', {
          field: t('publish.fields.category.label'),
        })
      }
      break

    case 'listingType':
      if (!formData.listingType) {
        errors.listingType = t('validation.required', {
          field: t('publish.fields.listingType.label'),
        })
      }
      break

    case 'pricingMode':
      if (!formData.pricingMode) {
        errors.pricingMode = t('validation.required', {
          field: t('publish.fields.pricingMode.label'),
        })
      }
      break

    case 'price':
      if (showPriceField.value) {
        if (formData.price === null || formData.price === undefined) {
          errors.price = t('validation.required', {
            field: t('publish.fields.price.label'),
          })
        } else if (formData.price < 0) {
          errors.price = t('validation.minValue', {
            field: t('publish.fields.price.label'),
            min: 0,
          })
        }
      }
      break

    case 'quantity':
      if (formData.quantity !== undefined && formData.quantity < 1) {
        errors.quantity = t('validation.minValue', {
          field: t('publish.fields.quantity.label'),
          min: 1,
        })
      }
      break

    case 'tags':
      if ((formData.tags?.length || 0) > 10) {
        errors.tags = t('validation.maxItems', {
          field: t('publish.fields.tags.label'),
          max: 10,
        })
      }
      break
  }
}

const validateAllFields = () => {
  const fields = [
    'title',
    'description',
    'categoryId',
    'listingType',
    'pricingMode',
    'price',
    'quantity',
    'tags',
  ]
  fields.forEach((field) => validateField(field))
}

// Métodos de manejo de archivos
const handleFileSelect = (_event?: {
  files: FileList
  originalEvent: Event
}) => {
  // BaseFileUpload emite v-model con la selección agregada; usamos esa fuente
  const files = Array.isArray(selectedFiles.value)
    ? selectedFiles.value
    : selectedFiles.value
      ? [selectedFiles.value as File]
      : []

  // Limpiar URLs previas para evitar fugas de memoria
  imagePreviews.value.forEach((p) => URL.revokeObjectURL(p.url))

  // Crear previews a partir del v-model actual
  imagePreviews.value = files.map((file) => ({
    file,
    url: URL.createObjectURL(file),
  }))
}

const handleFileRemove = (_event: FileUploadRemoveEvent) => {
  // BaseFileUpload ya actualizó el v-model; sincronizamos previews
  // Limpiar todas las URLs actuales
  imagePreviews.value.forEach((p) => URL.revokeObjectURL(p.url))
  const files = Array.isArray(selectedFiles.value) ? selectedFiles.value : []
  imagePreviews.value = files.map((file) => ({
    file,
    url: URL.createObjectURL(file),
  }))
}

const removeImagePreview = (index: number) => {
  URL.revokeObjectURL(imagePreviews.value[index].url)
  imagePreviews.value.splice(index, 1)
  selectedFiles.value.splice(index, 1)
}

// Métodos de manejo de etiquetas
const addTag = () => {
  const tag = tagsInput.value.trim().toLowerCase()
  if (
    tag &&
    !(formData.tags || []).includes(tag) &&
    (formData.tags || []).length < 10
  ) {
    if (!formData.tags) formData.tags = []
    formData.tags.push(tag)
    tagsInput.value = ''
    validateField('tags')
  }
}

const removeTag = (index: number) => {
  if (formData.tags) {
    formData.tags.splice(index, 1)
    validateField('tags')
  }
}

// Métodos de formulario
const handleSubmit = async () => {
  if (!user.value?.uid) {
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t('auth.notAuthenticated'),
      life: 3000,
    })
    return
  }

  validateAllFields()

  if (!isFormValid.value) {
    toast.add({
      severity: 'error',
      summary: t('validation.errors'),
      detail: t('validation.checkFields'),
      life: 3000,
    })
    return
  }

  try {
    // Preparar datos del item
    const itemData: CreateItemInput = {
      ...formData,
      userId: user.value.uid,
      price: showPriceField.value ? formData.price : null,
      quantity: formData.quantity || 1,
      tags: formData.tags || [],
    }

    // Crear el item
    const newItem = await createItem(itemData)

    if (newItem) {
      // Subir imágenes si las hay
      if (selectedFiles.value.length > 0) {
        for (let i = 0; i < selectedFiles.value.length; i++) {
          try {
            await uploadItemImage(newItem.id, selectedFiles.value[i], i)
          } catch (error) {
            console.error(`Error uploading image ${i + 1}:`, error)
            // No fallar completamente si una imagen falla
          }
        }
      }

      toast.add({
        severity: 'success',
        summary: t('publish.success.title'),
        detail: t('publish.success.message'),
        life: 3000,
      })

      // Redirigir al dashboard
      router.push('/dashboard')
    }
  } catch (error) {
    console.error('Error creating item:', error)
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t('publish.errors.createFailed'),
      life: 5000,
    })
  }
}

const handleCancel = () => {
  if (confirm(t('publish.confirmCancel'))) {
    router.push('/dashboard')
  }
}

// Cleanup
const cleanup = () => {
  imagePreviews.value.forEach((preview) => {
    URL.revokeObjectURL(preview.url)
  })
}

// Lifecycle
onMounted(() => {
  if (!user.value?.uid) {
    router.push('/login')
    return
  }

  // Set userId
  formData.userId = user.value.uid
})

// Cleanup on unmount
import { onUnmounted } from 'vue'
onUnmounted(cleanup)
</script>

<style scoped>
.publish-container {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--space-lg);
}

.publish-header {
  margin-bottom: var(--space-xl);
  text-align: center;
}

.header-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
}

.page-title {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.title-icon {
  font-size: 2rem;
  color: var(--color-primary);
}

.page-subtitle {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  margin: 0;
}

.publish-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.publish-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.form-section {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding: var(--space-lg);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-lg);
}

.form-field {
  width: 100%;
}

.form-checkbox {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) 0;
}

.checkbox-input {
  width: 1rem;
  height: 1rem;
  accent-color: var(--color-primary);
  border-radius: var(--radius-sm);
}

.checkbox-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
}

.image-previews {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--space-md);
  margin-top: var(--space-md);
}

.preview-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-preview-btn {
  position: absolute;
  top: var(--space-xs);
  right: var(--space-xs);
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: var(--color-error);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.remove-preview-btn:hover {
  background: var(--color-error);
  transform: scale(1.1);
}

.remove-icon {
  font-size: 0.75rem;
}

.tags-display {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  margin-top: var(--space-md);
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: var(--space-lg);
  padding: var(--space-xl) 0;
  border-top: 1px solid var(--color-border);
  margin-top: var(--space-xl);
}

/* Responsive */
@media (max-width: 768px) {
  .publish-container {
    padding: var(--space-md);
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .image-previews {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  }

  .form-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
