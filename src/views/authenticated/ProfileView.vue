<template>
  <div class="profile-container">
    <!-- Profile Header -->
    <BaseCard class="profile-header-card">
      <div class="profile-header">
        <div class="profile-avatar-section">
          <BaseAvatar
            :image="userProfile.avatarUrl"
            :size="'xlarge'"
            :verified="userProfile.verified"
            class="profile-avatar" />
          <BaseButton
            icon="mdi:camera"
            variant="secondary"
            size="small"
            class="change-avatar-btn"
            @click="openAvatarUpload">
            {{ t('profile.changePhoto') }}
          </BaseButton>
        </div>

        <div class="profile-info">
          <h1 class="profile-name">{{ userProfile.displayName }}</h1>
          <p class="profile-email">{{ userProfile.email }}</p>

          <div class="profile-stats">
            <div class="stat-item">
              <span class="stat-value">
                {{ userProfile.stats.exchanges }}
              </span>
              <span class="stat-label">
                {{ t('profile.stats.exchanges') }}
              </span>
            </div>
            <div class="stat-item">
              <span class="stat-value">
                {{ userProfile.stats.reputation }}
              </span>
              <span class="stat-label">
                {{ t('profile.stats.reputation') }}
              </span>
            </div>
            <div class="stat-item">
              <span class="stat-value">
                {{ userProfile.stats.memberSince }}
              </span>
              <span class="stat-label">
                {{ t('profile.stats.memberSince') }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </BaseCard>

    <!-- Profile Content -->
    <div class="profile-content-grid">
      <!-- Left Column -->
      <div class="profile-main-content">
        <!-- Personal Information -->
        <BaseCard
          :title="t('profile.personalInfo.title')"
          class="profile-section">
          <div class="profile-form">
            <div class="form-row">
              <BaseInput
                v-model="profileForm.firstName"
                :label="t('profile.personalInfo.firstName')"
                :placeholder="t('profile.personalInfo.firstNamePlaceholder')"
                class="form-field" />

              <BaseInput
                v-model="profileForm.lastName"
                :label="t('profile.personalInfo.lastName')"
                :placeholder="t('profile.personalInfo.lastNamePlaceholder')"
                class="form-field" />
            </div>

            <BaseInput
              v-model="profileForm.bio"
              :label="t('profile.personalInfo.bio')"
              :placeholder="t('profile.personalInfo.bioPlaceholder')"
              type="textarea"
              class="form-field" />

            <div class="form-actions">
              <BaseButton
                @click="saveProfile"
                :loading="savingProfile"
                class="save-btn">
                {{ t('profile.saveChanges') }}
              </BaseButton>
            </div>
          </div>
        </BaseCard>

        <!-- Verification Status -->
        <BaseCard
          :title="t('profile.verification.title')"
          class="profile-section">
          <div class="verification-section">
            <div class="verification-item">
              <div class="verification-info">
                <Icon icon="mdi:email" class="verification-icon" />
                <div>
                  <h4 class="verification-title">
                    {{ t('profile.verification.email') }}
                  </h4>
                  <p class="verification-status verified">
                    {{ t('profile.verification.verified') }}
                  </p>
                </div>
              </div>
              <BaseBadge value="Verified" severity="success" />
            </div>

            <div class="verification-item">
              <div class="verification-info">
                <Icon icon="mdi:phone" class="verification-icon" />
                <div>
                  <h4 class="verification-title">
                    {{ t('profile.verification.phone') }}
                  </h4>
                  <p
                    class="verification-status"
                    :class="{ verified: profileForm.phoneVerified }">
                    {{
                      profileForm.phoneVerified
                        ? t('profile.verification.verified')
                        : t('profile.verification.notVerified')
                    }}
                  </p>
                </div>
              </div>
              <BaseButton
                v-if="!profileForm.phoneVerified"
                :label="t('profile.verification.verify')"
                variant="secondary"
                size="small" />
              <BaseBadge v-else value="Verified" severity="success" />
            </div>

            <div class="verification-item">
              <div class="verification-info">
                <Icon icon="mdi:map-marker" class="verification-icon" />
                <div>
                  <h4 class="verification-title">
                    {{ t('profile.verification.address') }}
                  </h4>
                  <p
                    class="verification-status"
                    :class="{ verified: profileForm.addressVerified }">
                    {{
                      profileForm.addressVerified
                        ? t('profile.verification.verified')
                        : t('profile.verification.notVerified')
                    }}
                  </p>
                </div>
              </div>
              <BaseButton
                v-if="!profileForm.addressVerified"
                :label="t('profile.verification.verify')"
                variant="secondary"
                size="small" />
              <BaseBadge v-else value="Verified" severity="success" />
            </div>
          </div>
        </BaseCard>
      </div>

      <!-- Right Column -->
      <div class="profile-sidebar">
        <!-- Reputation -->
        <BaseCard
          :title="t('profile.reputation.title')"
          class="profile-section">
          <div class="reputation-section">
            <div class="reputation-score">
              <BaseRating
                :model-value="userProfile.reputation.rating"
                readonly
                :stars="5"
                class="rating-display" />
              <span class="reputation-value">
                {{ userProfile.reputation.rating }}/{{
                  userProfile.reputation.maxRating
                }}
              </span>
            </div>

            <p class="reputation-text">
              {{ userProfile.reputation.description }}
            </p>

            <div class="reputation-details">
              <div class="reputation-item">
                <span class="reputation-label">
                  {{ t('profile.reputation.reviews') }}
                </span>
                <span class="reputation-count">
                  {{ userProfile.reputation.reviews }}
                </span>
              </div>
              <div class="reputation-item">
                <span class="reputation-label">
                  {{ t('profile.reputation.onTime') }}
                </span>
                <span class="reputation-count">
                  {{ userProfile.reputation.onTime }}%
                </span>
              </div>
              <div class="reputation-item">
                <span class="reputation-label">
                  {{ t('profile.reputation.positive') }}
                </span>
                <span class="reputation-count">
                  {{ userProfile.reputation.positive }}%
                </span>
              </div>
            </div>
          </div>
        </BaseCard>

        <!-- Badges -->
        <BaseCard :title="t('profile.badges.title')" class="profile-section">
          <div class="badges-section">
            <div
              v-for="badge in userProfile.badges"
              :key="badge.id"
              class="badge-item"
              :class="{ earned: badge.earned }">
              <Icon :icon="badge.icon" class="badge-icon" />
              <div class="badge-info">
                <h4 class="badge-name">
                  {{ t(`profile.badges.names.${badge.key}`) }}
                </h4>
                <p class="badge-description">
                  {{ t(`profile.badges.descriptions.${badge.key}`) }}
                </p>
              </div>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>

    <!-- Avatar Upload Modal -->
    <BaseModal
      v-model:visible="showAvatarUpload"
      :title="t('profile.changePhoto')"
      :modal="true"
      :closable="true"
      :dismissable-mask="true"
      position="center"
      size="medium">
      <div class="avatar-upload-modal">
        <BaseFileUpload
          v-model="avatarFile"
          :label="t('profile.changePhoto')"
          :accept="'image/*'"
          :max-file-size="2000000"
          :multiple="false"
          :auto="false"
          :mode="'advanced'"
          :show-upload-button="true"
          :show-cancel-button="true"
          @upload="handleAvatarUpload"
          @select="handleAvatarSelect"
          @error="handleAvatarError"
          class="avatar-file-upload" />

        <div class="avatar-upload-actions">
          <BaseButton
            @click="uploadAvatar"
            :disabled="!avatarFile"
            :loading="uploadingAvatar"
            variant="primary">
            {{ t('common.accept') }}
          </BaseButton>
          <BaseButton
            @click="showAvatarUpload = false"
            variant="secondary"
            class="ml-2">
            {{ t('common.cancel') }}
          </BaseButton>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Icon } from '@iconify/vue'
import { useAuth } from '../../composables/useAuth'
import BaseCard from '../../components/base/BaseCard.vue'
import BaseButton from '../../components/base/BaseButton.vue'
import BaseInput from '../../components/base/BaseInput.vue'
import BaseAvatar from '../../components/base/BaseAvatar.vue'
import BaseRating from '../../components/base/BaseRating.vue'
import BaseBadge from '../../components/base/BaseBadge.vue'
import BaseModal from '../../components/base/BaseModal.vue'
import BaseFileUpload from '../../components/base/BaseFileUpload.vue'

const { t } = useI18n()
const { user } = useAuth()

// Profile state
const savingProfile = ref(false)
const showAvatarUpload = ref(false)
const avatarFile = ref<File | null>(null)
const uploadingAvatar = ref(false)
const profileForm = ref({
  firstName: '',
  lastName: '',
  bio: '',
  phoneVerified: false,
  addressVerified: false,
})

// Mock user profile data
const userProfile = computed(() => ({
  avatarUrl: user.value?.photoURL || '',
  displayName: user.value?.displayName || t('profile.anonymousUser'),
  email: user.value?.email || '',
  verified: true,
  stats: {
    exchanges: 12,
    reputation: '4.8 ★',
    memberSince: '2 años',
  },
  reputation: {
    rating: 4.8,
    maxRating: 5,
    description: t('profile.reputation.description'),
    reviews: 24,
    onTime: 98,
    positive: 100,
  },
  badges: [
    {
      id: 1,
      key: 'firstExchange',
      icon: 'mdi:medal',
      earned: true,
    },
    {
      id: 2,
      key: 'trustedMember',
      icon: 'mdi:shield-check',
      earned: true,
    },
    {
      id: 3,
      key: 'helpfulNeighbor',
      icon: 'mdi:hand-heart',
      earned: false,
    },
    {
      id: 4,
      key: 'communityLeader',
      icon: 'mdi:crown',
      earned: false,
    },
  ],
}))

// Methods
const saveProfile = () => {
  savingProfile.value = true
  // Simulate API call
  setTimeout(() => {
    savingProfile.value = false
    // Show success message
  }, 1000)
}

const openAvatarUpload = () => {
  showAvatarUpload.value = true
}

const handleAvatarSelect = (event: { files: FileList }) => {
  if (event.files && event.files.length > 0) {
    avatarFile.value = event.files[0]
  }
}

const handleAvatarUpload = (event: any) => {
  console.log('Avatar uploaded:', event)
  // Handle successful upload
  uploadingAvatar.value = false
  showAvatarUpload.value = false
  // Show success message
}

const handleAvatarError = (error: any) => {
  console.error('Avatar upload error:', error)
  uploadingAvatar.value = false
  // Show error message
}

const uploadAvatar = () => {
  if (!avatarFile.value) return

  uploadingAvatar.value = true
  // Simulate upload process
  setTimeout(() => {
    handleAvatarUpload({ files: [avatarFile.value] })
  }, 1500)
}

// Initialize form with user data
onMounted(() => {
  if (user.value) {
    const nameParts = user.value.displayName?.split(' ') || []
    profileForm.value.firstName = nameParts[0] || ''
    profileForm.value.lastName = nameParts.slice(1).join(' ') || ''
    profileForm.value.bio = ''
  }
})
</script>

<style scoped>
.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.profile-header-card {
  background: linear-gradient(
    135deg,
    var(--color-primary),
    var(--color-secondary)
  );
  color: white;
  border: none;
}

.profile-header {
  display: flex;
  gap: var(--space-xl);
  align-items: center;
  padding: var(--space-xl);
}

.profile-avatar-section {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
}

.profile-avatar {
  width: 120px;
  height: 120px;
  font-size: 4rem;
}

.change-avatar-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.change-avatar-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-xs);
}

.profile-email {
  font-size: var(--font-size-lg);
  opacity: 0.9;
  margin-bottom: var(--space-lg);
}

.profile-stats {
  display: flex;
  gap: var(--space-xl);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.stat-value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
}

.stat-label {
  font-size: var(--font-size-sm);
  opacity: 0.9;
}

.profile-content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--space-lg);
}

.profile-section {
  margin-bottom: var(--space-lg);
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-lg);
}

.form-field {
  width: 100%;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.save-btn {
  min-width: 150px;
}

.verification-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.verification-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md);
  background: var(--color-background-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.verification-info {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.verification-icon {
  font-size: 1.5rem;
  color: var(--color-primary);
}

.verification-title {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--space-xs);
}

.verification-status {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.verification-status.verified {
  color: var(--color-success);
}

.reputation-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.reputation-score {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.rating-display {
  display: flex;
}

.reputation-value {
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.reputation-text {
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.reputation-details {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
}

.reputation-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reputation-label {
  color: var(--color-text-secondary);
}

.reputation-count {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.badges-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.badge-item {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--color-background-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  opacity: 0.5;
  transition: all var(--transition-normal);
}

.badge-item.earned {
  opacity: 1;
  background: var(--color-background-tertiary);
}

.badge-icon {
  font-size: 1.5rem;
  color: var(--color-primary);
  flex-shrink: 0;
}

.badge-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.badge-name {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.badge-description {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

/* Avatar Upload Modal */
.avatar-upload-modal {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.avatar-file-upload {
  width: 100%;
}

.avatar-upload-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
}

/* Responsive */
@media (max-width: 1024px) {
  .profile-content-grid {
    grid-template-columns: 1fr;
  }

  .profile-stats {
    gap: var(--space-md);
  }
}

@media (max-width: 768px) {
  .profile-container {
    padding: var(--space-md);
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
    gap: var(--space-md);
  }

  .profile-stats {
    justify-content: center;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .verification-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-sm);
  }

  .verification-info {
    width: 100%;
  }

  .avatar-upload-actions {
    flex-direction: column;
  }

  .avatar-upload-actions .ml-2 {
    margin-left: 0;
    margin-top: var(--space-sm);
  }
}
</style>
