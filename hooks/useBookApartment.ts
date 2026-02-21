import { useState } from 'react';
import { sanctumApi } from '../services/api.js';
import { Booking } from '../types.js';

export const useBookApartment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bookApartment = async (bookingData: Omit<Booking, 'id' | 'customBookingId' | 'totalPrice' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Booking | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await sanctumApi.createBooking(bookingData);
      if (response.stripeSessionUrl) {
        window.location.href = response.stripeSessionUrl;
        return null;
      } else {
        return response;
      }
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { bookApartment, isLoading, error };
};
