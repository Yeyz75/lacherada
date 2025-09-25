<template>
  <BaseCard :padding="'xl'" :loading="loading" :class="cardClass">
    <header class="flex flex-col items-center gap-4 text-center">
      <Icon :icon="icon" class="text-4xl text-primary-500" />
      <div class="space-y-2">
        <h2 class="text-2xl font-bold text-text-primary">{{ title }}</h2>
        <p class="text-base text-text-muted">
          {{ description }}
        </p>
      </div>
    </header>

    <form class="flex flex-col gap-6" @submit.prevent="handleSubmit">
      <div class="space-y-2">
        <BaseInput
          id="password"
          v-model="password"
          :label="t('auth.password')"
          :placeholder="t('auth.passwordPlaceholder')"
          type="password"
          :error="passwordError"
          :disabled="loading"
          required
          @blur="validatePassword"
          :show-password-toggle="true"
          :clearable="false" />
      </div>

      <div class="space-y-2">
        <BaseInput
          id="confirmPassword"
          v-model="confirmPassword"
          :label="t('auth.confirmPassword')"
          :placeholder="t('auth.confirmPasswordPlaceholder')"
          type="password"
          :error="confirmPasswordError"
          :disabled="loading"
          required
          @blur="validateConfirmPassword"
          :show-password-toggle="true"
          :clearable="false" />
      </div>

      <section
        class="rounded-2xl border border-border bg-surface-secondary/40 p-4">
        <h4 class="text-sm font-semibold text-text-primary">
          {{ t('auth.passwordRequirements') }}
        </h4>
        <ul class="mt-3 space-y-2 text-sm">
          <li
            v-for="rule in rules"
            :key="rule.key"
            class="flex items-center gap-2">
            <Icon
              :icon="rule.met ? 'mdi:check-circle' : 'mdi:circle-outline'"
              :class="rule.met ? 'text-success' : 'text-text-muted'" />
            <span :class="rule.met ? 'text-success' : 'text-text-muted'">
              {{ rule.label }}
            </span>
          </li>
        </ul>
      </section>

      <footer class="flex flex-col gap-3">
        <BaseButton
          type="submit"
          variant="primary"
          :loading="loading"
          :disabled="!isFormValid">
          {{ t('auth.setPassword') }}
        </BaseButton>
        <BaseButton
          v-if="showCancel"
          type="button"
          variant="ghost"
          :disabled="loading"
          @click="handleCancel">
          {{ t('common.cancel') }}
        </BaseButton>
      </footer>

      <Message
        v-if="showGoogleInfo"
        severity="info"
        variant="simple"
        class="border-info/20 bg-info/5 text-sm">
        <div class="flex items-start gap-3">
          <Icon icon="mdi:information" class="mt-0.5 text-lg text-info" />
          <div class="space-y-1 text-left">
            <p class="font-semibold text-text-primary">
              {{ t('auth.googleReauthInfo') }}
            </p>
            <p class="text-text-muted">
              {{ t('auth.googleReauthDescription') }}
            </p>
          </div>
        </div>
      </Message>

      <Message v-if="error" severity="error" variant="simple">
        {{ error }}
      </Message>

      <Message v-if="success" severity="success" variant="simple">
        {{ success }}
      </Message>
    </form>
  </BaseCard>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import Message from 'primevue/message'
import BaseCard from './BaseCard.vue'
import BaseInput from './BaseInput.vue'
import BaseButton from './BaseButton.vue'
import { useI18n } from 'vue-i18n'

interface Props {
  title?: string
  description?: string
  icon?: string
  loading?: boolean
  error?: string | null
  success?: string | null
  showCancel?: boolean
  showGoogleInfo?: boolean
  class?: string
}

interface Emits {
  (e: 'submit', password: string): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Establece tu contraseña',
  description:
    'Para completar tu registro con Google, establece una contraseña que podrás usar para iniciar sesión más adelante.',
  icon: 'mdi:shield-lock-outline',
  loading: false,
  error: null,
  success: null,
  showCancel: true,
  showGoogleInfo: false,
  class: '',
})

const emit = defineEmits<Emits>()

const { t } = useI18n()

const password = ref('')
const confirmPassword = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')

const hasMinLength = computed(() => password.value.length >= 8)
const hasUpperCase = computed(() => /[A-Z]/.test(password.value))
const hasLowerCase = computed(() => /[a-z]/.test(password.value))
const hasNumber = computed(() => /\d/.test(password.value))

const isPasswordValid = computed(
  () =>
    hasMinLength.value &&
    hasUpperCase.value &&
    hasLowerCase.value &&
    hasNumber.value,
)

const passwordsMatch = computed(
  () =>
    password.value === confirmPassword.value &&
    confirmPassword.value.length > 0,
)

const isFormValid = computed(
  () =>
    isPasswordValid.value &&
    passwordsMatch.value &&
    !passwordError.value &&
    !confirmPasswordError.value,
)

const rules = computed(() => [
  {
    key: 'minLength',
    met: hasMinLength.value,
    label: t('auth.minLength'),
  },
  {
    key: 'upperCase',
    met: hasUpperCase.value,
    label: t('auth.upperCase'),
  },
  {
    key: 'lowerCase',
    met: hasLowerCase.value,
    label: t('auth.lowerCase'),
  },
  {
    key: 'number',
    met: hasNumber.value,
    label: t('auth.hasNumber'),
  },
])

const cardClass = computed(() =>
  props.class
    ? `mx-auto w-full max-w-lg space-y-8 ${props.class}`
    : 'mx-auto w-full max-w-lg space-y-8',
)

watch(password, () => {
  validatePassword()
  if (confirmPassword.value) {
    validateConfirmPassword()
  }
})

watch(confirmPassword, () => {
  validateConfirmPassword()
})

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

<script lang="ts">
export default {
  name: 'BasePasswordSetup',
  inheritAttrs: false,
}
</script>
