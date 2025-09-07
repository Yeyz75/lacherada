<template>
  <div class="forgot-password-container">
    <div class="forgot-password-card">
      <div class="forgot-password-header">
        <h1 class="forgot-password-title">
          {{ $t('auth.forgotPassword.title') }}
        </h1>
        <p class="forgot-password-subtitle">
          {{ $t('auth.forgotPassword.subtitle') }}
        </p>
      </div>

      <form
        @submit.prevent="handleForgotPassword"
        class="forgot-password-form"
        v-if="!emailSent">
        <div class="form-group">
          <label for="email" class="form-label">{{ $t('auth.email') }}</label>
          <InputText
            id="email"
            v-model="email"
            type="email"
            :placeholder="$t('auth.emailPlaceholder')"
            :invalid="!!emailError"
            class="form-input"
            required />
          <small v-if="emailError" class="error-message">{{
            emailError
          }}</small>
        </div>

        <Button
          type="submit"
          :label="$t('auth.forgotPassword.button')"
          :loading="loading"
          :disabled="!isFormValid"
          class="reset-button"
          severity="primary" />

        <div v-if="error" class="error-alert">
          <Message severity="error" :closable="false">
            {{ error }}
          </Message>
        </div>
      </form>

      <!-- Success state -->
      <div v-if="emailSent" class="success-content">
        <div class="success-icon">
          <i class="pi pi-check-circle"></i>
        </div>
        <h3 class="success-title">{{ $t('auth.forgotPassword.emailSent') }}</h3>
        <p class="success-message">
          {{ $t('auth.forgotPassword.checkEmail') }}
        </p>
        <Button
          :label="$t('auth.forgotPassword.resendEmail')"
          :loading="loading"
          @click="resendEmail"
          class="resend-button"
          severity="secondary"
          outlined />
      </div>

      <div class="forgot-password-footer">
        <p class="back-to-login">
          <router-link to="/auth/login" class="back-link">
            <i class="pi pi-arrow-left"></i>
            {{ $t('auth.forgotPassword.backToLogin') }}
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useAuth } from '../../composables/useAuth'
  import InputText from 'primevue/inputtext'
  import Button from 'primevue/button'
  import Message from 'primevue/message'

  const { resetPassword, loading, error } = useAuth()

  // Form data
  const email = ref('')
  const emailSent = ref(false)

  // Form validation
  const emailError = ref('')

  const isFormValid = computed(() => {
    return email.value && !emailError.value
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

  // Handle form submission
  const handleForgotPassword = async () => {
    validateEmail()

    if (!isFormValid.value) return

    try {
      await resetPassword(email.value)
      emailSent.value = true
    } catch (err) {
      console.error('Password reset failed:', err)
    }
  }

  // Resend email
  const resendEmail = async () => {
    try {
      await resetPassword(email.value)
    } catch (err) {
      console.error('Resend email failed:', err)
    }
  }
</script>

<style scoped>
  .forgot-password-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-background-secondary);
    padding: 1rem;
  }

  .forgot-password-card {
    background: var(--color-background);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-xl);
    padding: 2.5rem;
    width: 100%;
    max-width: 400px;
    border: 1px solid var(--color-border);
  }

  .forgot-password-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .forgot-password-title {
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    margin-bottom: 0.5rem;
  }

  .forgot-password-subtitle {
    color: var(--color-text-secondary);
    font-size: var(--font-size-base);
    line-height: 1.5;
  }

  .forgot-password-form {
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

  .reset-button {
    width: 100%;
    height: 3rem;
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-base);
    background: linear-gradient(
      135deg,
      var(--color-secondary),
      var(--color-secondary-dark)
    );
    border: none;
    border-radius: var(--radius-lg);
    color: white;
    transition: all var(--transition-fast);
  }

  .reset-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  .reset-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .error-alert {
    margin-top: 1rem;
  }

  /* Success state styles */
  .success-content {
    text-align: center;
    padding: 1rem 0;
  }

  .success-icon {
    margin-bottom: 1rem;
  }

  .success-icon i {
    font-size: 4rem;
    color: var(--color-success);
  }

  .success-title {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin-bottom: 1rem;
  }

  .success-message {
    color: var(--color-text-secondary);
    font-size: var(--font-size-base);
    line-height: 1.5;
    margin-bottom: 2rem;
  }

  .resend-button {
    width: 100%;
    height: 2.5rem;
    font-weight: var(--font-weight-medium);
    background: transparent;
    border: 2px solid var(--color-secondary);
    border-radius: var(--radius-lg);
    color: var(--color-secondary);
    transition: all var(--transition-fast);
  }

  .resend-button:hover:not(:disabled) {
    background: var(--color-secondary);
    color: white;
  }

  .forgot-password-footer {
    text-align: center;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--color-border);
  }

  .back-to-login {
    margin: 0;
  }

  .back-link {
    color: var(--color-accent);
    text-decoration: none;
    font-weight: var(--font-weight-medium);
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: var(--font-size-sm);
    transition: color var(--transition-fast);
  }

  .back-link:hover {
    color: var(--color-accent-dark);
    text-decoration: underline;
  }

  .back-link i {
    font-size: var(--font-size-xs);
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .forgot-password-container {
      padding: 0.5rem;
    }

    .forgot-password-card {
      padding: 2rem;
      margin: 1rem;
    }

    .forgot-password-title {
      font-size: 1.75rem;
    }

    .success-title {
      font-size: 1.25rem;
    }
  }

  @media (max-width: 480px) {
    .forgot-password-card {
      padding: 1.5rem;
    }

    .forgot-password-title {
      font-size: 1.5rem;
    }

    .success-icon i {
      font-size: 3rem;
    }

    .success-title {
      font-size: 1.125rem;
    }
  }
</style>
