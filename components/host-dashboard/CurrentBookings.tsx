import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Booking, Apartment, BookingStatus } from '../../types';
import BookingCard from '../booking/BookingCard';
import BookingListItem from '../booking/BookingListItem';

interface CurrentBookingsProps {
  bookings: Booking[];
  apartments: Apartment[];
  onUpdateStatus: (booking: Booking, status: BookingStatus) => void;
}

const CurrentBookings: React.FC<CurrentBookingsProps> = ({ bookings, apartments, onUpdateStatus }) => {
  const { t } = useTranslation();
  const [currentTabFilter, setCurrentTabFilter] = useState<'current' | 'check-in' | 'check-out'>('current');

  const { guestsCurrentlyIn, checkInsToday, checkOutsToday } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const hostAptIds = apartments.map(a => a.id);
    const relevantBookings = bookings.filter(b => hostAptIds.includes(b.apartmentId) && b.status !== BookingStatus.CANCELED);
    
    const guestsCurrentlyIn = relevantBookings.filter(b => {
        const startDate = new Date(b.startDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(b.endDate);
        endDate.setHours(0, 0, 0, 0);
        return startDate <= today && endDate >= today;
    });

    const checkInsToday = relevantBookings.filter(b => {
        const startDate = new Date(b.startDate);
        startDate.setHours(0, 0, 0, 0);
        return startDate.getTime() === today.getTime();
    });

    const checkOutsToday = relevantBookings.filter(b => {
        const endDate = new Date(b.endDate);
        endDate.setHours(0, 0, 0, 0);
        return endDate.getTime() === today.getTime();
    });

    return { guestsCurrentlyIn, checkInsToday, checkOutsToday };
  }, [bookings, apartments]);

  return (
    <div>
      <div className="flex items-center px-1 space-x-2">
        <button onClick={() => setCurrentTabFilter('current')} className={`px-6 py-3 mb-8 gap-3 text-[11px] font-black uppercase tracking-[0.2em] rounded-xl ${currentTabFilter === 'current' ? 'bg-sky-700/50 text-white border border-zinc-800' : 'bg-transparent border border-zinc-800 text-charcoal-border'}`}>{t('host_dashboard.current_bookings.current_stays')}</button>
        <button onClick={() => setCurrentTabFilter('check-in')} className={`px-6 py-3 mb-8 gap-3 text-[11px] font-black uppercase tracking-[0.2em] rounded-xl ${currentTabFilter === 'check-in' ? 'bg-sky-700/50 text-white border border-zinc-800' : 'bg-transparent border border-zinc-800 text-charcoal-darker'}`}>{t('host_dashboard.current_bookings.check_ins_today')}</button>
        <button onClick={() => setCurrentTabFilter('check-out')} className={`px-6 py-3 mb-8 gap-3 text-[11px] font-black uppercase tracking-[0.2em] rounded-xl ${currentTabFilter === 'check-out' ? 'bg-sky-700/50 text-white border border-zinc-800' : 'bg-transparent border border-zinc-800 text-charcoal-darker'}`}>{t('host_dashboard.current_bookings.check_outs_today')}</button>
      </div>

      {currentTabFilter === 'current' && (
        <div>
          <h3 className="text-2xl font-serif font-bold text-charcoal px-2 tracking-tight">{t('host_dashboard.current_bookings.currently_in_unit')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-4">
            {guestsCurrentlyIn.length > 0 ? (
              guestsCurrentlyIn.map(b => {
                const aptTitle = apartments.find(a => a.id === b.apartmentId)?.title || t('host_dashboard.current_bookings.unknown_unit');
                return (
                  <BookingCard
                    key={b.id}
                    booking={b}
                    apartmentTitle={aptTitle}
                    onUpdateStatus={onUpdateStatus}
                    statusFilter={'all'}
                    showButtons={false}
                  />
                );
              })
            ) : (
              <div className="col-span-full py-20 text-center border border-dashed border-charcoal/20 rounded-[3rem]">
                <p className="text-charcoal/60 font-medium italic">{t('host_dashboard.current_bookings.no_guests')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {currentTabFilter === 'check-in' && (
        <div>
          <h3 className="text-2xl font-serif font-bold text-charcoal px-2 tracking-tight">{t('host_dashboard.current_bookings.check_ins_today')}</h3>
          <div className="space-y-6 mt-4">
            {checkInsToday.length > 0 ? (
              checkInsToday.map(b => {
                const aptTitle = apartments.find(a => a.id === b.apartmentId)?.title || t('host_dashboard.current_bookings.unknown_unit');
                return <BookingListItem key={b.id} booking={b} apartmentTitle={aptTitle} statusFilter={'all'} onUpdateStatus={onUpdateStatus} />;
              })
            ) : (
              <div className="py-20 text-center border border-dashed border-charcoal/20 rounded-[3rem]">
                <p className="text-charcoal/60 font-medium italic">{t('host_dashboard.current_bookings.no_check_ins')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {currentTabFilter === 'check-out' && (
        <div>
          <h3 className="text-2xl font-serif font-bold text-charcoal px-2 tracking-tight">{t('host_dashboard.current_bookings.check_outs_today')}</h3>
          <div className="space-y-6 mt-4">
            {checkOutsToday.length > 0 ? (
              checkOutsToday.map(b => {
                const aptTitle = apartments.find(a => a.id === b.apartmentId)?.title || t('host_dashboard.current_bookings.unknown_unit');
                return <BookingListItem key={b.id} booking={b} apartmentTitle={aptTitle} statusFilter={'all'} onUpdateStatus={onUpdateStatus} />;
              })
            ) : (
              <div className="py-20 text-center border border-dashed border-charcoal/20 rounded-[3rem]">
                <p className="text-charcoal/60 font-medium italic">{t('host_dashboard.current_bookings.no_check_outs')}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrentBookings;
