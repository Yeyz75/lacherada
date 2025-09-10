<template>
  <div class="base-file-upload-wrapper" :class="wrapperClasses">
    <!-- Label -->
    <label
      v-if="label"
      :for="inputId"
      class="base-file-upload-label"
      :class="labelClasses">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <!-- File Upload Component -->
    <FileUpload
      :id="inputId"
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
      @select="handleFileSelect"
      @upload="handleUpload"
      @before-upload="handleBeforeUpload"
      @before-send="handleBeforeSend"
      @error="handleError"
      @clear="handleClear"
      @remove="handleRemove"
      @progress="handleProgress"
      v-bind="fileUploadProps"
      :class="fileUploadClasses">
      <!-- Empty template slot -->
      <template #empty>
        <div class="file-upload-empty">
          <slot name="empty">
            <i
              class="pi pi-cloud-upload !border-2 !rounded-full !p-8 !text-4xl !text-muted-color" />
            <p class="mt-4 mb-0">
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
          <div class="file-upload-header">
            <div class="file-upload-actions">
              <BaseButton
                @click="chooseCallback()"
                :label="chooseLabel || t('fileUpload.choose')"
                icon="pi pi-folder-open"
                :disabled="disabled"
                variant="outlined" />

              <BaseButton
                v-if="showUploadButton"
                @click="uploadCallback()"
                :label="uploadLabel || t('fileUpload.upload')"
                icon="pi pi-upload"
                :disabled="!files || files.length === 0 || disabled"
                variant="primary"
                class="ml-2" />

              <BaseButton
                v-if="showCancelButton"
                @click="clearCallback()"
                :label="cancelLabel || t('fileUpload.cancel')"
                icon="pi pi-times"
                :disabled="(!files || files.length === 0) && disabled"
                variant="secondary"
                class="ml-2" />
            </div>

            <div
              v-if="showProgress && uploadProgress > 0"
              class="file-upload-progress">
              <ProgressBar
                :value="uploadProgress"
                :show-value="true"
                class="w-full mt-2" />
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
          <div class="file-upload-content">
            <!-- Pending files -->
            <div v-if="files && files.length > 0" class="pending-files">
              <h5>{{ t('fileUpload.pending') }}</h5>
              <div class="file-list">
                <div
                  v-for="(file, index) of files"
                  :key="file.name + file.type + file.size"
                  class="file-item pending">
                  <div class="file-preview">
                    <img
                      v-if="isImageFile(file)"
                      role="presentation"
                      :alt="file.name"
                      :src="(file as any).objectURL"
                      class="file-image" />
                    <i v-else class="file-icon pi pi-file" />
                  </div>
                  <div class="file-info">
                    <span class="file-name">{{ file.name }}</span>
                    <span class="file-size">
                      {{ formatFileSize(file.size) }}
                    </span>
                  </div>
                  <BaseButton
                    v-if="!disabled"
                    icon="pi pi-times"
                    @click="removeFileCallback(index)"
                    variant="text"
                    severity="danger"
                    :aria-label="t('fileUpload.removeFile')" />
                </div>
              </div>
            </div>

            <!-- Uploaded files -->
            <div
              v-if="uploadedFiles && uploadedFiles.length > 0"
              class="uploaded-files">
              <h5>{{ t('fileUpload.uploaded') }}</h5>
              <div class="file-list">
                <div
                  v-for="(file, index) of uploadedFiles"
                  :key="file.name + file.type + file.size"
                  class="file-item uploaded">
                  <div class="file-preview">
                    <img
                      v-if="isImageFile(file)"
                      role="presentation"
                      :alt="file.name"
                      :src="(file as any).objectURL"
                      class="file-image" />
                    <i v-else class="file-icon pi pi-file" />
                  </div>
                  <div class="file-info">
                    <span class="file-name">{{ file.name }}</span>
                    <span class="file-size">
                      {{ formatFileSize(file.size) }}
                    </span>
                    <Badge value="Completed" severity="success" />
                  </div>
                  <BaseButton
                    v-if="!disabled"
                    icon="pi pi-times"
                    @click="removeUploadedFileCallback(index)"
                    variant="text"
                    severity="danger"
                    :aria-label="t('fileUpload.removeFile')" />
                </div>
              </div>
            </div>
          </div>
        </slot>
      </template>
    </FileUpload>

    <!-- Helper Text / Error Message -->
    <div v-if="helperText || errorMessage" class="base-file-upload-help">
      <Message
        v-if="errorMessage"
        severity="error"
        variant="simple"
        size="small"
        :id="`${inputId}-error`">
        {{ errorMessage }}
      </Message>
      <small
        v-else-if="helperText"
        class="base-file-upload-helper"
        :id="`${inputId}-helper`">
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

interface FileUploadProps {
  modelValue?: File | File[] | null
  label?: string
  helperText?: string
  name?: string
  uploadUrl?: string
  mode?: 'basic' | 'advanced'
  accept?: string
  maxFileSize?: number
  multiple?: boolean
  disabled?: boolean
  required?: boolean
  auto?: boolean
  chooseLabel?: string
  uploadLabel?: string
  cancelLabel?: string
  invalidFileSizeMessage?: string
  invalidFileTypeMessage?: string
  fileLimit?: number
  fileLimitMessage?: string
  previewWidth?: number
  showUploadButton?: boolean
  showCancelButton?: boolean
  showProgress?: boolean
  customUpload?: boolean
  emptyMessage?: string
  error?: string | boolean
  class?: string
}

const props = withDefaults(defineProps<FileUploadProps>(), {
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
const fileUploadRef = ref<any>()
const uploadProgress = ref(0)
const inputId = ref(
  `base-file-upload-${Math.random().toString(36).substr(2, 9)}`,
)

// Computed properties
const hasError = computed(
  () => Boolean(props.error) || Boolean(errorMessage.value),
)
const errorMessage = computed(() => {
  if (typeof props.error === 'string') return props.error
  return props.error ? t('fileUpload.error') : ''
})

// CSS Classes
const wrapperClasses = computed(() => [
  'base-file-upload-wrapper',
  {
    'opacity-75': props.disabled,
    'base-file-upload-error': hasError.value,
  },
  props.class,
])

const labelClasses = computed(() => ({
  'text-red-600': hasError.value,
}))

const fileUploadClasses = computed(() => ({
  'base-file-upload': true,
  'base-file-upload-disabled': props.disabled,
}))

// FileUpload additional props
const fileUploadProps = computed(() => {
  const baseProps = { ...useAttrs() }
  return baseProps
})

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

<style scoped>
.base-file-upload-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.base-file-upload-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--p-text-color);
  margin-bottom: 0.25rem;
  transition: color 0.2s;
}

.base-file-upload-help {
  margin-top: 0.25rem;
}

.base-file-upload-helper {
  font-size: var(--font-size-xs);
  color: var(--p-text-muted-color);
  display: block;
}

/* File Upload Custom Styles */
.file-upload-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.file-upload-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--p-surface-100);
  border-radius: var(--p-border-radius-md);
}

.file-upload-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.file-upload-content {
  padding: 1rem 0;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: var(--p-border-radius-md);
  border: 1px solid var(--p-surface-200);
}

.file-item.pending {
  background: var(--p-surface-50);
}

.file-item.uploaded {
  background: var(--p-surface-100);
}

.file-preview {
  flex-shrink: 0;
}

.file-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: var(--p-border-radius-md);
}

.file-icon {
  font-size: 2rem;
  color: var(--p-surface-500);
}

.file-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.file-name {
  font-weight: var(--font-weight-medium);
  color: var(--p-text-color);
}

.file-size {
  font-size: var(--font-size-sm);
  color: var(--p-text-muted-color);
}

/* Error state */
.base-file-upload-error .base-file-upload-label {
  color: var(--p-red-500);
}

/* Responsive */
@media (max-width: 768px) {
  .base-file-upload-label {
    font-size: var(--font-size-xs);
  }

  .base-file-upload-helper {
    font-size: 0.6875rem;
  }

  .file-upload-header {
    flex-direction: column;
    align-items: stretch;
  }

  .file-upload-actions {
    justify-content: center;
  }
}
</style>
