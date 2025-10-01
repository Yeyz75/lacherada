<template>
  <div class="max-w-7xl mx-auto p-4 md:p-8">
    <!-- Header -->
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div class="flex-1">
        <h1
          class="flex items-center gap-2 text-3xl font-bold text-gray-900 dark:text-white mb-2">
          <Icon icon="mdi:message-text" class="text-primary-600 text-4xl" />
          {{ t('messages.title') }}
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-400">
          {{ t('messages.subtitle') }}
        </p>
      </div>
    </div>

    <!-- Coming Soon State -->
    <div
      class="flex flex-col items-center justify-center py-20 gap-6 text-center">
      <div class="relative">
        <Icon
          icon="mdi:chat-processing"
          class="text-8xl text-primary-500 animate-pulse" />
        <div
          class="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
          <Icon icon="mdi:wrench" class="text-white text-sm" />
        </div>
      </div>

      <div class="max-w-2xl space-y-4">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white">
          {{ t('messages.comingSoon.title') }}
        </h2>
        <p class="text-lg text-gray-600 dark:text-gray-400">
          {{ t('messages.comingSoon.description') }}
        </p>
      </div>

      <!-- Features Preview -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl w-full mt-8">
        <div
          class="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div class="flex items-start gap-4">
            <div class="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Icon
                icon="mdi:lightning-bolt"
                class="text-2xl text-primary-600" />
            </div>
            <div class="text-left">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-1">
                {{ t('messages.comingSoon.features.realtime.title') }}
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ t('messages.comingSoon.features.realtime.description') }}
              </p>
            </div>
          </div>
        </div>

        <div
          class="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div class="flex items-start gap-4">
            <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Icon icon="mdi:check-all" class="text-2xl text-green-600" />
            </div>
            <div class="text-left">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-1">
                {{ t('messages.comingSoon.features.readReceipts.title') }}
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ t('messages.comingSoon.features.readReceipts.description') }}
              </p>
            </div>
          </div>
        </div>

        <div
          class="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div class="flex items-start gap-4">
            <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Icon icon="mdi:bell-ring" class="text-2xl text-blue-600" />
            </div>
            <div class="text-left">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-1">
                {{ t('messages.comingSoon.features.notifications.title') }}
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{
                  t('messages.comingSoon.features.notifications.description')
                }}
              </p>
            </div>
          </div>
        </div>

        <div
          class="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div class="flex items-start gap-4">
            <div class="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Icon icon="mdi:file-image" class="text-2xl text-purple-600" />
            </div>
            <div class="text-left">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-1">
                {{ t('messages.comingSoon.features.media.title') }}
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ t('messages.comingSoon.features.media.description') }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Progress Indicator -->
      <div
        class="mt-8 p-6 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border border-primary-200 dark:border-primary-800 rounded-lg max-w-2xl w-full">
        <div class="flex items-center gap-4 mb-4">
          <Icon icon="mdi:progress-clock" class="text-3xl text-primary-600" />
          <div class="text-left flex-1">
            <h3 class="font-semibold text-gray-900 dark:text-white">
              {{ t('messages.comingSoon.progress.title') }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ t('messages.comingSoon.progress.description') }}
            </p>
          </div>
        </div>
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            class="bg-primary-600 h-2 rounded-full transition-all duration-500"
            style="width: 65%"></div>
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
          65% completado
        </p>
      </div>

      <!-- Actions -->
      <div class="flex gap-4 mt-8">
        <BaseButton variant="primary" @click="router.push('/explore')">
          <Icon icon="mdi:magnify" />
          {{ t('messages.comingSoon.actions.explore') }}
        </BaseButton>
        <BaseButton variant="secondary" @click="router.push('/dashboard')">
          <Icon icon="mdi:view-dashboard" />
          {{ t('messages.comingSoon.actions.dashboard') }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import BaseButton from '@/components/base/BaseButton.vue'

const { t } = useI18n()
const router = useRouter()
</script>
