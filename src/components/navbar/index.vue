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
            class="nav-link"
          >
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
              :title="t('common.changeLanguage')"
            >
              <Icon icon="mdi:translate" />
              <span>{{ locale.toUpperCase() }}</span>
            </button>
          </div>
          
          <!-- Theme Toggle -->
          <button
            @click="toggleTheme"
            class="btn btn-ghost theme-toggle"
            :title="isDark ? t('common.lightMode') : t('common.darkMode')"
          >
            <Icon :icon="isDark ? 'mdi:weather-sunny' : 'mdi:weather-night'" />
          </button>
          
          <!-- Auth Buttons -->
          <div class="auth-buttons">
            <button class="btn btn-ghost">
              {{ t('navbar.login') }}
            </button>
            <button class="btn btn-primary">
              {{ t('navbar.register') }}
            </button>
          </div>
          
          <!-- Mobile Menu Button -->
          <button
            @click="toggleMobileMenu"
            class="btn btn-ghost mobile-menu-btn"
          >
            <Icon :icon="isMobileMenuOpen ? 'mdi:close' : 'mdi:menu'" />
          </button>
        </div>
      </div>
    </div>
    
    <!-- Mobile Menu -->
    <div
      v-if="isMobileMenuOpen"
      class="mobile-menu"
    >
      <div class="mobile-menu-content">
        <router-link
          v-for="item in navItems"
          :key="item.key"
          :to="item.path"
          class="mobile-nav-link"
          @click="closeMobileMenu"
        >
          {{ t(`navbar.${item.key}`) }}
        </router-link>
        
        <div class="mobile-auth-buttons">
          <button class="btn btn-ghost btn-full">
            {{ t('navbar.login') }}
          </button>
          <button class="btn btn-primary btn-full">
            {{ t('navbar.register') }}
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Icon } from '@iconify/vue'
import { useTheme } from '../../composables/useTheme'

const { t, locale } = useI18n()
const { isDark, toggleTheme } = useTheme()

const isMobileMenuOpen = ref(false)

const navItems = [
  { key: 'home', path: '/' },
  { key: 'explore', path: '/explore' },
  { key: 'howItWorks', path: '/how-it-works' },
  { key: 'contact', path: '/contact' }
]

const toggleLanguage = () => {
  locale.value = locale.value === 'es' ? 'en' : 'es'
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}
</script>

<style scoped>
.navbar {
  background: var(--glass-background);
  backdrop-filter: var(--glass-backdrop);
  -webkit-backdrop-filter: var(--glass-backdrop);
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
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  -webkit-background-clip: text;
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
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
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
  
  .language-btn span {
    display: none;
  }
}

@media (max-width: 480px) {
  .logo-text {
    display: none;
  }
}
</style>