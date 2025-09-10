<template>
  <div class="set-password-container">
    <div class="set-password-background">
      <!-- Decorative background elements -->
      <div class="background-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>
    </div>

    <div class="set-password-content">
      <div class="user-info-card" v-if="user">
        <BaseAvatar
          :src="user.photoURL"
          :alt="user.displayName || user.email"
          size="large"
          class="user-avatar" />
        <div class="user-details">
          <h3 class="user-name">{{ user.displayName || user.email }}</h3>
          <p class="welcome-text">{{ $t('auth.setPasswordWelcome') }}</p>
        </div>
      </div>

      <BasePasswordSetup
        :title="$t('auth.setPasswordTitle')"
        :description="$t('auth.setPasswordDescription')"
        icon="mdi:shield-lock-outline"
        :loading="loading"
        :error="error"
        :success="success"
        :show-cancel="false"
        @submit="handleSetPassword"
        class="password-setup" />

      <div class="security-info">
        <div class="security-header">
          <Icon icon="mdi:shield-check" class="security-icon" />
          <h4 class="security-title">{{ $t('auth.securityTitle') }}</h4>
        </div>
        <ul class="security-features">
          <li>
            <Icon icon="mdi:check" class="check-icon" />
            {{ $t('auth.securityFeature1') }}
          </li>
          <li>
            <Icon icon="mdi:check" class="check-icon" />
            {{ $t('auth.securityFeature2') }}
          </li>
          <li>
            <Icon icon="mdi:check" class="check-icon" />
            {{ $t('auth.securityFeature3') }}
          </li>
        </ul>
      </div>

      <div class="help-section">
        <p class="help-text">
          {{ $t('auth.needHelp') }}
          <a href="#" @click.prevent="showSupport = true" class="help-link">
            {{ $t('auth.contactSupport') }}
          </a>
        </p>
      </div>
    </div>

    <!-- Support Modal -->
    <BaseModal
      v-model:visible="showSupport"
      :title="$t('auth.supportTitle')"
      size="medium">
      <div class="support-content">
        <p>{{ $t('auth.supportDescription') }}</p>
        <div class="support-contact">
          <a href="mailto:soporte@lacherada.com" class="support-email">
            <Icon icon="mdi:email" />
            soporte@lacherada.com
          </a>
        </div>
      </div>
      <template #footer>
        <BaseButton
          variant="outlined"
          :label="$t('common.close')"
          @click="showSupport = false" />
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useAuth } from '../../composables/useAuth'
import {
  BasePasswordSetup,
  BaseAvatar,
  BaseModal,
  BaseButton,
} from '../../components/base'

const router = useRouter()
const { user, setPassword, loading, error } = useAuth()

// Local state
const success = ref<string | null>(null)
const showSupport = ref(false)

// Check if user is authenticated and needs password setup
onMounted(async () => {
  if (!user.value) {
    // If no user is authenticated, redirect to login
    router.push('/auth/login')
    return
  }

  if (user.value.hasPassword) {
    // If user already has password, redirect to dashboard
    router.push('/dashboard')
    return
  }
})

/**
 * Handle password setup submission
 */
const handleSetPassword = async (password: string) => {
  try {
    await setPassword(password)
    success.value = '¡Contraseña establecida correctamente! Redirigiendo...'

    // Redirect to dashboard after successful password setup
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
  } catch (err) {
    console.error('Error setting password:', err)
    // Error is handled by the composable and displayed in the component
  }
}

/**
 * Handle sign out (if user wants to cancel the process)
 * Currently not used but kept for future functionality
 */
// const handleSignOut = async () => {
//   try {
//     await signOut()
//     router.push('/auth/login')
//   } catch (err) {
//     console.error('Error signing out:', err)
//   }
// }
</script>

<style scoped>
.set-password-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: linear-gradient(
    135deg,
    var(--color-background) 0%,
    var(--color-background-secondary) 100%
  );
  padding: var(--space-lg);
}

.set-password-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 0;
}

.background-shapes {
  position: relative;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  background: linear-gradient(
    45deg,
    var(--color-primary-light),
    var(--color-secondary-light)
  );
  border-radius: 50%;
  opacity: 0.1;
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 300px;
  height: 300px;
  top: 10%;
  left: -10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 200px;
  height: 200px;
  top: 60%;
  right: -5%;
  animation-delay: 2s;
}

.shape-3 {
  width: 150px;
  height: 150px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

.set-password-content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.user-info-card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  display: flex;
  align-items: center;
  gap: var(--space-md);
  box-shadow: var(--shadow-md);
}

.user-avatar {
  flex-shrink: 0;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-xs);
}

.welcome-text {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin: 0;
}

.password-setup {
  background: var(--color-background);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
}

.security-info {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  box-shadow: var(--shadow-md);
}

.security-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.security-icon {
  font-size: 1.5rem;
  color: var(--color-success);
}

.security-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.security-features {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.security-features li {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.check-icon {
  color: var(--color-success);
  font-size: 1rem;
  flex-shrink: 0;
}

.help-section {
  text-align: center;
  padding: var(--space-md);
}

.help-text {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin: 0;
}

.help-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  transition: color var(--transition-fast);
}

.help-link:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
}

.support-content {
  padding: var(--space-md) 0;
}

.support-contact {
  margin-top: var(--space-md);
  text-align: center;
}

.support-email {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  color: var(--color-primary);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-primary-light);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.support-email:hover {
  background: var(--color-primary);
  color: white;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* Responsive design */
@media (max-width: 768px) {
  .set-password-container {
    padding: var(--space-md);
  }

  .user-info-card {
    flex-direction: column;
    text-align: center;
    gap: var(--space-sm);
  }

  .shape {
    display: none;
  }
}

@media (max-width: 480px) {
  .set-password-container {
    padding: var(--space-sm);
  }

  .set-password-content {
    gap: var(--space-lg);
  }
}
</style>
