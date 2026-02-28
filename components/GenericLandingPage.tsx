
import React, { useState, useMemo } from 'react';
import { Host, SubscriptionType, SUBSCRIPTION_PRICES } from '../types.js';
import { ArrowRight, CheckCircle, MapPin, DollarSign, TrendingUp, Sparkles, Menu, X, Calendar, MessageSquare, CreditCard, Aperture, Facebook, Twitter, Instagram } from 'lucide-react';

// --- Re-imagined for a Modern, Dark Aesthetic ---

const Header: React.FC<{ onSignIn: () => void }> = ({ onSignIn }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollTo = (id: string) => (e: React.MouseEvent) => {
      e.preventDefault();
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      if(isMenuOpen) setIsMenuOpen(false);
  }

  const navLinks = [
      { label: 'Features', id: 'features' },
      { label: 'Pricing', id: 'pricing' },
      { label: 'ROI Calculator', id: 'roi-calculator' },
      { label: 'Demo', id: 'demo' },
  ];

  return (
    <header className="bg-gray-900/80 backdrop-blur-lg sticky top-0 z-50 w-full border-b border-gray-700/50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <Aperture className="w-7 h-7 text-indigo-400" />
            <span className="text-2xl font-bold text-white">SANCTUM</span>
        </div>
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map(link => (
            <a key={link.id} href={`#${link.id}`} onClick={scrollTo(link.id)} className="text-sm font-semibold text-gray-400 hover:text-indigo-400 uppercase tracking-wider transition-colors">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="hidden md:flex">
             <button onClick={onSignIn} className="group relative inline-block text-sm font-bold text-white focus:outline-none">
                <span className="absolute inset-0 border-2 border-indigo-400 rounded-lg"></span>
                <span className="block border-2 border-indigo-400 rounded-lg bg-indigo-500 px-5 py-2 transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1">
                    Get Started
                </span>
            </button>
        </div>
        <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}\
        </button>
      </div>
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900 py-4 px-6 border-t border-gray-700/50">
          <nav className="flex flex-col space-y-4 items-center">
            {navLinks.map(link => (
              <a key={link.id} href={`#${link.id}`} onClick={scrollTo(link.id)} className="text-sm font-semibold text-gray-300 hover:text-indigo-400 py-2">
                {link.label}
              </a>
            ))}\
             <button onClick={onSignIn} className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-all w-full mt-4">\
                Get Started\
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

const Hero: React.FC<{ onSignIn: () => void }> = ({ onSignIn }) => (
    <div className="bg-gray-900 relative text-white">
        <div className="absolute inset-0 bg-grid-gray-800/20 [mask-image:linear-gradient(to_bottom,white_20%,transparent_100%)]"></div>
        <div className="container mx-auto px-6 py-24 md:py-32 text-center z-10 relative">
             <Sparkles className="mx-auto text-indigo-400 h-12 w-12 mb-4" />
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 leading-tight mb-6">
              Own your visibility. Own your guests.
            </h1>
            <p className="text-lg md:text-xl text-gray-400 leading-relaxed max-w-3xl mx-auto mb-10">
                Escape the 15% commission trap. Sanctum puts you on the map—literally. Get a stunning, independent booking website that syncs with everything, automates your guest communication, and takes payments directly. We help you appear on Google Maps independently from Airbnb and capture direct bookings at lower commission.
            </p>
            <div className="flex justify-center items-center gap-4">
                 <button onClick={onSignIn} className="group relative inline-block text-lg font-bold text-white focus:outline-none">
                    <span className="absolute inset-0 border-2 border-indigo-400 rounded-lg"></span>
                    <span className="block border-2 border-indigo-400 rounded-lg bg-indigo-500 px-8 py-3 transition-transform group-hover:-translate-x-1.5 group-hover:-translate-y-1.5">
                        Claim Your Independence
                    </span>
                </button>
            </div>
        </div>
    </div>
);


const FeatureCard: React.FC<{
    icon: React.ReactNode,
    title: string,
    children: React.ReactNode,
    className?: string
}> = ({ icon, title, children, className = '' }) => (
    <div className={`relative p-8 rounded-2xl bg-gray-800/50 border border-gray-700/60 overflow-hidden ${className}`}>
        <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-tr from-indigo-900/20 via-transparent to-transparent"></div>
        <div className="relative z-10">
            <div className="inline-block bg-gray-900 text-indigo-400 rounded-lg p-3 mb-5 border border-gray-700">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
            <p className="text-gray-400 leading-relaxed">{children}</p>
        </div>
    </div>
);

const FeaturesSection: React.FC = () => (
    <section id="features" className="py-20 sm:py-28 bg-gray-900">
        <div className="container mx-auto px-4">
             <div className="text-center mb-16">
                <p className="text-indigo-400 font-bold text-lg">THE ULTIMATE TOOLKIT</p>
                <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mt-2">All-in-One Property Management</h2>
                <p className="mt-6 text-xl text-gray-400 max-w-3xl mx-auto">From five-star guest service to maximizing your revenue, Sanctum provides the tools for you to thrive independently.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                 <FeatureCard icon={<MapPin size={24}/>} title="Your Direct Booking Site">
                    Appear on Google Maps and search. Get a beautiful, mobile-friendly website that showcases your properties and lets guests book direct.
                </FeatureCard>
                <FeatureCard icon={<CreditCard size={24}/>} title="Seamless Payments">
                    Integrated Stripe processing means you get paid instantly and securely. No more chasing payments, no more platform fees.
                </FeatureCard>
                <FeatureCard icon={<Calendar size={24}/>} title="Unified Calendar">
                    Automatically sync your bookings and availability from Airbnb, Vrbo, and more. Say goodbye to double bookings forever. 
                </FeatureCard>
                <FeatureCard icon={<MessageSquare size={24}/>} title="Automated Messaging">
                    Five-star service, on autopilot. Send automated booking confirmations, check-in instructions, and review reminders.
                </FeatureCard>
                <FeatureCard icon={<DollarSign size={24}/>} title="Dynamic Pricing">
                    Take control of your revenue. Set custom price ranges for different dates, seasons, or events to maximize your occupancy and profit.
                </FeatureCard>
                <FeatureCard icon={<TrendingUp size={24}/>} title="Build Your Brand, Not Theirs">
                    Every direct booking is a customer you own. Build a brand that guests trust and a direct booking channel that grows over time.
                </FeatureCard>
                <FeatureCard icon={<TrendingUp size={24}/>} title="Build Your Brand, Not Theirs">
                    No technical overhead, no high effort needed - we set everything up for you and your plattform is ready to go from day 1. Only functions you need, in a clean design.
                </FeatureCard>
            </div>
        </div>
    </section>
);


const ROISection: React.FC = () => {
  const [revenue, setRevenue] = useState(50000);

  const ourFee = 0.04;
  const stripeFee = 0.029;
  const otherFee = 0.15;

  const { hostSavings } = useMemo(() => {
    const sanctumCommission = revenue * ourFee + revenue * stripeFee;
    const otherCommissions = revenue * otherFee;
    const hostSavings = otherCommissions - sanctumCommission;
    return { hostSavings };
  }, [revenue]);

  return (
    <div className="bg-gray-900 py-20 sm:py-28" id="roi-calculator">
        <div className="container mx-auto px-4">
            <div className="text-center mb-16">
                 <p className="text-indigo-400 font-bold text-lg">RETURN ON INVESTMENT</p>
                <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">Stop Burning Money</h2>
                <p className="mt-6 text-xl text-gray-400 max-w-3xl mx-auto">Major platforms like AirBnb, booking.com and Agoda charge 15% or more. Sanctum is just 4% + Stripe Payment Fees. See what you could save by switching.</p>
            </div>

            <div className="max-w-4xl mx-auto bg-gray-800/50 rounded-2xl p-8 sm:p-12 border border-gray-700/60">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <label htmlFor="revenue" className="text-lg font-bold text-white mb-2 block">Your Annual Booking Revenue</label>
                        <div className="relative">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500" />
                            <input
                                type="number"
                                id="revenue"
                                value={revenue}
                                onChange={(e) => setRevenue(Number(e.target.value))}
                                className="w-full bg-gray-900 border-2 border-gray-700 rounded-xl py-4 pl-14 pr-4 text-2xl font-bold text-white focus:ring-indigo-500 focus:border-indigo-500 transition"
                            />
                        </div>
                    </div>

                    <div className="text-center md:text-left">
                        <p className="text-lg text-gray-300 mb-2">Your estimated annual savings:</p>
                        <p className="text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-cyan-400 tracking-tight">~${Math.round(hostSavings).toLocaleString()}</p>
                        <p className="text-md text-gray-400 mt-2">Enough for a vacation.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

const PricingSection: React.FC<{ onSignIn: () => void }> = ({ onSignIn }) => {

  const PriceCard: React.FC<{plan: SubscriptionType, price: number, features: string[], isPopular?: boolean}> = ({ plan, price, features, isPopular }) => (
    <div className={`relative border rounded-2xl p-8 flex flex-col h-full ${isPopular ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-gray-700/60'}`}>
        {isPopular && <div className="absolute top-0 right-8 -translate-y-1/2 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">Most Popular</div>}
        <h3 className={`text-2xl font-bold ${isPopular ? 'text-indigo-400' : 'text-white'}`}>{plan}</h3>
        <p className="text-5xl font-extrabold my-4 text-white">
            ${price}<span className="text-lg font-medium text-gray-400">/mo</span>
        </p>
        <ul className="space-y-4 mb-8 text-gray-400">
            {features.map(f => <li key={f} className="flex items-center"><CheckCircle className={`w-5 h-5 mr-3 ${isPopular ? 'text-indigo-400' : 'text-green-500'}`} />{f}</li>)}
        </ul>
        <button onClick={onSignIn} className={`w-full mt-auto font-bold py-3 px-6 rounded-xl transition-colors text-lg ${isPopular ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>Choose Plan</button>
    </div>
  );

  return (
    <section id="pricing" className="py-20 sm:py-28 bg-gray-900 border-t border-gray-800">
        <div className="container mx-auto px-4">
            <div className="text-center mb-16">
                <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">Pricing That Makes Sense</h2>
                <p className="mt-6 text-xl text-gray-400 max-w-3xl mx-auto">Start small, grow big. Our success is tied to yours. All plans include our powerful direct booking engine and a 4% booking fee.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto items-stretch">
                <PriceCard plan={SubscriptionType.BASIC} price={SUBSCRIPTION_PRICES.Basic} features={['Up to 3 Properties', 'Direct Booking Website', 'Google Maps Setup', 'Standard Email Support', 'Automated Guest Messaging', 'Calendar Sync', 'No Commission' ]} />
                <PriceCard plan={SubscriptionType.PRO} price={SUBSCRIPTION_PRICES.Pro} features={['Up to 8 Properties', 'Stripe Payment Integration', 'Automated Guest Messaging', 'Calendar Sync', 'Priority Support', '4% commission']} isPopular />
                <PriceCard plan={SubscriptionType.PREMIUM} price={SUBSCRIPTION_PRICES.Premium} features={['Unlimited Properties', 'Custom Branding & Landing Page', 'Dedicated Account Manager', 'Advanced Analytics', 'Phone & Video Support', '4% commission']} />
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
        <div id="demo" className="py-20 sm:py-28 bg-gray-900">
            <div className="container mx-auto px-4 text-center">
                 <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">See It in Action</h2>
                 <p className="mt-6 text-xl text-gray-300 max-w-2xl mx-auto">Words are cheap. See how Sanctum looks and feels from a guest's perspective. Select a demo host to explore their live booking site.</p>
                <div className="relative max-w-md mx-auto mt-10">
                  <select
                    id="host-select"
                    defaultValue=""
                    onChange={(e) => handleHostRedirect(e.target.value)}
                    className="bg-gray-800 border-2 border-gray-600 text-white p-5 rounded-full w-full appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center text-lg cursor-pointer"
                  >
                    <option value="" disabled>— Select a Demo Host —</option>
                    {hosts.map(host => (
                      <option key={host.id} value={host.slug}>{host.businessName || host.slug}</option>
                    ))}\
                  </select>
                  <ArrowRight className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500 pointer-events-none" />
                </div>
            </div>
        </div>
    );
}

const Footer: React.FC = () => (
    <footer className="bg-gray-900 border-t border-gray-800">
        <div className="container mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <p className="text-sm text-gray-500 text-center md:text-left">&copy; {new Date().getFullYear()} Sanctum. Own Your Bookings.</p>
                 <div className="flex items-center space-x-5">
                    <a href="#" className="text-gray-500 hover:text-indigo-400 cursor-pointer transition-colors"><Facebook className="w-5 h-5" /></a>
                    <a href="#" className="text-gray-500 hover:text-indigo-400 cursor-pointer transition-colors"><Twitter className="w-5 h-5" /></a>
                    <a href="#" className="text-gray-500 hover:text-indigo-400 cursor-pointer transition-colors"><Instagram className="w-5 h-5" /></a>
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
    <div className="min-h-screen bg-gray-900 font-sans antialiased">
      <Header onSignIn={onSignIn} />
      <main>
        <Hero onSignIn={onSignIn} />
        <FeaturesSection />
        <PricingSection onSignIn={onSignIn} />
        <ROISection />
        <DemoSection hosts={hosts} />
      </main>
      <Footer />
    </div>
  );
};

export default GenericLandingPage;
