<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <h1 class="register-title">{{ $t("auth.register.title") }}</h1>
        <p class="register-subtitle">{{ $t("auth.register.subtitle") }}</p>
      </div>

      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label for="displayName" class="form-label">{{
            $t("auth.displayName")
          }}</label>
          <InputText
            id="displayName"
            v-model="displayName"
            :placeholder="$t('auth.displayNamePlaceholder')"
            :invalid="!!displayNameError"
            class="form-input"
            required
          />
          <small v-if="displayNameError" class="error-message">{{
            displayNameError
          }}</small>
        </div>

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
            :feedback="true"
            toggleMask
            class="form-input"
            :strongRegex="strongPasswordRegex"
            :mediumRegex="mediumPasswordRegex"
            required
          />
          <small v-if="passwordError" class="error-message">{{
            passwordError
          }}</small>
        </div>

        <div class="form-group">
          <label for="confirmPassword" class="form-label">{{
            $t("auth.register.confirmPassword")
          }}</label>
          <Password
            id="confirmPassword"
            v-model="confirmPassword"
            :placeholder="$t('auth.register.confirmPasswordPlaceholder')"
            :invalid="!!confirmPasswordError"
            :feedback="false"
            toggleMask
            class="form-input"
            required
          />
          <small v-if="confirmPasswordError" class="error-message">{{
            confirmPasswordError
          }}</small>
        </div>

        <div class="form-group">
          <div class="checkbox-container">
            <Checkbox v-model="acceptTerms" :binary="true" inputId="terms" />
            <label for="terms" class="checkbox-label">
              {{ $t("auth.register.acceptTerms") }}
              <a href="#" class="terms-link">{{
                $t("auth.register.termsAndConditions")
              }}</a>
            </label>
          </div>
          <small v-if="termsError" class="error-message">{{
            termsError
          }}</small>
        </div>

        <Button
          type="submit"
          :label="$t('auth.register.button')"
          :loading="loading"
          :disabled="!isFormValid"
          class="register-button"
          severity="primary"
        />

        <div v-if="error" class="error-alert">
          <Message severity="error" :closable="false">
            {{ error }}
          </Message>
        </div>
      </form>

      <div class="register-footer">
        <p class="login-link">
          {{ $t("auth.register.haveAccount") }}
          <router-link to="/auth/login">{{
            $t("auth.register.signIn")
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
import Checkbox from "primevue/checkbox";

const router = useRouter();
const { signUp, loading, error } = useAuth();

// Form data
const displayName = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const acceptTerms = ref(false);

// Form validation
const displayNameError = ref("");
const emailError = ref("");
const passwordError = ref("");
const confirmPasswordError = ref("");
const termsError = ref("");

// Password strength regex
const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const mediumPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/;

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
  );
});

// Validation functions
const validateDisplayName = () => {
  if (!displayName.value) {
    displayNameError.value = "Display name is required";
  } else if (displayName.value.length < 2) {
    displayNameError.value = "Display name must be at least 2 characters";
  } else {
    displayNameError.value = "";
  }
};

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
  // Also validate confirm password when password changes
  validateConfirmPassword();
};

const validateConfirmPassword = () => {
  if (!confirmPassword.value) {
    confirmPasswordError.value = "Please confirm your password";
  } else if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = "Passwords do not match";
  } else {
    confirmPasswordError.value = "";
  }
};

const validateTerms = () => {
  if (!acceptTerms.value) {
    termsError.value = "You must accept the terms and conditions";
  } else {
    termsError.value = "";
  }
};

// Handle form submission
const handleRegister = async () => {
  validateDisplayName();
  validateEmail();
  validatePassword();
  validateConfirmPassword();
  validateTerms();

  if (!isFormValid.value) return;

  try {
    await signUp(email.value, password.value, displayName.value);
    router.push("/auth/login");
  } catch (err) {
    console.error("Registration failed:", err);
  }
};
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
