
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppData } from '../../services/useAppData';
import TimelineCalendar from './TimelineCalendar';

const Calendar: React.FC = () => {
  const { t } = useTranslation();
  const { apartments, bookings, blockedDates, onToggleBlock, loading, error } = useAppData();

  if (loading) return <div className="text-white">{t('host_dashboard.calendar.loading')}</div>;
  if (error) return <div className="text-red-500">{t('host_dashboard.calendar.error', { error })}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-serif font-bold mb-4">{t('calendar.booking_calendar')}</h1>
      <TimelineCalendar 
        apartments={apartments} 
        bookings={bookings} 
        blockedDates={blockedDates}
        onToggleBlock={onToggleBlock}
      />
    </div>
  );
};

export default Calendar;
