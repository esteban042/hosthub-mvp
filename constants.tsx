
import { Home, Bath, Wind, ParkingCircle, Tv, Utensils, Wifi, Heater, Snowflake, Sun, Star, ShieldCheck, MapPin, Building, BookMarked, DollarSign, Calendar, Search, Users as Guests, Bed, Pin, Flame, WashingMachine, Waves, Coffee, Umbrella, ShowerHead, FlameKindling, CircleHelp, Twitter, Instagram, Facebook, X } from 'lucide-react';

export const THEME_GRAY = 'rgb(168, 162, 158)';
export const EMERALD_ACCENT = 'rgb(52, 211, 153)';
export const SKY_ACCENT = '#0EA5E9';
export const TERRACOTTA = '#E17C60';
export const MINT_ACCENT = '#6EE7B7';
export const CARD_BORDER = 'rgba(255, 255, 255, 0.1)';
export const AMENITY_GREEN = 'rgb(52, 211, 153)';
export const CARD_BG = 'rgba(255, 255, 255, 0.02)';
export const TEXT_COLOR = '#4A4A4A';
export const BACKGROUND_COLOR = '#F2F0E6';

export const UNIT_TITLE_STYLE = {
  textShadow: '0px 1px 3px rgba(0,0,0,0.7)',
};

export const COUNTRIES = [ 'Albania', 'Andorra', 'Argentina', 'Australia', 'Austria', 'Bangladesh', 'Belarus', 'Belgium', 'Bosnia and Herzegovina', 'Brazil', 'Bulgaria', 'Canada', 'Chile', 'China', 'Colombia', 'Croatia', 'Cyprus', 'Czech Republic', 'Denmark', 'Egypt', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Ireland', 'Israel', 'Italy', 'Japan', 'Kenya', 'Kosovo', 'Latvia', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Malaysia', 'Malta', 'Mexico', 'Moldova', 'Monaco', 'Montenegro', 'Netherlands', 'New Zealand', 'Nigeria', 'North Macedonia', 'Norway', 'Pakistan', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Romania', 'Russia', 'San Marino', 'Saudi Arabia', 'Serbia', 'Singapore', 'Slovakia', 'Slovenia', 'South Africa', 'South Korea', 'Spain', 'Sweden', 'Switzerland', 'Thailand', 'Turkey', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Vatican City', 'Vietnam' ];

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
    Building: (className: string) => <Building className={className} strokeWidth={1.5} />,
    Bookings: (className: string) => <BookMarked className={className} strokeWidth={1.5} />,
    Dollar: (className: string) => <DollarSign className={className} strokeWidth={1.5} />,
    MapPin: (className: string) => <MapPin className={className} strokeWidth={1.5} />,
    Star: (className: string) => <Star className={className} strokeWidth={1.5} />,
    ShieldCheck: (className: string) => <ShieldCheck className={className} strokeWidth={1.5} />,
    Calendar: (className: string) => <Calendar className={className} strokeWidth={1.5} />,
    Search: (className: string) => <Search className={className} strokeWidth={1.5} />,
    Guests: (className: string) => <Guests className={className} strokeWidth={1.5} />,
    Bed: (className: string) => <Bed className={className} strokeWidth={1.5} />,
    Bath: (className: string) => <Bath className={className} strokeWidth={1.5} />,
    Location: (className: string) => <Pin className={className} strokeWidth={1.5} />,
    Twitter: (className: string) => <Twitter className={className} strokeWidth={1.5} />,
    Instagram: (className: string) => <Instagram className={className} strokeWidth={1.5} />,
    Facebook: (className: string) => <Facebook className={className} strokeWidth={1.5} />,
    X: (className: string) => <X className={className} strokeWidth={1.5} />
};

export const AMENITY_ICONS: Record<string, (c: string) => React.ReactElement> = {
  'Wifi': (c) => <Wifi className={c} color={SKY_ACCENT} strokeWidth={1.5} />,
  'Kitchen': (c) => <Utensils className={c} color={SKY_ACCENT} strokeWidth={1.5} />,
  'Free Parking': (c) => <ParkingCircle className={c} color={SKY_ACCENT} strokeWidth={1.5} />,
  'Fireplace': (c) => <Flame className={c} color={SKY_ACCENT} strokeWidth={1.5} />,
  'Air Conditioning': (c) => <Wind className={c} color={SKY_ACCENT} strokeWidth={1.5} />,
  'Washer': (c) => <WashingMachine className={c} color={SKY_ACCENT} strokeWidth={1.5} />,
  'Pool': (c) => <Waves className={c} color={SKY_ACCENT} strokeWidth={1.5} />,
  'TV': (c) => <Tv className={c} color={SKY_ACCENT} strokeWidth={1.5} />,
  'Coffee Maker': (c) => <Coffee className={c} color={SKY_ACCENT} strokeWidth={1.5} />,
  'Beach Access': (c) => <Umbrella className={c} color={SKY_ACCENT} strokeWidth={1.5} />,
  'Outdoor Shower': (c) => <ShowerHead className={c} color={SKY_ACCENT} strokeWidth={1.5} />,
  'BBQ Grill': (c) => <FlameKindling className={c} color={SKY_ACCENT} strokeWidth={1.5} />,
  'Default': (c) => <CircleHelp className={c} color={SKY_ACCENT} strokeWidth={1.5} />
};
