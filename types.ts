export enum BookingStatus {
  REQUESTED = 'requested',
  CONFIRMED = 'confirmed',
  PAID = 'paid',
  REJECTED = 'rejected',
  CANCELED = 'canceled'
}

export enum UserRole {
  ADMIN = 'admin',
  HOST = 'host',
  GUEST = 'guest'
}

export enum SubscriptionType {
  BASIC = 'basic',
  PRO = 'pro',
  ENTERPRISE = 'enterprise'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface PremiumSection {
  title: string;
  content: string;
}

export interface PremiumConfig {
  isEnabled: boolean;
  images: string[];
  sections: PremiumSection[];
}

export interface Host {
  id: string;
  slug: string; 
  name: string;
  bio: string;
  avatar: string;
  subscriptionType: SubscriptionType;
  commissionRate: number; // 3, 4, 5, or 6
  contactEmail?: string;
  physicalAddress?: string;
  country?: string;
  phoneNumber?: string;
  notes?: string; 
  airbnbCalendarLink?: string;
  premiumConfig?: PremiumConfig;
  paymentInstructions?: string; // New: To be included in confirmation emails
}

export interface PriceRule {
  id: string;
  startDate: string;
  endDate: string;
  price: number;
  label?: string;
}

export interface Apartment {
  id: string;
  hostId: string;
  title: string;
  description: string;
  city: string;
  address?: string;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  pricePerNight: number; 
  priceOverrides?: PriceRule[]; 
  amenities: string[];
  photos: string[];
  isActive: boolean; 
  mapEmbedUrl?: string;
}

export interface Booking {
  id: string;
  apartmentId: string;
  guestEmail: string;
  guestPhone?: string;
  numGuests?: number;
  startDate: string; 
  endDate: string; 
  status: BookingStatus;
  totalPrice: number;
  isDepositPaid: boolean; 
  guestMessage?: string;
  depositAmount?: number; // New: Calculated for confirmation
}

export interface BlockedDate {
  id: string;
  apartmentId: string; 
  date: string; 
  reason?: string;
}