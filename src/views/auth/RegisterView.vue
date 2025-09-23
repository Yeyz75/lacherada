<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <h1 class="register-title">{{ $t('auth.register.title') }}</h1>
        <p class="register-subtitle">{{ $t('auth.register.subtitle') }}</p>
      </div>

      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <BaseInput
            id="displayName"
            v-model="displayName"
            :label="$t('auth.displayName')"
            :placeholder="$t('auth.displayNamePlaceholder')"
            :error="displayNameError"
            class="form-input"
            required
            @blur="validateDisplayName" />
        </div>

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
            required
            @blur="validateEmail" />
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
            required
            @input="validatePassword"
            @blur="validatePassword" />
        </div>

        <div class="form-group">
          <BaseInput
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            :label="$t('auth.register.confirmPassword')"
            :placeholder="$t('auth.register.confirmPasswordPlaceholder')"
            :error="confirmPasswordError"
            :show-password-toggle="true"
            class="form-input"
            required
            @input="validateConfirmPassword"
            @blur="validateConfirmPassword" />
        </div>

        <div class="form-group">
          <div class="checkbox-container">
            <Checkbox v-model="acceptTerms" :binary="true" input-id="terms" />
            <label for="terms" class="checkbox-label">
              {{ $t('auth.register.acceptTerms') }}
              <a href="#" class="terms-link">
                {{ $t('auth.register.termsAndConditions') }}
              </a>
            </label>
          </div>
          <small v-if="termsError" class="error-message">
            {{ termsError }}
          </small>
        </div>

        <Button
          type="submit"
          :label="$t('auth.register.button')"
          :loading="loading"
          :disabled="!isFormValid"
          class="register-button"
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
          @click="handleGoogleRegister">
          <template #default>
            <Icon icon="simple-icons:google" class="google-icon" />
            {{
              googleLoading
                ? $t('auth.redirectingToGoogle')
                : $t('auth.googleRegister')
            }}
          </template>
        </Button>

        <div v-if="error" class="error-alert">
          <Message severity="error" :closable="false">
            {{ error }}
          </Message>
        </div>
      </form>

      <div class="register-footer">
        <p class="login-link">
          {{ $t('auth.register.haveAccount') }}
          <router-link to="/auth/login">
            {{ $t('auth.register.signIn') }}
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { Icon } from '@iconify/vue'
import BaseInput from '../../components/base/BaseInput.vue'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Checkbox from 'primevue/checkbox'

const router = useRouter()
const { signUp, signInWithGoogle, loading, error, clearError, initialize } =
  useAuth()

// Inicializar el sistema de autenticación cuando se monta el componente
onMounted(async () => {
  await initialize()
})

// Form data
const displayName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const acceptTerms = ref(false)
const googleLoading = ref(false)

// Form validation
const displayNameError = ref('')
const emailError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')
const termsError = ref('')

const isFormValid = computed(() => {
  return (
    displayName.value &&
    email.value &&
    password.value &&
    confirmPassword.value &&
    acceptTerms.value &&
    !displayNameError.value &&
    !emailError.value &&
    !passwordError.value &&
    !confirmPasswordError.value &&
    !termsError.value
  )
})

// Validation functions
const validateDisplayName = () => {
  if (!displayName.value) {
    displayNameError.value = 'El nombre es requerido'
  } else if (displayName.value.length < 2) {
    displayNameError.value = 'El nombre debe tener al menos 2 caracteres'
  } else {
    displayNameError.value = ''
  }
}

const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email.value) {
    emailError.value = 'El correo electrónico es requerido'
  } else if (!emailRegex.test(email.value)) {
    emailError.value = 'Por favor ingresa un correo electrónico válido'
  } else {
    emailError.value = ''
  }
}

const validatePassword = () => {
  if (!password.value) {
    passwordError.value = 'La contraseña es requerida'
  } else if (password.value.length < 6) {
    passwordError.value = 'La contraseña debe tener al menos 6 caracteres'
  } else {
    passwordError.value = ''
  }
  // Also validate confirm password when password changes
  if (confirmPassword.value) {
    validateConfirmPassword()
  }
}

const validateConfirmPassword = () => {
  if (!confirmPassword.value) {
    confirmPasswordError.value = 'Por favor confirma tu contraseña'
  } else if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = 'Las contraseñas no coinciden'
  } else {
    confirmPasswordError.value = ''
  }
}

const validateTerms = () => {
  if (!acceptTerms.value) {
    termsError.value = 'Debes aceptar los términos y condiciones'
  } else {
    termsError.value = ''
  }
}

// Handle form submission
const handleRegister = async () => {
  validateDisplayName()
  validateEmail()
  validatePassword()
  validateConfirmPassword()
  validateTerms()

  if (!isFormValid.value) return

  try {
    clearError()
    const result = await signUp(email.value, password.value, displayName.value)

    // Para usuarios de email, SIEMPRE verificar que no estén verificados
    if (result.user.loginMethod === 'email') {
      // FORZAR verificación para usuarios de email recién registrados
      // Los usuarios de email NUNCA deberían estar verificados inmediatamente después del registro

      // Pequeño delay para asegurar que el estado se actualice
      await new Promise((resolve) => setTimeout(resolve, 100))
      // SIEMPRE redirigir a verificación para usuarios de email
      await router.replace('/auth/verify-email')
    } else {
      // Usuarios de Google van directo al dashboard
      await router.replace('/dashboard')
    }
  } catch (err) {
    console.error('Registration failed:', err)
  }
}

// Handle Google registration
const handleGoogleRegister = async () => {
  googleLoading.value = true

  try {
    clearError()

    // Iniciar el flujo de OAuth con Google
    const result = await signInWithGoogle()

    if (result.redirecting) {
      // El usuario será redirigido a Google
      // No hacer nada más aquí, el AuthCallbackView manejará el resultado
    }
  } catch (err) {
    console.error('Error iniciando flujo de Google:', err)
    googleLoading.value = false
  }
  // Nota: No establecer googleLoading.value = false aquí para OAuth
  // se establecerá cuando la página se recargue o redirija
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background-secondary);
  padding: 1rem;
}

.register-card {
  background: var(--color-background);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  padding: 2.5rem;
  width: 100%;
  max-width: 450px;
  margin: 1rem 0;
  border: 1px solid var(--color-border);
}

.register-header {
  text-align: center;
  margin-bottom: 2rem;
}

.register-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
}

.register-subtitle {
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}

.register-form {
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

.checkbox-container {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.checkbox-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.terms-link {
  color: var(--color-secondary);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  transition: color var(--transition-fast);
}

.terms-link:hover {
  color: var(--color-secondary-dark);
  text-decoration: underline;
}

.register-button {
  width: 100%;
  height: 3rem;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
  background: linear-gradient(
    135deg,
    var(--color-primary),
    var(--color-primary-dark)
  );
  border: none;
  border-radius: var(--radius-lg);
  color: white;
  transition: all var(--transition-fast);
}

.register-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg), var(--shadow-glow);
}

.register-button:disabled {
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

.google-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.google-icon {
  font-size: 1.1rem;
  margin-right: 0.5rem;
  color: #4285f4;
}

.error-alert {
  margin-top: 1rem;
}

.register-footer {
  text-align: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.login-link {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.login-link a {
  color: var(--color-accent);
  text-decoration: none;
  font-weight: var(--font-weight-semibold);
  transition: color var(--transition-fast);
}

.login-link a:hover {
  color: var(--color-accent-dark);
  text-decoration: underline;
}

/* Responsive design */
@media (max-width: 768px) {
  .register-container {
    padding: 0.5rem;
  }

  .register-card {
    padding: 2rem;
    margin: 0.5rem;
  }

  .register-title {
    font-size: 1.75rem;
  }
}

@media (max-width: 480px) {
  .register-card {
    padding: 1.5rem;
  }

  .register-title {
    font-size: 1.5rem;
  }

  .checkbox-container {
    align-items: flex-start;
  }

  .checkbox-label {
    font-size: 0.85rem;
  }
}
</style>
