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
          <!-- Contact Form -->
          <div class="contact-form-section">
            <div class="form-container">
              <h2 class="form-title">Envía un Mensaje</h2>

              <form @submit.prevent="submitForm" class="contact-form">
                <div class="form-group">
                  <label for="name" class="form-label">{{
                    t('contact.form.name')
                  }}</label>
                  <input
                    id="name"
                    v-model="form.name"
                    type="text"
                    class="form-input"
                    :placeholder="t('contact.form.namePlaceholder')"
                    required />
                </div>

                <div class="form-group">
                  <label for="email" class="form-label">{{
                    t('contact.form.email')
                  }}</label>
                  <input
                    id="email"
                    v-model="form.email"
                    type="email"
                    class="form-input"
                    :placeholder="t('contact.form.emailPlaceholder')"
                    required />
                </div>

                <div class="form-group">
                  <label for="subject" class="form-label">{{
                    t('contact.form.subject')
                  }}</label>
                  <input
                    id="subject"
                    v-model="form.subject"
                    type="text"
                    class="form-input"
                    :placeholder="t('contact.form.subjectPlaceholder')"
                    required />
                </div>

                <div class="form-group">
                  <label for="message" class="form-label">{{
                    t('contact.form.message')
                  }}</label>
                  <textarea
                    id="message"
                    v-model="form.message"
                    class="form-textarea"
                    rows="6"
                    :placeholder="t('contact.form.messagePlaceholder')"
                    required></textarea>
                </div>

                <button
                  type="submit"
                  class="btn btn-primary btn-full btn-lg"
                  :disabled="isSubmitting">
                  <Icon v-if="isSubmitting" icon="mdi:loading" class="spin" />
                  <Icon v-else icon="mdi:send" />
                  {{
                    isSubmitting
                      ? t('contact.form.sending')
                      : t('contact.form.send')
                  }}
                </button>

                <!-- Success/Error Messages -->
                <div
                  v-if="submitStatus === 'success'"
                  class="alert alert-success">
                  <Icon icon="mdi:check-circle" />
                  {{ t('contact.form.success') }}
                </div>

                <div v-if="submitStatus === 'error'" class="alert alert-error">
                  <Icon icon="mdi:alert-circle" />
                  {{ t('contact.form.error') }}
                </div>
              </form>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="contact-info-section">
            <div class="info-container">
              <h2 class="info-title">Información de Contacto</h2>

              <div class="info-items">
                <div class="info-item">
                  <div class="info-icon">
                    <Icon icon="mdi:map-marker" />
                  </div>
                  <div class="info-content">
                    <h3 class="info-label">{{ t('contact.info.address') }}</h3>
                    <p class="info-value">
                      Calle de la Innovación, 123<br />
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
                    <p class="info-value">{{ t('contact.info.hoursValue') }}</p>
                  </div>
                </div>
              </div>

              <!-- Social Links -->
              <div class="social-links">
                <h3 class="social-title">Síguenos</h3>
                <div class="social-icons">
                  <a href="#" class="social-link">
                    <Icon icon="mdi:twitter" />
                  </a>
                  <a href="#" class="social-link">
                    <Icon icon="mdi:facebook" />
                  </a>
                  <a href="#" class="social-link">
                    <Icon icon="mdi:instagram" />
                  </a>
                  <a href="#" class="social-link">
                    <Icon icon="mdi:linkedin" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="faq-section">
      <div class="container">
        <h2 class="section-title">{{ t('contact.faq.title') }}</h2>

        <div class="faq-container">
          <div
            v-for="(_, index) in faqs"
            :key="index"
            class="faq-item"
            :class="{ active: activeFaq === index }">
            <button @click="toggleFaq(index)" class="faq-question">
              <span>{{ t(`contact.faq.q${index + 1}.question`) }}</span>
              <Icon
                :icon="
                  activeFaq === index ? 'mdi:chevron-up' : 'mdi:chevron-down'
                "
                class="faq-icon" />
            </button>

            <div class="faq-answer" v-show="activeFaq === index">
              <p>{{ t(`contact.faq.q${index + 1}.answer`) }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Map Section (Placeholder) -->
    <section class="map-section">
      <div class="container">
        <h2 class="section-title">Nuestra Ubicación</h2>
        <div class="map-placeholder">
          <Icon icon="mdi:map" class="map-icon" />
          <p class="map-text">Mapa interactivo próximamente</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { Icon } from '@iconify/vue'

  const { t } = useI18n()

  // Form data
  const form = ref({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  // Form state
  const isSubmitting = ref(false)
  const submitStatus = ref<'idle' | 'success' | 'error'>('idle')

  // FAQ state
  const activeFaq = ref<number | null>(null)

  const faqs = [{ id: 1 }, { id: 2 }, { id: 3 }]

  // Methods
  const submitForm = async () => {
    isSubmitting.value = true
    submitStatus.value = 'idle'

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate success/error randomly for demo
      const success = Math.random() > 0.3

      if (success) {
        submitStatus.value = 'success'
        resetForm()
      } else {
        submitStatus.value = 'error'
      }
    } catch (error) {
      submitStatus.value = 'error'
    } finally {
      isSubmitting.value = false

      // Clear status after 5 seconds
      setTimeout(() => {
        submitStatus.value = 'idle'
      }, 5000)
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

  const toggleFaq = (index: number) => {
    activeFaq.value = activeFaq.value === index ? null : index
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

  /* Contact Form */
  .form-container {
    background: var(--color-background);
    border-radius: var(--radius-lg);
    padding: var(--space-2xl);
    box-shadow: var(--shadow-md);
    border: 1px solid var(--color-border);
  }

  .form-title {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    margin-bottom: var(--space-xl);
    text-align: center;
  }

  .contact-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .form-label {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
  }

  .form-input,
  .form-textarea {
    padding: var(--space-md);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-background);
    color: var(--color-text-primary);
    font-size: var(--font-size-sm);
    transition: all var(--transition-fast);
  }

  .form-input:focus,
  .form-textarea:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px var(--color-primary-light);
  }

  .form-textarea {
    resize: vertical;
    min-height: 120px;
    font-family: inherit;
  }

  .btn-full {
    width: 100%;
  }

  /* Contact Information */
  .info-container {
    background: var(--color-background-secondary);
    border-radius: var(--radius-lg);
    padding: var(--space-2xl);
    height: fit-content;
  }

  .info-title {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    margin-bottom: var(--space-xl);
    text-align: center;
  }

  .info-items {
    display: flex;
    flex-direction: column;
    gap: var(--space-xl);
    margin-bottom: var(--space-2xl);
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
    border-top: 1px solid var(--color-border);
    padding-top: var(--space-xl);
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
    gap: var(--space-md);
  }

  .social-link {
    width: 48px;
    height: 48px;
    background: var(--color-background);
    border: 1px solid var(--color-border);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-secondary);
    font-size: var(--font-size-lg);
    transition: all var(--transition-fast);
    text-decoration: none;
  }

  .social-link:hover {
    background: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
    transform: translateY(-2px);
  }

  /* Alerts */
  .alert {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-md);
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
  }

  .alert-success {
    background: var(--color-success-light);
    color: var(--color-success-dark);
    border: 1px solid var(--color-success);
  }

  .alert-error {
    background: var(--color-error-light);
    color: var(--color-error-dark);
    border: 1px solid var(--color-error);
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

  .faq-container {
    max-width: 800px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .faq-item {
    background: var(--color-background);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
    overflow: hidden;
    transition: all var(--transition-normal);
  }

  .faq-item.active {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-md);
  }

  .faq-question {
    width: 100%;
    padding: var(--space-lg);
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    transition: all var(--transition-fast);
  }

  .faq-question:hover {
    background: var(--color-background-secondary);
  }

  .faq-icon {
    flex-shrink: 0;
    font-size: var(--font-size-lg);
    color: var(--color-primary);
    transition: transform var(--transition-fast);
  }

  .faq-answer {
    padding: 0 var(--space-lg) var(--space-lg);
    color: var(--color-text-secondary);
    line-height: 1.6;
    animation: fadeIn 0.3s ease-out;
  }

  /* Map Section */
  .map-section {
    padding: var(--space-3xl) 0;
  }

  .map-placeholder {
    background: var(--color-background-secondary);
    border: 2px dashed var(--color-border);
    border-radius: var(--radius-lg);
    height: 400px;
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

  /* Animations */
  .spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
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

    .form-container,
    .info-container {
      padding: var(--space-xl);
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
      height: 300px;
    }
  }

  @media (max-width: 480px) {
    .hero-section {
      padding: var(--space-xl) 0;
    }

    .form-container,
    .info-container {
      padding: var(--space-lg);
    }

    .social-icons {
      gap: var(--space-sm);
    }

    .social-link {
      width: 40px;
      height: 40px;
      font-size: var(--font-size-md);
    }

    .faq-question {
      padding: var(--space-md);
      font-size: var(--font-size-sm);
    }

    .faq-answer {
      padding: 0 var(--space-md) var(--space-md);
    }
  }
</style>
