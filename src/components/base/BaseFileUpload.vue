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
      :class="fileUploadClasses"
      :unstyled="true">
      <!-- Empty template slot -->
      <template #empty>
        <div
          class="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-surface-secondary/40 p-8 text-center">
          <slot name="empty">
            <i
              class="pi pi-cloud-upload inline-flex h-16 w-16 items-center justify-center rounded-full border-2 border-border bg-surface-primary text-4xl text-text-muted" />
            <p class="mt-4 mb-0 text-sm text-text-muted">
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
          <div
            class="flex flex-col gap-3 rounded-2xl border border-border/80 bg-surface-secondary/80 px-4 py-4 shadow-sm">
            <div class="flex flex-wrap items-center gap-3">
              <BaseButton
                @click="chooseCallback()"
                :label="chooseLabel || t('fileUpload.choose')"
                icon="pi pi-folder-open"
                :disabled="disabled"
                variant="primary"
                size="sm"
                class="min-w-[8.5rem]" />

              <BaseButton
                v-if="showUploadButton"
                @click="uploadCallback()"
                :label="uploadLabel || t('fileUpload.upload')"
                icon="pi pi-upload"
                :disabled="!files || files.length === 0 || disabled"
                variant="success"
                size="sm"
                class="min-w-[8.5rem]" />

              <BaseButton
                v-if="showCancelButton"
                @click="clearCallback()"
                :label="cancelLabel || t('fileUpload.cancel')"
                icon="pi pi-times"
                :disabled="!files || files.length === 0 || disabled"
                variant="ghost"
                size="sm"
                class="min-w-[8.5rem]" />
            </div>

            <div
              class="flex flex-wrap items-center gap-2 text-xs text-text-muted">
              <i class="pi pi-info-circle text-base text-primary/70" />
              <span>{{ fileSelectionSummary(files) }}</span>
            </div>

            <div
              v-if="showProgress && uploadProgress > 0"
              class="flex w-full items-center gap-3">
              <ProgressBar
                :value="uploadProgress"
                :show-value="true"
                class="h-2 w-full overflow-hidden rounded-full bg-surface-tertiary text-xs shadow-inner" />
            </div>
          </div>
        </slot>
      </template>

      <!-- Content template slot -->
      <template
        #content="{
          files,
          uploadedFiles,
          removeFileCallback,
          removeUploadedFileCallback,
        }"
        v-if="mode === 'advanced'">
        <slot
          name="content"
          :files="files"
          :uploaded-files="uploadedFiles"
          :remove-file-callback="removeFileCallback"
          :remove-uploaded-file-callback="removeUploadedFileCallback">
          <div class="flex flex-col gap-6">
            <!-- Pending files -->
            <div v-if="files && files.length > 0" class="flex flex-col gap-3">
              <h5 class="text-sm font-semibold text-text-primary">
                {{ t('fileUpload.pending') }}
              </h5>
              <div class="flex flex-col gap-3">
                <div
                  v-for="(file, index) of files"
                  :key="file.name + file.type + file.size"
                  class="flex items-center gap-4 rounded-xl border border-border bg-surface-primary/70 p-4 shadow-sm">
                  <div
                    class="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg bg-surface-secondary">
                    <img
                      v-if="isImageFile(file)"
                      role="presentation"
                      :alt="file.name"
                      :src="(file as any).objectURL"
                      class="h-full w-full object-cover" />
                    <i v-else class="pi pi-file text-2xl text-text-muted" />
                  </div>
                  <div class="flex flex-1 flex-col gap-1 text-sm">
                    <span class="font-medium text-text-primary">
                      {{ file.name }}
                    </span>
                    <span class="text-text-muted">
                      {{ formatFileSize(file.size) }}
                    </span>
                  </div>
                  <BaseButton
                    v-if="!disabled"
                    icon="pi pi-times"
                    @click="removeFileCallback(index)"
                    variant="ghost"
                    severity="danger"
                    size="sm"
                    class="h-9 w-9 rounded-full text-text-muted hover:text-error"
                    :aria-label="t('fileUpload.removeFile')" />
                </div>
              </div>
            </div>

            <!-- Uploaded files -->
            <div
              v-if="uploadedFiles && uploadedFiles.length > 0"
              class="flex flex-col gap-3">
              <h5 class="text-sm font-semibold text-text-primary">
                {{ t('fileUpload.uploaded') }}
              </h5>
              <div class="flex flex-col gap-3">
                <div
                  v-for="(file, index) of uploadedFiles"
                  :key="file.name + file.type + file.size"
                  class="flex items-center gap-4 rounded-xl border border-success/40 bg-success/5 p-4 shadow-sm">
                  <div
                    class="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg bg-surface-secondary">
                    <img
                      v-if="isImageFile(file)"
                      role="presentation"
                      :alt="file.name"
                      :src="(file as any).objectURL"
                      class="h-full w-full object-cover" />
                    <i v-else class="pi pi-file text-2xl text-success" />
                  </div>
                  <div class="flex flex-1 flex-col gap-1 text-sm">
                    <span class="font-medium text-text-primary">
                      {{ file.name }}
                    </span>
                    <span class="text-text-muted">
                      {{ formatFileSize(file.size) }}
                    </span>
                    <Badge
                      :value="t('fileUpload.uploadedBadge') ?? 'Completed'"
                      severity="success"
                      class="w-fit" />
                  </div>
                  <BaseButton
                    v-if="!disabled"
                    icon="pi pi-times"
                    @click="removeUploadedFileCallback(index)"
                    variant="ghost"
                    severity="danger"
                    size="sm"
                    class="h-9 w-9 rounded-full text-text-muted hover:text-error"
                    :aria-label="t('fileUpload.removeFile')" />
                </div>
              </div>
            </div>
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
import Badge from 'primevue/badge'
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
const uploadProgress = ref(0)
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
  {
    'opacity-60 pointer-events-none': props.disabled,
  },
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

const fileUploadClasses = computed(() => [
  'group relative flex w-full flex-col gap-5 rounded-2xl p-1 transition duration-200 focus-within:ring-2 focus-within:ring-primary/20',
  {
    'ring-2 ring-error/25 focus-within:ring-error/25': hasError.value,
    'opacity-75 pointer-events-none': props.disabled,
  },
])

const fileSelectionSummary = (files?: File[]) => {
  if (files && files.length > 0) {
    return t('fileUpload.filesSelected', { count: files.length })
  }
  return t('fileUpload.noFilesSelected')
}

// Methods
const handleFileSelect = (event: { files: FileList; originalEvent: Event }) => {
  emit('select', event)
  if (props.customUpload && props.auto) {
    // Handle custom upload logic here if needed
  }
}

const handleUpload = (event: any) => {
  emit('upload', event)
  // Reset progress after upload
  setTimeout(() => {
    uploadProgress.value = 0
  }, 1000)
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
}

const handleRemove = (event: FileUploadRemoveEvent) => {
  emit('remove', event)
}

const handleProgress = (event: { originalEvent: Event; progress: number }) => {
  emit('progress', event)
  uploadProgress.value = event.progress
}

const isImageFile = (file: any): boolean => {
  return file.type && file.type.startsWith('image/')
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
