import { Home, Bath, Wind, ParkingCircle, Tv, Utensils, Wifi, Heater, Snowflake, Sun, Star, ShieldCheck, MapPin, Building, BookMarked, DollarSign, Calendar, Search, Users as Guests, Bed, Pin, Flame, WashingMachine, Waves, Coffee, Umbrella, ShowerHead, FlameKindling, CircleHelp, Twitter, Instagram, Facebook, X } from 'lucide-react';

export const THEME_GRAY = 'rgb(168, 162, 158)';
export const EMERALD_ACCENT = 'rgb(52, 211, 153)';
export const CARD_BORDER = 'rgba(255, 255, 255, 0.1)';
export const AMENITY_GREEN = 'rgb(52, 211, 153)';
export const CARD_BG = 'rgba(255, 255, 255, 0.02)';

export const UNIT_TITLE_STYLE = {
  textShadow: '0px 1px 3px rgba(0,0,0,0.7)',
};

export const ALL_AMENITIES = [
  { label: 'Wifi', icon: <Wifi className="w-5 h-5" /> },
  { label: 'TV', icon: <Tv className="w-5 h-5" /> },
  { label: 'Kitchen', icon: <Utensils className="w-5 h-5" /> },
  { label: 'Air Conditioning', icon: <Wind className="w-5 h-5" /> },
  { label: 'Heating', icon: <Heater className="w-5 h-5" /> },
  { label: 'Free Parking', icon: <ParkingCircle className="w-5 h-5" /> },
  { label: 'Washer', icon: <WashingMachine className="w-5 h-5" /> },
  { label: 'Pool', icon: <Waves className="w-5 h-5" /> },
  { label: 'Coffee Maker', icon: <Coffee className="w-5 h-5" /> },
  { label: 'BBQ Grill', icon: <FlameKindling className="w-5 h-5" /> },
  { label: 'Fireplace', icon: <Flame className="w-5 h-5" /> },
  { label: 'Beach Access', icon: <Umbrella className="w-5 h-5" /> },
  { label: 'Outdoor Shower', icon: <ShowerHead className="w-5 h-5" /> },
];

export const CORE_ICONS = {
    Building: (className: string) => <Building className={className} />, 
    Bookings: (className: string) => <BookMarked className={className} />,
    Dollar: (className: string) => <DollarSign className={className} />,
    MapPin: (className: string) => <MapPin className={className} />,
    Star: (className: string) => <Star className={className} />,
    ShieldCheck: (className: string) => <ShieldCheck className={className} />,
    Calendar: (className: string) => <Calendar className={className} />,
    Search: (className: string) => <Search className={className} />,
    Guests: (className: string) => <Guests className={className} />,
    Bed: (className: string) => <Bed className={className} />,
    Bath: (className: string) => <Bath className={className} />,
    Location: (className: string) => <Pin className={className} />,
    Twitter: (className: string) => <Twitter className={className} />,
    Instagram: (className: string) => <Instagram className={className} />,
    Facebook: (className: string) => <Facebook className={className} />,
    X: (className: string) => <X className={className} />
};

export const AMENITY_ICONS: Record<string, (c: string) => React.ReactElement> = {
  'Wifi': (c) => <Wifi className={c} strokeWidth={1.5} />,
  'Kitchen': (c) => <Utensils className={c} strokeWidth={1.5} />,
  'Free Parking': (c) => <ParkingCircle className={c} strokeWidth={1.5} />,
  'Fireplace': (c) => <Flame className={c} strokeWidth={1.5} />,
  'Air Conditioning': (c) => <Wind className={c} strokeWidth={1.5} />,
  'Washer': (c) => <WashingMachine className={c} strokeWidth={1.5} />,
  'Pool': (c) => <Waves className={c} strokeWidth={1.5} />,
  'TV': (c) => <Tv className={c} strokeWidth={1.5} />,
  'Coffee Maker': (c) => <Coffee className={c} strokeWidth={1.5} />,
  'Beach Access': (c) => <Umbrella className={c} strokeWidth={1.5} />,
  'Outdoor Shower': (c) => <ShowerHead className={c} strokeWidth={1.5} />,
  'BBQ Grill': (c) => <FlameKindling className={c} strokeWidth={1.5} />,
  'Default': (c) => <CircleHelp className={c} strokeWidth={1.5} />
};