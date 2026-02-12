
import { Booking, BlockedDate, BookingStatus } from '../types';

/**
 * Checks if two date ranges overlap.
 * Range 1: [s1, e1], Range 2: [s2, e2]
 * Overlap if s1 < e2 AND e1 > s2
 */
export const isOverlapping = (
  s1: string,
  e1: string,
  s2: string,
  e2: string
): boolean => {
  const start1 = new Date(s1).getTime();
  const end1 = new Date(e1).getTime();
  const start2 = new Date(s2).getTime();
  const end2 = new Date(e2).getTime();
  return start1 < end2 && end1 > start2;
};

/**
 * Validates if an apartment is available for the given dates.
 * Considers confirmed and requested bookings to ensure date security.
 */
export const checkAvailability = (
  apartmentId: string,
  startDate: string,
  endDate: string,
  existingBookings: Booking[],
  blockedDates: BlockedDate[]
): { available: boolean; conflicts: (Booking | BlockedDate)[] } => {
  const conflicts: (Booking | BlockedDate)[] = [];

  // Check Active Bookings (Confirmed OR Requested)
  const bookingConflicts = existingBookings.filter(
    (b) =>
      b.apartmentId === apartmentId &&
      (b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.PAID) &&
      isOverlapping(startDate, endDate, b.startDate, b.endDate)
  );
  conflicts.push(...bookingConflicts);

  // Check Manual Blocks
  const manualConflicts = blockedDates.filter(
    (d) => {
      const isCorrectApt = d.apartmentId === apartmentId || d.apartmentId === 'all';
      if (!isCorrectApt) return false;
      
      const blockTime = new Date(d.date).getTime();
      const startTime = new Date(startDate).getTime();
      const endTime = new Date(endDate).getTime();
      return blockTime >= startTime && blockTime < endTime;
    }
  );
  conflicts.push(...manualConflicts);

  return {
    available: conflicts.length === 0,
    conflicts,
  };
};

/**
 * Checks for warnings (pending requests that overlap)
 */

