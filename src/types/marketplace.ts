import type { PostgrestError } from '@supabase/supabase-js'

export type ListingType =
  | 'lend'
  | 'borrow'
  | 'sell'
  | 'donate'
  | 'exchange'
  | 'service'

export type PricingModel =
  | 'free'
  | 'fixed'
  | 'negotiable'
  | 'donation'
  | 'request'

export type ItemCondition = 'new' | 'like_new' | 'good' | 'fair' | 'poor'

export type ItemStatus =
  | 'draft'
  | 'published'
  | 'paused'
  | 'completed'
  | 'archived'

export type FulfillmentOption =
  | 'in_person'
  | 'pickup'
  | 'delivery'
  | 'shipping'
  | 'digital'

export interface Category {
  id: string
  slug: string
  name: string
  description?: string | null
  icon?: string | null
  parentId?: string | null
  isActive: boolean
  sortOrder: number
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface ItemImage {
  id: string
  itemId: string
  storagePath: string
  publicUrl?: string | null
  position: number
  metadata: Record<string, unknown>
  createdAt: string
}

export interface Item {
  id: string
  userId: string
  categoryId?: string | null
  title: string
  slug?: string | null
  description?: string | null
  listingType: ListingType
  pricingMode: PricingModel
  price?: number | null
  currency: string
  allowNegotiation: boolean
  quantity: number
  condition?: ItemCondition | null
  fulfillmentOptions: FulfillmentOption[]
  status: ItemStatus
  isActive: boolean
  availabilityStart?: string | null
  availabilityEnd?: string | null
  locationCity?: string | null
  locationState?: string | null
  locationCountry?: string | null
  latitude?: number | null
  longitude?: number | null
  contactMethod?: string | null
  tags: string[]
  metadata: Record<string, unknown>
  rentalTerms?: Record<string, unknown> | null
  exchangeTerms?: string | null
  viewCount: number
  favoriteCount: number
  lastMessageAt?: string | null
  publishedAt?: string | null
  createdAt: string
  updatedAt: string
  category?: Category
  images?: ItemImage[]
  userProfile?: {
    displayName?: string | null
    avatarUrl?: string | null
  }
}

export interface CreateItemInput {
  userId: string
  categoryId?: string | null
  title: string
  description?: string | null
  listingType: ListingType
  pricingMode?: PricingModel
  price?: number | null
  currency?: string
  allowNegotiation?: boolean
  quantity?: number
  condition?: ItemCondition | null
  fulfillmentOptions?: FulfillmentOption[]
  status?: ItemStatus
  isActive?: boolean
  availabilityStart?: string | Date | null
  availabilityEnd?: string | Date | null
  locationCity?: string | null
  locationState?: string | null
  locationCountry?: string | null
  latitude?: number | null
  longitude?: number | null
  contactMethod?: string | null
  tags?: string[]
  metadata?: Record<string, unknown>
  rentalTerms?: Record<string, unknown> | null
  exchangeTerms?: string | null
}

export interface UpdateItemInput
  extends Partial<Omit<CreateItemInput, 'userId'>> {
  status?: ItemStatus
  isActive?: boolean
  publishedAt?: string | Date | null
}

export interface ItemFilters {
  query?: string
  categoryId?: string
  listingType?: ListingType
  pricingMode?: PricingModel
  minPrice?: number
  maxPrice?: number
  country?: string
  state?: string
  city?: string
  tags?: string[]
  fulfillmentOption?: FulfillmentOption
  status?: ItemStatus
  userId?: string
  onlyPublished?: boolean
}

export interface PaginationOptions {
  page?: number
  limit?: number
}

export interface PaginationMetadata {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResult<T> {
  data: T[]
  pagination: PaginationMetadata
}

export interface Favorite {
  id: string
  userId: string
  itemId: string
  createdAt: string
  item?: Item
}

export interface MessageThread {
  id: string
  itemId: string
  senderId: string
  recipientId: string
  content: string
  isRead: boolean
  createdAt: string
  readAt?: string | null
  metadata: Record<string, unknown>
}

export interface UserRating {
  id: string
  itemId?: string | null
  raterId: string
  rateeId: string
  rating: number
  review?: string | null
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface UploadImageResult {
  image: ItemImage
  publicUrl?: string | null
}

export interface ItemServiceError {
  message: string
  context?: string
  cause?: PostgrestError | Error
}
