<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <!-- Brand Section -->
        <div class="footer-brand">
          <div class="logo">
            <Icon
              icon="mdi:handshake"
              class="logo-icon" />
            <span class="logo-text">LaCherada</span>
          </div>
          <p class="brand-description">
            {{ t('home.subtitle') }}
          </p>
          <div class="social-links">
            <a
              v-for="social in socialLinks"
              :key="social.name"
              :href="social.url"
              :aria-label="social.name"
              class="social-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon :icon="social.icon" />
            </a>
          </div>
        </div>

        <!-- Links Sections -->
        <div class="footer-links">
          <div class="links-group">
            <h4 class="links-title">{{ t('footer.about') }}</h4>
            <ul class="links-list">
              <li>
                <a
                  href="#"
                  class="footer-link"
                >{{ t('navbar.howItWorks') }}</a
                >
              </li>
              <li>
                <a
                  href="#"
                  class="footer-link"
                >Nuestra Historia</a
                >
              </li>
              <li>
                <a
                  href="#"
                  class="footer-link"
                >Equipo</a
                >
              </li>
              <li>
                <a
                  href="#"
                  class="footer-link"
                >Carreras</a
                >
              </li>
            </ul>
          </div>

          <div class="links-group">
            <h4 class="links-title">{{ t('footer.support') }}</h4>
            <ul class="links-list">
              <li>
                <a
                  href="#"
                  class="footer-link"
                >Centro de Ayuda</a
                >
              </li>
              <li>
                <a
                  href="#"
                  class="footer-link"
                >{{ t('navbar.contact') }}</a
                >
              </li>
              <li>
                <a
                  href="#"
                  class="footer-link"
                >Seguridad</a
                >
              </li>
              <li>
                <a
                  href="#"
                  class="footer-link"
                >Reportar Problema</a
                >
              </li>
            </ul>
          </div>

          <div class="links-group">
            <h4 class="links-title">Legal</h4>
            <ul class="links-list">
              <li>
                <a
                  href="#"
                  class="footer-link"
                >{{ t('footer.privacy') }}</a
                >
              </li>
              <li>
                <a
                  href="#"
                  class="footer-link"
                >{{ t('footer.terms') }}</a
                >
              </li>
              <li>
                <a
                  href="#"
                  class="footer-link"
                >Cookies</a
                >
              </li>
              <li>
                <a
                  href="#"
                  class="footer-link"
                >Licencias</a
                >
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Newsletter -->
      <div class="newsletter">
        <div class="newsletter-content">
          <div class="newsletter-text">
            <h3>Mantente conectado</h3>
            <p>Recibe las últimas novedades y ofertas especiales</p>
          </div>
          <form class="newsletter-form">
            <input
              type="email"
              placeholder="Tu correo electrónico"
              class="newsletter-input"
              required
            />
            <button
              type="submit"
              class="btn btn-primary">
              Suscribirse
              <Icon icon="mdi:arrow-right" />
            </button>
          </form>
        </div>
      </div>

      <!-- Bottom -->
      <div class="footer-bottom">
        <div class="footer-bottom-content">
          <p class="copyright">© 2025 LaCherada. Todos los derechos reservados.</p>
          <div class="footer-badges">
            <div class="security-badge">
              <Icon icon="mdi:shield-check" />
              <span>Pagos Seguros</span>
            </div>
            <div class="security-badge">
              <Icon icon="mdi:lock" />
              <span>Datos Protegidos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Icon } from '@iconify/vue'

const { t } = useI18n()

const socialLinks = [
  { name: 'Facebook', icon: 'mdi:facebook', url: 'https://facebook.com' },
  { name: 'Twitter', icon: 'mdi:twitter', url: 'https://twitter.com' },
  { name: 'Instagram', icon: 'mdi:instagram', url: 'https://instagram.com' },
  { name: 'LinkedIn', icon: 'mdi:linkedin', url: 'https://linkedin.com' },
]
</script>

<style scoped>
.footer {
  background: var(--color-background-secondary);
  border-top: 1px solid var(--color-border);
  margin-top: var(--space-3xl);
}

.footer-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: var(--space-3xl);
  padding: var(--space-3xl) 0;
}

.footer-brand {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.logo-icon {
  font-size: var(--font-size-2xl);
}

.logo-text {
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-description {
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
  max-width: 300px;
}

.social-links {
  display: flex;
  gap: var(--space-md);
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--color-background-tertiary);
  border-radius: 50%;
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
  transition: all var(--transition-fast);
}

.social-link:hover {
  background: var(--color-primary);
  color: white;
  transform: translateY(-2px);
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-xl);
}

.links-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.links-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-sm);
}

.links-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.footer-link {
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.footer-link:hover {
  color: var(--color-primary);
}

.newsletter {
  background: var(--color-background-tertiary);
  border-radius: var(--radius-xl);
  padding: var(--space-xl);
  margin: var(--space-xl) 0;
}

.newsletter-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-xl);
}

.newsletter-text h3 {
  font-size: var(--font-size-xl);
  margin-bottom: var(--space-sm);
  color: var(--color-text-primary);
}

.newsletter-text p {
  color: var(--color-text-secondary);
  margin-bottom: 0;
}

.newsletter-form {
  display: flex;
  gap: var(--space-sm);
  flex-shrink: 0;
}

.newsletter-input {
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-background);
  color: var(--color-text-primary);
  font-family: inherit;
  width: 250px;
  transition: border-color var(--transition-fast);
}

.newsletter-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.footer-bottom {
  border-top: 1px solid var(--color-border);
  padding: var(--space-lg) 0;
}

.footer-bottom-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.copyright {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin-bottom: 0;
}

.footer-badges {
  display: flex;
  gap: var(--space-lg);
}

.security-badge {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

/* Responsive */
@media (max-width: 1024px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: var(--space-2xl);
  }

  .footer-links {
    grid-template-columns: repeat(2, 1fr);
  }

  .newsletter-content {
    flex-direction: column;
    text-align: center;
  }

  .newsletter-form {
    width: 100%;
    max-width: 400px;
  }

  .newsletter-input {
    flex: 1;
  }
}

@media (max-width: 768px) {
  .footer-links {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
  }

  .footer-bottom-content {
    flex-direction: column;
    gap: var(--space-md);
    text-align: center;
  }

  .newsletter-form {
    flex-direction: column;
  }

  .newsletter-input {
    width: 100%;
  }
}
</style>
