import React from 'react';
import { Globe, CreditCard, Calendar, MessageCircle, BarChart2, Shield, Rocket } from 'lucide-react';

const Feature: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => {
  return (
    <div className="bg-white/80 p-6 rounded-lg shadow-md text-center">
      <div className="flex justify-center mb-4">
        <div className="bg-brand-green/10 text-brand-green rounded-lg p-3">
          {icon}
        </div>
      </div>
      <div>
        <h3 className="text-xl font-bold text-charcoal mb-2">{title}</h3>
        <p className="text-charcoal/80">{children}</p>
      </div>
    </div>
  );
};

const Process: React.FC = () => {
  return (
    <div 
      id="process" 
      className="py-24 sm:py-32"
      style={{
        backgroundImage: 'url(/images/background.svg)',
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        filter: 'opacity(0.85)'
      }}
    >
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold uppercase text-brand-green tracking-widest">THE ULTIMATE TOOLKIT</h2>
          <p className="mt-4 text-4xl sm:text-5xl font-extrabold text-charcoal tracking-tight">All-in-One Property Management</p>
          <p className="mt-6 text-xl text-charcoal/80 max-w-3xl mx-auto">Escape the 15% commission trap. Sanctum puts you on the map—literally. Get a stunning, independent booking website that syncs with everything, automates your guest communication and takes payments directly. We help you appear on Google Maps independently from Airbnb and capture direct bookings at lower commission.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <Feature icon={<Globe size={24} />} title="Your Direct Booking Site">
            Appear on Google Maps and search. Get a beautiful, mobile-friendly website that showcases your properties and lets guests book direct.
          </Feature>
          <Feature icon={<CreditCard size={24} />} title="Seamless Payments">
            Integrated Stripe processing means you get paid instantly and securely. No more chasing payments, no more platform fees.
          </Feature>
          <Feature icon={<Calendar size={24} />} title="Unified Calendar">
            Automatically sync your bookings and availability from Airbnb, Vrbo, and more. Say goodbye to double bookings forever.
          </Feature>
          <Feature icon={<MessageCircle size={24} />} title="Automated Messaging">
            Five-star service, on autopilot. Send automated booking confirmations, check-in instructions, and review reminders.
          </Feature>
          <Feature icon={<BarChart2 size={24} />} title="Dynamic Pricing">
            Take control of your revenue. Set custom price ranges for different dates, seasons, or events to maximize your occupancy and profit.
          </Feature>
          <Feature icon={<Shield size={24} />} title="Build Your Brand, Not Theirs">
            Every direct booking is a customer you own. Build a brand that guests trust and a direct booking channel that grows over time.
          </Feature>
          <Feature icon={<Rocket size={24} />} title="Ready2go">
             No technical overhead, no high effort needed - we set everything up for you and your plattform is ready to go from day 1. Only functions you need, in a clean design.
          </Feature>
        </div>
      </div>
    </div>
  );
};

export default Process;
