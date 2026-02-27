
import React, { useState, useMemo } from 'react';
import { Host, SubscriptionType, SUBSCRIPTION_PRICES } from '../types.js';
import { ArrowRight, CheckCircle, MapPin, DollarSign, TrendingUp, Sparkles, Menu, X, Calendar, MessageSquare, CreditCard, Aperture, Facebook, Twitter, Instagram } from 'lucide-react';

// --- NEW DESIGN COMPONENTS (STYLED) ---

const Header: React.FC<{ onSignIn: () => void }> = ({ onSignIn }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollTo = (id: string) => (e: React.MouseEvent) => {
      e.preventDefault();
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      if(isMenuOpen) setIsMenuOpen(false);
  }

  const navLinks = [
      { label: 'Features', id: 'features' },
      { label: 'ROI Calculator', id: 'roi-calculator' },
      { label: 'Pricing', id: 'pricing' },
  ];

  return (
    <header className="bg-white/90 backdrop-blur-lg sticky top-0 z-50 w-full border-b border-gray-200">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
            <Aperture className="w-7 h-7 text-indigo-600" />
            <span className="text-2xl font-bold text-gray-800">SANCTUM</span>
        </div>
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map(link => (
            <a key={link.id} href={`#${link.id}`} onClick={scrollTo(link.id)} className="text-sm font-semibold text-gray-500 hover:text-indigo-600 uppercase tracking-wider transition-colors">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="hidden md:flex">
             <button onClick={onSignIn} className="bg-indigo-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-indigo-700 transition-all text-sm">
                Get Started
            </button>
        </div>
        <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      {isMenuOpen && (
        <div className="md:hidden bg-white py-4 px-6 border-t border-gray-200">
          <nav className="flex flex-col space-y-4 items-center">
            {navLinks.map(link => (
              <a key={link.id} href={`#${link.id}`} onClick={scrollTo(link.id)} className="text-sm font-semibold text-gray-600 hover:text-indigo-600 py-2">
                {link.label}
              </a>
            ))}
             <button onClick={onSignIn} className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-all w-full mt-4">
                Get Started
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

const Hero: React.FC<{ onSignIn: () => void }> = ({ onSignIn }) => (
    <div className="bg-white relative">
        <div className="container mx-auto px-6 py-24 md:py-32 flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 text-center lg:text-left z-10">
                 <Sparkles className="mx-auto lg:mx-0 text-indigo-500 h-12 w-12 mb-4" />
                <h1 className="text-4xl md:text-6xl font-extrabold text-gray-800 leading-tight mb-4">
                    Own your visibility. Own your guests.
                </h1>
                <p className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-8">
                    We help you appear on Google Maps independently from booking plattfroms and capture direct bookings with lower commission.
                </p>
   
            </div>

            <div className="w-full lg:w-1/2 h-80 lg:h-auto lg:absolute lg:top-0 lg:right-0 mt-12 lg:mt-0">
                <div className="absolute right-0 top-0 h-full w-full lg:w-[55%]" style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0 100%)' }}>
                    <img
                        src="https://i.imgur.com/3lIuM1m.png"
                        className="h-full w-full object-cover"
                        alt="Cityscape"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-purple-500 to-indigo-600 opacity-60 mix-blend-multiply"></div>
                </div>
            </div>
        </div>
    </div>
);


// --- OLD CONTENT COMPONENTS (RESTYLED) ---

const Feature: React.FC<{ icon: React.ReactNode, title: string, children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-white p-8 rounded-2xl border border-gray-200/80 text-center transform hover:-translate-y-2 transition-transform duration-300 shadow-sm hover:shadow-xl">
      <div className="inline-block bg-indigo-100 text-indigo-600 rounded-xl p-4 mb-5">{icon}</div>
      <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
      <p className="text-gray-500 leading-relaxed">{children}</p>
    </div>
);

const FeaturesSection: React.FC = () => (
    <section id="features" className="py-20 sm:py-28 bg-gray-50">
        <div className="container mx-auto px-4">
             <div className="text-center mb-16">
                <p className="text-indigo-600 font-bold text-lg">Everything you need</p>
                <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-800 tracking-tight mt-2">All-in-one platform</h2>
                <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">From calendars to automated messaging and payment processing, we have you covered. Get all the tools you need to run your business efficiently.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                 <Feature icon={<MapPin/>} title="Direct Booking Site">
                    Get a beautiful, mobile-friendly website that showcases your properties and allows guests to book directly with you.
                </Feature>
                <Feature icon={<Calendar/>} title="Calendar Sync">
                    Automatically sync your bookings and availability with other platforms like Airbnb and Vrbo to prevent double bookings.
                </Feature>
                <Feature icon={<MessageSquare/>} title="Automated Messaging">
                    Save time with automated messages for booking confirmations, check-in instructions, and post-stay reviews.
                </Feature>
                <Feature icon={<CreditCard/>} title="Payment Processing">
                    Securely accept credit card payments from guests with our built-in Stripe integration. No more chasing payments.
                </Feature>
                <Feature icon={<DollarSign/>} title="Slash Commissions">
                    Keep more of your earnings. Our 4% fee beats the 15%+ charged by major platforms, directly boosting your profit.
                </Feature>
                <Feature icon={<TrendingUp/>} title="Build Your Brand">
                    Establish your own booking channel. We give you the tools to create a brand that guests trust and return to.
                </Feature>
            </div>
        </div>
    </section>
);

const ROISection: React.FC = () => {
  const [revenue, setRevenue] = useState(50000);

  const ourFee = 0.04;
  const stripeFee = 0.029;
  const otherFee = 0.15;

  const { hostSavings, sanctumCommission, otherCommissions } = useMemo(() => {
    const sanctumCommission = revenue * ourFee + revenue * stripeFee;
    const otherCommissions = revenue * otherFee;
    const hostSavings = otherCommissions - sanctumCommission;
    return { hostSavings, sanctumCommission, otherCommissions };
  }, [revenue]);

  return (
    <div className="bg-white py-20 sm:py-28" id="roi-calculator">
        <div className="container mx-auto px-4">
            <div className="text-center mb-16">
                <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-800 tracking-tight">Stop Overpaying for Bookings</h2>
                <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">See how much you can save by cutting out the middlemen. Compare our 4% fee (+ Stripe) to the 15%+ taken by major platforms.</p>
            </div>

            <div className="max-w-4xl mx-auto bg-gray-50 rounded-2xl p-8 sm:p-12 border border-gray-200/80">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <label htmlFor="revenue" className="text-lg font-bold text-gray-800 mb-2 block">Your Annual Revenue</label>
                        <div className="relative">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                            <input
                                type="number"
                                id="revenue"
                                value={revenue}
                                onChange={(e) => setRevenue(Number(e.target.value))}
                                className="w-full bg-white border-2 border-gray-200 rounded-xl py-4 pl-14 pr-4 text-2xl font-bold text-gray-800 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            />
                        </div>
                    </div>

                    <div className="text-center md:text-left">
                        <p className="text-lg text-gray-600 mb-2">With Sanctum, you'd save:</p>
                        <p className="text-5xl sm:text-6xl font-extrabold text-indigo-600 tracking-tight">~${Math.round(hostSavings).toLocaleString()}</p>
                        <p className="text-md text-gray-500 mt-2">per year</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

const PricingSection: React.FC<{ onSignIn: () => void }> = ({ onSignIn }) => {

  const PriceCard: React.FC<{plan: SubscriptionType, price: number, features: string[], isPopular?: boolean}> = ({ plan, price, features, isPopular }) => (
    <div className={`border rounded-2xl p-8 flex flex-col h-full ${isPopular ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-gray-200/80'}`}>
        <h3 className={`text-2xl font-bold ${isPopular ? 'text-indigo-600' : 'text-gray-800'}`}>{plan}</h3>
        <p className={`text-5xl font-extrabold my-4 ${isPopular ? 'text-gray-800' : 'text-gray-800'}`}>
            ${price}<span className={`text-lg font-medium ${isPopular ? 'text-gray-500' : 'text-gray-500'}`}>/mo</span>
        </p>
        <ul className={`space-y-4 mb-8 ${isPopular ? 'text-gray-600' : 'text-gray-600'}`}>
            {features.map(f => <li key={f} className="flex items-center"><CheckCircle className={`w-5 h-5 mr-3 ${isPopular ? 'text-indigo-500' : 'text-green-500'}`} />{f}</li>)}
        </ul>
        <button onClick={onSignIn} className={`w-full mt-auto font-bold py-4 px-6 rounded-xl transition-colors ${isPopular ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}>Get Started</button>
    </div>
  );

  return (
    <section id="pricing" className="py-20 sm:py-28 bg-gray-50">
        <div className="container mx-auto px-4">
            <div className="text-center mb-16">
                <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-800 tracking-tight">Find the Perfect Plan</h2>
                <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">Start for free, and scale up as you grow. All plans include our powerful direct booking engine.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
                <PriceCard plan={SubscriptionType.BASIC} price={SUBSCRIPTION_PRICES.Basic} features={['Up to 3 Properties', 'Direct Booking Website', 'Google Maps Setup', 'Email Support']} />
                <PriceCard plan={SubscriptionType.PRO} price={SUBSCRIPTION_PRICES.Pro} features={['Up to 15 Properties', 'Stripe Payment Integration', 'Automated Guest Messaging', 'Calendar Sync', 'Priority Support']} isPopular />
                <PriceCard plan={SubscriptionType.ENTERPRISE} price={SUBSCRIPTION_PRICES.Enterprise} features={['Unlimited Properties', 'Custom Branding & Features', 'Dedicated Account Manager', 'Advanced Analytics', 'Phone & Video Support']} />
            </div>
        </div>
    </section>
  )
}

const DemoSection: React.FC<{ hosts: Host[] }> = ({ hosts }) => {
    const handleHostRedirect = (slug: string) => {
        if (slug) window.location.href = `/?host=${slug}`;
    };

    return (
        <div className="py-20 sm:py-28 bg-white">
            <div className="container mx-auto px-4 text-center">
                 <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-800 tracking-tight">Explore a Live Demo</h2>
                 <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">See how Sanctum works from a guest's perspective. Select a demo host to view their direct booking site.</p>
                <div className="relative max-w-md mx-auto mt-10">
                  <select
                    id="host-select"
                    defaultValue=""
                    onChange={(e) => handleHostRedirect(e.target.value)}
                    className="bg-white border-2 border-gray-300 text-gray-800 p-5 rounded-full w-full appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center text-lg cursor-pointer shadow-md"
                  >
                    <option value="" disabled>— Select a Demo —</option>
                    {hosts.map(host => (
                      <option key={host.id} value={host.slug} className="text-gray-800">{host.businessName || host.slug}</option>
                    ))}
                  </select>
                  <ArrowRight className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 pointer-events-none" />
                </div>
            </div>
        </div>
    );
}

const Footer: React.FC = () => (
    <footer className="bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <p className="text-sm text-gray-500 text-center md:text-left">&copy; {new Date().getFullYear()} Sanctum. All rights reserved.</p>
                 <div className="flex items-center space-x-5">
                    <a href="#" className="text-gray-400 hover:text-indigo-600 cursor-pointer transition-colors"><Facebook className="w-5 h-5" /></a>
                    <a href="#" className="text-gray-400 hover:text-indigo-600 cursor-pointer transition-colors"><Twitter className="w-5 h-5" /></a>
                    <a href="#" className="text-gray-400 hover:text-indigo-600 cursor-pointer transition-colors"><Instagram className="w-5 h-5" /></a>
                </div>
            </div>
        </div>
    </footer>
)

interface GenericLandingPageProps {
  hosts: Host[];
  onSignIn: () => void;
}

const GenericLandingPage: React.FC<GenericLandingPageProps> = ({ hosts, onSignIn }) => {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Header onSignIn={onSignIn} />
      <main>
        <Hero onSignIn={onSignIn} />
        <FeaturesSection />
        <ROISection />
        <PricingSection onSignIn={onSignIn} />
        <DemoSection hosts={hosts} />
      </main>
      <Footer />
    </div>
  );
};

export default GenericLandingPage;
