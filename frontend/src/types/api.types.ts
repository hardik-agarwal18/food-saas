export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface ValidationError {
  path: string;
  message: string;
}

export interface ErrorDetails {
  code: string;
  message: string;
  details?: ValidationError[];
}

export interface ErrorResponse {
  success: false;
  error: ErrorDetails;
  requestId?: string;
  correlationId?: string;
  timestamp?: string;
}

export class ApiError extends Error {
  public code: string;
  public details?: ValidationError[];
  public statusCode: number;

  constructor(message: string, code: string, statusCode: number, details?: ValidationError[]) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

export enum Role {
  ADMIN = 'ADMIN',
  CUSTOMER = 'CUSTOMER',
  DRIVER = 'DRIVER',
  RESTAURANT_OWNER = 'RESTAURANT_OWNER',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export interface User {
  id: string;
  email: string;
  roles: Role[];
  status: UserStatus;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
  preferences?: Record<string, any>;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export enum RestaurantStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export interface Restaurant {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  phoneNumber: string;
  email: string;

  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;

  latitude?: number;
  longitude?: number;

  status: RestaurantStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MenuCategory {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum DietaryPreference {
  VEG = 'VEG',
  NON_VEG = 'NON_VEG',
  VEGAN = 'VEGAN',
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId?: string;
  name: string;
  description?: string;
  price: string | number; // Decimal in DB
  imageUrl?: string;
  isAvailable: boolean;
  sortOrder: number;
  dietaryPreference: DietaryPreference;
  createdAt: string;
  updatedAt: string;
}

export interface MenuModifierGroup {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  isRequired: boolean;
  minSelections: number;
  maxSelections?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MenuModifierItem {
  id: string;
  modifierGroupId: string;
  name: string;
  priceAdjustment: string | number; // Decimal in DB
  isAvailable: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum OrderType {
  DELIVERY = 'DELIVERY',
  PICKUP = 'PICKUP',
}

export interface OrderItemModifier {
  id: string;
  orderItemId: string;
  menuModifierItemId: string;
  name: string;
  price: string | number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  name: string;
  unitPrice: string | number;
  quantity: number;
  specialInstructions?: string;
  modifiers?: OrderItemModifier[];
}

export interface Order {
  id: string;
  customerId: string;
  restaurantId: string;

  status: OrderStatus;
  paymentStatus: PaymentStatus;
  orderType: OrderType;

  subtotal: string | number;
  deliveryFee: string | number;
  taxAmount: string | number;
  discountAmount: string | number;
  totalAmount: string | number;

  restaurantName: string;
  restaurant?: Restaurant;

  deliveryAddress?: Record<string, any>;
  specialInstructions?: string;

  acceptedAt?: string;
  preparingAt?: string;
  readyAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;

  createdAt: string;
  updatedAt: string;

  items?: OrderItem[];
}

export enum DriverStatus {
  OFFLINE = 'OFFLINE',
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  SUSPENDED = 'SUSPENDED',
}

export enum VehicleType {
  BICYCLE = 'BICYCLE',
  MOTORCYCLE = 'MOTORCYCLE',
  CAR = 'CAR',
  VAN = 'VAN',
}

export interface Driver {
  id: string;
  userId: string;

  firstName: string;
  lastName: string;
  phone: string;
  vehicleType: VehicleType;
  vehiclePlateNumber?: string;

  status: DriverStatus;

  currentLatitude?: number;
  currentLongitude?: number;
  lastLocationAt?: string;

  createdAt: string;
  updatedAt: string;
}

export enum DeliveryAssignmentStatus {
  PENDING = 'PENDING',
  OFFERED = 'OFFERED',
  ACCEPTED = 'ACCEPTED',
  DRIVER_ARRIVING = 'DRIVER_ARRIVING',
  PICKED_UP = 'PICKED_UP',
  DELIVERED = 'DELIVERED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export interface DeliveryAssignment {
  id: string;
  orderId: string;
  driverId?: string;
  order?: Order;

  status: DeliveryAssignmentStatus;

  estimatedDistance?: number;
  estimatedDuration?: number;
  deliveryFee: string | number;

  acceptedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  expiresAt?: string;

  createdAt: string;
  updatedAt: string;
}
