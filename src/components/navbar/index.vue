<template>
  <nav class="navbar">
    <div class="container">
      <div class="navbar-content">
        <!-- Logo -->
        <div class="navbar-brand">
          <router-link to="/" class="logo">
            <Icon icon="mdi:handshake" class="logo-icon" />
            <span class="logo-text">LaCherada</span>
          </router-link>
        </div>

        <!-- Desktop Navigation -->
        <div class="navbar-menu desktop-menu">
          <router-link
            v-for="item in navItems"
            :key="item.key"
            :to="item.path"
            class="nav-link">
            {{ t(`navbar.${item.key}`) }}
          </router-link>
        </div>

        <!-- Actions -->
        <div class="navbar-actions">
          <!-- Language Selector -->
          <div class="language-selector">
            <button
              @click="toggleLanguage"
              class="btn btn-ghost language-btn"
              :title="t('common.changeLanguage')">
              <Icon icon="mdi:translate" />
              <span>{{ locale.toUpperCase() }}</span>
            </button>
          </div>

          <!-- Theme Toggle -->
          <button
            @click="toggleTheme"
            class="btn btn-ghost theme-toggle"
            :title="isDark ? t('common.lightMode') : t('common.darkMode')">
            <Icon :icon="isDark ? 'mdi:weather-sunny' : 'mdi:weather-night'" />
          </button>

          <!-- Auth Buttons -->
          <div class="auth-buttons">
            <!-- Not authenticated -->
            <template v-if="!authReady">
              <div class="auth-placeholder" aria-hidden="true">
                <ProgressSpinner
                  stroke-width="4"
                  style="width: 24px; height: 24px" />
              </div>
            </template>

            <template v-else-if="!isAuthenticated">
              <button @click="goToLogin" class="btn btn-ghost">
                {{ t('navbar.login') }}
              </button>
              <button @click="goToRegister" class="btn btn-primary">
                {{ t('navbar.register') }}
              </button>
            </template>

            <!-- Authenticated -->
            <template v-else>
              <!-- Email Verification Warning - Mejorada -->
              <div v-if="needsEmailVerification" class="verification-warning">
                <Icon icon="mdi:alert-circle" class="warning-icon" />
                <span class="warning-text">
                  {{ t('navbar.verifyEmail', 'Verifica tu email') }}
                </span>
                <router-link to="/auth/verify-email" class="verify-link">
                  {{ t('navbar.verifyNow', 'Verificar ahora') }}
                </router-link>
              </div>

              <div
                class="user-menu"
                ref="userDropdownRef"
                @click="toggleUserDropdown">
                <div class="user-info">
                  <div
                    class="user-avatar"
                    :class="{ unverified: needsEmailVerification }">
                    <Icon
                      :icon="
                        needsEmailVerification
                          ? 'mdi:alert-circle'
                          : 'mdi:account-circle'
                      " />
                  </div>
                  <span class="user-name">
                    {{ user?.displayName || user?.email }}
                  </span>
                  <Icon
                    icon="mdi:chevron-down"
                    class="dropdown-icon"
                    :class="{ rotated: isUserDropdownOpen }" />
                </div>

                <!-- User Dropdown -->
                <div v-if="isUserDropdownOpen" class="user-dropdown">
                  <!-- Si no está verificado, mostrar opción de verificar primero -->
                  <router-link
                    v-if="needsEmailVerification"
                    to="/auth/verify-email"
                    class="dropdown-item verify-item"
                    @click="closeUserDropdown">
                    <Icon icon="mdi:alert-circle" />
                    {{ t('navbar.verifyEmailNow', 'Verificar Email') }}
                  </router-link>
                  <div
                    v-if="needsEmailVerification"
                    class="dropdown-divider"></div>

                  <!-- Solo mostrar estas opciones si está verificado -->
                  <template v-if="!needsEmailVerification">
                    <router-link
                      to="/profile"
                      class="dropdown-item"
                      @click="closeUserDropdown">
                      <Icon icon="mdi:account" />
                      {{ t('navbar.profile') }}
                    </router-link>
                    <router-link
                      to="/my-items"
                      class="dropdown-item"
                      @click="closeUserDropdown">
                      <Icon icon="mdi:package-variant" />
                      {{ t('navbar.myItems') }}
                    </router-link>
                    <div class="dropdown-divider"></div>
                  </template>

                  <button
                    @click="handleSignOut"
                    class="dropdown-item sign-out-item"
                    :disabled="loading">
                    <Icon icon="mdi:logout" />
                    {{ t('navbar.signOut', 'Sign Out') }}
                  </button>
                </div>
              </div>
            </template>
          </div>

          <!-- Mobile Menu Button -->
          <button
            @click="toggleMobileMenu"
            class="btn btn-ghost mobile-menu-btn">
            <Icon :icon="isMobileMenuOpen ? 'mdi:close' : 'mdi:menu'" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div v-if="isMobileMenuOpen" class="mobile-menu">
      <div class="mobile-menu-content">
        <router-link
          v-for="item in navItems"
          :key="item.key"
          :to="item.path"
          class="mobile-nav-link"
          @click="closeMobileMenu">
          {{ t(`navbar.${item.key}`) }}
        </router-link>

        <div class="mobile-auth-buttons">
          <!-- Not authenticated -->
          <template v-if="!authReady">
            <div class="mobile-loading" aria-hidden="true">
              <ProgressSpinner
                stroke-width="4"
                style="width: 28px; height: 28px" />
            </div>
          </template>

          <template v-else-if="!isAuthenticated">
            <button @click="goToLogin" class="btn btn-ghost btn-full">
              {{ t('navbar.login') }}
            </button>
            <button @click="goToRegister" class="btn btn-primary btn-full">
              {{ t('navbar.register') }}
            </button>
          </template>

          <!-- Authenticated -->
          <template v-else>
            <div class="mobile-user-info">
              <div class="user-display">
                <Icon icon="mdi:account-circle" class="user-avatar-mobile" />
                <span>{{ user?.displayName || user?.email }}</span>
              </div>

              <div class="mobile-user-links">
                <router-link
                  to="/profile"
                  class="mobile-nav-link"
                  @click="closeMobileMenu">
                  <Icon icon="mdi:account" />
                  {{ t('navbar.profile') }}
                </router-link>
                <router-link
                  to="/my-items"
                  class="mobile-nav-link"
                  @click="closeMobileMenu">
                  <Icon icon="mdi:package-variant" />
                  {{ t('navbar.myItems') }}
                </router-link>
              </div>

              <button
                @click="handleSignOut"
                class="btn btn-ghost btn-full"
                :disabled="loading">
                <Icon icon="mdi:logout" />
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useTheme } from '../../composables/useTheme'
import { useAuth } from '../../composables/useAuth'
import ProgressSpinner from 'primevue/progressspinner'

const { t, locale } = useI18n()
const { isDark, toggleTheme } = useTheme()
const {
  initialized,
  user,
  isAuthenticated,
  needsEmailVerification,
  signOut,
  loading,
} = useAuth()

const authReady = computed(() => initialized.value)
const router = useRouter()

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

<style scoped>
.navbar {
  background: var(--glass-background);
  backdrop-filter: var(--glass-backdrop);
  border-bottom: 1px solid var(--glass-border);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  transition: all var(--transition-normal);
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-sm) 0;
}

.navbar-brand {
  flex-shrink: 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.logo:hover {
  color: var(--color-primary-dark);
  transform: scale(1.05);
}

.logo-icon {
  font-size: var(--font-size-2xl);
}

.logo-text {
  background: linear-gradient(
    135deg,
    var(--color-primary),
    var(--color-secondary)
  );
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.navbar-menu {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
}

.nav-link {
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  padding: var(--space-sm) 0;
  position: relative;
  transition: color var(--transition-fast);
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--color-text-primary);
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(
    90deg,
    var(--color-primary),
    var(--color-secondary)
  );
  transition: width var(--transition-fast);
}

.nav-link:hover::after,
.nav-link.router-link-active::after {
  width: 100%;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.language-selector {
  position: relative;
}

.language-btn {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-size-sm);
}

.theme-toggle {
  font-size: var(--font-size-lg);
}

.auth-buttons {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.auth-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
}

.user-menu {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-background-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.user-info:hover {
  background: var(--color-background-tertiary);
}

.user-avatar {
  font-size: var(--font-size-xl);
  color: var(--color-primary);
}

.user-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-icon {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  transition: transform var(--transition-fast);
}

.dropdown-icon.rotated {
  transform: rotate(180deg);
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: var(--space-xs);
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-dropdown);
  min-width: 200px;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  color: var(--color-text-primary);
  text-decoration: none;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition: background-color var(--transition-fast);
  font-size: var(--font-size-sm);
}

.dropdown-item:hover {
  background: var(--color-background-secondary);
}

.dropdown-item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dropdown-divider {
  height: 1px;
  background: var(--color-border);
  margin: var(--space-xs) 0;
}

.sign-out-item {
  color: var(--color-danger);
}

.sign-out-btn {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-size-sm);
}

.mobile-menu-btn {
  display: none;
  font-size: var(--font-size-lg);
}

.mobile-menu {
  background: var(--color-background);
  border-top: 1px solid var(--color-border);
  padding: var(--space-md) 0;
}

.mobile-menu-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.mobile-nav-link {
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.mobile-nav-link:hover,
.mobile-nav-link.router-link-active {
  color: var(--color-text-primary);
  background: var(--color-background-tertiary);
}

.mobile-auth-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-top: var(--space-md);
  padding: 0 var(--space-md);
}

.mobile-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-sm);
}

.mobile-user-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.mobile-user-links {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.user-display {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm);
  background: var(--color-background-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.user-avatar-mobile {
  font-size: var(--font-size-xl);
  color: var(--color-primary);
}

.btn-full {
  width: 100%;
}

/* Mobile styles */
@media (max-width: 768px) {
  .desktop-menu {
    display: none;
  }

  .auth-buttons {
    display: none;
  }

  .mobile-menu-btn {
    display: flex;
  }

  .navbar-actions {
    gap: var(--space-xs);
  }

  /* Verification Warning Styles */
  .verification-warning {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-xs) var(--space-sm);
    background: var(--color-warning-50);
    border: 1px solid var(--color-warning-200);
    border-radius: var(--radius-md);
    margin-right: var(--space-sm);
    white-space: nowrap;
    max-width: 280px;
  }

  .warning-icon {
    color: var(--color-warning);
    font-size: 1.2rem;
  }

  .warning-text {
    color: var(--color-warning-700);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
  }

  .verify-link {
    color: var(--color-primary);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    text-decoration: underline;
    transition: color var(--transition-fast);
  }

  .verify-link:hover {
    color: var(--color-primary-hover);
  }

  .user-avatar.unverified {
    color: var(--color-warning);
  }

  .dropdown-item.verify-item {
    background: var(--color-warning-50);
    border-bottom: 1px solid var(--color-warning-200);
  }

  .dropdown-item.verify-item:hover {
    background: var(--color-warning-100);
  }

  .dropdown-item.verify-item svg {
    color: var(--color-warning);
  }

  .language-btn span {
    display: none;
  }
}

@media (max-width: 768px) {
  .verification-warning {
    display: none; /* Ocultar en móvil para evitar aglomeración */
  }

  .navbar-actions {
    gap: var(--space-xs);
  }

  .auth-buttons {
    gap: var(--space-xs);
  }
}

@media (max-width: 480px) {
  .logo-text {
    display: none;
  }

  .navbar-actions {
    gap: 4px;
  }
}
</style>
