import { Home, Bath, Wind, ParkingCircle, Tv, Utensils, Wifi, Heater, Snowflake, Sun, Star, ShieldCheck, MapPin, Building, BookMarked, DollarSign, Calendar, Search, Users as Guests, Bed, Pin } from 'lucide-react';

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
  { label: 'Air Conditioning', icon: <Snowflake className="w-5 h-5" /> },
  { label: 'Heating', icon: <Heater className="w-5 h-5" /> },
  { label: 'Free Parking', icon: <ParkingCircle className="w-5 h-5" /> },
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
    Location: (className: string) => <Pin className={className} />
}
