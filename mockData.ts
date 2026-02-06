import { Host, Apartment, UserRole, BookingStatus, Booking, SubscriptionType } from './types';

export const MOCK_HOSTS: Host[] = [
  {
    id: 'host-1',
    slug: 'alpine-getaways',
    name: 'Sarah Miller',
    bio: 'Avid mountain explorer and curator of cozy high-altitude retreats with a focus on local timber and hand-woven textiles.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200',
    subscriptionType: SubscriptionType.PRO,
    commissionRate: 4,
    contactEmail: 'sarah.miller@alpine.com',
    physicalAddress: 'Via Cantonale 10, 3818 Grindelwald',
    country: 'Switzerland',
    phoneNumber: '+41 79 123 45 67',
    notes: 'Premium host with strong performance in winter bookings.',
    airbnbCalendarLink: 'https://www.airbnb.com/calendar/ical/12345.ics?s=5a0d31b0e3e26f5d6f7b11d3',
    premiumConfig: {
      isEnabled: true,
      images: [
        'https://images.unsplash.com/photo-1548777123-e216912df7d8?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1434394354979-a235cd36269d?auto=format&fit=crop&q=80&w=800'
      ],
      sections: [
        { title: 'The Alpine Philosophy', content: 'Our collection is built on the belief that a true mountain retreat should be a sensory experience. From the scent of dried cedar in our chalets to the crisp morning air on our panoramic terraces, we curate spaces that ground you in nature while elevating your comfort.' },
        { title: 'Local Craftsmanship', content: 'We work exclusively with local Swiss artisans to furnish our properties. Every blanket is hand-woven in the valley, and every table is crafted from fallen timber, ensuring your stay directly supports the heritage of our mountain community.' }
      ]
    }
  },
  {
    id: 'host-2',
    slug: 'urban-retreats',
    name: 'James Chen',
    bio: 'Architect focusing on minimalist urban living. Creating sanctuaries of silence and light in the heart of bustling cities.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200',
    subscriptionType: SubscriptionType.BASIC,
    commissionRate: 3,
    contactEmail: 'james.chen@urban.com',
    physicalAddress: 'Shibuya 1-1, Tokyo',
    country: 'Japan',
    phoneNumber: '+81 90 9876 5432',
    notes: 'Focus on high-tech amenities and modern design. Exploring expansion to Osaka.',
    airbnbCalendarLink: 'https://www.airbnb.com/calendar/ical/67890.ics?s=c8f2a1e7d9b4c0a5f1e6b3a2'
  },
  {
    id: 'host-3',
    slug: 'tuscan-sun',
    name: 'Elena Rossi',
    bio: 'Third-generation villa manager dedicated to preserving the rustic elegance of the Italian countryside.',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200&h=200',
    subscriptionType: SubscriptionType.ENTERPRISE,
    commissionRate: 5,
    contactEmail: 'elena.rossi@tuscan.it',
    physicalAddress: 'Via Chianti 50, 53100 Siena',
    country: 'Italy',
    phoneNumber: '+39 333 1122334',
    notes: 'Manages several high-end villas. Looking to add more properties in Umbria next year.',
    airbnbCalendarLink: 'https://www.airbnb.com/calendar/ical/11223.ics?s=a9b8c7d6e5f4a3b2c1d0e9f8'
  },
  {
    id: 'host-4',
    slug: 'coastal-escapes',
    name: 'Maya Singh',
    bio: 'Passionate about beachfront properties and sustainable tourism.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    subscriptionType: SubscriptionType.PRO,
    commissionRate: 4,
    contactEmail: 'maya.singh@coastal.com',
    physicalAddress: '123 Ocean Drive, Miami',
    country: 'USA',
    phoneNumber: '+1 305 555 1234',
    notes: 'Specializes in luxury beach houses. Considers offering additional services like private chef.',
    airbnbCalendarLink: 'https://www.airbnb.com/calendar/ical/44556.ics?s=f0e1d2c3b4a5f6e7d8c9b0a1'
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
    photos: ['https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=800&h=600', 'https://images.unsplash.com/photo-1449156003053-c3ca32454685?auto=format&fit=crop&q=80&w=800&h=600'],
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d10839.839077209353!2d7.994236814675713!3d46.613304273874316!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x478f7e2c9a9d7013%3A0xc0e0f3e6a0d6a0a0!2sGrindelwald%2C%20Switzerland!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus'
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
    photos: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800&h=600'],
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d10839.839077209353!2d7.994236814675713!3d46.613304273874316!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x478f7e2c9a9d7013%3A0xc0e0f3e6a0d6a0a0!2sGrindelwald%2C%20Switzerland!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus'
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
    photos: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800&h=600'],
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12965.433221971714!2d139.69234839845348!3d35.66070624009714!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x35ef4b64a13d702d%3A0x6b1c2b5d4e1a1b1a!2sShibuya%2C%20Tokyo%2C%20Japan!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2us'
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
    photos: ['https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&q=80&w=800&h=600'],
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2891.8906967011033!2d11.33230831557999!3d43.31885507913417!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x132bc2072129a7d3%3A0x959828e8a6096d24!2sSiena%2C%20Province%20of%20Siena%2C%20Italy!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2us'
  },
  {
    id: 'apt-5',
    hostId: 'host-4',
    title: 'Seaside Villa Azure',
    description: 'Modern villa with breathtaking sea views and direct beach access. Perfect for a luxurious coastal retreat.',
    city: 'Miami',
    capacity: 8,
    bedrooms: 4,
    bathrooms: 4,
    pricePerNight: 600,
    isActive: true,
    amenities: ['Wifi', 'Pool', 'Beach Access', 'Outdoor Shower', 'BBQ Grill', 'Kitchen', 'Air Conditioning'],
    photos: ['https://images.unsplash.com/photo-1600596542815-ffad4d6cdb19?auto=format&fit=crop&q=80&w=800&h=600'],
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d114979.62688028717!2d-80.28695846101967!3d25.782361661339656!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88d9b0a20ec8c111%3A0xff96f271ddad4f65!2sMiami%2C%20FL%2C%20USA!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2us'
  }
];

const currentYear = new Date().getFullYear();

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'book-1',
    apartmentId: 'apt-1',
    guestEmail: 'traveler@boutique.com',
    startDate: `${currentYear}-06-10`,
    endDate: `${currentYear}-06-15`,
    status: BookingStatus.CONFIRMED,
    totalPrice: 1250,
    isDepositPaid: true
  },
  {
    id: 'book-2',
    apartmentId: 'apt-3',
    guestEmail: 'city.mapper@design.jp',
    startDate: `${currentYear}-07-01`,
    endDate: `${currentYear}-07-05`,
    status: BookingStatus.REQUESTED,
    totalPrice: 840,
    isDepositPaid: false
  },
  {
    id: 'book-3',
    apartmentId: 'apt-4',
    guestEmail: 'family.rossi@italy.it',
    startDate: `${currentYear}-08-12`,
    endDate: `${currentYear}-08-19`,
    status: BookingStatus.CONFIRMED,
    totalPrice: 3150,
    isDepositPaid: true
  },
  {
    id: 'book-4',
    apartmentId: 'apt-1',
    guestEmail: 'alpine.lover@example.com',
    startDate: `${currentYear}-01-10`,
    endDate: `${currentYear}-01-12`,
    status: BookingStatus.PAID,
    totalPrice: 500, 
    isDepositPaid: true
  },
  {
    id: 'book-5',
    apartmentId: 'apt-5',
    guestEmail: 'beach.goer@example.com',
    startDate: `${currentYear}-09-01`,
    endDate: `${currentYear}-09-07`,
    status: BookingStatus.CONFIRMED,
    totalPrice: 3600, 
    isDepositPaid: true
  }
];