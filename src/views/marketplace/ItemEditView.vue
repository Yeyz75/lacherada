<template>
  <div class="max-w-4xl mx-auto p-4 md:p-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        {{ t('itemEdit.title') }}
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        {{ t('itemEdit.subtitle') }}
      </p>
    </div>

    <!-- Loading -->
    <div
      v-if="isLoading"
      class="flex flex-col items-center justify-center py-20 gap-4">
      <Icon icon="mdi:loading" class="text-6xl text-gray-400 animate-spin" />
      <p class="text-gray-600 dark:text-gray-400">{{ t('common.loading') }}</p>
    </div>

    <!-- Error -->
    <div
      v-else-if="error"
      class="flex flex-col items-center justify-center py-20 gap-4">
      <Icon icon="mdi:alert-circle" class="text-6xl text-red-500" />
      <p class="text-gray-900 dark:text-white">{{ error }}</p>
      <BaseButton variant="secondary" @click="loadItem">
        {{ t('common.retry') }}
      </BaseButton>
    </div>

    <!-- Edit Form -->
    <form v-else-if="formData" @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Basic Info Card -->
      <div
        class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {{ t('publish.sections.basicInfo') }}
        </h2>

        <div class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BaseInput
              v-model="formData.title"
              :label="t('publish.fields.title.label')"
              :placeholder="t('publish.fields.title.placeholder')"
              required
              :maxlength="100" />
            v-model="formData.categoryId" required />
          </div>

          <BaseTextarea
            v-model="formData.description"
            :label="t('publish.fields.description.label')"
            :placeholder="t('publish.fields.description.placeholder')"
            required
            :maxlength="2000"
            :rows="4"
            class="w-full md:col-span-2" />

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <BaseSelect
              v-model="formData.listingType"
              :label="t('publish.fields.listingType.label')"
              :placeholder="t('publish.fields.listingType.placeholder')"
              required
              :options="listingTypeOptions" />

            <BaseSelect
              v-model="formData.pricingMode"
              :label="t('publish.fields.pricingMode.label')"
              :placeholder="t('publish.fields.pricingMode.placeholder')"
              required
              :options="pricingModeOptions" />

            <BaseInput
              v-if="showPriceField"
              v-model.number="formData.price"
              :label="t('publish.fields.price.label')"
              :placeholder="t('publish.fields.price.placeholder')"
              type="number"
              step="0.01"
              min="0" />
          </div>
        </div>
      </div>

      <!-- Details Card -->
      <div
        class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {{ t('publish.sections.details') }}
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <BaseInput
            v-model.number="formData.quantity"
            :label="t('publish.fields.quantity.label')"
            type="number"
            :min="1" />

          <BaseSelect
            v-model="formData.condition"
            :label="t('publish.fields.condition.label')"
            :options="conditionOptions"
            clearable />

          <BaseSelect
            v-model="formData.fulfillmentOptions"
            :label="t('publish.fields.fulfillmentOptions.label')"
            multiple
            :options="fulfillmentOptions"
            clearable />
        </div>

        <div class="mt-4">
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              v-model="formData.allowNegotiation"
              type="checkbox"
              class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
            <span class="text-sm text-gray-700 dark:text-gray-300">
              {{ t('publish.fields.allowNegotiation') }}
            </span>
          </label>
        </div>
      </div>

      <!-- Location Card -->
      <div
        class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {{ t('publish.sections.location') }}
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <BaseInput
            v-model="formData.locationCity"
            :label="t('publish.fields.locationCity.label')"
            :placeholder="t('publish.fields.locationCity.placeholder')"
            clearable />

          <BaseInput
            v-model="formData.locationState"
            :label="t('publish.fields.locationState.label')"
            :placeholder="t('publish.fields.locationState.placeholder')"
            clearable />

          <BaseInput
            v-model="formData.locationCountry"
            :label="t('publish.fields.locationCountry.label')"
            :placeholder="t('publish.fields.locationCountry.placeholder')"
            clearable />
        </div>
      </div>

      <!-- Status Card -->
      <div
        class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {{ t('itemEdit.status.title') }}
        </h2>

        <BaseSelect
          v-model="formData.status"
          :label="t('itemEdit.status.label')"
          :options="statusOptions" />
      </div>

      <!-- Actions -->
      <div
        class="flex flex-col md:flex-row gap-4 justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
        <BaseButton type="button" variant="secondary" @click="handleCancel">
          {{ t('common.cancel') }}
        </BaseButton>

        <BaseButton
          type="submit"
          variant="primary"
          :loading="isSubmitting"
          :disabled="!isFormValid">
          {{ t('itemEdit.actions.save') }}
        </BaseButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useToast } from 'primevue/usetoast'
import { useAuth } from '@/composables/useAuth'
import { useItems } from '@/composables/useItems'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseTextarea from '@/components/base/BaseTextarea.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import CategorySelector from '@/components/CategorySelector.vue'
import type { UpdateItemInput } from '@/types/marketplace'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const toast = useToast()
const { user } = useAuth()
const { currentItem, isLoading, isSubmitting, error, getItemById, updateItem } =
  useItems()

const formData = ref<UpdateItemInput | null>(null)

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

const statusOptions = [
  { value: 'draft', label: t('marketplace.status.draft') },
  { value: 'published', label: t('marketplace.status.published') },
  { value: 'paused', label: t('marketplace.status.paused') },
  { value: 'archived', label: t('marketplace.status.archived') },
]

const showPriceField = computed(() => {
  return (
    formData.value?.pricingMode === 'fixed' ||
    formData.value?.pricingMode === 'negotiable'
  )
})

const isFormValid = computed(() => {
  if (!formData.value) return false
  return !!(
    formData.value.title?.trim() &&
    formData.value.description?.trim() &&
    formData.value.categoryId &&
    formData.value.listingType &&
    formData.value.pricingMode
  )
})

const loadItem = async () => {
  const itemId = route.params.id as string
  const item = await getItemById(itemId)

  if (item) {
    if (item.userId !== user.value?.uid) {
      toast.add({
        severity: 'error',
        summary: t('common.error'),
        detail: t('itemEdit.errors.notOwner'),
        life: 3000,
      })
      router.push('/my-items')
      return
    }

    formData.value = {
      title: item.title,
      description: item.description,
      categoryId: item.categoryId,
      listingType: item.listingType,
      pricingMode: item.pricingMode,
      price: item.price,
      allowNegotiation: item.allowNegotiation,
      quantity: item.quantity,
      condition: item.condition,
      fulfillmentOptions: item.fulfillmentOptions,
      status: item.status,
      locationCity: item.locationCity,
      locationState: item.locationState,
      locationCountry: item.locationCountry,
    }
  }
}

const handleSubmit = async () => {
  if (!formData.value || !currentItem.value) return

  const success = await updateItem(currentItem.value.id, formData.value)

  if (success) {
    toast.add({
      severity: 'success',
      summary: t('itemEdit.success.title'),
      detail: t('itemEdit.success.message'),
      life: 3000,
    })
    router.push('/my-items')
  } else {
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t('itemEdit.errors.updateFailed'),
      life: 3000,
    })
  }
}

const handleCancel = () => {
  if (confirm(t('itemEdit.confirmCancel'))) {
    router.push('/my-items')
  }
}

onMounted(() => {
  loadItem()
})
</script>
