export interface SiteSettings {
  id: string
  site_name: string
  logo_url?: string
  primary_button_text: string
  primary_button_url: string
  secondary_button_text: string
  secondary_button_url: string
  created_at: string
  updated_at: string
}

export interface MenuItem {
  id: string
  title: string
  url?: string
  sort_order: number
  is_active: boolean
  has_dropdown: boolean
  menu_type: 'link' | 'board' | 'dropdown'
  board_table_name?: string
  created_at: string
  updated_at: string
}

export interface Banner {
  id: string
  title: string
  subtitle?: string
  image_url?: string
  button_text?: string
  button_url?: string
  buttons?: Array<{text: string, url: string, style: 'primary' | 'secondary' | 'outline'}>
  background_color: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ServiceCard {
  id: string
  title: string
  icon_url?: string
  link_url?: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PricingPlan {
  id: string
  name: string
  price: string
  original_price?: string
  tag?: string
  tag_color: string
  description?: string
  features?: string[]
  image_url?: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CustomerReview {
  id: string
  customer_name: string
  rating: number
  review_text: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface EventBanner {
  id: string
  title: string
  description?: string
  image_url?: string
  link_url?: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface FooterSettings {
  id: string
  company_name: string
  logo_url?: string
  logo_link_url?: string
  address?: string
  phone?: string
  business_hours?: string
  qr_codes?: Array<{name: string, url: string}>
  app_download_text: string
  app_download_subtitle?: string
  app_store_links?: Array<{name: string, url: string, icon: string}>
  feature_image_url?: string
  gallery_images?: Array<{name: string, url: string}>
  background_color: string
  created_at: string
  updated_at: string
} 