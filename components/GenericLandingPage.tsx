
import React, { useState, useMemo } from 'react';
import { Host, SubscriptionType, SUBSCRIPTION_PRICES } from '../types.js';
import { ArrowRight, CheckCircle, MapPin, DollarSign, TrendingUp, Sparkles, Menu, X, Calendar, MessageSquare, CreditCard } from 'lucide-react';

interface GenericLandingPageProps {
  hosts: Host[];
  onSignIn: () => void;
}

const NavLink: React.FC<{ href: string; children: React.ReactNode; onClick?: () => void }> = ({ href, children, onClick }) => (
  <a href={href} onClick={onClick} className="text-stone-700 hover:text-sky-600 transition-colors duration-300 text-lg font-medium">{children}</a>
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
                <h2 className="text-4xl sm:text-5xl font-extrabold text-charcoal tracking-tight">Stop Overpaying for Bookings</h2>
                <p className="mt-6 text-xl text-stone-600 max-w-3xl mx-auto">See how much you can save by cutting out the middlemen. Compare our 4% fee (+ Stripe) to the 15%+ taken by major platforms.</p>
            </div>

            <div className="max-w-4xl mx-auto bg-stone-50 rounded-3xl p-8 sm:p-12 border border-stone-200">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <label htmlFor="revenue" className="text-lg font-bold text-charcoal mb-2 block">Your Annual Revenue</label>
                        <div className="relative">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-stone-400" />
                            <input
                                type="number"
                                id="revenue"
                                value={revenue}
                                onChange={(e) => setRevenue(Number(e.target.value))}
                                className="w-full bg-white border-2 border-stone-200 rounded-xl py-4 pl-14 pr-4 text-2xl font-bold text-charcoal focus:ring-sky-500 focus:border-sky-500 transition"
                            />
                        </div>
                    </div>

                    <div className="text-center md:text-left">
                        <p className="text-lg text-stone-600 mb-2">With Sanctum, you'd save:</p>
                        <p className="text-5xl sm:text-6xl font-extrabold text-sky-600 tracking-tight">~${Math.round(hostSavings).toLocaleString()}</p>
                        <p className="text-md text-stone-500 mt-2">per year</p>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-stone-200 grid sm:grid-cols-2 gap-8 text-lg">
                    <div className="text-center bg-green-50 p-6 rounded-xl">
                        <p className="font-bold text-green-800">Your Commission (Sanctum)</p>
                        <p className="text-3xl font-extrabold text-green-700 mt-2">${Math.round(sanctumCommission).toLocaleString()}</p>
                    </div>
                    <div className="text-center bg-red-50 p-6 rounded-xl">
                        <p className="font-bold text-red-800">Platform Fees (Airbnb, etc.)</p>
                        <p className="text-3xl font-extrabold text-red-700 mt-2">${Math.round(otherCommissions).toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

const PricingSection: React.FC<{ onSignIn: () => void }> = ({ onSignIn }) => {

  const PriceCard: React.FC<{plan: SubscriptionType, price: number, features: string[], isPopular?: boolean}> = ({ plan, price, features, isPopular }) => (
    <div className={`border rounded-3xl p-8 flex flex-col h-full ${isPopular ? 'bg-sky-600 text-white border-sky-600' : 'bg-white'}`}>
        <h3 className={`text-2xl font-bold ${isPopular ? 'text-white' : 'text-charcoal'}`}>{plan}</h3>
        <p className={`text-5xl font-extrabold my-4 ${isPopular ? 'text-white' : 'text-charcoal'}`}>
            ${price}<span className={`text-lg font-medium ${isPopular ? 'text-sky-200' : 'text-stone-500'}`}>/mo</span>
        </p>
        <ul className={`space-y-4 mb-8 ${isPopular ? 'text-sky-100' : 'text-stone-600'}`}>
            {features.map(f => <li key={f} className="flex items-center"><CheckCircle className={`w-5 h-5 mr-3 ${isPopular ? 'text-white' : 'text-sky-500'}`} />{f}</li>)}
        </ul>
        <button onClick={onSignIn} className={`w-full mt-auto font-bold py-4 px-6 rounded-xl transition-colors ${isPopular ? 'bg-white text-sky-600 hover:bg-sky-50' : 'bg-stone-100 text-charcoal hover:bg-stone-200'}`}>Get Started</button>
    </div>
  );

  return (
    <section id="pricing" className="py-20 sm:py-28 bg-stone-50">
        <div className="container mx-auto px-4">
            <div className="text-center mb-16">
                <h2 className="text-4xl sm:text-5xl font-extrabold text-charcoal tracking-tight">Find the Perfect Plan</h2>
                <p className="mt-6 text-xl text-stone-600 max-w-3xl mx-auto">Start for free, and scale up as you grow. All plans include our powerful direct booking engine.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
                <PriceCard plan={SubscriptionType.BASIC} price={SUBSCRIPTION_PRICES.basic} features={['Up to 3 Properties', 'Direct Booking Website', 'Google Maps Setup', 'Email Support']} />
                <PriceCard plan={SubscriptionType.PRO} price={SUBSCRIPTION_PRICES.pro} features={['Up to 15 Properties', 'Stripe Payment Integration', 'Automated Guest Messaging', 'Calendar Sync', 'Priority Support']} isPopular />
                <PriceCard plan={SubscriptionType.ENTERPRISE} price={SUBSCRIPTION_PRICES.enterprise} features={['Unlimited Properties', 'Custom Branding & Features', 'Dedicated Account Manager', 'Advanced Analytics', 'Phone & Video Support']} />
            </div>
        </div>
    </section>
  )
}

const GenericLandingPage: React.FC<GenericLandingPageProps> = ({ hosts, onSignIn }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleHostRedirect = (slug: string) => {
    if (slug) window.location.href = `/?host=${slug}`;
  };

  const scrollTo = (id: string) => (e: React.MouseEvent) => {
      e.preventDefault();
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-white text-charcoal font-sans">
        {/* Header & Nav */}
        <header className="bg-white/80 backdrop-blur-lg fixed top-0 left-0 right-0 z-50 border-b border-stone-200">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-4">
                    <div className="text-3xl font-bold text-charcoal">Sanctum</div>
                    <nav className="hidden md:flex items-center space-x-8">
                        <NavLink href="#features" onClick={scrollTo('features')}>Features</NavLink>
                        <NavLink href="#roi-calculator" onClick={scrollTo('roi-calculator')}>ROI Calculator</NavLink>
                        <NavLink href="#pricing" onClick={scrollTo('pricing')}>Pricing</NavLink>
                    </nav>

                    <div className="md:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? <X/> : <Menu />}</button>
                    </div>
                </div>
            </div>
            {isMenuOpen && (
                <div className="md:hidden bg-white py-4 px-4 border-t border-stone-200">
                     <nav className="flex flex-col space-y-4">
                        <NavLink href="#features" onClick={scrollTo('features')}>Features</NavLink>
                        <NavLink href="#roi-calculator" onClick={scrollTo('roi-calculator')}>ROI Calculator</NavLink>
                        <NavLink href="#pricing" onClick={scrollTo('pricing')}>Pricing</NavLink>
                    </nav>
                </div>
            )}
        </header>

        {/* Hero Section */}
        <main className="pt-32 pb-20 text-center bg-stone-50" style={{clipPath: 'ellipse(150% 100% at 50% 0%)'}}>
            <div className="container mx-auto px-4">
                <Sparkles className="mx-auto text-sky-500 h-12 w-12 mb-4" />
                <h1 className="text-5xl md:text-7xl font-extrabold text-charcoal tracking-tight mb-6">Own your visibility. Own your guests.</h1>
                <p className="text-xl md:text-2xl text-stone-600 mb-10 max-w-3xl mx-auto">We help you appear on Google Maps independently from Airbnb and capture direct bookings with lower commission.</p>
                <div className="flex justify-center items-center space-x-4">
                    <button onClick={onSignIn} className="bg-sky-600 text-white px-8 py-4 rounded-full font-bold hover:bg-sky-700 transition-all text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                        Start Your Free Trial
                    </button>
                </div>
            </div>
        </main>

        {/* Features Section */}
        <section id="features" className="py-20 sm:py-28 container mx-auto px-4">
             <div className="text-center mb-16">
                <p className="text-sky-600 font-bold text-lg">Everything you need</p>
                <h2 className="text-4xl sm:text-5xl font-extrabold text-charcoal tracking-tight mt-2">All-in-one platform</h2>
                <p className="mt-6 text-xl text-stone-600 max-w-3xl mx-auto">From calendars to automated messaging and payment processing, we have you covered. Get all the tools you need to run your business efficiently.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
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
        </section>

        <ROISection />

        <PricingSection onSignIn={onSignIn} />

        {/* Demo Section */}
        <div className="py-20 sm:py-28 bg-stone-50">
            <div className="container mx-auto px-4 text-center">
                 <h2 className="text-4xl sm:text-5xl font-extrabold text-charcoal tracking-tight">Explore a Live Demo</h2>
                 <p className="mt-6 text-xl text-stone-600 max-w-2xl mx-auto">See how Sanctum works from a guest's perspective. Select a demo host to view their direct booking site.</p>
                <div className="relative max-w-md mx-auto mt-10">
                  <select
                    id="host-select"
                    defaultValue=""
                    onChange={(e) => handleHostRedirect(e.target.value)}
                    className="bg-white border-2 border-stone-300 text-charcoal p-5 rounded-full w-full appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500 text-center text-lg cursor-pointer shadow-md"
                  >
                    <option value="" disabled>— Select a Demo —</option>
                    {hosts.map(host => (
                      <option key={host.id} value={host.slug} className="text-charcoal">{host.businessName || host.slug}</option>
                    ))}
                  </select>
                  <ArrowRight className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-stone-400 pointer-events-none" />
                </div>
            </div>
        </div>

        {/* Footer */}
        <footer className="bg-white py-12">
            <div className="container mx-auto text-center text-stone-500">
                <p>&copy; {new Date().getFullYear()} Sanctum. All rights reserved.</p>
                <div className="flex justify-center space-x-6 mt-4">
                    <a href="#" className="hover:text-sky-600 transition-colors">Terms of Service</a>
                    <a href="#" className="hover:text-sky-600 transition-colors">Privacy Policy</a>
                </div>
            </div>
        </footer>
    </div>
  );
};

const Feature: React.FC<{ icon: React.ReactNode, title: string, children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="bg-white p-8 rounded-3xl border border-stone-200 text-center transform hover:-translate-y-2 transition-transform duration-300 shadow-sm hover:shadow-2xl">
    <div className="inline-block bg-sky-100 text-sky-600 rounded-2xl p-4 mb-5">{icon}</div>
    <h3 className="text-2xl font-bold text-charcoal mb-3">{title}</h3>
    <p className="text-stone-500">{children}</p>
  </div>
);


export default GenericLandingPage;
