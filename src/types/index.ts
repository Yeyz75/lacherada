// User types
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

export type PostType = 'lend' | 'borrow' | 'sell' | 'donate' | 'exchange' | 'service'

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

export type PostAvailability = 'available' | 'reserved' | 'unavailable' | 'completed'

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

export type ExchangeStatus = 'pending' | 'accepted' | 'declined' | 'in-progress' | 'completed' | 'cancelled'

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