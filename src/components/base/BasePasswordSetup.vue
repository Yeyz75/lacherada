<template>
  <BaseCard class="password-setup-card">
    <template #header>
      <div class="password-setup-header">
        <Icon :icon="icon" class="setup-icon" />
        <h2 class="setup-title">{{ title }}</h2>
        <p class="setup-description">{{ description }}</p>
      </div>
    </template>

    <template #content>
      <BaseForm @submit="handleSubmit" class="password-setup-form">
        <div class="form-group">
          <BaseInput
            id="password"
            v-model="password"
            type="password"
            :label="$t('auth.password')"
            :placeholder="$t('auth.passwordPlaceholder')"
            :error="passwordError"
            :show-password-toggle="true"
            required
            class="password-input" />
        </div>

        <div class="form-group">
          <BaseInput
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            :label="$t('auth.confirmPassword')"
            :placeholder="$t('auth.confirmPasswordPlaceholder')"
            :error="confirmPasswordError"
            :show-password-toggle="true"
            required
            class="password-input" />
        </div>

        <div class="password-requirements">
          <h4 class="requirements-title">
            {{ $t('auth.passwordRequirements') }}
          </h4>
          <ul class="requirements-list">
            <li :class="{ valid: hasMinLength }">
              <Icon
                icon="mdi:check-circle"
                v-if="hasMinLength"
                class="check-icon" />
              <Icon icon="mdi:circle-outline" v-else class="circle-icon" />
              {{ $t('auth.minLength') }}
            </li>
            <li :class="{ valid: hasUpperCase }">
              <Icon
                icon="mdi:check-circle"
                v-if="hasUpperCase"
                class="check-icon" />
              <Icon icon="mdi:circle-outline" v-else class="circle-icon" />
              {{ $t('auth.upperCase') }}
            </li>
            <li :class="{ valid: hasLowerCase }">
              <Icon
                icon="mdi:check-circle"
                v-if="hasLowerCase"
                class="check-icon" />
              <Icon icon="mdi:circle-outline" v-else class="circle-icon" />
              {{ $t('auth.lowerCase') }}
            </li>
            <li :class="{ valid: hasNumber }">
              <Icon
                icon="mdi:check-circle"
                v-if="hasNumber"
                class="check-icon" />
              <Icon icon="mdi:circle-outline" v-else class="circle-icon" />
              {{ $t('auth.hasNumber') }}
            </li>
          </ul>
        </div>

        <div class="form-actions">
          <BaseButton
            type="button"
            variant="outlined"
            :label="$t('common.cancel')"
            @click="handleCancel"
            :disabled="loading"
            class="cancel-button" />

          <BaseButton
            type="submit"
            variant="primary"
            :label="$t('auth.setPassword')"
            :loading="loading"
            :disabled="!isFormValid"
            class="submit-button" />
        </div>

        <Message
          v-if="error"
          severity="error"
          :closable="false"
          class="error-message">
          {{ error }}
        </Message>

        <Message
          v-if="success"
          severity="success"
          :closable="false"
          class="success-message">
          {{ success }}
        </Message>
      </BaseForm>
    </template>
  </BaseCard>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'
import Message from 'primevue/message'
import { BaseCard, BaseForm, BaseInput, BaseButton } from '../base'

interface Props {
  title?: string
  description?: string
  icon?: string
  loading?: boolean
  error?: string | null
  success?: string | null
  showCancel?: boolean
}

interface Emits {
  (e: 'submit', password: string): void
  (e: 'cancel'): void
}

withDefaults(defineProps<Props>(), {
  title: 'Establece tu contraseña',
  description:
    'Para completar tu registro, necesitas establecer una contraseña que podrás usar para iniciar sesión más adelante.',
  icon: 'mdi:lock-outline',
  loading: false,
  error: null,
  success: null,
  showCancel: true,
})

const emit = defineEmits<Emits>()

// Form data
const password = ref('')
const confirmPassword = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')

// Password validation computed properties
const hasMinLength = computed(() => password.value.length >= 8)
const hasUpperCase = computed(() => /[A-Z]/.test(password.value))
const hasLowerCase = computed(() => /[a-z]/.test(password.value))
const hasNumber = computed(() => /\d/.test(password.value))

const isPasswordValid = computed(() => {
  return (
    hasMinLength.value &&
    hasUpperCase.value &&
    hasLowerCase.value &&
    hasNumber.value
  )
})

const passwordsMatch = computed(() => {
  return (
    password.value === confirmPassword.value && confirmPassword.value.length > 0
  )
})

const isFormValid = computed(() => {
  return (
    isPasswordValid.value &&
    passwordsMatch.value &&
    !passwordError.value &&
    !confirmPasswordError.value
  )
})

// Watchers for real-time validation
watch(password, () => {
  validatePassword()
  if (confirmPassword.value) {
    validateConfirmPassword()
  }
})

watch(confirmPassword, () => {
  validateConfirmPassword()
})

// Validation functions
const validatePassword = () => {
  if (!password.value) {
    passwordError.value = 'La contraseña es requerida'
  } else if (!isPasswordValid.value) {
    passwordError.value = 'La contraseña no cumple con los requisitos'
  } else {
    passwordError.value = ''
  }
}

const validateConfirmPassword = () => {
  if (!confirmPassword.value) {
    confirmPasswordError.value = 'Confirma tu contraseña'
  } else if (!passwordsMatch.value) {
    confirmPasswordError.value = 'Las contraseñas no coinciden'
  } else {
    confirmPasswordError.value = ''
  }
}

// Event handlers
const handleSubmit = () => {
  validatePassword()
  validateConfirmPassword()

  if (isFormValid.value) {
    emit('submit', password.value)
  }
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.password-setup-card {
  max-width: 500px;
  margin: 0 auto;
}

.password-setup-header {
  text-align: center;
  padding: var(--space-lg) 0;
}

.setup-icon {
  font-size: 3rem;
  color: var(--color-primary);
  margin-bottom: var(--space-md);
}

.setup-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-sm);
}

.setup-description {
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
  line-height: 1.5;
  max-width: 400px;
  margin: 0 auto;
}

.password-setup-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.password-input {
  width: 100%;
}

.password-requirements {
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
}

.requirements-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-sm);
}

.requirements-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.requirements-list li {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  transition: color var(--transition-fast);
}

.requirements-list li.valid {
  color: var(--color-success);
}

.check-icon {
  color: var(--color-success);
  font-size: 1rem;
}

.circle-icon {
  color: var(--color-text-tertiary);
  font-size: 1rem;
}

.form-actions {
  display: flex;
  gap: var(--space-md);
  justify-content: flex-end;
  margin-top: var(--space-md);
}

.cancel-button {
  flex: 0 0 auto;
}

.submit-button {
  flex: 1;
  max-width: 200px;
}

.error-message,
.success-message {
  margin-top: var(--space-md);
}

/* Responsive design */
@media (max-width: 768px) {
  .password-setup-card {
    margin: var(--space-md);
  }

  .setup-title {
    font-size: var(--font-size-xl);
  }

  .form-actions {
    flex-direction: column;
  }

  .cancel-button,
  .submit-button {
    width: 100%;
    max-width: none;
  }
}
</style>
