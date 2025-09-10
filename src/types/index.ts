// User types
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface User {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface UserProfile extends User {
  bio?: string
  location?: string
  rating?: number
  totalExchanges?: number
  joinedAt: Date
}

// Post/Item types
export interface Post {
  id: string
  userId: string
  title: string
  description: string
  category: PostCategory
  type: PostType
  images: string[]
  location: Location
  price?: number
  condition?: ItemCondition
  availability: PostAvailability
  tags: string[]
  createdAt: Date
  updatedAt: Date
  viewCount: number
  favoriteCount: number
}

export type PostType =
  | 'lend'
  | 'borrow'
  | 'sell'
  | 'donate'
  | 'exchange'
  | 'service'

export type PostCategory =
  | 'tools'
  | 'technology'
  | 'home'
  | 'services'
  | 'education'
  | 'sports'
  | 'clothing'
  | 'vehicles'
  | 'other'

export type ItemCondition = 'new' | 'like-new' | 'good' | 'fair' | 'poor'

export type PostAvailability =
  | 'available'
  | 'reserved'
  | 'unavailable'
  | 'completed'

export interface Location {
  city: string
  state?: string
  country: string
  coordinates?: {
    lat: number
    lng: number
  }
}

// Exchange/Transaction types
export interface Exchange {
  id: string
  postId: string
  requesterId: string
  ownerId: string
  status: ExchangeStatus
  messages: Message[]
  scheduledDate?: Date
  completedDate?: Date
  rating?: ExchangeRating
  createdAt: Date
  updatedAt: Date
}

export type ExchangeStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'in-progress'
  | 'completed'
  | 'cancelled'

export interface Message {
  id: string
  senderId: string
  content: string
  timestamp: Date
  read: boolean
}

export interface ExchangeRating {
  requesterRating: number
  ownerRating: number
  requesterComment?: string
  ownerComment?: string
}

// API Response types
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form types
export interface ContactForm {
  name: string
  email: string
  subject: string
  message: string
}

export interface SearchFilters {
  query?: string
  category?: PostCategory
  type?: PostType
  location?: string
  priceMin?: number
  priceMax?: number
  condition?: ItemCondition
  availability?: PostAvailability
}

// =============================================================================
// DESIGN SYSTEM TYPES
// =============================================================================

// Base component props
export interface BaseComponentProps {
  class?: string
  id?: string
  testId?: string
}

// Button types
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'success'
  | 'warning'
  | 'text'
  | 'outlined'
  | 'raised'

export type ButtonSize =
  | 'small'
  | 'medium'
  | 'large'
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'

export interface ButtonProps extends BaseComponentProps {
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  icon?: string
  iconPosition?: 'left' | 'right'
  type?: 'button' | 'submit' | 'reset'
}

// Input types
export type InputType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'search'
  | 'textarea'

export type InputSize = 'sm' | 'md' | 'lg'

export interface InputProps extends BaseComponentProps {
  type?: InputType
  size?: InputSize
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  error?: string | boolean
  success?: boolean
  icon?: string
  iconPosition?: 'left' | 'right'
  clearable?: boolean
  maxlength?: number
  minlength?: number
  pattern?: string
  autocomplete?: string
}

// File Upload types
export interface FileUploadProps extends BaseComponentProps {
  modelValue?: File | File[] | null
  label?: string
  helperText?: string
  name?: string
  uploadUrl?: string
  mode?: 'basic' | 'advanced'
  accept?: string
  maxFileSize?: number
  multiple?: boolean
  disabled?: boolean
  required?: boolean
  auto?: boolean
  chooseLabel?: string
  uploadLabel?: string
  cancelLabel?: string
  invalidFileSizeMessage?: string
  invalidFileTypeMessage?: string
  fileLimit?: number
  fileLimitMessage?: string
  previewWidth?: number
  showUploadButton?: boolean
  showCancelButton?: boolean
  showProgress?: boolean
  customUpload?: boolean
  emptyMessage?: string
  error?: string | boolean
}

// Card types
export type CardVariant = 'default' | 'glass' | 'elevated' | 'outlined'

export interface CardProps extends BaseComponentProps {
  variant?: CardVariant
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  clickable?: boolean
  loading?: boolean
}

// Table types
export interface TableColumn<T = any> {
  key: string
  label: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (value: any, row: T, index: number) => string | any
}

export interface TableProps<T = any> extends BaseComponentProps {
  columns: TableColumn<T>[]
  data: T[]
  loading?: boolean
  selectable?: boolean
  pagination?: {
    page: number
    size: number
    total: number
  }
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  emptyMessage?: string
}

// Form types
export interface FormField {
  name: string
  label?: string
  type: 'input' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file'
  required?: boolean
  validation?: {
    pattern?: string
    min?: number
    max?: number
    minLength?: number
    maxLength?: number
    custom?: (value: any) => string | boolean
  }
  options?: Array<{ label: string; value: any }>
  placeholder?: string
  disabled?: boolean
}

export interface FormProps extends BaseComponentProps {
  fields?: FormField[]
  layout?: 'vertical' | 'horizontal' | 'inline'
  loading?: boolean
  showSubmit?: boolean
  submitText?: string
  showCancel?: boolean
  cancelText?: string
}

// Design tokens
export interface DesignTokens {
  colors: {
    primary: string
    secondary: string
    success: string
    warning: string
    error: string
    info: string
  }
  spacing: Record<string, string>
  typography: {
    fontFamily: string
    fontSize: Record<string, string>
    fontWeight: Record<string, number>
    lineHeight: Record<string, number>
  }
  borderRadius: Record<string, string>
  shadows: Record<string, string>
  transitions: Record<string, string>
}

// Avatar types
export interface AvatarProps extends BaseComponentProps {
  image?: string
  icon?: string
  label?: string
  size?: 'small' | 'normal' | 'large' | 'xlarge'
  shape?: 'square' | 'circle'
  status?: 'online' | 'offline' | 'away' | 'busy'
  showStatus?: boolean
  verified?: boolean
  clickable?: boolean
  loading?: boolean
}

// Badge types
export interface BadgeProps extends BaseComponentProps {
  value?: string | number
  label?: string
  severity?: 'secondary' | 'info' | 'success' | 'warn' | 'danger' | 'contrast'
  size?: 'small' | 'normal' | 'large'
  variant?: 'filled' | 'outlined' | 'dot'
  icon?: string
  iconPosition?: 'left' | 'right'
  removable?: boolean
  clickable?: boolean
  pulse?: boolean
}

// Rating types
export interface RatingProps extends BaseComponentProps {
  modelValue?: number
  readonly?: boolean
  disabled?: boolean
  stars?: number
  cancel?: boolean
  label?: string
  size?: 'small' | 'normal' | 'large'
  showText?: boolean
  showCount?: boolean
  showBreakdown?: boolean
  totalRatings?: number
  breakdown?: Record<number, number>
  precision?: 'full' | 'half'
}

// Chip types
export interface ChipProps extends BaseComponentProps {
  label?: string
  icon?: string
  image?: string
  removable?: boolean
  variant?: 'filled' | 'outlined' | 'text'
  severity?: 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger'
  size?: 'small' | 'normal' | 'large'
  clickable?: boolean
  selected?: boolean
  disabled?: boolean
}

// Modal types
export interface ModalProps extends BaseComponentProps {
  visible: boolean
  title?: string
  modal?: boolean
  closable?: boolean
  dismissableMask?: boolean
  closeOnEscape?: boolean
  draggable?: boolean
  resizable?: boolean
  maximizable?: boolean
  position?:
    | 'center'
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'topleft'
    | 'topright'
    | 'bottomleft'
    | 'bottomright'
  size?: 'small' | 'medium' | 'large' | 'fullscreen'
  icon?: string
  loading?: boolean
  loadingText?: string
  showDefaultActions?: boolean
  showCancel?: boolean
  showConfirm?: boolean
  cancelText?: string
  confirmText?: string
  confirmSeverity?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'info'
    | 'warn'
    | 'danger'
  actionLoading?: boolean
}
