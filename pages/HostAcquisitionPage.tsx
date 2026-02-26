import React from 'react';
import { Check, Zap, MessageSquare, DollarSign, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom'; // Assuming react-router-dom is used for navigation

// Define a consistent color palette
const PALETTE = {
  background: '#f8f7f4', // Off-white, warm
  charcoal: '#2d3748', // Dark grey for text
  primary: '#4a90e2', // A calming blue for primary actions
  accent: '#e94e77', // A vibrant pink/coral for accents and highlights
  lightGrey: '#f7fafc',
  white: '#ffffff',
};

// Feature Component
const Feature: React.FC<{ icon: React.ElementType, title: string, description: string }> = ({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-center text-center p-6">
    <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
      <Icon size={32} />
    </div>
    <h3 className="text-xl font-bold text-charcoal mb-2">{title}</h3>
    <p className="text-charcoal/70 leading-relaxed">{description}</p>
  </div>
);

// Testimonial Component
const Testimonial: React.FC<{ quote: string, author: string, company: string }> = ({ quote, author, company }) => (
  <div className="bg-lightGrey p-8 rounded-xl shadow-sm text-center">
    <p className="text-lg italic text-charcoal/80">"{quote}"</p>
    <p className="mt-4 font-bold text-charcoal">{author}</p>
    <p className="text-sm text-charcoal/60">{company}</p>
  </div>
);

const HostAcquisitionPage = () => {
  return (
    <div style={{ backgroundColor: PALETTE.background, color: PALETTE.charcoal }} className="font-sans">
      {/* Hero Section */}
      <section className="relative text-center py-20 md:py-32 px-4 bg-white overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-accent/5 z-0"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4" style={{ color: PALETTE.charcoal }}>
            Effortless Hospitality, <span style={{ color: PALETTE.primary }}>Unforgettable Stays.</span>
          </h1>
          <p className="text-xl md:text-2xl text-charcoal/70 max-w-2xl mx-auto mb-8">
            Sanctum is the all-in-one platform to manage your properties, automate communication, and delight your guests—all from one simple dashboard.
          </p>
          <Link to="/signup" className="inline-block bg-primary text-white font-bold py-4 px-10 rounded-full text-lg hover:opacity-90 transition-all transform hover:scale-105 shadow-lg shadow-primary/30">
            Get Started for Free
          </Link>
          <p className="mt-4 text-sm text-charcoal/50">No credit card required.</p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <header className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight">The Smart Way to Host</h2>
            <p className="text-lg text-charcoal/70 mt-2">Everything you need, nothing you don’t.</p>
          </header>
          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <Feature
              icon={Zap}
              title="Automated Workflows"
              description="From booking confirmations to check-out instructions, automate your guest communication and save hours every week."
            />
            <Feature
              icon={DollarSign}
              title="Direct Payments"
              description="Connect your Stripe account for secure, direct payments. No hidden fees, no third-party commissions."
            />
            <Feature
              icon={ExternalLink}
              title="Your Own Booking Site"
              description="Get a beautiful, customizable landing page for your properties. Showcase your brand and drive direct bookings."
            />
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section className="py-20 px-4 bg-lightGrey">
         <div className="container mx-auto text-center flex flex-col items-center">
            <h2 className="text-4xl font-bold tracking-tight mb-4">Your Brand, Your Rules</h2>
            <p className="text-lg text-charcoal/70 max-w-2xl mb-12">
                Finally, a platform that puts you in control. See how Sanctum brings all your hosting tools into one elegant interface.
            </p>
            <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl p-4 border border-gray-200">
                <img 
                    src="https://cdn.dribbble.com/users/1405793/screenshots/16513575/media/3a7457494a8fbd1c7b8d4f04c34a01c3.png?compress=1&resize=1200x900" 
                    alt="Sanctum Dashboard Showcase" 
                    className="rounded-xl w-full"
                />
            </div>
         </div>
      </section>


      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold tracking-tight mb-12">Loved by Hosts Everywhere</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Testimonial
              quote="Sanctum has been a game-changer for my rental business. The automation features save me so much time."
              author="Elena Rodriguez"
              company="Cozy Cove Rentals"
            />
            <Testimonial
              quote="I finally have a professional-looking website without the hassle. My direct bookings have increased by 40%!"
              author="Ben Carter"
              company="Urban Escapes"
            />
            <Testimonial
              quote="The direct Stripe integration is seamless. Getting paid is faster and more secure than ever. Highly recommended."
              author="Samantha Wu"
              company="Lakeside Lofts"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-4xl font-bold tracking-tight mb-4">Ready to Elevate Your Hosting?</h2>
          <p className="text-xl text-charcoal/70 mb-8">
            Join hundreds of other hosts who have taken control of their business with Sanctum.
          </p>
          <Link to="/signup" className="inline-block bg-primary text-white font-bold py-4 px-10 rounded-full text-lg hover:opacity-90 transition-all transform hover:scale-105 shadow-lg shadow-primary/30">
            Sign Up Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8">
        <p className="text-charcoal/60">&copy; {new Date().getFullYear()} Sanctum Stays. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HostAcquisitionPage;
