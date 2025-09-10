<template>
  <div class="dashboard-container">
    <!-- Welcome Header -->
    <div class="welcome-header">
      <div class="welcome-content">
        <h1 class="welcome-title">
          {{
            t('dashboard.welcome', {
              name: user?.displayName || t('dashboard.user'),
            })
          }}
        </h1>
        <p class="welcome-subtitle">
          {{ t('dashboard.subtitle') }}
        </p>
      </div>
      <div class="welcome-avatar">
        <Icon icon="mdi:account-circle" class="avatar-icon" />
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="stats-grid">
      <BaseCard
        v-for="stat in stats"
        :key="stat.key"
        class="stat-card"
        :class="`stat-${stat.key}`">
        <div class="stat-content">
          <div class="stat-icon">
            <Icon :icon="stat.icon" />
          </div>
          <div class="stat-info">
            <h3 class="stat-value">{{ stat.value }}</h3>
            <p class="stat-label">{{ t(`dashboard.stats.${stat.key}`) }}</p>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- Main Content Grid -->
    <div class="dashboard-grid">
      <!-- Quick Actions -->
      <BaseCard class="quick-actions-card">
        <template #header>
          <h2 class="card-title">
            <Icon icon="mdi:lightning-bolt" />
            {{ t('dashboard.quickActions') }}
          </h2>
        </template>
        <div class="quick-actions">
          <router-link
            v-for="action in quickActions"
            :key="action.key"
            :to="action.path"
            class="action-button"
            :class="`action-${action.key}`">
            <Icon :icon="action.icon" class="action-icon" />
            <span class="action-label">
              {{ t(`dashboard.actions.${action.key}`) }}
            </span>
          </router-link>
        </div>
      </BaseCard>

      <!-- Recent Activity -->
      <BaseCard class="activity-card">
        <template #header>
          <h2 class="card-title">
            <Icon icon="mdi:clock-outline" />
            {{ t('dashboard.recentActivity') }}
          </h2>
        </template>
        <div class="activity-list">
          <div
            v-for="activity in recentActivities"
            :key="activity.id"
            class="activity-item">
            <div class="activity-icon">
              <Icon :icon="activity.icon" />
            </div>
            <div class="activity-details">
              <p class="activity-title">{{ activity.title }}</p>
              <p class="activity-time">{{ activity.time }}</p>
            </div>
            <div class="activity-status">
              <BaseBadge
                :value="activity.status"
                :severity="getActivitySeverity(activity.type)" />
            </div>
          </div>

          <div v-if="recentActivities.length === 0" class="empty-state">
            <Icon icon="mdi:inbox-outline" class="empty-icon" />
            <p class="empty-text">{{ t('dashboard.noActivity') }}</p>
            <router-link to="/explore" class="empty-action">
              {{ t('dashboard.startExploring') }}
            </router-link>
          </div>
        </div>
      </BaseCard>

      <!-- Reputation & Community -->
      <BaseCard class="reputation-card">
        <template #header>
          <h2 class="card-title">
            <Icon icon="mdi:star-outline" />
            {{ t('dashboard.reputation') }}
          </h2>
        </template>
        <div class="reputation-content">
          <div class="reputation-score">
            <BaseRating
              :model-value="userReputation.rating"
              readonly
              :stars="5"
              class="rating-display" />
            <div class="score-info">
              <span class="score-value">{{ userReputation.rating }}/5</span>
              <span class="score-reviews">
                ({{ userReputation.reviews }} {{ t('dashboard.reviews') }})
              </span>
            </div>
          </div>

          <div class="reputation-progress">
            <div class="progress-info">
              <span class="progress-label">
                {{ t('dashboard.nextLevel') }}
              </span>
              <span class="progress-value">{{ userReputation.progress }}%</span>
            </div>
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: `${userReputation.progress}%` }"></div>
            </div>
          </div>

          <div class="badges-section">
            <h4 class="badges-title">{{ t('dashboard.badges') }}</h4>
            <div class="badges-grid">
              <div
                v-for="badge in userBadges"
                :key="badge.key"
                class="badge-item"
                :class="{ earned: badge.earned }">
                <Icon :icon="badge.icon" class="badge-icon" />
                <span class="badge-name">
                  {{ t(`dashboard.badgeNames.${badge.key}`) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </BaseCard>

      <!-- Recommendations -->
      <BaseCard class="recommendations-card">
        <template #header>
          <h2 class="card-title">
            <Icon icon="mdi:thumb-up-outline" />
            {{ t('dashboard.recommendations') }}
          </h2>
        </template>
        <div class="recommendations-list">
          <div
            v-for="item in recommendations"
            :key="item.id"
            class="recommendation-item">
            <div class="recommendation-image">
              <Icon :icon="item.icon" />
            </div>
            <div class="recommendation-details">
              <h4 class="recommendation-title">{{ item.title }}</h4>
              <p class="recommendation-description">{{ item.description }}</p>
              <div class="recommendation-meta">
                <span class="recommendation-distance">
                  <Icon icon="mdi:map-marker" />
                  {{ item.distance }}
                </span>
                <span class="recommendation-category">
                  {{ item.category }}
                </span>
              </div>
            </div>
            <BaseButton
              icon="mdi:heart-outline"
              class="favorite-btn"
              severity="secondary"
              text />
          </div>

          <div class="recommendations-footer">
            <router-link to="/explore" class="view-more-link">
              {{ t('dashboard.viewMore') }}
              <Icon icon="mdi:arrow-right" />
            </router-link>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Icon } from '@iconify/vue'
import { useAuth } from '../../composables/useAuth'
import BaseCard from '../../components/base/BaseCard.vue'
import BaseButton from '../../components/base/BaseButton.vue'
import BaseBadge from '../../components/base/BaseBadge.vue'
import BaseRating from '../../components/base/BaseRating.vue'

const { t } = useI18n()
const { user } = useAuth()

// Mock data for dashboard
const stats = computed(() => [
  {
    key: 'published',
    icon: 'mdi:package-variant',
    value: 12,
  },
  {
    key: 'exchanges',
    icon: 'mdi:swap-horizontal',
    value: 8,
  },
  {
    key: 'favorites',
    icon: 'mdi:heart',
    value: 15,
  },
  {
    key: 'messages',
    icon: 'mdi:message-text',
    value: 3,
  },
])

const quickActions = computed(() => [
  {
    key: 'publish',
    icon: 'mdi:plus-circle',
    path: '/publish',
  },
  {
    key: 'explore',
    icon: 'mdi:compass',
    path: '/explore',
  },
  {
    key: 'messages',
    icon: 'mdi:chat',
    path: '/messages',
  },
  {
    key: 'profile',
    icon: 'mdi:account-edit',
    path: '/profile',
  },
])

const recentActivities = computed(() => [
  {
    id: 1,
    icon: 'mdi:handshake',
    title: t('dashboard.activityExamples.exchange'),
    time: t('dashboard.timeAgo.hours', { count: 2 }),
    status: t('dashboard.statusLabels.completed'),
    type: 'exchange',
  },
  {
    id: 2,
    icon: 'mdi:message',
    title: t('dashboard.activityExamples.message'),
    time: t('dashboard.timeAgo.days', { count: 1 }),
    status: t('dashboard.statusLabels.new'),
    type: 'message',
  },
  {
    id: 3,
    icon: 'mdi:heart',
    title: t('dashboard.activityExamples.favorite'),
    time: t('dashboard.timeAgo.days', { count: 3 }),
    status: t('dashboard.statusLabels.saved'),
    type: 'favorite',
  },
])

const userReputation = computed(() => ({
  rating: 4.5,
  reviews: 12,
  progress: 75,
}))

const userBadges = computed(() => [
  {
    key: 'firstExchange',
    icon: 'mdi:medal',
    earned: true,
  },
  {
    key: 'trustedMember',
    icon: 'mdi:shield-check',
    earned: true,
  },
  {
    key: 'helpfulNeighbor',
    icon: 'mdi:hand-heart',
    earned: false,
  },
  {
    key: 'communityLeader',
    icon: 'mdi:crown',
    earned: false,
  },
])

const recommendations = computed(() => [
  {
    id: 1,
    title: t('dashboard.exampleItems.drill'),
    description: t('dashboard.exampleItems.drillDescription'),
    icon: 'mdi:tools',
    distance: '0.5 km',
    category: t('dashboard.categories.tools'),
  },
  {
    id: 2,
    title: t('dashboard.exampleItems.book'),
    description: t('dashboard.exampleItems.bookDescription'),
    icon: 'mdi:book',
    distance: '1.2 km',
    category: t('dashboard.categories.books'),
  },
  {
    id: 3,
    title: t('dashboard.exampleItems.bike'),
    description: t('dashboard.exampleItems.bikeDescription'),
    icon: 'mdi:bicycle',
    distance: '0.8 km',
    category: t('dashboard.categories.sports'),
  },
])

const getActivitySeverity = (type: string) => {
  switch (type) {
    case 'exchange':
      return 'success'
    case 'message':
      return 'info'
    case 'favorite':
      return 'contrast'
    default:
      return 'secondary'
  }
}
</script>

<style scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-lg);
  gap: var(--space-xl);
  display: flex;
  flex-direction: column;
}

.welcome-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-xl);
  background: linear-gradient(
    135deg,
    var(--color-primary),
    var(--color-secondary)
  );
  border-radius: var(--radius-lg);
  color: white;
  margin-bottom: var(--space-xl);
}

.welcome-content {
  flex: 1;
}

.welcome-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-sm);
}

.welcome-subtitle {
  font-size: var(--font-size-lg);
  opacity: 0.9;
}

.welcome-avatar .avatar-icon {
  font-size: 4rem;
  opacity: 0.8;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
}

.stat-card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  transition: all var(--transition-normal);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-lg);
}

.stat-icon {
  font-size: 2.5rem;
  color: var(--color-primary);
}

.stat-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-xs);
}

.stat-label {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--space-xl);
}

.card-title {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
}

.action-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-lg);
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: all var(--transition-normal);
}

.action-button:hover {
  background: var(--color-background-tertiary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.action-icon {
  font-size: 2rem;
  color: var(--color-primary);
}

.action-label {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  text-align: center;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.activity-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--color-background-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.activity-icon {
  font-size: 1.5rem;
  color: var(--color-primary);
  flex-shrink: 0;
}

.activity-details {
  flex: 1;
}

.activity-title {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--space-xs);
}

.activity-time {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-xl);
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  color: var(--color-text-tertiary);
}

.empty-text {
  color: var(--color-text-secondary);
}

.empty-action {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
}

.reputation-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.reputation-score {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.score-info {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.score-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.score-reviews {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.reputation-progress {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-label {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.progress-value {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
}

.progress-bar {
  height: 8px;
  background: var(--color-background-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--color-primary),
    var(--color-secondary)
  );
  transition: width var(--transition-normal);
}

.badges-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.badges-title {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.badges-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-sm);
}

.badge-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm);
  background: var(--color-background-secondary);
  border-radius: var(--radius-sm);
  opacity: 0.5;
  transition: all var(--transition-normal);
}

.badge-item.earned {
  opacity: 1;
  background: var(--color-background-tertiary);
}

.badge-icon {
  font-size: 1.25rem;
  color: var(--color-primary);
}

.badge-name {
  font-size: var(--font-size-xs);
  color: var(--color-text-primary);
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.recommendation-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--color-background-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.recommendation-image {
  font-size: 2rem;
  color: var(--color-primary);
  flex-shrink: 0;
}

.recommendation-details {
  flex: 1;
}

.recommendation-title {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--space-xs);
}

.recommendation-description {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-sm);
}

.recommendation-meta {
  display: flex;
  gap: var(--space-md);
  align-items: center;
}

.recommendation-distance {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
}

.recommendation-category {
  color: var(--color-primary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.recommendations-footer {
  text-align: center;
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
}

.view-more-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  color: var(--color-primary);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  transition: color var(--transition-fast);
}

.view-more-link:hover {
  color: var(--color-primary-dark);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .dashboard-container {
    padding: var(--space-md);
  }

  .welcome-header {
    flex-direction: column;
    text-align: center;
    gap: var(--space-md);
  }

  .welcome-title {
    font-size: var(--font-size-2xl);
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .quick-actions {
    grid-template-columns: 1fr;
  }

  .badges-grid {
    grid-template-columns: 1fr;
  }
}
</style>
