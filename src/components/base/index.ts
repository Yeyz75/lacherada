// =============================================================================
// LACHERADA DESIGN SYSTEM - BASE COMPONENTS
// =============================================================================

/**
 * Exportación centralizada de todos los componentes base del Design System
 *
 * Uso:
 * import { BaseButton, BaseInput, BaseCard } from '@/components/base'
 *
 * O importación individual:
 * import BaseButton from '@/components/base/BaseButton.vue'
 */

// Component exports
export { default as BaseAccordion } from './BaseAccordion.vue'
export { default as BaseAccordionPanel } from './BaseAccordionPanel.vue'
export { default as BaseAccordionHeader } from './BaseAccordionHeader.vue'
export { default as BaseAccordionContent } from './BaseAccordionContent.vue'
export { default as BaseButton } from './BaseButton.vue'
export { default as BaseInput } from './BaseInput.vue'
export { default as BaseSelect } from './BaseSelect.vue'
export { default as BaseTextarea } from './BaseTextarea.vue'
export { default as BaseCard } from './BaseCard.vue'
export { default as BaseTable } from './BaseTable.vue'
export { default as BaseForm } from './BaseForm.vue'
export { default as BaseAvatar } from './BaseAvatar.vue'
export { default as BaseBadge } from './BaseBadge.vue'
export { default as BaseRating } from './BaseRating.vue'
export { default as BaseChip } from './BaseChip.vue'
export { default as BaseModal } from './BaseModal.vue'
export { default as BaseDivider } from './BaseDivider.vue'
export { default as BasePasswordSetup } from './BasePasswordSetup.vue'

// Type exports for component props
export type {
  ButtonProps,
  ButtonVariant,
  ButtonSize,
  InputProps,
  InputType,
  InputSize,
  CardProps,
  CardVariant,
  TableProps,
  TableColumn,
  FormProps,
  FormField,
  AvatarProps,
  BadgeProps,
  RatingProps,
  ChipProps,
  ModalProps,
  BaseComponentProps,
  DesignTokens,
} from '../../types'
