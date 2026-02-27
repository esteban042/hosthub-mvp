import React from 'react';
import { Booking, BookingStatus, Host, Apartment } from '../../types';
import BookingCard from '../booking/BookingCard';
import { CalendarDays, History, X } from 'lucide-react';
import MessageModal from './MessageModal';
import { sanctumApi } from '../../services/api';

interface BookingsProps {
  bookings: Booking[];
  apartments: Apartment[];
  host: Host;
  onUpdateBooking: (booking: Booking, status: BookingStatus) => void;
}

const Bookings: React.FC<BookingsProps> = ({ bookings, apartments, host, onUpdateBooking }) => {
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'past' | 'upcoming-30d' | BookingStatus>('all');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedBooking, setSelectedBooking] = React.useState<Booking | null>(null);
  const [updatingBookingId, setUpdatingBookingId] = React.useState<string | null>(null);
  const todayStr = new Date().toISOString().split('T')[0];

  const handleOpenModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedBooking(null);
    setIsModalOpen(false);
  };

  const handleSendMessage = async (message: string) => {
    if (selectedBooking) {
      try {
        await sanctumApi.sendMessage(selectedBooking.id, message);
        handleCloseModal();
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    }
  };

  const handleSendCheckInMessage = async (booking: Booking) => {
    try {
      await sanctumApi.sendCheckInMessage(booking.id);
    } catch (error) {
      console.error("Failed to send check-in message:", error);
    }
  };

  const handleSendWelcomeMessage = async (booking: Booking) => {
    try {
      await sanctumApi.sendWelcomeMessage(booking.id);
    } catch (error) {
      console.error("Failed to send welcome message:", error);
    }
  };

  const handleSendCheckoutMessage = async (booking: Booking) => {
    try {
      await sanctumApi.sendCheckoutMessage(booking.id);
    } catch (error) {
      console.error("Failed to send checkout message:", error);
    }
  };

  const handleUpdateStatus = async (booking: Booking, status: BookingStatus) => {
    setUpdatingBookingId(booking.id);
    try {
        if (status === BookingStatus.CANCELED) {
            await sanctumApi.cancelBooking(booking.id);
        }
        onUpdateBooking(booking, status); 
    } catch (error) {
        console.error(`Failed to update booking to ${status}:`, error);
    } finally {
        setUpdatingBookingId(null);
    }
  };

  const groupedAndSortedBookings = React.useMemo(() => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const filtered = bookings.filter(b => {
      const isPast = b.endDate < todayStr;

      if (statusFilter === 'upcoming-30d') {
        const startDate = new Date(b.startDate);
        return (b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.PAID) && startDate >= new Date(todayStr) && startDate <= thirtyDaysFromNow;
      }
      if (statusFilter === 'past') return isPast && b.status !== BookingStatus.CANCELED;
      if (statusFilter === BookingStatus.CANCELED) return b.status === BookingStatus.CANCELED;
      if (statusFilter === 'all') return !isPast && b.status !== BookingStatus.CANCELED;
      return !isPast && b.status === statusFilter;
    });

    const sorted = filtered.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    const groups = new Map<string, Booking[]>();
    for (const booking of sorted) {
      const apt = apartments.find(a => a.id === booking.apartmentId);
      if (apt) {
        const aptTitle = apt.title;
        if (!groups.has(aptTitle)) groups.set(aptTitle, []);
        groups.get(aptTitle)?.push(booking);
      }
    }
    return Array.from(groups.entries());
  }, [bookings, apartments, statusFilter, todayStr]);

  const filters = [
    { label: 'All Active', value: 'all', icon: null },
    { label: 'Upcoming (30d)', value: 'upcoming-30d', icon: <CalendarDays className="w-3.5 h-3.5 mr-1.5" /> },
    { label: 'Confirmed', value: BookingStatus.CONFIRMED, icon: null },
    { label: 'Paid', value: BookingStatus.PAID, icon: null },
    { label: 'Past Stays', value: 'past', icon: <History className="w-3.5 h-3.5 mr-1.5" /> },
    { label: 'Canceled', value: BookingStatus.CANCELED, icon: <X className="w-3.5 h-3.5 mr-1.5" /> },
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-12 px-2">
        {filters.map(filter => (
          <button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value as any)}
            className={`px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center ${
              statusFilter === filter.value
                ? 'bg-sky-700/50 text-white shadow-l border border-zinc-800'
                : 'bg-transparent border border-zinc-800'
            }`}
          >
            {filter.icon}
            {filter.label}
          </button>
        ))}
      </div>

      {groupedAndSortedBookings.length > 0 ? (
        groupedAndSortedBookings.map(([title, bks]) => (
          <div key={title} className="mb-12">
            <h3 className="text-2xl font-serif font-bold px-2 tracking-tight mb-6">{title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {bks.map(b => (
                <BookingCard 
                  key={b.id} 
                  booking={b} 
                  apartmentTitle={title} 
                  onUpdateStatus={handleUpdateStatus}
                  onSendMessage={handleOpenModal}
                  onSendCheckInMessage={handleSendCheckInMessage}
                  onSendWelcomeMessage={handleSendWelcomeMessage}
                  onSendCheckoutMessage={handleSendCheckoutMessage}
                  statusFilter={statusFilter}
                  isUpdating={updatingBookingId === b.id}
                />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="py-20 text-center border border-dashed border-stone-800 rounded-[3rem]">
          <p className="text-stone-600 font-medium italic">No bookings match this selection.</p>
        </div>
      )}

      <MessageModal 
        booking={selectedBooking}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSend={handleSendMessage}
      />
    </div>
  );
};

export default Bookings;
