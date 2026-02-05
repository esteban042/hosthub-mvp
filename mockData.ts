
import { Host, Apartment, UserRole, BookingStatus, Booking, SubscriptionType } from './types';

export const MOCK_HOSTS: Host[] = [
  {
    id: 'host-1',
    slug: 'alpine-getaways',
    name: 'Sarah Miller',
    bio: 'Avid mountain explorer and curator of cozy high-altitude retreats with a focus on local timber and hand-woven textiles.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200',
    subscriptionType: SubscriptionType.PREMIUM,
    commissionRate: 5
  },
  {
    id: 'host-2',
    slug: 'urban-retreats',
    name: 'James Chen',
    bio: 'Architect focusing on minimalist urban living. Creating sanctuaries of silence and light in the heart of bustling cities.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200',
    subscriptionType: SubscriptionType.STANDARD,
    commissionRate: 3
  },
  {
    id: 'host-3',
    slug: 'tuscan-sun',
    name: 'Elena Rossi',
    bio: 'Third-generation villa manager dedicated to preserving the rustic elegance of the Italian countryside.',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200&h=200',
    subscriptionType: SubscriptionType.STANDARD,
    commissionRate: 4
  }
];

export const MOCK_APARTMENTS: Apartment[] = [
  {
    id: 'apt-1',
    hostId: 'host-1',
    title: 'Modern Chalet with Valley View',
    description: 'A beautiful timber chalet overlooking the Swiss Alps. Features hand-carved furniture, a stone hearth, and panoramic windows that catch the golden hour perfectly.',
    city: 'Grindelwald',
    capacity: 4,
    bedrooms: 2,
    bathrooms: 2,
    pricePerNight: 250,
    isActive: true,
    priceOverrides: [
      { id: 'pr-1', startDate: '2025-12-20', endDate: '2026-01-05', price: 450, label: 'Holiday Season' }
    ],
    amenities: ['Wifi', 'Kitchen', 'Free Parking', 'Fireplace', 'Air Conditioning'],
    photos: ['https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=800&h=600', 'https://images.unsplash.com/photo-1449156003053-c3ca32454685?auto=format&fit=crop&q=80&w=800&h=600']
  },
  {
    id: 'apt-2',
    hostId: 'host-1',
    title: 'The Hikers Lookout',
    description: 'A refined studio suite at the base of the Eiger trail. Minimalist design meets rustic warmth with wool blankets and locally sourced cedar walls.',
    city: 'Grindelwald',
    capacity: 2,
    bedrooms: 1,
    bathrooms: 1,
    pricePerNight: 125,
    isActive: true,
    amenities: ['Wifi', 'Coffee Maker', 'Fireplace', 'Washer'],
    photos: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800&h=600']
  },
  {
    id: 'apt-3',
    hostId: 'host-2',
    title: 'Minimalist Shibuya Loft',
    description: 'A sanctuary of light and shadow in Tokyo. Features industrial concrete softened by warm oak floors and curated Japanese art.',
    city: 'Tokyo',
    capacity: 2,
    bedrooms: 1,
    bathrooms: 1,
    pricePerNight: 210,
    isActive: true,
    priceOverrides: [
      { id: 'pr-2', startDate: '2025-03-25', endDate: '2025-04-10', price: 320, label: 'Cherry Blossom Peak' }
    ],
    amenities: ['Wifi', 'Air Conditioning', 'Washer', 'Kitchen'],
    photos: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800&h=600']
  },
  {
    id: 'apt-4',
    hostId: 'host-3',
    title: 'Olive Grove Villa',
    description: 'Experience the soul of Tuscany in this 18th-century stone farmhouse. Surrounded by silver-leafed olive trees and the scent of wild rosemary.',
    city: 'Siena',
    capacity: 6,
    bedrooms: 3,
    bathrooms: 3,
    pricePerNight: 450,
    isActive: true,
    amenities: ['Kitchen', 'Free Parking', 'Fireplace', 'Washer', 'Air Conditioning'],
    photos: ['https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&q=80&w=800&h=600']
  }
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'book-1',
    apartmentId: 'apt-1',
    guestEmail: 'traveler@boutique.com',
    startDate: '2025-06-10',
    endDate: '2025-06-15',
    status: BookingStatus.CONFIRMED,
    totalPrice: 1250,
    isDepositPaid: true
  },
  {
    id: 'book-2',
    apartmentId: 'apt-3',
    guestEmail: 'city.mapper@design.jp',
    startDate: '2025-07-01',
    endDate: '2025-07-05',
    status: BookingStatus.REQUESTED,
    totalPrice: 840,
    isDepositPaid: false
  },
  {
    id: 'book-3',
    apartmentId: 'apt-4',
    guestEmail: 'family.rossi@italy.it',
    startDate: '2025-08-12',
    endDate: '2025-08-19',
    status: BookingStatus.CONFIRMED,
    totalPrice: 3150,
    isDepositPaid: true
  }
];
