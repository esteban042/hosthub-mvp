
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
  STANDARD = 'standard',
  PREMIUM = 'premium'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface Host {
  id: string;
  slug: string; 
  name: string;
  bio: string;
  avatar: string;
  subscriptionType: SubscriptionType;
  commissionRate: number; // 3, 4, or 5
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
  pricePerNight: number; // Base price
  priceOverrides?: PriceRule[]; // Seasonal rates
  amenities: string[];
  photos: string[];
  isActive: boolean; 
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
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface BlockedDate {
  id: string;
  apartmentId: string; 
  date: string; 
  reason?: string;
}
