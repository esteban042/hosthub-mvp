import React from 'react';
import { Host, Apartment, Booking } from '../types';
import { CheckCircle, Briefcase, Users, Hash, ArrowRight, DollarSign, Calendar, Home, CreditCard, X } from 'lucide-react';

interface TemplateProps {
  host: Host;
  apartment: Apartment;
  booking: Booking;
}

const containerStyle: React.CSSProperties = {
  backgroundColor: '#111827', 
  padding: '2rem',
  fontFamily: 'sans-serif',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: '#1f2937', 
  borderRadius: '1rem',
  maxWidth: '600px',
  margin: 'auto',
  color: '#d1d5db',
  overflow: 'hidden'
};

const headerStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '2rem 0',
};

const contentStyle: React.CSSProperties = {
  padding: '0 2rem 2rem 2rem',
};

const InfoRow: React.FC<{ icon: React.ElementType, label: string, value: string | number | React.ReactNode }> = ({ icon: Icon, label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #4b5563' }}>
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Icon size={18} style={{ marginRight: '0.75rem' }} />
      <span style={{ fontWeight: 500 }}>{label}</span>
    </div>
    <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '1.125rem' }}>{value}</span>
  </div>
);

const InfoBlock: React.FC<{ icon: React.ElementType, title: string, content: string | undefined }> = ({ icon: Icon, title, content }) => {
  if (!content) return null;
  return (
    <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.7)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #4b5563', marginTop: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', color: '#6ee7b7' }}>
        <Icon size={20} style={{ marginRight: '0.75rem' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>{title}</h3>
      </div>
      <p style={{ color: '#d1d5db', whiteSpace: 'pre-line', lineHeight: 1.6, marginTop: '1rem' }}>
        {content}
      </p>
    </div>
  );
};

export const BookingConfirmationTemplate: React.FC<TemplateProps> = ({ host, apartment, booking }) => {
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div style={containerStyle}>
      <div style={{...cardStyle, border: '1px solid #34d399'}}>
        <div style={headerStyle}>
          <CheckCircle size={50} style={{ margin: 'auto', color: '#6ee7b7', backgroundColor: 'rgba(52, 211, 153, 0.1)', padding: '0.5rem', borderRadius: '9999px' }} />
          <h1 style={{ fontSize: '2.25rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.025em', marginTop: '0.75rem' }}>Booking confirmed!</h1>
          <p style={{ color: '#9ca3af', fontSize: '1.125rem' }}>Your booking was successful and sent to you per email.</p>
        </div>
        <div style={contentStyle}>
          <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.7)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #4b5563' }}>
            <InfoRow icon={Hash} label="Booking ID" value={booking.customBookingId || 'N/A'} />
            <InfoRow icon={Home} label="Apartment" value={apartment.title} />
            <InfoRow icon={Briefcase} label="Host" value={host.name} />
            <InfoRow 
              icon={Calendar} 
              label="Dates" 
              value={
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <span>{formatDate(booking.startDate)}</span>
                  <ArrowRight size={20} style={{ color: '#6ee7b7', margin: '0 0.5rem'}}/>
                  <span>{formatDate(booking.endDate)}</span>
                </div>
              } 
            />
            <InfoRow icon={Users} label="Number of Guests" value={booking.numGuests} />
            <InfoRow icon={DollarSign} label="Total Price" value={`$${booking.totalPrice.toFixed(2)}`} />
          </div>

          <InfoBlock 
            icon={CreditCard} 
            title="Next Steps & Payment"
            content={host.paymentInstructions}
          />
        </div>
      </div>
    </div>
  );
};


export const BookingCancellationTemplate: React.FC<TemplateProps> = ({ host, apartment, booking }) => {
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  
    return (
      <div style={containerStyle}>
        <div style={{...cardStyle, border: '1px solid #f87171'}}>
          <div style={headerStyle}>
            <X size={50} style={{ margin: 'auto', color: '#f87171', backgroundColor: 'rgba(251, 146, 146, 0.1)', padding: '0.5rem', borderRadius: '9999px' }} />
            <h1 style={{ fontSize: '2.25rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.025em', marginTop: '0.75rem' }}>Booking Cancelled</h1>
            <p style={{ color: '#9ca3af', fontSize: '1.125rem' }}>Your booking for {apartment.title} has been cancelled.</p>
          </div>
          <div style={contentStyle}>
            <p style={{textAlign: 'center', color: '#d1d5db', marginBottom: '2rem'}}>
              If you have already paid a deposit, it will be refunded to your original payment method within 3-5 business days. Please explore other available sanctuaries in {apartment.city}.
            </p>
            <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.7)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #4b5563', opacity: 0.6, textDecoration: 'line-through' }}>
                <InfoRow icon={Hash} label="Booking ID" value={booking.customBookingId || 'N/A'} />
                <InfoRow icon={Home} label="Apartment" value={apartment.title} />
                <InfoRow icon={Users} label="Number of Guests" value={booking.numGuests} />
                <InfoRow icon={Calendar} label="Check-In" value={formatDate(booking.startDate)} />
                <InfoRow icon={Calendar} label="Check-Out" value={formatDate(booking.endDate)} />
            </div>
            <div style={{textAlign: 'center', marginTop: '2rem'}}>
                <a href="/" style={{ backgroundColor: '#374151', color: '#ffffff', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: 'bold' }}>Explore Alternatives</a>
            </div>
          </div>
        </div>
      </div>
    );
  };
  