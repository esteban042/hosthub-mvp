
import React, { useState, useEffect } from 'react';
import { Host, Booking } from '../../types';
import { sanctumApi } from '../../services/api';

interface PrintableBillProps {
  host: Host;
  bookings: Booking[];
  totalBookingVolume: number;
  commission: number;
  subscriptionPrice: number;
  totalDue: number; // This will now be just the subscription price
  billingPeriod: string;
}

const PrintableBill: React.FC<PrintableBillProps> = ({ 
  host, bookings, totalBookingVolume, commission, subscriptionPrice, totalDue, billingPeriod 
}) => {
  const [companyInfo, setCompanyInfo] = useState({
    name: "",
    addressLine1: "",
    addressLine2: "",
    email: "",
    website: "",
  });

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const info = await sanctumApi.get('/api/v1/misc/company-info');
        setCompanyInfo(info);
      } catch (error) {
        console.error("Error fetching company info:", error);
      }
    };

    fetchCompanyInfo();
  }, []);

  const handlePrint = () => {
    const printContents = document.getElementById("bill-content")?.innerHTML;
    const originalContents = document.body.innerHTML;
    if (printContents) {
        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload(); // Reload to restore modal functionality
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' });
  };
  
  const currencySymbol = host.currency?.symbol || '$';

  return (
    <div className="bg-white text-charcoal font-sans w-full max-w-5xl mx-auto">
      <div id="bill-content" className="p-10 bg-white">
        {/* Header with Company Info and Invoice Title */}
        <header className="flex justify-between items-start pb-8 border-b-2 border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{companyInfo.name}</h2>
            <p className="text-sm text-gray-500">{companyInfo.addressLine1}</p>
            <p className="text-sm text-gray-500">{companyInfo.addressLine2}</p>
            <p className="text-sm text-gray-500">{companyInfo.email}</p>
            <p className="text-sm text-gray-500">{companyInfo.website}</p>
          </div>
          <div className="text-right">
            <h1 className="text-4xl font-bold text-gray-800 uppercase">Invoice</h1>
            <p className="text-sm text-gray-500 mt-2">Invoice Date: {new Date().toLocaleDateString()}</p>
            <p className="text-sm text-gray-500">Billing Period: {billingPeriod}</p>
          </div>
        </header>

        {/* Bill To Section */}
        <section className="mt-8 mb-12">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Bill To</h3>
          <div className="mt-2">
            <p className="text-lg font-bold text-gray-900">{host.name}</p>
            <p className="text-gray-600">{host.contactEmail}</p>
            {host.physicalAddress && <p className="text-gray-600">{host.physicalAddress}</p>}
          </div>
        </section>

        {/* Bookings Summary Table */}
        <section className="mb-12">
          <h3 className="font-bold text-lg text-gray-800 mb-4 border-b pb-2">Bookings Summary</h3>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 font-semibold text-sm">Booking ID</th>
                <th className="p-3 font-semibold text-sm">Dates</th>
                <th className="p-3 font-semibold text-sm">Guest</th>
                <th className="p-3 font-semibold text-sm text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id} className="border-b border-gray-100">
                  <td className="p-3">#{b.customBookingId || b.id.substring(0, 8)}</td>
                  <td className="p-3">{formatDate(b.startDate)} to {formatDate(b.endDate)}</td>
                  <td className="p-3">{b.guestName}</td>
                  <td className="p-3 text-right">{currencySymbol}{b.totalPrice.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Financial Summary */}
        <section className="mt-10">
          <div className="w-full">
             <h3 className="font-bold text-lg text-gray-800 mb-4 border-b pb-2">Account Summary</h3>
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="py-2 text-gray-600">Total Booking Volume</td>
                  <td className="py-2 text-right">{currencySymbol}{totalBookingVolume.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">Commission ({host.commissionRate}%) Deducted from Payout</td>
                  <td className="py-2 text-right text-green-600">({currencySymbol}{commission.toFixed(2)})</td>
                </tr>
                <tr className="font-medium">
                  <td className="py-2">Subscription Fee</td>
                  <td className="py-2 text-right">{currencySymbol}{subscriptionPrice.toFixed(2)}</td>
                </tr>
                <tr className="font-bold text-xl border-t-2 border-charcoal mt-4">
                  <td className="py-4">Amount Due</td>
                  <td className="py-4 text-right">{currencySymbol}{totalDue.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-gray-500 text-xs pt-8 mt-12 border-t">
          <p>Thank you for your partnership!</p>
          <p>The amount due will be automatically charged. If you have any questions, please contact us at {companyInfo.email}.</p>
        </footer>
      </div>

      <div className="mt-10 text-center print:hidden">
          <button 
            onClick={handlePrint} 
            className="bg-cyan-700/80 text-white py-3 px-8 rounded-lg hover:bg-cyan-700/50 transition-colors shadow-lg"
          >
            Print or Save as PDF
          </button>
      </div>
    </div>
  );
};

export default PrintableBill;
