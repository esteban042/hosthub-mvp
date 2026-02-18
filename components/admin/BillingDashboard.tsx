
import React, { useState, useMemo } from 'react';
import { Host, Apartment, Booking, BookingStatus, SUBSCRIPTION_PRICES } from '../../types';
import PrintableBill from './PrintableBill';
import Modal from '../Modal';
import { ArrowLeft } from 'lucide-react';

interface BillingDashboardProps {
  hosts: Host[];
  apartments: Apartment[];
  bookings: Booking[];
  onClose: () => void;
}

const BillingDashboard: React.FC<BillingDashboardProps> = ({ hosts, apartments, bookings, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isBillVisible, setIsBillVisible] = useState(false);
  const [selectedBillData, setSelectedBillData] = useState<any | null>(null);

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const monthlyHostData = useMemo(() => {
    return hosts.map(host => {
        const hostApartmentIds = apartments.filter(a => a.hostId === host.id).map(a => a.id);
        
        const hostBookingsInMonth = bookings.filter(b => 
            hostApartmentIds.includes(b.apartmentId) &&
            (b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.PAID) &&
            new Date(b.startDate).getMonth() === currentMonth.getMonth() &&
            new Date(b.startDate).getFullYear() === currentMonth.getFullYear()
        );

        const totalBookingVolume = hostBookingsInMonth.reduce((sum, b) => sum + b.totalPrice, 0);
        const commission = totalBookingVolume * (host.commissionRate / 100);
        const subscriptionPrice = SUBSCRIPTION_PRICES[host.subscriptionType] || 0;
        const totalDue = commission + subscriptionPrice;

        return {
            hostId: host.id,
            hostName: host.name,
            hostEmail: host.contactEmail,
            totalBookingVolume,
            commission,
            subscriptionPrice,
            totalDue,
            numBookings: hostBookingsInMonth.length,
            billData: {
                host,
                bookings: hostBookingsInMonth,
                totalBookingVolume,
                commission,
                subscriptionPrice,
                totalDue,
                billingPeriod: currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })
            }
        };
    });
  }, [hosts, apartments, bookings, currentMonth]);


  const handleGenerateBill = (hostId: string) => {
    const data = monthlyHostData.find(d => d.hostId === hostId);
    if (data) {
        setSelectedBillData(data.billData);
        setIsBillVisible(true);
    }
  };

  return (
    <div className="bg-white/50 p-8 rounded-[2rem] border border-gray-700 shadow-xl mt-12 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 rounded-full hover:bg-stone-100 transition-colors">
                <ArrowLeft className="w-6 h-6 text-charcoal" />
            </button>
            <h3 className="text-2xl font-bold text-charcoal">Host Billing</h3>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={goToPreviousMonth} className="p-2 rounded-full hover:bg-stone-100">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="text-lg font-bold text-charcoal">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
          <button onClick={goToNextMonth} className="p-2 rounded-full hover:bg-stone-100">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {monthlyHostData.map(data => (
            <div key={data.hostId} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="font-bold text-lg text-gray-800">{data.hostName}</h4>
                        <p className="text-sm text-stone-500">{data.hostEmail}</p>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        {currentMonth.toLocaleString('default', { month: 'short', year: 'numeric' })}
                    </span>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Booking Volume:</span>
                        <span className="font-bold text-gray-800">${data.totalBookingVolume.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Commission ({hosts.find(h => h.id === data.hostId)?.commissionRate}%):</span>
                        <span className="font-bold text-green-600">${data.commission.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 mt-2">
                        <span className="font-bold text-gray-600">Total Due:</span>
                        <span className="font-bold text-lg text-gray-900">${data.totalDue.toFixed(2)}</span>
                    </div>
                </div>
                <button 
                    onClick={() => handleGenerateBill(data.hostId)}
                    className="mt-4 w-full bg-cyan-700/80 text-white py-2 rounded-lg hover:bg-cyan-700/50 transition-colors font-semibold"
                >
                    Generate Bill
                </button>
            </div>
        ))}
      </div>

      {isBillVisible && selectedBillData && (
        <Modal isOpen={isBillVisible} onClose={() => setIsBillVisible(false)} title={`Bill for ${selectedBillData.host.name}`}>
          <PrintableBill {...selectedBillData} />
        </Modal>
      )}
    </div>
  );
};

export default BillingDashboard;
