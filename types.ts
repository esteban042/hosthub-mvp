
export enum UserRole {
  GUEST = 'guest',
  HOST = 'host',
  ADMIN = 'admin',
}

export enum SubscriptionType {
  BASIC = 'basic',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

export const SUBSCRIPTION_PRICES = {
  [SubscriptionType.BASIC]: 50,
  [SubscriptionType.PRO]: 100,
  [SubscriptionType.ENTERPRISE]: 250,
};

export enum BookingStatus {
    CONFIRMED = 'confirmed',
    PAID = 'paid',
    CANCELED = 'canceled',
    REQUESTED = 'requested',
    PENDING_PAYMENT = 'pending_payment',
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: UserRole;
}

export interface Currency {
  name: string;
  code: string;
  symbol: string;
}

export interface Host {
  id: string;
  userId: string;
  slug: string;
  name: string;
  bio: string;
  avatar: string;
  subscriptionType: SubscriptionType;
  commissionRate: number;
  contactEmail: string;
  physicalAddress: string;
  country: string;
  phoneNumber: string;
  notes: string | null;
  airbnbCalendarLink: string | null;
  paymentInstructions: string | null;
  businessName: string | null;
  businessId: string | null;
  landingPagePicture: string | null;
  premiumConfig: {
    images: string[];
    sections: { title: string; content: string }[];
    isEnabled: boolean;
  } | null;
  terms: string | null;
  conditions: string | null;
  faq: string | null;
  socialMediaLinks?: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
  };
  vat?: number;
  checkInTime?: string;
  checkOutTime?: string;
  checkInInfo?: string;
  welcomeMessage?: string;
  checkoutMessage?: string;
  checkInMessage?: string;
  depositPercentage?: number;
  stripeAccountId?: string;
  stripeActive?: boolean;
  currency?: Currency;
}

export interface Apartment {
  id: string;
  hostId: string;
  title: string;
  description: string;
  address: string;
  city: string;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  pricePerNight: number;
  priceOverrides: { date: string; price: number }[];
  amenities: string[];
  photos: string[];
  isActive: boolean;
  mapEmbedUrl: string | null;
  minStayNights: number;
  maxStayNights: number;
  pageViews?: number;
}

export interface Booking {
  id: string;
  customBookingId?: string;
  apartmentId: string;
  guestName: string;
  guestEmail: string;
  guestCountry: string;
  guestPhone: string;
  guestMessage: string;
  numGuests: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: BookingStatus;
  notes: string | null;
  depositAmount?: number;
  stripeSessionId?: string;
  stripeSessionUrl?: string;
}

export interface BlockedDate {
  id: string;
  apartmentId: string;
  date: string;
}

// Utility to convert snake_case to camelCase
const toCamel = (s: string): string => {
    return s.replace(/([-_][a-z])/ig, ($1) => {
      return $1.toUpperCase()
        .replace('-', '')
        .replace('_', '');
    });
};

const isObject = (o: any): o is Object => {
    return o === Object(o) && !Array.isArray(o) && typeof o !== 'function';
};

export const keysToCamel = <T>(o: any): T => {
    if (isObject(o)) {
      const n: { [key: string]: any } = {};

      Object.keys(o)
        .forEach((k: string) => {
          n[toCamel(k)] = keysToCamel((o as any)[k]);
        });

      return n as T;
    } else if (Array.isArray(o)) {
      return o.map((i) => {
        return keysToCamel(i);
      }) as unknown as T;
    }

    return o as T;
};
