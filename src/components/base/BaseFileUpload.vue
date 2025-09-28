<template>
  <div v-bind="rootAttrs" :class="wrapperClasses">
    <!-- Label -->
    <label v-if="label" :for="inputId" :class="labelClasses">
      {{ label }}
      <span v-if="required" class="text-error ml-1">*</span>
    </label>

    <!-- File Upload Component -->
    <FileUpload
      :id="inputId"
      :data-testid="testId"
      ref="fileUploadRef"
      :name="name"
      :url="uploadUrl"
      :mode="mode"
      :accept="accept"
      :max-file-size="maxFileSize"
      :multiple="multiple"
      :disabled="disabled"
      :auto="auto"
      :choose-label="chooseLabel || t('fileUpload.choose')"
      :upload-label="uploadLabel || t('fileUpload.upload')"
      :cancel-label="cancelLabel || t('fileUpload.cancel')"
      :invalid-file-size-message="
        invalidFileSizeMessage || t('fileUpload.invalidFileSize')
      "
      :invalid-file-type-message="
        invalidFileTypeMessage || t('fileUpload.invalidFileType')
      "
      :file-limit="fileLimit"
      :file-limit-message="fileLimitMessage || t('fileUpload.fileLimit')"
      :preview-width="previewWidth"
      :show-upload-button="showUploadButton"
      :show-cancel-button="showCancelButton"
      :custom-upload="customUpload"
      :aria-describedby="ariaDescribedBy"
      @select="handleFileSelect"
      @upload="handleUpload"
      @before-upload="handleBeforeUpload"
      @before-send="handleBeforeSend"
      @error="handleError"
      @clear="handleClear"
      @remove="handleRemove"
      @progress="handleProgress"
      :class="fileUploadClasses">
      <!-- Empty template slot -->
      <template #empty>
        <div class="flex items-center justify-center flex-col p-6 text-center">
          <slot name="empty">
            <i class="pi pi-cloud-upload text-4xl text-muted-color" />
            <p class="mt-4 mb-0 text-sm">
              {{ emptyMessage || t('fileUpload.dragAndDrop') }}
            </p>
          </slot>
        </div>
      </template>

      <!-- Header template slot -->
      <template
        #header="{ chooseCallback, uploadCallback, clearCallback, files }"
        v-if="mode === 'advanced'">
        <slot
          name="header"
          :choose-callback="chooseCallback"
          :upload-callback="uploadCallback"
          :clear-callback="clearCallback"
          :files="files">
          <div class="flex flex-wrap justify-between items-center gap-4 w-full">
            <div class="flex gap-2">
              <BaseButton
                @click="chooseCallback()"
                icon="mdi:image-plus"
                variant="ghost"
                size="sm"
                :disabled="disabled"
                aria-label="Seleccionar archivos" />
              <BaseButton
                v-if="showUploadButton"
                @click="uploadCallback()"
                icon="mdi:cloud-upload-outline"
                variant="success"
                size="sm"
                :disabled="!files || files.length === 0 || disabled"
                aria-label="Subir archivos" />
              <BaseButton
                v-if="showCancelButton"
                @click="clearCallback()"
                icon="mdi:close-circle-outline"
                variant="danger"
                size="sm"
                :disabled="!files || files.length === 0 || disabled"
                aria-label="Cancelar selección" />
            </div>
            <ProgressBar
              :value="totalSizePercent"
              :show-value="false"
              class="md:w-80 h-1 w-full md:ml-auto">
              <span class="whitespace-nowrap text-xs">
                {{ totalSizeLabel }}
              </span>
            </ProgressBar>
          </div>
        </slot>
      </template>
    </FileUpload>

    <!-- Helper Text / Error Message -->
    <div v-if="helperText || errorMessage" class="mt-1">
      <Message
        v-if="errorMessage"
        severity="error"
        variant="simple"
        size="small"
        :id="errorId">
        {{ errorMessage }}
      </Message>
      <small v-else-if="helperText" :class="helperClasses" :id="helperId">
        {{ helperText }}
      </small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, useAttrs } from 'vue'
import { useI18n } from 'vue-i18n'
import FileUpload from 'primevue/fileupload'
import ProgressBar from 'primevue/progressbar'
import Message from 'primevue/message'
import BaseButton from './BaseButton.vue'
import type {
  FileUploadErrorEvent,
  FileUploadRemoveEvent,
} from 'primevue/fileupload'
import type { FileUploadProps as BaseFileUploadProps } from '../../types'

interface Props extends BaseFileUploadProps {
  showProgress?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'advanced',
  accept: 'image/*',
  maxFileSize: 1000000, // 1MB
  multiple: false,
  disabled: false,
  required: false,
  auto: false,
  previewWidth: 50,
  showUploadButton: true,
  showCancelButton: true,
  showProgress: true,
  customUpload: false,
  error: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: File | File[] | null]
  'select': [event: { files: FileList; originalEvent: Event }]
  'upload': [event: any]
  'before-upload': [event: { xhr: XMLHttpRequest; formData: FormData }]
  'before-send': [event: { xhr: XMLHttpRequest }]
  'error': [event: FileUploadErrorEvent]
  'clear': []
  'remove': [event: FileUploadRemoveEvent]
  'progress': [event: { originalEvent: Event; progress: number }]
}>()

const { t } = useI18n()
const attrs = useAttrs()
const fileUploadRef = ref<any>()
// Selected files state to support v-model and progress display
const selected = ref<File[] | File | null>(null)
const totalBytes = ref(0)
const currentCount = ref(0)
const generatedId = `base-file-upload-${Math.random().toString(36).slice(2, 11)}`
const inputId = computed(() => props.id ?? generatedId)

// Computed properties
const hasError = computed(
  () => Boolean(props.error) || Boolean(errorMessage.value),
)
const errorMessage = computed(() => {
  if (typeof props.error === 'string') return props.error
  return props.error ? t('fileUpload.error') : ''
})

const helperId = computed(() =>
  props.helperText ? `${inputId.value}-helper` : undefined,
)
const errorId = computed(() =>
  errorMessage.value ? `${inputId.value}-error` : undefined,
)
const ariaDescribedBy = computed(() => errorId.value ?? helperId.value)

const helperText = computed(() => props.helperText)

// CSS Classes
const wrapperClasses = computed(() => [
  'flex w-full flex-col gap-2',
  { 'opacity-60 pointer-events-none': props.disabled },
  props.class,
  attrs.class,
])

const rootAttrs = computed(() => {
  const { class: _class, ...rest } = Object.assign({}, attrs)
  return rest
})

const labelClasses = computed(() => [
  'flex items-center gap-1 text-sm font-medium text-text-primary transition-colors duration-150',
  {
    'text-error': hasError.value,
  },
])

const helperClasses = computed(() => [
  'text-xs text-text-muted transition-colors',
  {
    'text-error': hasError.value,
  },
])

// Keep styling minimal to let PrimeVue theme drive the look
const fileUploadClasses = computed(() => [
  'w-full',
  { 'opacity-75 pointer-events-none': props.disabled },
])

// Total size progress helpers
const maxDisplayBytes = computed(() => {
  if (!props.maxFileSize) return Infinity
  const perFile = props.maxFileSize
  const count = Math.max(1, currentCount.value || (props.multiple ? 1 : 1))
  // If fileLimit is provided, use that as an upper bound for display purposes
  const limitCount = props.fileLimit ? Math.max(count, props.fileLimit) : count
  return perFile * limitCount
})

const totalSizePercent = computed(() => {
  if (!isFinite(maxDisplayBytes.value) || maxDisplayBytes.value <= 0) return 0
  return Math.min(
    100,
    Math.round((totalBytes.value / maxDisplayBytes.value) * 100),
  )
})

const totalSizeLabel = computed(() => {
  const total = formatFileSize(totalBytes.value)
  if (!isFinite(maxDisplayBytes.value)) return total
  return `${total} / ${formatFileSize(maxDisplayBytes.value)}`
})

// Methods
const handleFileSelect = (event: { files: FileList; originalEvent: Event }) => {
  emit('select', event)
  const newFiles = Array.from(event.files || [])

  if (props.multiple) {
    const current = Array.isArray(selected.value) ? selected.value : []
    // Append and deduplicate by name+size+type to avoid duplicates when reselecting
    const combined = [...current, ...newFiles]
    const uniqueMap = new Map<string, File>()
    for (const f of combined) {
      uniqueMap.set(`${f.name}-${f.size}-${f.type}`, f)
    }
    const result = Array.from(uniqueMap.values())
    selected.value = result
    emit('update:modelValue', result)
  } else {
    // Para single file, siempre reemplazar con el nuevo archivo
    // Limpiar archivos anteriores del componente PrimeVue
    if (
      fileUploadRef.value &&
      fileUploadRef.value.files &&
      fileUploadRef.value.files.length > 0
    ) {
      fileUploadRef.value.clear()
    }

    selected.value = newFiles[0] || null
    emit('update:modelValue', newFiles[0] || null)

    // Forzar que PrimeVue solo muestre un archivo
    if (fileUploadRef.value && newFiles[0]) {
      fileUploadRef.value.files = [newFiles[0]]
    }
  }

  const arr = Array.isArray(selected.value)
    ? selected.value
    : selected.value
      ? [selected.value as File]
      : []
  currentCount.value = arr.length
  totalBytes.value = arr.reduce((sum, f) => sum + (f?.size || 0), 0)
}

const handleUpload = (event: any) => {
  emit('upload', event)
}

const handleBeforeUpload = (event: {
  xhr: XMLHttpRequest
  formData: FormData
}) => {
  emit('before-upload', event)
}

const handleBeforeSend = (event: { xhr: XMLHttpRequest }) => {
  emit('before-send', event)
}

const handleError = (event: FileUploadErrorEvent) => {
  emit('error', event)
}

const handleClear = () => {
  emit('clear')
  selected.value = props.multiple ? [] : null
  totalBytes.value = 0
  currentCount.value = 0
  emit('update:modelValue', selected.value as any)
}

const handleRemove = (event: FileUploadRemoveEvent) => {
  emit('remove', event)
  const file = event.file as File | undefined
  if (!file) return
  if (Array.isArray(selected.value)) {
    const idx = selected.value.findIndex(
      (f) =>
        f.name === file.name && f.size === file.size && f.type === file.type,
    )
    if (idx > -1) {
      selected.value.splice(idx, 1)
      totalBytes.value = selected.value.reduce(
        (sum, f) => sum + (f.size || 0),
        0,
      )
      currentCount.value = selected.value.length
      emit('update:modelValue', [...selected.value])
    }
  } else if (selected.value && (selected.value as File).name === file.name) {
    selected.value = null
    totalBytes.value = 0
    currentCount.value = 0
    emit('update:modelValue', null)
  }
}

const handleProgress = (event: { originalEvent: Event; progress: number }) => {
  emit('progress', event)
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Public methods
const upload = () => {
  fileUploadRef.value?.upload()
}

const clear = () => {
  fileUploadRef.value?.clear()
}

defineExpose({
  upload,
  clear,
  fileUploadRef,
})
</script>

<script lang="ts">
export default {
  name: 'BaseFileUpload',
  inheritAttrs: false,
}
</script>
