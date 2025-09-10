<template>
  <div class="password-setup-container">
    <!-- Header Section -->
    <div class="password-setup-header">
      <Icon :icon="icon" class="setup-icon" />
      <h2 class="setup-title">{{ title }}</h2>
      <p class="setup-description">{{ description }}</p>
    </div>

    <!-- Form Section -->
    <form @submit.prevent="handleSubmit" class="password-setup-form">
      <!-- Password Field -->
      <div class="form-field">
        <label for="password" class="field-label">
          {{ $t('auth.password') }}
          <span class="required-indicator">*</span>
        </label>
        <Password
          id="password"
          v-model="password"
          :placeholder="$t('auth.passwordPlaceholder')"
          :invalid="!!passwordError"
          :disabled="loading"
          toggle-mask
          :feedback="false"
          class="password-field"
          @blur="validatePassword" />
        <small v-if="passwordError" class="field-error">
          {{ passwordError }}
        </small>
      </div>

      <!-- Confirm Password Field -->
      <div class="form-field">
        <label for="confirmPassword" class="field-label">
          {{ $t('auth.confirmPassword') }}
          <span class="required-indicator">*</span>
        </label>
        <Password
          id="confirmPassword"
          v-model="confirmPassword"
          :placeholder="$t('auth.confirmPasswordPlaceholder')"
          :invalid="!!confirmPasswordError"
          :disabled="loading"
          toggle-mask
          :feedback="false"
          class="password-field"
          @blur="validateConfirmPassword" />
        <small v-if="confirmPasswordError" class="field-error">
          {{ confirmPasswordError }}
        </small>
      </div>

      <!-- Password Requirements -->
      <div class="password-requirements">
        <h4 class="requirements-title">
          {{ $t('auth.passwordRequirements') }}
        </h4>
        <ul class="requirements-list">
          <li :class="{ valid: hasMinLength }">
            <Icon
              :icon="hasMinLength ? 'mdi:check-circle' : 'mdi:circle-outline'"
              :class="hasMinLength ? 'check-icon' : 'circle-icon'" />
            {{ $t('auth.minLength') }}
          </li>
          <li :class="{ valid: hasUpperCase }">
            <Icon
              :icon="hasUpperCase ? 'mdi:check-circle' : 'mdi:circle-outline'"
              :class="hasUpperCase ? 'check-icon' : 'circle-icon'" />
            {{ $t('auth.upperCase') }}
          </li>
          <li :class="{ valid: hasLowerCase }">
            <Icon
              :icon="hasLowerCase ? 'mdi:check-circle' : 'mdi:circle-outline'"
              :class="hasLowerCase ? 'check-icon' : 'circle-icon'" />
            {{ $t('auth.lowerCase') }}
          </li>
          <li :class="{ valid: hasNumber }">
            <Icon
              :icon="hasNumber ? 'mdi:check-circle' : 'mdi:circle-outline'"
              :class="hasNumber ? 'check-icon' : 'circle-icon'" />
            {{ $t('auth.hasNumber') }}
          </li>
        </ul>
      </div>

      <!-- Action Buttons -->
      <div class="form-actions">
        <Button
          v-if="showCancel"
          type="button"
          severity="secondary"
          :label="$t('common.cancel')"
          @click="handleCancel"
          :disabled="loading"
          class="cancel-button" />

        <Button
          type="submit"
          :label="$t('auth.setPassword')"
          :loading="loading"
          :disabled="!isFormValid"
          :class="showCancel ? 'submit-button' : 'submit-button-full'" />
      </div>

      <!-- Error Message -->
      <Message v-if="error" severity="error" :closable="false" class="message">
        {{ error }}
      </Message>

      <!-- Success Message -->
      <Message
        v-if="success"
        severity="success"
        :closable="false"
        class="message">
        {{ success }}
      </Message>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'

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
    'Para completar tu registro con Google, establece una contraseña que podrás usar para iniciar sesión más adelante.',
  icon: 'mdi:shield-lock-outline',
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
.password-setup-container {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  padding: var(--space-xl);
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.password-setup-header {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.setup-icon {
  font-size: 3rem;
  color: var(--color-primary);
  margin-bottom: var(--space-md);
  display: block;
  transition: color var(--transition-fast);
}

.setup-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-sm) 0;
  line-height: var(--line-height-tight);
}

.setup-description {
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
  margin: 0;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.password-setup-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.field-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.required-indicator {
  color: var(--color-error);
  font-size: var(--font-size-sm);
}

.password-field {
  width: 100%;
}

.field-error {
  color: var(--color-error);
  font-size: var(--font-size-sm);
  margin-top: var(--space-xs);
  display: block;
}

.password-requirements {
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast);
}

.requirements-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-sm) 0;
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
  flex-shrink: 0;
}

.circle-icon {
  color: var(--color-text-tertiary);
  font-size: 1rem;
  flex-shrink: 0;
}

.form-actions {
  display: flex;
  gap: var(--space-md);
  margin-top: var(--space-lg);
}

.cancel-button {
  flex: 0 0 auto;
}

.submit-button {
  flex: 1;
}

.submit-button-full {
  flex: 1;
  width: 100%;
}

.message {
  margin-top: var(--space-md);
}

/* Responsive design */
@media (max-width: 768px) {
  .password-setup-container {
    margin: var(--space-md);
    padding: var(--space-md);
  }

  .setup-title {
    font-size: var(--font-size-xl);
  }

  .setup-description {
    font-size: var(--font-size-sm);
  }

  .form-actions {
    flex-direction: column;
  }

  .cancel-button,
  .submit-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .password-setup-container {
    margin: var(--space-sm);
    padding: var(--space-sm);
  }

  .password-setup-form {
    gap: var(--space-md);
  }
}
</style>
