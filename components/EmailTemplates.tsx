import React from 'react';
import { Host, Apartment, Booking } from '../types';
import { CheckCircle, Briefcase, Users, Hash, ArrowRight, DollarSign, Calendar, Home, CreditCard, X, MessageSquare, ServerCrash } from 'lucide-react';

interface TemplateProps {
  host: Host;
  apartment: Apartment;
  booking: Booking;
  message?: string;
}

interface ServerCrashTemplateProps {
  error: Error;
}

// Key Styles - "subtle and elegant"
const globalContainerStyle: React.CSSProperties = {
  backgroundColor: '#ffffff', // Clean white background
  padding: '2rem',
  fontFamily: 'sans-serif',
  color: '#374151',
};

const messageContainerStyle: React.CSSProperties = {
  backgroundColor: '#f9fafb', // Subtle grey container for the message
  borderRadius: '0.75rem',
  maxWidth: '600px',
  margin: 'auto',
  border: '1px solid #e5e7eb',
  padding: '2.5rem',
};

const headerStyle: React.CSSProperties = {
  textAlign: 'center',
  paddingBottom: '2rem',
  borderBottom: '1px solid #e5e7eb',
  marginBottom: '2rem'
};

const footerStyle: React.CSSProperties = {
  textAlign: 'center',
  paddingTop: '2rem',
  marginTop: '2rem',
  fontSize: '0.875rem',
  color: '#9ca3af',
  borderTop: '1px solid #e5e7eb'
};

const InfoRow: React.FC<{ icon: React.ElementType, label: string, value: string | number | React.ReactNode }> = ({ icon: Icon, label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #e5e7eb' }}>
    <div style={{ display: 'flex', alignItems: 'center', color: '#6b7280' }}>
      <Icon size={18} style={{ marginRight: '0.75rem' }} />
      <span>{label}</span>
    </div>
    <span style={{ fontWeight: 600, color: '#1f2937' }}>{value}</span>
  </div>
);

const SpecialInfoBlock: React.FC<{ icon: React.ElementType, title: string, content: string | undefined }> = ({ icon: Icon, title, content }) => {
  if (!content) return null;
  return (
    <div style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', color: '#374151', marginBottom: '1rem' }}>
        <Icon size={20} style={{ marginRight: '0.75rem' }} />
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{title}</h3>
      </div>
      <p style={{ color: '#6b7280', whiteSpace: 'pre-line', lineHeight: 1.6, fontSize: '0.9rem', borderLeft: '3px solid #d1d5db', paddingLeft: '1rem', margin: 0 }}>
        {content}
      </p>
    </div>
  );
};

// --- TEMPLATES ---

export const ServerCrashTemplate: React.FC<ServerCrashTemplateProps> = ({ error }) => (
    <div style={globalContainerStyle}>
        <div style={{...messageContainerStyle, borderColor: '#fca5a5'}}>
            <div style={{...headerStyle, borderColor: '#fca5a5'}}>
                <ServerCrash size={40} style={{ margin: 'auto', color: '#ef4444' }} />
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '1rem' }}>Server Crash Report</h1>
                <p style={{ color: '#6b7280', fontSize: '1rem' }}>An unhandled error occurred.</p>
            </div>
            <SpecialInfoBlock 
              icon={ServerCrash} 
              title="Error Details"
              content={`Message: ${error.message}\nStack: ${error.stack}`}
            />
        </div>
    </div>
);

export const DirectMessageTemplate: React.FC<TemplateProps> = ({ host, apartment, booking, message }) => (
    <div style={globalContainerStyle}>
        <div style={messageContainerStyle}>
            <div style={headerStyle}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>New Message Regarding Your Booking</h1>
                <p style={{ color: '#6b7280', fontSize: '1rem', marginTop: '0.5rem' }}>at {apartment.title}</p>
            </div>
            <SpecialInfoBlock 
                icon={MessageSquare} 
                title="Message from your host"
                content={message}
            />
             <div style={{ marginTop: '2rem' }}>
                <InfoRow icon={Hash} label="Booking ID" value={booking.customBookingId || booking.id.substring(0, 8)} />
                <InfoRow icon={Home} label="Apartment" value={apartment.title} />
            </div>
            <div style={footerStyle}>
                <p>Reply to this email to respond.</p>
                <p>&copy; {new Date().getFullYear()} {host.businessName || host.name}</p>
            </div>
        </div>
    </div>
);


export const BookingConfirmationTemplate: React.FC<TemplateProps> = ({ host, apartment, booking }) => {
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div style={globalContainerStyle}>
        <div style={messageContainerStyle}>
            <div style={headerStyle}>
                <CheckCircle size={40} style={{ margin: 'auto', color: '#10b981' }} />
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '1rem' }}>Booking Confirmed!</h1>
                <p style={{ color: '#6b7280', fontSize: '1rem', marginTop: '0.5rem' }}>Your sanctuary awaits.</p>
            </div>

            <div>
                <InfoRow icon={Hash} label="Booking ID" value={booking.customBookingId || booking.id.substring(0, 8)} />
                <InfoRow icon={Home} label="Apartment" value={apartment.title} />
                <InfoRow icon={Briefcase} label="Host" value={host.businessName || host.name} />
                <InfoRow 
                icon={Calendar} 
                label="Dates" 
                value={
                    <div style={{display: 'flex', alignItems: 'center'}}>
                    <span>{formatDate(booking.startDate)}</span>
                    <ArrowRight size={16} style={{ color: '#9ca3af', margin: '0 0.5rem'}}/>
                    <span>{formatDate(booking.endDate)}</span>
                    </div>
                } 
                />
                <InfoRow icon={Users} label="Guests" value={booking.numGuests} />
                <InfoRow icon={DollarSign} label="Total Price" value={`$${booking.totalPrice.toFixed(2)}`} />
            </div>

            <SpecialInfoBlock 
                icon={CreditCard} 
                title="Payment Instructions"
                content={host.paymentInstructions}
            />
        
            <div style={footerStyle}>
                <p>For any questions, please contact your host by replying to this email.</p>
                <p>&copy; {new Date().getFullYear()} {host.businessName || host.name}</p>
            </div>
        </div>
    </div>
  );
};


export const BookingCancellationTemplate: React.FC<TemplateProps> = ({ host, apartment, booking }) => {
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  
    return (
        <div style={globalContainerStyle}>
            <div style={{...messageContainerStyle, borderColor: '#fca5a5'}}>
                <div style={{...headerStyle, borderColor: '#fca5a5'}}>
                    <X size={40} style={{ margin: 'auto', color: '#ef4444' }} />
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '1rem' }}>Booking Cancelled</h1>
                    <p style={{ color: '#6b7280', fontSize: '1rem', marginTop: '0.5rem' }}>A booking for {apartment.title} has been cancelled.</p>
                </div>

                <p style={{textAlign: 'center', color: '#6b7280', lineHeight: 1.6}}>
                    If a deposit was paid, it will be refunded according to the cancellation policy. 
                    We invite you to explore other available sanctuaries in {apartment.city || 'the area'}.
                </p>

                <div style={{ marginTop: '2rem', opacity: 0.8 }}>
                    <InfoRow icon={Hash} label="Booking ID" value={booking.customBookingId || booking.id.substring(0, 8)} />
                    <InfoRow icon={Home} label="Apartment" value={apartment.title} />
                    <InfoRow icon={Calendar} label="Original Check-In" value={formatDate(booking.startDate)} />
                </div>
                
                <div style={{textAlign: 'center', marginTop: '2.5rem'}}>
                    <a href="/" style={{ backgroundColor: '#374151', color: '#ffffff', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: 'bold' }}>Explore Alternatives</a>
                </div>

                <div style={footerStyle}>
                    <p>&copy; {new Date().getFullYear()} {host.businessName || host.name}</p>
                </div>
            </div>
        </div>
    );
  };
