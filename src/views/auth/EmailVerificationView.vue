<template>
  <div class="email-verification-container">
    <BaseCard class="verification-card">
      <div class="verification-content">
        <!-- Header -->
        <div class="verification-header">
          <Icon icon="mdi:email-check" class="verification-icon" />
          <h1 class="verification-title">
            {{ t('auth.verification.title') }}
          </h1>
          <p class="verification-subtitle">
            {{ t('auth.verification.subtitle') }}
          </p>
        </div>

        <!-- Email Display -->
        <div class="email-display">
          <div class="email-info">
            <Icon icon="mdi:email" class="email-icon" />
            <span class="email-address">{{ userEmail }}</span>
          </div>
        </div>

        <!-- Instructions -->
        <div class="verification-instructions">
          <p class="instruction-text">
            {{ t('auth.verification.instructions') }}
          </p>
          <ul class="instruction-list">
            <li>{{ t('auth.verification.step1') }}</li>
            <li>{{ t('auth.verification.step2') }}</li>
            <li>{{ t('auth.verification.step3') }}</li>
          </ul>
        </div>

        <!-- Actions -->
        <div class="verification-actions">
          <BaseButton
            @click="resendEmail"
            :loading="resending"
            :disabled="resendDisabled"
            variant="primary"
            size="large"
            class="resend-btn">
            <Icon icon="mdi:email-send" class="btn-icon" />
            {{ resendText }}
          </BaseButton>
        </div>

        <!-- Help -->
        <div class="verification-help">
          <p class="help-text">
            {{ t('auth.verification.helpText') }}
          </p>
          <BaseButton
            @click="signOut"
            variant="text"
            size="small"
            class="signout-btn">
            {{ t('auth.verification.signOut') }}
          </BaseButton>
        </div>
      </div>
    </BaseCard>

    <!-- Success Modal -->
    <BaseModal
      v-model:visible="showSuccessModal"
      :title="t('auth.verification.success.title')"
      :modal="true"
      :closable="false"
      :dismissable-mask="false"
      position="center"
      size="small">
      <div class="success-content">
        <Icon icon="mdi:check-circle" class="success-icon" />
        <p class="success-message">
          {{ t('auth.verification.success.message') }}
        </p>
        <BaseButton
          @click="goToDashboard"
          variant="primary"
          size="large"
          class="continue-btn">
          {{ t('auth.verification.success.continue') }}
        </BaseButton>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useAuth } from '../../composables/useAuth'
import { SupabaseAuthService } from '../../services/authService'
import BaseCard from '../../components/base/BaseCard.vue'
import BaseButton from '../../components/base/BaseButton.vue'
import BaseModal from '../../components/base/BaseModal.vue'

const { t } = useI18n()
const router = useRouter()
const { user, signOut: authSignOut } = useAuth()

// State
const resending = ref(false)
const showSuccessModal = ref(false)
const resendCount = ref(0)
const resendCooldown = ref(0)
const cooldownInterval = ref<NodeJS.Timeout | null>(null)
const userEmail = computed(() => user.value?.email || '')
const resendDisabled = computed(
  () => resendCooldown.value > 0 || resendCount.value >= 3,
)
const resendText = computed(() => {
  if (resendCooldown.value > 0) {
    return t('auth.verification.resendCooldown', {
      seconds: resendCooldown.value,
    })
  }
  if (resendCount.value >= 3) {
    return t('auth.verification.resendLimit')
  }
  return t('auth.verification.resendEmail')
})

// Methods
const resendEmail = async () => {
  if (resendDisabled.value) return

  resending.value = true
  try {
    await SupabaseAuthService.resendEmailVerification()
    resendCount.value++
    startCooldown()
  } catch (error) {
    console.error('Error resending email:', error)
  } finally {
    resending.value = false
  }
}

const startCooldown = () => {
  resendCooldown.value = 60 // 60 segundos
  cooldownInterval.value = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) {
      clearInterval(cooldownInterval.value!)
      cooldownInterval.value = null
    }
  }, 1000)
}

const signOut = async () => {
  try {
    await authSignOut()
    router.push('/auth/login')
  } catch (error) {
    console.error('Error signing out:', error)
  }
}

const goToDashboard = () => {
  showSuccessModal.value = false
  router.push('/dashboard')
}

// La verificación se maneja automáticamente cuando el usuario verifica su email

onUnmounted(() => {
  if (cooldownInterval.value) {
    clearInterval(cooldownInterval.value)
  }
})
</script>

<style scoped>
.email-verification-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
  background: linear-gradient(
    135deg,
    var(--color-primary-50) 0%,
    var(--color-secondary-50) 100%
  );
}

.verification-card {
  width: 100%;
  max-width: 500px;
  padding: var(--space-2xl);
  text-align: center;
}

.verification-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.verification-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
}

.verification-icon {
  font-size: 4rem;
  color: var(--color-primary);
}

.verification-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.verification-subtitle {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  margin: 0;
}

.email-display {
  padding: var(--space-lg);
  background: var(--color-background-secondary);
  border-radius: var(--radius-lg);
  border: 2px dashed var(--color-border);
}

.email-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
}

.email-icon {
  font-size: 1.5rem;
  color: var(--color-primary);
}

.email-address {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.verification-instructions {
  text-align: left;
}

.instruction-text {
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-md);
}

.instruction-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.instruction-list li {
  padding: var(--space-sm) 0;
  color: var(--color-text-secondary);
  position: relative;
  padding-left: var(--space-lg);
}

.instruction-list li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--color-success);
  font-weight: bold;
}

.verification-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.check-btn,
.resend-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
}

.btn-icon {
  font-size: 1.2rem;
}

.verification-help {
  padding-top: var(--space-lg);
  border-top: 1px solid var(--color-border);
}

.help-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-md);
}

.signout-btn {
  color: var(--color-text-secondary);
}

.signout-btn:hover {
  color: var(--color-primary);
}

/* Success Modal */
.success-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-lg);
  padding: var(--space-lg);
  text-align: center;
}

.success-icon {
  font-size: 4rem;
  color: var(--color-success);
}

.success-message {
  font-size: var(--font-size-lg);
  color: var(--color-text-primary);
  margin: 0;
}

.continue-btn {
  width: 100%;
}

/* Responsive */
@media (max-width: 768px) {
  .email-verification-container {
    padding: var(--space-md);
  }

  .verification-card {
    padding: var(--space-xl);
  }

  .verification-icon {
    font-size: 3rem;
  }

  .verification-title {
    font-size: var(--font-size-xl);
  }
}
</style>
