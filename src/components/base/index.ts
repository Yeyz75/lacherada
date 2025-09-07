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
export { default as BaseButton } from './BaseButton.vue'
export { default as BaseInput } from './BaseInput.vue'
export { default as BaseCard } from './BaseCard.vue'
export { default as BaseTable } from './BaseTable.vue'
export { default as BaseForm } from './BaseForm.vue'

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
  BaseComponentProps,
  DesignTokens,
} from '../../types'
