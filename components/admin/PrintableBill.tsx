
import React from 'react';
import { Host, Booking } from '../../types';

interface PrintableBillProps {
  host: Host;
  bookings: Booking[];
  totalBookingVolume: number;
  commission: number;
  subscriptionPrice: number;
  totalDue: number;
  billingPeriod: string;
}

const PrintableBill: React.FC<PrintableBillProps> = ({ 
  host, bookings, totalBookingVolume, commission, subscriptionPrice, totalDue, billingPeriod 
}) => {

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-8 bg-white text-charcoal font-sans">
      <div id="bill-content">
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-3xl font-bold">Invoice</h1>
            <p className="text-stone-500">Bill to: {host.name}</p>
            <p className="text-stone-500">{host.email}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold">{billingPeriod}</h2>
            <p className="text-stone-500">Invoice Date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="mb-10">
          <h3 className="font-bold text-lg mb-4 border-b pb-2">Bookings Summary</h3>
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="py-2">Booking ID</th>
                <th className="py-2">Dates</th>
                <th className="py-2">Guest</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id} className="border-b border-stone-200">
                  <td className="py-2">#{b.id.substring(0, 8)}</td>
                  <td className="py-2">{b.startDate} to {b.endDate}</td>
                  <td className="py-2">{b.guestName}</td>
                  <td className="py-2 text-right">${b.totalPrice.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mb-10">
          <div className="w-full md:w-1/2 lg:w-1/3">
            <div className="flex justify-between py-2">
              <span className="font-medium">Total Booking Volume:</span>
              <span>${totalBookingVolume.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-medium">Commission ({host.commissionRate}%):</span>
              <span className="text-rose-500">+ ${commission.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-medium">Subscription Fee:</span>
              <span className="text-rose-500">+ ${subscriptionPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-4 border-t-2 border-charcoal mt-4">
              <span className="font-bold text-xl">Total Due:</span>
              <span className="font-bold text-xl">${totalDue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="text-center text-stone-500 text-xs">
          <p>Thank you for your business!</p>
          <p>Please make payment within 30 days of the invoice date.</p>
        </div>
      </div>

      <div className="mt-10 text-center print:hidden">
          <button 
            onClick={handlePrint} 
            className="bg-cyan-700/80 text-white py-3 px-8 rounded-lg hover:bg-sky-700/30 transition-colors shadow-lg"
          >
            Print Bill
          </button>
      </div>
    </div>
  );
};

export default PrintableBill;
