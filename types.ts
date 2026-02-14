
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

export enum BookingStatus {
    CONFIRMED = 'confirmed',
    PAID = 'paid',
    CANCELED = 'canceled',
    REQUESTED = 'requested',
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: UserRole;
}

export interface Host {
  id: string;
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
}

export interface Booking {
  id: string;
  customBookingId?: string;
  apartmentId: string;
  guestName: string;
  guestEmail: string;
  guestCountry: string;
  numGuests: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: BookingStatus;
  notes: string | null;
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
