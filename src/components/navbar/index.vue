<template>
  <nav
    class="sticky top-0 z-[var(--z-sticky)] border-b border-border/60 bg-surface-primary/80 backdrop-blur transition-shadow duration-300">
    <div class="container flex items-center justify-between gap-md py-sm">
      <div class="flex flex-1 items-center gap-lg">
        <router-link
          to="/"
          class="group flex items-center gap-xs text-lg font-semibold text-primary-500 transition duration-200 hover:scale-[1.02]">
          <Icon
            icon="mdi:handshake"
            class="text-2xl transition duration-200 group-hover:text-primary-400" />
          <span
            class="hidden bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-xl font-display font-semibold uppercase tracking-tight text-transparent sm:inline">
            LaCherada
          </span>
        </router-link>

        <div class="hidden items-center gap-lg lg:flex">
          <router-link
            v-for="item in navItems"
            :key="item.key"
            :to="item.path"
            class="text-sm font-medium text-text-muted transition hover:text-text-primary"
            :class="{ 'text-text-primary': route.path === item.path }">
            {{ t(`navbar.${item.key}`) }}
          </router-link>
        </div>
      </div>

      <div class="flex items-center gap-xs">
        <button
          @click="toggleLanguage"
          class="btn btn-ghost hidden gap-xs text-sm font-semibold text-text-muted lg:inline-flex"
          :title="t('common.changeLanguage')">
          <Icon icon="mdi:translate" class="text-lg" />
          <span>{{ locale.toUpperCase() }}</span>
        </button>

        <button
          @click="toggleTheme"
          class="btn btn-ghost p-2 text-xl text-text-muted"
          :title="isDark ? t('common.lightMode') : t('common.darkMode')">
          <Icon :icon="isDark ? 'mdi:weather-sunny' : 'mdi:weather-night'" />
        </button>

        <div class="hidden items-center gap-xs lg:flex">
          <template v-if="!authReady">
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-surface-tertiary">
              <ProgressSpinner
                stroke-width="4"
                style="width: 24px; height: 24px" />
            </div>
          </template>

          <template v-else-if="!isAuthenticated">
            <button
              @click="goToLogin"
              class="btn btn-ghost text-sm font-semibold">
              {{ t('navbar.login') }}
            </button>
            <button
              @click="goToRegister"
              class="btn btn-primary text-sm font-semibold">
              {{ t('navbar.register') }}
            </button>
          </template>

          <template v-else>
            <div
              v-if="needsEmailVerification"
              class="hidden items-center gap-xs rounded-lg border border-warning/40 bg-warning/10 px-sm py-2 text-sm font-medium text-warning lg:flex">
              <Icon icon="mdi:alert-circle" class="text-base" />
              <span>{{ t('navbar.verifyEmail', 'Verifica tu email') }}</span>
              <router-link
                to="/auth/verify-email"
                class="underline transition hover:text-warning/80">
                {{ t('navbar.verifyNow', 'Verificar ahora') }}
              </router-link>
            </div>

            <div
              class="relative flex items-center"
              ref="userDropdownRef"
              @click="toggleUserDropdown">
              <div
                class="flex items-center gap-xs rounded-lg border border-border bg-surface-secondary px-sm py-xs transition hover:bg-surface-tertiary">
                <BaseAvatar
                  :image="user?.photoURL || undefined"
                  :size="'small'"
                  :verified="isEmailVerified"
                  class="flex-shrink-0" />
                <span
                  class="max-w-[160px] truncate text-sm font-medium text-text-primary">
                  {{ user?.displayName || user?.email }}
                </span>
                <Icon
                  v-if="needsEmailVerification"
                  icon="mdi:alert-circle"
                  class="text-warning text-sm" />
                <Icon
                  icon="mdi:chevron-down"
                  class="text-xs text-text-muted transition-transform duration-200"
                  :class="{ 'rotate-180': isUserDropdownOpen }" />
              </div>

              <div
                v-if="isUserDropdownOpen"
                class="absolute right-0 top-[calc(100%+0.5rem)] min-w-[220px] overflow-hidden rounded-xl border border-border bg-surface-primary shadow-lg">
                <router-link
                  v-if="needsEmailVerification"
                  to="/auth/verify-email"
                  class="flex items-center gap-xs px-sm py-xs text-sm font-medium text-warning transition hover:bg-warning/10"
                  @click="closeUserDropdown">
                  <Icon icon="mdi:alert-circle" class="text-base" />
                  {{ t('navbar.verifyEmailNow', 'Verificar Email') }}
                </router-link>
                <div
                  v-if="needsEmailVerification"
                  class="h-px bg-border-muted"></div>

                <template v-if="!needsEmailVerification">
                  <router-link
                    to="/profile"
                    class="flex items-center gap-xs px-sm py-xs text-sm text-text-primary transition hover:bg-surface-tertiary"
                    @click="closeUserDropdown">
                    <Icon icon="mdi:account" />
                    {{ t('navbar.profile') }}
                  </router-link>
                  <router-link
                    to="/my-items"
                    class="flex items-center gap-xs px-sm py-xs text-sm text-text-primary transition hover:bg-surface-tertiary"
                    @click="closeUserDropdown">
                    <Icon icon="mdi:package-variant" />
                    {{ t('navbar.myItems') }}
                  </router-link>
                  <div class="h-px bg-border-muted"></div>
                </template>

                <button
                  @click="handleSignOut"
                  class="flex w-full items-center gap-xs px-sm py-xs text-left text-sm text-error transition hover:bg-error/10"
                  :disabled="loading">
                  <Icon icon="mdi:logout" />
                  {{ t('navbar.signOut', 'Sign Out') }}
                </button>
              </div>
            </div>
          </template>
        </div>

        <button
          @click="toggleLanguage"
          class="btn btn-ghost inline-flex gap-xs text-sm font-semibold text-text-muted lg:hidden"
          :title="t('common.changeLanguage')">
          <Icon icon="mdi:translate" class="text-lg" />
        </button>

        <button @click="toggleMobileMenu" class="btn btn-ghost p-2 lg:hidden">
          <Icon
            :icon="isMobileMenuOpen ? 'mdi:close' : 'mdi:menu'"
            class="text-xl" />
        </button>
      </div>
    </div>

    <div
      v-if="isMobileMenuOpen"
      class="border-t border-border bg-surface-primary lg:hidden">
      <div class="container flex flex-col gap-sm py-sm">
        <div class="flex flex-col gap-xs">
          <router-link
            v-for="item in navItems"
            :key="item.key"
            :to="item.path"
            class="rounded-lg px-sm py-xs text-sm font-medium text-text-muted transition hover:bg-surface-tertiary hover:text-text-primary"
            :class="{ 'text-text-primary': route.path === item.path }"
            @click="closeMobileMenu">
            {{ t(`navbar.${item.key}`) }}
          </router-link>
        </div>

        <div class="flex flex-col gap-xs border-t border-border pt-sm">
          <template v-if="!authReady">
            <div class="flex items-center justify-center py-sm">
              <ProgressSpinner
                stroke-width="4"
                style="width: 28px; height: 28px" />
            </div>
          </template>

          <template v-else-if="!isAuthenticated">
            <button
              @click="goToLogin"
              class="btn btn-ghost w-full text-sm font-semibold">
              {{ t('navbar.login') }}
            </button>
            <button
              @click="goToRegister"
              class="btn btn-primary w-full text-sm font-semibold">
              {{ t('navbar.register') }}
            </button>
          </template>

          <template v-else>
            <div
              class="flex flex-col gap-xs rounded-xl border border-border bg-surface-secondary px-sm py-sm">
              <div class="flex items-center gap-xs">
                <BaseAvatar
                  :image="user?.photoURL || undefined"
                  :size="'normal'"
                  :verified="isEmailVerified"
                  class="flex-shrink-0" />
                <span class="text-sm font-semibold text-text-primary">
                  {{ user?.displayName || user?.email }}
                </span>
              </div>

              <div class="flex flex-col gap-2xs">
                <router-link
                  to="/profile"
                  class="flex items-center gap-xs rounded-lg px-sm py-xs text-sm text-text-primary transition hover:bg-surface-tertiary"
                  @click="closeMobileMenu">
                  <Icon icon="mdi:account" />
                  {{ t('navbar.profile') }}
                </router-link>
                <router-link
                  to="/my-items"
                  class="flex items-center gap-xs rounded-lg px-sm py-xs text-sm text-text-primary transition hover:bg-surface-tertiary"
                  @click="closeMobileMenu">
                  <Icon icon="mdi:package-variant" />
                  {{ t('navbar.myItems') }}
                </router-link>
              </div>

              <button
                @click="handleSignOut"
                class="btn btn-ghost w-full text-sm font-semibold text-error"
                :disabled="loading">
                <Icon icon="mdi:logout" class="text-lg" />
                {{ t('navbar.signOut', 'Sign Out') }}
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useTheme } from '../../composables/useTheme'
import { useAuth } from '../../composables/useAuth'
import BaseAvatar from '../base/BaseAvatar.vue'
import ProgressSpinner from 'primevue/progressspinner'

const { t, locale } = useI18n()
const { isDark, toggleTheme } = useTheme()
const {
  initialized,
  user,
  isAuthenticated,
  isEmailVerified,
  needsEmailVerification,
  signOut,
  loading,
} = useAuth()
const router = useRouter()
const route = useRoute()

const authReady = computed(() => initialized.value)

// Debug: Log user photoURL changes
watchEffect(() => {
  if (user.value?.photoURL) {
    console.log('Navbar user photoURL:', user.value.photoURL)
  }
})

const isMobileMenuOpen = ref(false)
const isUserDropdownOpen = ref(false)
const userDropdownRef = ref<HTMLElement | null>(null)

const navItems = computed(() => {
  if (!authReady.value) {
    return []
  }
  // Si está autenticado pero no verificado, mostrar solo enlaces públicos
  if (isAuthenticated.value && needsEmailVerification.value) {
    return [
      { key: 'home', path: '/' },
      { key: 'explore', path: '/explore' },
      { key: 'howItWorks', path: '/how-it-works' },
      { key: 'contact', path: '/contact' },
    ]
  }

  // Si está autenticado y verificado
  if (isAuthenticated.value) {
    return [
      { key: 'dashboard', path: '/dashboard' },
      { key: 'explore', path: '/explore' },
      { key: 'publish', path: '/publish' },
      { key: 'messages', path: '/messages' },
      { key: 'favorites', path: '/favorites' },
    ]
  }

  // Si no está autenticado
  return [
    { key: 'home', path: '/' },
    { key: 'explore', path: '/explore' },
    { key: 'howItWorks', path: '/how-it-works' },
    { key: 'contact', path: '/contact' },
  ]
})

const toggleLanguage = () => {
  locale.value = locale.value === 'es' ? 'en' : 'es'
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const toggleUserDropdown = () => {
  isUserDropdownOpen.value = !isUserDropdownOpen.value
}

const closeUserDropdown = () => {
  isUserDropdownOpen.value = false
}

const handleSignOut = async () => {
  try {
    await signOut()
    closeUserDropdown()
    router.push('/')
  } catch (error) {
    console.error('Sign out failed:', error)
  }
}

const goToLogin = () => {
  router.push('/auth/login')
  closeMobileMenu()
}

const goToRegister = () => {
  router.push('/auth/register')
  closeMobileMenu()
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
  closeUserDropdown()
}

// Handle click outside dropdown
const handleClickOutside = (event: Event) => {
  if (
    userDropdownRef.value &&
    !userDropdownRef.value.contains(event.target as Node)
  ) {
    closeUserDropdown()
  }
}

// Add event listener on mount
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

// Remove event listener on unmount
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
