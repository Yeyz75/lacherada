<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1 class="login-title">{{ $t('auth.login.title') }}</h1>
        <p class="login-subtitle">{{ $t('auth.login.subtitle') }}</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <BaseInput
            id="email"
            v-model="email"
            type="email"
            :label="$t('auth.email')"
            :placeholder="$t('auth.emailPlaceholder')"
            :error="emailError"
            icon="mdi:email"
            class="form-input"
            required />
        </div>

        <div class="form-group">
          <BaseInput
            id="password"
            v-model="password"
            type="password"
            :label="$t('auth.password')"
            :placeholder="$t('auth.passwordPlaceholder')"
            :error="passwordError"
            :show-password-toggle="true"
            class="form-input"
            required />
        </div>

        <div class="form-actions">
          <router-link to="/auth/forgot-password" class="forgot-link">
            {{ $t('auth.login.forgotPassword') }}
          </router-link>
        </div>

        <Button
          type="submit"
          :label="$t('auth.login.button')"
          :loading="loading"
          :disabled="!isFormValid"
          class="login-button"
          severity="primary" />

        <div class="or-divider">
          <span class="divider-line"></span>
          <span class="divider-text">{{ $t('auth.orDivider') }}</span>
          <span class="divider-line"></span>
        </div>

        <Button
          type="button"
          :loading="googleLoading"
          class="google-button"
          severity="secondary"
          outlined
          @click="handleGoogleLogin">
          <template #default>
            <Icon icon="simple-icons:google" class="google-icon" />
            {{ $t('auth.googleLogin') }}
          </template>
        </Button>

        <div v-if="error" class="error-alert">
          <Message severity="error" :closable="false">
            {{ error }}
          </Message>
        </div>
      </form>

      <div class="login-footer">
        <p class="register-link">
          {{ $t('auth.login.noAccount') }}
          <router-link to="/auth/register">
            {{ $t('auth.login.signUp') }}
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { Icon } from '@iconify/vue'
import BaseInput from '../../components/base/BaseInput.vue'
import Button from 'primevue/button'
import Message from 'primevue/message'

const router = useRouter()
const { signIn, signInWithGoogle, loading, error, clearError } = useAuth()

// Form data
const email = ref('')
const password = ref('')
const googleLoading = ref(false)

// Form validation
const emailError = ref('')
const passwordError = ref('')

const isFormValid = computed(() => {
  return (
    email.value && password.value && !emailError.value && !passwordError.value
  )
})

// Validation functions
const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email.value) {
    emailError.value = 'Email is required'
  } else if (!emailRegex.test(email.value)) {
    emailError.value = 'Please enter a valid email'
  } else {
    emailError.value = ''
  }
}

const validatePassword = () => {
  if (!password.value) {
    passwordError.value = 'Password is required'
  } else if (password.value.length < 6) {
    passwordError.value = 'Password must be at least 6 characters'
  } else {
    passwordError.value = ''
  }
}

// Handle form submission
const handleLogin = async () => {
  validateEmail()
  validatePassword()

  if (!isFormValid.value) return

  try {
    clearError()
    await signIn(email.value, password.value)
    router.push('/dashboard')
  } catch (err) {
    console.error('Login failed:', err)
  }
}

// Handle Google login
const handleGoogleLogin = async () => {
  googleLoading.value = true

  try {
    clearError()
    const result = await signInWithGoogle()

    if (result.needsPasswordSetup) {
      // Redirect to password setup if user needs to set password
      router.push('/auth/set-password')
    } else {
      // Redirect to dashboard if password is already set
      router.push('/dashboard')
    }
  } catch (err) {
    console.error('Google login failed:', err)
  } finally {
    googleLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background-secondary);
  padding: 1rem;
}

.login-card {
  background: var(--color-background);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  padding: 2.5rem;
  width: 100%;
  max-width: 400px;
  border: 1px solid var(--color-border);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
}

.login-subtitle {
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.form-input {
  width: 100%;
}

.error-message {
  color: var(--color-error);
  font-size: var(--font-size-xs);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.forgot-link {
  color: var(--color-secondary);
  text-decoration: none;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: color var(--transition-fast);
}

.forgot-link:hover {
  color: var(--color-secondary-dark);
  text-decoration: underline;
}

.login-button {
  width: 100%;
  height: 3rem;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
  background: linear-gradient(
    135deg,
    var(--color-accent),
    var(--color-accent-dark)
  );
  border: none;
  border-radius: var(--radius-lg);
  color: white;
  transition: all var(--transition-fast);
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.or-divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.5rem 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: var(--color-border);
}

.divider-text {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.google-button {
  width: 100%;
  height: 3rem;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: var(--color-background);
  color: var(--color-text-primary);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
}

.google-button:hover:not(:disabled) {
  border-color: var(--color-primary);
  background: var(--color-background-secondary);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.google-icon {
  font-size: 1.1rem;
  margin-right: 0.5rem;
  color: #4285f4;
}

.google-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-alert {
  margin-top: 1rem;
}

.login-footer {
  text-align: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.register-link {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.register-link a {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: var(--font-weight-semibold);
  transition: color var(--transition-fast);
}

.register-link a:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
}

/* Responsive design */
@media (max-width: 768px) {
  .login-container {
    padding: 0.5rem;
  }

  .login-card {
    padding: 2rem;
    margin: 1rem;
  }

  .login-title {
    font-size: 1.75rem;
  }
}

@media (max-width: 480px) {
  .login-card {
    padding: 1.5rem;
  }

  .login-title {
    font-size: 1.5rem;
  }
}
</style>
