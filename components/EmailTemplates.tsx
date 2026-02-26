import React from 'react';
import { Host, Apartment, Booking } from '../types.js';
import { CheckCircle, Briefcase, Users, Hash, ArrowRight, DollarSign, Calendar, Home, CreditCard, X, MessageSquare, ServerCrash, KeySquare, Info, LogOut, MapPin, ClipboardCheck } from 'lucide-react';

interface TemplateProps {
  host: Host;
  apartment: Apartment;
  booking: Booking;
  message?: string;
}

interface ServerCrashTemplateProps {
  error: Error;
}

// --- STYLES ---

const FONT_FAMILY = 'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;';
const FONT_SANS = `font-family: "DM Sans", ${FONT_FAMILY}`;

const globalContainerStyle: React.CSSProperties = {
  backgroundColor: '#f8f9fa',
  padding: '1rem',
};

const messageContainerStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '1rem',
  maxWidth: '600px',
  margin: '1rem auto',
  border: '1px solid #dee2e6',
  padding: '2rem',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
};

const headerStyle: React.CSSProperties = {
  textAlign: 'center',
  paddingBottom: '1.5rem',
  borderBottom: '1px solid #e9ecef',
  marginBottom: '1.5rem',
};

const footerStyle: React.CSSProperties = {
  textAlign: 'center',
  paddingTop: '1.5rem',
  marginTop: '1.5rem',
  fontSize: '0.75rem',
  color: '#6c757d',
  borderTop: '1px solid #e9ecef',
};

// CORRECTED InfoRow: Removed hardcoded text color to support Dark Mode
const InfoRow: React.FC<{ icon: React.ElementType, label: string, value: string | number | React.ReactNode }> = ({ icon: Icon, label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #e9ecef' }}>
      <div style={{ display: 'flex', alignItems: 'center', color: '#495057' }}>
        <Icon size={18} style={{ marginRight: '0.75rem' }} />
        <span style={{ fontWeight: 500 }}>{label}</span>
      </div>
      {/* The explicit color property has been removed from this span to allow email clients to set it automatically */}
      <span style={{ fontWeight: 700, fontSize: '1rem' }}>{value}</span>
    </div>
  );

const SpecialInfoBlock: React.FC<{ icon: React.ElementType, title: string, content: string | undefined | null }> = ({ icon: Icon, title, content }) => {
  if (!content) return null;
  return (
    <div style={{ marginTop: '2rem', backgroundColor: '#f8f9fa', padding: '1.5rem', borderRadius: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', color: '#007bff', marginBottom: '1rem' }}>
        <Icon size={20} style={{ marginRight: '0.75rem' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{title}</h3>
      </div>
      <p style={{ color: '#495057', whiteSpace: 'pre-line', lineHeight: 1.6, fontSize: '0.9rem', margin: 0 }}>
        {content}
      </p>
    </div>
  );
};


// --- TEMPLATES ---

// ... (other templates remain unchanged) ...

export const WelcomeMessageTemplate: React.FC<TemplateProps> = ({ host, apartment, booking }) => (
    <div style={{...globalContainerStyle, fontFamily: FONT_SANS}}>
        <div style={messageContainerStyle}>
            <div style={headerStyle}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Welcome to {apartment.title}!</h1>
                <p style={{ color: '#6c757d', fontSize: '1rem', marginTop: '0.5rem' }}>We are excited to host you.</p>
            </div>
            <p style={{textAlign: 'center', color: '#495057', lineHeight: 1.6}}>
                We hope you have a wonderful stay. If you have any questions, please don't hesitate to reach out.
            </p>
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

export const CheckInMessageTemplate: React.FC<TemplateProps> = ({ host, apartment, booking }) => (
    <div style={{...globalContainerStyle, fontFamily: FONT_SANS}}>
        <div style={messageContainerStyle}>
            <div style={headerStyle}>
                 <CheckCircle size={40} style={{ margin: 'auto', color: '#28a745', backgroundColor: '#d4edda', padding: '8px', borderRadius: '50%' }} />
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '1rem' }}>Your Check-In Details</h1>
                <p style={{ color: '#6c757d', fontSize: '1rem', marginTop: '0.5rem' }}>for your stay at {apartment.title}</p>
            </div>

            <SpecialInfoBlock 
                icon={KeySquare} 
                title="Check-In Instructions"
                content={host.checkInInfo}
            />

            <SpecialInfoBlock 
                icon={Info} 
                title="House Rules"
                content={host.terms}
            />

             <div style={{ marginTop: '2rem' }}>
                <InfoRow icon={Hash} label="Booking ID" value={booking.customBookingId || booking.id.substring(0, 8)} />
                <InfoRow icon={Home} label="Apartment" value={apartment.title} />
            </div>
            <div style={footerStyle}>
                <p>If you have any questions, you can reply to this email.</p>
                <p>&copy; {new Date().getFullYear()} {host.businessName || host.name}</p>
            </div>
        </div>
    </div>
);

export const CheckoutMessageTemplate: React.FC<TemplateProps> = ({ host, apartment, booking }) => {
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    return (
        <div style={{...globalContainerStyle, fontFamily: FONT_SANS}}>
            <div style={messageContainerStyle}>
                <div style={headerStyle}>
                    <LogOut size={40} style={{ margin: 'auto', color: '#007bff' }} />
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '1rem' }}>Checkout Information</h1>
                    <p style={{ color: '#6c757d', fontSize: '1rem', marginTop: '0.5rem' }}>We hope you enjoyed your stay at {apartment.title}.</p>
                </div>

                <SpecialInfoBlock 
                    icon={LogOut} 
                    title="Checkout Instructions"
                    content={host.checkoutMessage}
                />

                 <div style={{ marginTop: '2rem' }}>
                    <InfoRow icon={Hash} label="Booking ID" value={booking.customBookingId || booking.id.substring(0, 8)} />
                    <InfoRow icon={Home} label="Apartment" value={apartment.title} />
                    <InfoRow icon={Calendar} label="Checkout Date" value={formatDate(booking.endDate)} />
                </div>
                <div style={footerStyle}>
                    <p>We hope to see you again soon!</p>
                    <p>&copy; {new Date().getFullYear()} {host.businessName || host.name}</p>
                </div>
            </div>
        </div>
    );
};


export const ServerCrashTemplate: React.FC<ServerCrashTemplateProps> = ({ error }) => (
    <div style={{...globalContainerStyle, fontFamily: FONT_SANS}}>
        <div style={{...messageContainerStyle, borderColor: '#dc3545'}}>
            <div style={{...headerStyle, borderColor: '#dc3545'}}>
                <ServerCrash size={40} style={{ margin: 'auto', color: '#dc3545' }} />
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '1rem' }}>Server Crash Report</h1>
                <p style={{ color: '#6c757d', fontSize: '1rem' }}>An unhandled error occurred.</p>
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
    <div style={{...globalContainerStyle, fontFamily: FONT_SANS}}>
        <div style={messageContainerStyle}>
            <div style={headerStyle}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>New Message Regarding Your Booking</h1>
                <p style={{ color: '#6c757d', fontSize: '1rem', marginTop: '0.5rem' }}>at {apartment.title}</p>
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


// --- CORRECTED AND IMPROVED BOOKING CONFIRMATION ---
export const BookingConfirmationTemplate: React.FC<TemplateProps> = ({ host, apartment, booking }) => {
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const fullAddress = [apartment.address, apartment.city].filter(Boolean).join(', ');

  return (
    <div style={{...globalContainerStyle, fontFamily: FONT_SANS}}>
        <div style={messageContainerStyle}>
            <div style={headerStyle}>
                <CheckCircle size={40} style={{ margin: 'auto', color: '#28a745', backgroundColor: '#d4edda', padding: '8px', borderRadius: '50%' }} />
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '1rem' }}>Booking Confirmed!</h1>
                <p style={{ color: '#6c757d', fontSize: '1rem', marginTop: '0.5rem' }}>Your sanctuary awaits.</p>
            </div>

            <div>
                <InfoRow icon={Hash} label="Booking ID" value={booking.customBookingId || booking.id.substring(0, 8)} />
                <InfoRow icon={Home} label="Apartment" value={apartment.title} />
                <InfoRow icon={MapPin} label="Address" value={fullAddress} />
                <InfoRow icon={Briefcase} label="Host" value={`${host.businessName || host.name} (${host.contactEmail})`} />
                <InfoRow icon={Calendar} label="Check-in Date" value={formatDate(booking.startDate)} />
                <InfoRow icon={Calendar} label="Check-out Date" value={formatDate(booking.endDate)} />
                <InfoRow icon={Users} label="Guests" value={booking.numGuests} />
                <InfoRow icon={DollarSign} label="Total Price" value={`$${booking.totalPrice.toFixed(2)}`} />
                {booking.depositAmount && booking.depositAmount > 0 && (
                  <InfoRow icon={DollarSign} label="Deposit Amount" value={`$${booking.depositAmount.toFixed(2)}`} />
                )}
                <InfoRow icon={ClipboardCheck} label="Booking Status" value={booking.status.charAt(0).toUpperCase() + booking.status.slice(1)} />
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
        <div style={{...globalContainerStyle, fontFamily: FONT_SANS}}>
            <div style={{...messageContainerStyle, borderColor: '#dc3545'}}>
                <div style={{...headerStyle, borderColor: '#dc3545'}}>
                    <X size={40} style={{ margin: 'auto', color: '#dc3545' }} />
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '1rem' }}>Booking Cancelled</h1>
                    <p style={{ color: '#6c757d', fontSize: '1rem', marginTop: '0.5rem' }}>A booking for {apartment.title} has been cancelled.</p>
                </div>

                <p style={{textAlign: 'center', color: '#495057', lineHeight: 1.6}}>
                    If a deposit was paid, it will be refunded according to the cancellation policy. 
                    We invite you to explore other available sanctuaries in {apartment.city || 'the area'}.
                </p>

                <div style={{ marginTop: '2rem', opacity: 0.8 }}>
                    <InfoRow icon={Hash} label="Booking ID" value={booking.customBookingId || booking.id.substring(0, 8)} />
                    <InfoRow icon={Home} label="Apartment" value={apartment.title} />
                    <InfoRow icon={Calendar} label="Original Check-In" value={formatDate(booking.startDate)} />
                </div>
                
                <div style={{textAlign: 'center', marginTop: '2.5rem'}}>
                    <a href="/" style={{ backgroundColor: '#007bff', color: '#ffffff', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: 'bold' }}>Explore Alternatives</a>
                </div>

                <div style={footerStyle}>
                    <p>&copy; {new Date().getFullYear()} {host.businessName || host.name}</p>
                </div>
            </div>
        </div>
    );
  };
