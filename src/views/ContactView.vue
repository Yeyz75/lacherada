<template>
  <div class="contact-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">{{ t('contact.title') }}</h1>
          <p class="hero-subtitle">{{ t('contact.subtitle') }}</p>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <section class="main-content">
      <div class="container">
        <div class="content-grid">
          <!-- Contact Form using PrimeVue -->
          <div class="contact-form-section">
            <Card class="form-card">
              <template #header>
                <div class="card-header">
                  <Icon icon="mdi:email-edit" class="header-icon" />
                  <h2 class="form-title">Envía un Mensaje</h2>
                </div>
              </template>

              <template #content>
                <form @submit.prevent="submitForm" class="contact-form">
                  <div class="form-field">
                    <label for="name" class="field-label">
                      <Icon icon="mdi:account" class="label-icon" />
                      {{ t('contact.form.name') }}
                    </label>
                    <InputText
                      id="name"
                      v-model="form.name"
                      :placeholder="t('contact.form.namePlaceholder')"
                      required
                      class="w-full" />
                  </div>

                  <div class="form-field">
                    <label for="email" class="field-label">
                      <Icon icon="mdi:email" class="label-icon" />
                      {{ t('contact.form.email') }}
                    </label>
                    <InputText
                      id="email"
                      v-model="form.email"
                      type="email"
                      :placeholder="t('contact.form.emailPlaceholder')"
                      required
                      class="w-full" />
                  </div>

                  <div class="form-field">
                    <label for="subject" class="field-label">
                      <Icon icon="mdi:bookmark" class="label-icon" />
                      {{ t('contact.form.subject') }}
                    </label>
                    <InputText
                      id="subject"
                      v-model="form.subject"
                      :placeholder="t('contact.form.subjectPlaceholder')"
                      required
                      class="w-full" />
                  </div>

                  <div class="form-field">
                    <label for="message" class="field-label">
                      <Icon icon="mdi:message-text" class="label-icon" />
                      {{ t('contact.form.message') }}
                    </label>
                    <Textarea
                      id="message"
                      v-model="form.message"
                      :placeholder="t('contact.form.messagePlaceholder')"
                      rows="6"
                      required
                      class="w-full" />
                  </div>

                  <Button
                    type="submit"
                    :label="
                      isSubmitting
                        ? t('contact.form.sending')
                        : t('contact.form.send')
                    "
                    :loading="isSubmitting"
                    class="w-full"
                    size="large">
                    <template #icon>
                      <Icon icon="mdi:send" />
                    </template>
                  </Button>
                </form>
              </template>
            </Card>
          </div>

          <!-- Contact Information using PrimeVue -->
          <div class="contact-info-section">
            <Card class="info-card">
              <template #header>
                <div class="card-header">
                  <Icon icon="mdi:information" class="header-icon" />
                  <h2 class="info-title">Información de Contacto</h2>
                </div>
              </template>

              <template #content>
                <div class="info-items">
                  <div class="info-item">
                    <div class="info-icon">
                      <Icon icon="mdi:map-marker" />
                    </div>
                    <div class="info-content">
                      <h3 class="info-label">
                        {{ t('contact.info.address') }}
                      </h3>
                      <p class="info-value">
                        Calle de la Innovación, 123
                        <br />
                        28001 Madrid, España
                      </p>
                    </div>
                  </div>

                  <div class="info-item">
                    <div class="info-icon">
                      <Icon icon="mdi:email" />
                    </div>
                    <div class="info-content">
                      <h3 class="info-label">{{ t('contact.info.email') }}</h3>
                      <p class="info-value">contacto@lacherada.com</p>
                    </div>
                  </div>

                  <div class="info-item">
                    <div class="info-icon">
                      <Icon icon="mdi:phone" />
                    </div>
                    <div class="info-content">
                      <h3 class="info-label">{{ t('contact.info.phone') }}</h3>
                      <p class="info-value">+34 91 123 45 67</p>
                    </div>
                  </div>

                  <div class="info-item">
                    <div class="info-icon">
                      <Icon icon="mdi:clock" />
                    </div>
                    <div class="info-content">
                      <h3 class="info-label">{{ t('contact.info.hours') }}</h3>
                      <p class="info-value">
                        {{ t('contact.info.hoursValue') }}
                      </p>
                    </div>
                  </div>
                </div>

                <Divider />

                <!-- Social Links using PrimeVue Buttons -->
                <div class="social-links">
                  <h3 class="social-title">Síguenos</h3>
                  <div class="social-icons">
                    <Button
                      icon="mdi:twitter"
                      severity="secondary"
                      text
                      rounded
                      @click="openSocial('twitter')" />
                    <Button
                      icon="mdi:facebook"
                      severity="secondary"
                      text
                      rounded
                      @click="openSocial('facebook')" />
                    <Button
                      icon="mdi:instagram"
                      severity="secondary"
                      text
                      rounded
                      @click="openSocial('instagram')" />
                    <Button
                      icon="mdi:linkedin"
                      severity="secondary"
                      text
                      rounded
                      @click="openSocial('linkedin')" />
                  </div>
                </div>
              </template>
            </Card>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section using PrimeVue Accordion -->
    <section class="faq-section">
      <div class="container">
        <h2 class="section-title">{{ t('contact.faq.title') }}</h2>

        <Card class="faq-card">
          <template #content>
            <Accordion>
              <AccordionTab
                v-for="(_, index) in faqs"
                :key="index"
                :header="t(`contact.faq.q${index + 1}.question`)">
                <p class="faq-answer">
                  {{ t(`contact.faq.q${index + 1}.answer`) }}
                </p>
              </AccordionTab>
            </Accordion>
          </template>
        </Card>
      </div>
    </section>

    <!-- Map Section -->
    <section class="map-section">
      <div class="container">
        <h2 class="section-title">Nuestra Ubicación</h2>
        <Card class="map-card">
          <template #content>
            <div class="map-placeholder">
              <Icon icon="mdi:map" class="map-icon" />
              <p class="map-text">Mapa interactivo próximamente</p>
            </div>
          </template>
        </Card>
      </div>
    </section>

    <!-- Toast for notifications -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { Icon } from '@iconify/vue'

// PrimeVue components
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import Divider from 'primevue/divider'
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'
import Toast from 'primevue/toast'

const { t } = useI18n()
const toast = useToast()

// Form data
const form = ref({
  name: '',
  email: '',
  subject: '',
  message: '',
})

// Form state
const isSubmitting = ref(false)

// FAQ data
const faqs = [{ id: 1 }, { id: 2 }, { id: 3 }]

// Methods
const submitForm = async () => {
  isSubmitting.value = true

  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Simulate success/error randomly for demo
    const success = Math.random() > 0.3

    if (success) {
      toast.add({
        severity: 'success',
        summary: t('contact.form.success'),
        detail: 'Tu mensaje ha sido enviado exitosamente',
        life: 5000,
      })
      resetForm()
    } else {
      toast.add({
        severity: 'error',
        summary: t('contact.form.error'),
        detail: 'Ha ocurrido un error al enviar el mensaje',
        life: 5000,
      })
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: t('contact.form.error'),
      detail: 'Ha ocurrido un error inesperado',
      life: 5000,
    })
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  form.value = {
    name: '',
    email: '',
    subject: '',
    message: '',
  }
}

const openSocial = (platform: string) => {
  toast.add({
    severity: 'info',
    summary: 'Redes Sociales',
    detail: `Abriendo ${platform}...`,
    life: 3000,
  })
}
</script>

<style scoped>
.contact-page {
  min-height: 100vh;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(
    135deg,
    var(--color-primary-light) 0%,
    var(--color-primary) 50%,
    var(--color-secondary) 100%
  );
  color: white;
  padding: var(--space-2xl) 0;
  text-align: center;
}

.hero-content {
  max-width: 600px;
  margin: 0 auto;
}

.hero-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-sm);
}

.hero-subtitle {
  font-size: var(--font-size-lg);
  opacity: 0.9;
}

/* Main Content */
.main-content {
  padding: var(--space-3xl) 0;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3xl);
  align-items: start;
}

/* Card styling */
.form-card,
.info-card {
  height: fit-content;
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-lg);
}

.header-icon {
  font-size: 1.5rem;
  color: var(--color-primary);
}

.form-title,
.info-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

/* Form styling */
.contact-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.field-label {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.label-icon {
  font-size: 1rem;
  color: var(--color-text-secondary);
}

/* Contact Information */
.info-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
  margin-bottom: var(--space-lg);
}

.info-item {
  display: flex;
  align-items: start;
  gap: var(--space-md);
}

.info-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  background: linear-gradient(
    135deg,
    var(--color-primary),
    var(--color-secondary)
  );
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: var(--font-size-lg);
}

.info-content {
  flex: 1;
}

.info-label {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-xs);
}

.info-value {
  color: var(--color-text-secondary);
  line-height: 1.5;
}

/* Social Links */
.social-links {
  margin-top: var(--space-lg);
}

.social-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-md);
  text-align: center;
}

.social-icons {
  display: flex;
  justify-content: center;
  gap: var(--space-sm);
}

/* FAQ Section */
.faq-section {
  background: var(--color-background-secondary);
  padding: var(--space-3xl) 0;
}

.section-title {
  text-align: center;
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-2xl);
}

.faq-card {
  max-width: 800px;
  margin: 0 auto;
}

.faq-answer {
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0;
}

/* Map Section */
.map-section {
  padding: var(--space-3xl) 0;
}

.map-card {
  max-width: 800px;
  margin: 0 auto;
}

.map-placeholder {
  background: var(--color-background-secondary);
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-lg);
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
}

.map-icon {
  font-size: 4rem;
  color: var(--color-text-tertiary);
}

.map-text {
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: var(--font-size-2xl);
  }

  .content-grid {
    grid-template-columns: 1fr;
    gap: var(--space-2xl);
  }

  .main-content {
    padding: var(--space-2xl) 0;
  }

  .faq-section {
    padding: var(--space-2xl) 0;
  }

  .map-section {
    padding: var(--space-2xl) 0;
  }

  .map-placeholder {
    height: 250px;
  }

  .social-icons {
    gap: var(--space-xs);
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: var(--space-xl) 0;
  }

  .card-header {
    padding: var(--space-md);
  }

  .info-icon {
    width: 40px;
    height: 40px;
    font-size: var(--font-size-md);
  }
}
</style>
