import React from 'react';
import { useTranslation } from 'react-i18next';

interface BookingPriceBreakdownProps {
  pricePerNight: number;
  nights: number;
  serviceFee: number;
  totalPrice: number;
}

const BookingPriceBreakdown: React.FC<BookingPriceBreakdownProps> = ({ pricePerNight, nights, serviceFee, totalPrice }) => {
  const { t } = useTranslation();

  return (
    <div className="my-4 p-4 border border-stone-200 rounded-lg bg-stone-50 text-sm">
        <div className="flex justify-between items-center py-2">
            <span className="text-stone-600">{t('booking_price_breakdown.nights_at_price', { count: nights, price: pricePerNight })}</span>
            <span className="font-semibold">${(nights * pricePerNight).toFixed(0)}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-t border-stone-200">
            <span className="text-stone-600">{t('booking_price_breakdown.service_fee')}</span>
            <span className="font-semibold">${serviceFee.toFixed(0)}</span>
        </div>
        <div className="flex justify-between items-center pt-2 mt-2 border-t-2 border-stone-300">
            <span className="font-bold text-base">{t('booking_price_breakdown.total')}</span>
            <span className="font-bold text-base">${totalPrice.toFixed(0)}</span>
        </div>
    </div>
  );
};

export default BookingPriceBreakdown;
