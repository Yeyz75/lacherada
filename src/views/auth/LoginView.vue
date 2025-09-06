<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1 class="login-title">{{ $t("auth.login.title") }}</h1>
        <p class="login-subtitle">{{ $t("auth.login.subtitle") }}</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email" class="form-label">{{ $t("auth.email") }}</label>
          <InputText
            id="email"
            v-model="email"
            type="email"
            :placeholder="$t('auth.emailPlaceholder')"
            :invalid="!!emailError"
            class="form-input"
            required
          />
          <small v-if="emailError" class="error-message">{{
            emailError
          }}</small>
        </div>

        <div class="form-group">
          <label for="password" class="form-label">{{
            $t("auth.password")
          }}</label>
          <Password
            id="password"
            v-model="password"
            :placeholder="$t('auth.passwordPlaceholder')"
            :invalid="!!passwordError"
            :feedback="false"
            toggleMask
            class="form-input"
            required
          />
          <small v-if="passwordError" class="error-message">{{
            passwordError
          }}</small>
        </div>

        <div class="form-actions">
          <router-link to="/auth/forgot-password" class="forgot-link">
            {{ $t("auth.login.forgotPassword") }}
          </router-link>
        </div>

        <Button
          type="submit"
          :label="$t('auth.login.button')"
          :loading="loading"
          :disabled="!isFormValid"
          class="login-button"
          severity="primary"
        />

        <div v-if="error" class="error-alert">
          <Message severity="error" :closable="false">
            {{ error }}
          </Message>
        </div>
      </form>

      <div class="login-footer">
        <p class="register-link">
          {{ $t("auth.login.noAccount") }}
          <router-link to="/auth/register">{{
            $t("auth.login.signUp")
          }}</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "../../composables/useAuth";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Button from "primevue/button";
import Message from "primevue/message";

const router = useRouter();
const { signIn, loading, error } = useAuth();

// Form data
const email = ref("");
const password = ref("");

// Form validation
const emailError = ref("");
const passwordError = ref("");

const isFormValid = computed(() => {
  return (
    email.value && password.value && !emailError.value && !passwordError.value
  );
});

// Validation functions
const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.value) {
    emailError.value = "Email is required";
  } else if (!emailRegex.test(email.value)) {
    emailError.value = "Please enter a valid email";
  } else {
    emailError.value = "";
  }
};

const validatePassword = () => {
  if (!password.value) {
    passwordError.value = "Password is required";
  } else if (password.value.length < 6) {
    passwordError.value = "Password must be at least 6 characters";
  } else {
    passwordError.value = "";
  }
};

// Handle form submission
const handleLogin = async () => {
  validateEmail();
  validatePassword();

  if (!isFormValid.value) return;

  try {
    await signIn(email.value, password.value);
    router.push("/");
  } catch (err) {
    console.error("Login failed:", err);
  }
};
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
