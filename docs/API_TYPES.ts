/**
 * HanBuy API TypeScript Types
 * 
 * Use these types in your frontend application for type safety
 */

// Base API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User Types
export type UserRole = 'admin' | 'customer' | 'solobox_client';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type ClientLevel = 'standard' | 'premium' | 'vip';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: Address;
  role: UserRole;
  approval_status: ApprovalStatus;
  client_level?: ClientLevel;
  created_at: string;
  updated_at?: string;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  address?: Address;
  role?: UserRole;
}

// Product Types
export type ProductType = 'onhand' | 'preorder';
export type ProductStatus = 'active' | 'inactive' | 'sold_out';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: 'PHP' | 'KRW';
  images: string[];
  category?: string;
  product_type: ProductType;
  status: ProductStatus;
  stock?: number;
  variations?: ProductVariation[];
  created_at: string;
  updated_at?: string;
}

export interface ProductVariation {
  id: string;
  product_id: string;
  name: string;
  value: string;
  price_adjustment?: number;
}

// Cart Types
export type BoxType = 'solo' | 'shared';

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
  box_type_preference?: BoxType;
  created_at: string;
  updated_at?: string;
}

export interface AddToCartRequest {
  user_id: string;
  product_id: string;
  quantity: number;
  box_type_preference?: BoxType;
}

export interface UpdateCartRequest {
  quantity: number;
}

// Order Types
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded';
export type PaymentType = 'full' | 'partial';

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  subtotal: number;
  isf?: number;
  lsf?: number;
  shipping_fee: number;
  solo_shipping_fee?: number;
  shared_shipping_fee?: number;
  total: number;
  currency: 'PHP' | 'KRW';
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_type: PaymentType;
  payment_method?: PaymentMethod;
  downpayment_amount?: number;
  balance?: number;
  qr_code?: string;
  box_type_preference: BoxType;
  shipping_address: Address;
  items: OrderItem[];
  created_at: string;
  updated_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_type: ProductType;
  quantity: number;
  unit_price: number;
  total: number;
  image_url?: string;
  preorder_release_date?: string;
}

export interface CreateOrderRequest {
  user_id: string;
  order_number: string;
  subtotal: number;
  isf?: number;
  lsf?: number;
  shipping_fee?: number;
  solo_shipping_fee?: number;
  shared_shipping_fee?: number;
  total: number;
  currency?: 'PHP' | 'KRW';
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  payment_type?: PaymentType;
  payment_method?: PaymentMethod;
  downpayment_amount?: number;
  balance?: number;
  qr_code?: string;
  box_type_preference: BoxType;
  shipping_address: Address;
  order_items: Omit<OrderItem, 'id' | 'order_id'>[];
}

// Payment Types
export type BankType = 'bdo' | 'bpi' | 'metrobank' | 'gcash' | 'paymaya';

export interface PaymentMethod {
  bank_type: BankType;
  account_number?: string;
  account_name?: string;
}

export interface QRCodeRequest {
  order_id: string;
  amount: number;
  payment_method: PaymentMethod;
}

export interface QRCodeResponse {
  qr_code: string;
  payment_reference: string;
  expires_at: string;
}

export interface PaymentConfirmationRequest {
  order_id: string;
  amount: number;
  payment_proof: File;
  payment_method: PaymentMethod;
}

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  status: 'pending_verification' | 'verified' | 'rejected';
  payment_method: PaymentMethod;
  payment_proof_url?: string;
  verified_at?: string;
  created_at: string;
}

// Invoice Types
export type InvoiceStatus = 'pending' | 'paid' | 'overdue';

export interface Invoice {
  id: string;
  invoice_number: string;
  box_id?: string;
  user_id: string;
  items: InvoiceItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: InvoiceStatus;
  due_date: string;
  paid_at?: string;
  created_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

// Box Types
export type BoxStatus = 'open' | 'closed' | 'shipped' | 'delivered';

export interface Box {
  id: string;
  box_number: string;
  user_id: string;
  status: BoxStatus;
  box_type: BoxType;
  total_weight?: number;
  total_cbm?: number;
  items: BoxItem[];
  created_at: string;
  updated_at?: string;
}

export interface BoxItem {
  id: string;
  box_id: string;
  product_id: string;
  quantity: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
}

export interface BoxPenalty {
  box_id: string;
  days_overdue: number;
  penalty_rate: number;
  penalty_amount: number;
  total_due: number;
}

// Tracking Types
export type TrackingStatus = 'pending' | 'in_transit' | 'delivered' | 'exception';

export interface Tracking {
  tracking_number: string;
  courier: string;
  status: TrackingStatus;
  events: TrackingEvent[];
  estimated_delivery?: string;
}

export interface TrackingEvent {
  timestamp: string;
  location: string;
  status: string;
  description: string;
}

export interface AddTrackingRequest {
  tracking_number: string;
  courier: string;
  description?: string;
  estimated_arrival?: string;
}

// Shipping Types
export interface ShippingQuoteRequest {
  weight: number;
  cbm: number;
  origin: string;
  destination: string;
  box_type: BoxType;
}

export interface ShippingQuote {
  isf: number;
  lsf: number;
  total_shipping: number;
  currency: 'PHP' | 'KRW';
  estimated_days: number;
}

export interface CBMCalculateRequest {
  length: number;
  width: number;
  height: number;
  unit?: 'cm' | 'm';
}

export interface CBMResult {
  cbm: number;
  length: number;
  width: number;
  height: number;
}

// Document Types
export type DocumentType = 'payment_proof' | 'id' | 'invoice' | 'other';

export interface Document {
  id: string;
  user_id: string;
  filename: string;
  url: string;
  type: DocumentType;
  description?: string;
  size: number;
  created_at: string;
}

export interface UploadDocumentRequest {
  file: File;
  type: DocumentType;
  description?: string;
}

// Notification Types
export type NotificationType = 'order' | 'payment' | 'box' | 'system';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface NotificationPreferences {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  order_updates: boolean;
  payment_updates: boolean;
  box_updates: boolean;
}

// Liked Items Types
export interface LikedItem {
  id: string;
  user_id: string;
  product_id: string;
  product?: Product;
  created_at: string;
}

export interface AddLikedItemRequest {
  product_id: string;
}

// Admin Types
export interface DashboardStats {
  total_users: number;
  total_orders: number;
  total_revenue: number;
  pending_approvals: number;
  pending_orders: number;
  recent_orders: Order[];
}

export interface StockAlert {
  product_id: string;
  name: string;
  current_stock: number;
  min_stock: number;
  status: 'low_stock' | 'out_of_stock';
}

// KR Website Types
export interface PriceComparison {
  item_id: string;
  hanbuy_price: number;
  comparisons: WebsiteComparison[];
}

export interface WebsiteComparison {
  website: string;
  price: number;
  currency: 'KRW' | 'PHP';
  url: string;
}

export interface SaleAlert {
  id: string;
  product_name: string;
  original_price: number;
  sale_price: number;
  discount_percent: number;
  website: string;
  url: string;
}

// Query Parameter Types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ProductFilters extends PaginationParams {
  category?: string;
  status?: ProductStatus;
  product_type?: ProductType;
  search?: string;
}

export interface OrderFilters extends PaginationParams {
  user_id?: string;
  status?: OrderStatus;
  payment_status?: PaymentStatus;
}

export interface UserFilters extends PaginationParams {
  role?: UserRole;
  approval_status?: ApprovalStatus;
}

// Error Types
export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'DUPLICATE_ENTRY'
  | 'DATABASE_ERROR'
  | 'RATE_LIMIT_EXCEEDED';

export interface ApiError {
  success: false;
  error: string;
  message?: string;
  code?: ErrorCode;
}


