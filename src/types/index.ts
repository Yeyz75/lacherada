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
