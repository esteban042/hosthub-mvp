
import React from 'react';
import { Host, SubscriptionType } from '../types.js';
import { ArrowRight, CheckCircle, ShieldCheck, Calendar, Star, DollarSign, MapPin, Search, Building, Book } from 'lucide-react';
import { SKY_ACCENT, TERRACOTTA, MINT_ACCENT } from '../constants.tsx';

interface GenericLandingPageProps {
  hosts: Host[];
  onSignIn: () => void;
  onHostChange: (slug: string) => void;
}

const ProductLandingPage: React.FC<GenericLandingPageProps> = ({ hosts, onSignIn, onHostChange }) => {

  const handleHostRedirect = (slug: string) => {
    window.location.href = `/?host=${slug}`;
  };

  return (
    <div className="min-h-screen bg-alabaster text-charcoal">
       <style>
        {`
          @keyframes gradient-animation {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animated-gradient {
            background: linear-gradient(-45deg, ${SKY_ACCENT}, ${TERRACOTTA}, ${MINT_ACCENT}, #f0e6e6);
            background-size: 400% 400%;
            animation: gradient-animation 15s ease infinite;
          }
          .feature-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          }
        `}
      </style>

      {/* Navigation */}
      <nav className="container mx-auto p-6 flex justify-between items-center">
        <div className="text-3xl font-serif font-bold text-charcoal">Sanctum</div>
        <div className="space-x-8 flex items-center text-sm">
          <a href="#features" className="hover:text-sky-accent transition-colors">Features</a>
          <a href="#pricing" className="hover:text-sky-accent transition-colors">Pricing</a>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="text-center py-32 container mx-auto animated-gradient text-white rounded-3xl shadow-2xl">
        <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight">Your Brand, Your Rules.</h1>
        <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto">The ultimate platform for independent hosts who demand control, elegance, and simplicity.</p>
        <div className="relative max-w-md mx-auto">
          <select
            id="host-select"
            defaultValue=""
            onChange={(e) => handleHostRedirect(e.target.value)}
            className="bg-white/20 text-white p-5 rounded-full w-full appearance-none focus:outline-none focus:ring-2 focus:ring-white text-center text-lg backdrop-blur-md cursor-pointer"
          >
            <option value="" disabled>— Explore a Showcase —</option>
            {hosts.map(host => (
              <option key={host.id} value={host.slug} className="text-charcoal">{host.slug}</option>
            ))}
          </select>
          <ArrowRight className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-white pointer-events-none" />
        </div>
      </header>

      {/* Why Sanctum Section */}
      <section id="features" className="py-24">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-serif font-bold text-charcoal mb-4">Less Overhead, More Hosting</h2>
          <p className="text-lg text-stone-500 mb-16">A streamlined experience, built for you.</p>
          <div className="grid md:grid-cols-5 gap-10">
            <div className="text-center p-4">
              <ShieldCheck className="w-12 h-12 text-sky-accent mx-auto mb-4" strokeWidth={1.5} />
              <h3 className="text-xl font-bold text-charcoal mb-2">Stay Independent</h3>
              <p className="text-stone-500 text-sm">Build your own brand with a stunning, customizable landing page.</p>
            </div>
             <div className="text-center p-4">
              <Calendar className="w-12 h-12 text-sky-accent mx-auto mb-4" strokeWidth={1.5} />
              <h3 className="text-xl font-bold text-charcoal mb-2">Effortless Setup</h3>
              <p className="text-stone-500 text-sm">Intuitive dashboard and iCal integration make managing properties a breeze.</p>
            </div>
            <div className="text-center p-4">
              <Star className="w-12 h-12 text-sky-accent mx-auto mb-4" strokeWidth={1.5} />
              <h3 className="text-xl font-bold text-charcoal mb-2">Branded Showcase</h3>
              <p className="text-stone-500 text-sm">Impress guests with a premium, elegant showcase of your properties.</p>
            </div>
            <div className="text-center p-4">
              <DollarSign className="w-12 h-12 text-sky-accent mx-auto mb-4" strokeWidth={1.5} />
              <h3 className="text-xl font-bold text-charcoal mb-2">Lower Fees</h3>
              <p className="text-stone-500 text-sm">Our low-fee structure means you keep more of your hard-earned money.</p>
            </div>
             <div className="text-center p-4">
              <MapPin className="w-12 h-12 text-sky-accent mx-auto mb-4" strokeWidth={1.5} />
              <h3 className="text-xl font-bold text-charcoal mb-2">Boost Visibility</h3>
              <p className="text-stone-500 text-sm">Attract more guests and drive direct bookings with Google Maps integration.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Onboarding Section */}
      <section id="onboarding" className="py-24 bg-white/60">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-serif font-bold text-charcoal mb-16">Effortless Onboarding, Seamless Support</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-3xl border border-stone-200 feature-card transition-all">
              <div className="bg-sky-accent/10 text-sky-accent rounded-xl w-16 h-16 flex items-center justify-center mb-6"><Search className="w-8 h-8" /></div>
              <h3 className="text-2xl font-bold text-charcoal mb-3">Google & SEO Setup</h3>
              <p className="text-stone-500">We set up your Google Maps profile and optimize your search results to ensure guests can find you easily.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-stone-200 feature-card transition-all">
              <div className="bg-sky-accent/10 text-sky-accent rounded-xl w-16 h-16 flex items-center justify-center mb-6"><Building className="w-8 h-8" /></div>
              <h3 className="text-2xl font-bold text-charcoal mb-3">Profile & Unit Setup</h3>
              <p className="text-stone-500">We handle the initial setup and provide personalized training to help you add and manage your units with confidence.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-stone-200 feature-card transition-all">
              <div className="bg-sky-accent/10 text-sky-accent rounded-xl w-16 h-16 flex items-center justify-center mb-6"><Book className="w-8 h-8" /></div>
              <h3 className="text-2xl font-bold text-charcoal mb-3">Go-Live & Booking Support</h3>
              <p className="text-stone-500">We provide early, hands-on support to ensure your booking feature runs smoothly from day one.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24">
        <div className="container mx-auto text-center">
           <h2 className="text-4xl font-serif font-bold text-charcoal mb-16">Choose Your Perfect Plan</h2>
           <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">

            {/* Basic Plan */}
            <div className="bg-[#F7F5F0] p-8 rounded-3xl border border-stone-200 flex flex-col feature-card transition-all">
              <h3 className="text-2xl font-bold text-charcoal mb-4">{SubscriptionType.BASIC}</h3>
              <p className="text-5xl font-extrabold text-charcoal mb-2">$19<span className="text-xl font-medium text-stone-500">/mo</span></p>
              <p className="text-stone-500 mb-8">For those just starting out.</p>
              <ul className="space-y-4 text-left text-stone-500 mb-10">
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-sky-accent mr-3" />Up to 5 properties</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-sky-accent mr-3" />Basic Booking Engine</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-sky-accent mr-3" />Email Support</li>
              </ul>
              <button className="mt-auto w-full bg-stone-200 text-charcoal font-bold py-3 px-6 rounded-lg hover:bg-stone-300 transition-colors">Get Started</button>
            </div>

            {/* Pro Plan */}
            <div className="bg-sky-500 text-white p-8 rounded-3xl shadow-2xl shadow-sky-accent/20 flex flex-col transform scale-105 feature-card transition-all">
              <h3 className="text-2xl font-bold text-white mb-4">{SubscriptionType.PRO}</h3>
              <p className="text-5xl font-extrabold text-white mb-2">$49<span className="text-xl font-medium text-white/80">/mo</span></p>
              <p className="text-white/80 mb-8">For the growing business.</p>
              <ul className="space-y-4 text-left text-white mb-10">
                <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-3" />Up to 20 properties</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-3" />Advanced Booking Engine</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-3" />Premium Landing Pages</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-3" />Priority Support</li>
              </ul>
              <button className="mt-auto w-full bg-white text-sky-500 font-bold py-3 px-6 rounded-lg hover:bg-opacity-90 transition-colors">Choose Pro</button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-[#F7F5F0] p-8 rounded-3xl border border-stone-200 flex flex-col feature-card transition-all">
              <h3 className="text-2xl font-bold text-charcoal mb-4">{SubscriptionType.ENTERPRISE}</h3>
              <p className="text-5xl font-extrabold text-charcoal mb-2">Custom</p>
              <p className="text-stone-500 mb-8">For large-scale operations.</p>
              <ul className="space-y-4 text-left text-stone-500 mb-10">
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-sky-accent mr-3" />Unlimited Properties</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-sky-accent mr-3" />Custom Solutions</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-sky-accent mr-3" />Dedicated Manager</li>
              </ul>
              <button className="mt-auto w-full bg-stone-200 text-charcoal font-bold py-3 px-6 rounded-lg hover:bg-stone-300 transition-colors">Contact Us</button>
            </div>

           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/60 py-8">
        <div className="container mx-auto text-center text-stone-500">
          <p>&copy; {new Date().getFullYear()} Sanctum. All rights reserved.</p>
          <div className="flex justify-center space-x-6 mt-4">
            <a href="#" className="hover:text-sky-accent transition-colors">Imprint</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default ProductLandingPage;
