import { Currency } from '../types.js';

export const CURRENCIES: Currency[] = [
  { name: 'Euro', code: 'EUR', symbol: '€' },
  { name: 'US Dollar', code: 'USD', symbol: '$' },
  { name: 'British Pound', code: 'GBP', symbol: '£' },
  { name: 'Swiss Franc', code: 'CHF', symbol: 'CHF' },
  { name: 'Canadian Dollar', code: 'CAD', symbol: 'CA$' },
  { name: 'Australian Dollar', code: 'AUD', symbol: 'A$' },
  { name: 'Japanese Yen', code: 'JPY', symbol: '¥' },
  { name: 'Chinese Yuan', code: 'CNY', symbol: '¥' },
  { name: 'Hong Kong Dollar', code: 'HKD', symbol: 'HK$' },
  { name: 'Singapore Dollar', code: 'SGD', symbol: 'S$' },
  { name: 'Thai Baht', code: 'THB', symbol: '฿' },
  { name: 'Indonesian Rupiah', code: 'IDR', symbol: 'Rp' },
  { name: 'Malaysian Ringgit', code: 'MYR', symbol: 'RM' },
  { name: 'Philippine Peso', code: 'PHP', symbol: '₱' },
  { name: 'Vietnamese Dong', code: 'VND', symbol: '₫' },
];

const STRIPE_FIXED_FEES: { [key: string]: number } = {
    usd: 0.30,
    eur: 0.25,
    gbp: 0.20,
    chf: 0.30,
    cad: 0.30,
    aud: 0.30,
    jpy: 30,
    cny: 2.35,
    hkd: 2.35,
    sgd: 0.35,
    thb: 11,
    idr: 4500,
    myr: 2,
    php: 15,
    vnd: 6000,
};

export const STRIPE_COMMISSION_RATE = 0.043; // 4.3%

export const getStripeCommissionRate = (hostCountry: string, guestCountry: string): number => {
    return STRIPE_COMMISSION_RATE;
};

export const getCurrency = (code?: string): Currency | undefined => {
    if (!code) return undefined;
    return CURRENCIES.find(c => c.code.toLowerCase() === code.toLowerCase());
};

export const getStripeFixedFee = (currencyCode: string): number => {
    return STRIPE_FIXED_FEES[currencyCode.toLowerCase()] || 0.30; // Default to USD fee
};
