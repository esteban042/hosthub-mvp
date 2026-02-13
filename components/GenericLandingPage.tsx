
import React from 'react';
import { Host, SubscriptionType } from '../types';
import { CORE_ICONS } from '../constants';
import { ArrowRight, CheckCircle } from 'lucide-react';

interface GenericLandingPageProps {
  hosts: Host[];
}

const ProductLandingPage: React.FC<GenericLandingPageProps> = ({ hosts }) => {
  const handleHostSelection = (slug: string) => {
    if (slug) {
      window.location.href = `/?host=${slug}`;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] text-gray-200 font-sans">

      {/* Navigation */}
      <nav className="container mx-auto p-6 flex justify-between items-center">
        <div className="text-2xl font-bold text-white">Sanctum</div>
        <div className="space-x-6 flex items-center">
          <a href="#features" className="hover:text-[#66FCF1] transition-colors">Features</a>
          <a href="#pricing" className="hover:text-[#66FCF1] transition-colors">Pricing</a>
          <a href="#" className="bg-[#66FCF1] text-[#0B0C10] font-bold py-2 px-4 rounded-full hover:bg-opacity-90 transition-all">Sign In</a>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="text-center py-24 container mx-auto">
        <h1 className="text-6xl md:text-7xl font-extrabold text-white mb-4 leading-tight">The Future of Property Management is Here</h1>
        <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto">Elevate your hosting experience with a tool that's as professional and detail-oriented as you are.</p>
        <div className="relative max-w-md mx-auto">
          <select
            id="host-select"
            defaultValue=""
            onChange={(e) => handleHostSelection(e.target.value)}
            className="bg-[#1F2833] text-white p-4 rounded-full w-full appearance-none focus:outline-none focus:ring-2 focus:ring-[#66FCF1] text-center text-lg"
          >
            <option value="" disabled>Explore a Showcase</option>
            {hosts.map(host => (
              <option key={host.id} value={host.slug}>{host.slug}</option>
            ))}
          </select>
          <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[#66FCF1] pointer-events-none" />
        </div>
      </header>

      {/* Why Sanctum Section */}
      <section id="features" className="py-20 bg-[#1F2833]">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-2">Why Sanctum?</h2>
          <p className="text-lg text-gray-400 mb-12">Everything you need, nothing you don't.</p>
          <div className="grid md:grid-cols-3 gap-12 text-left">
            <div className="p-6">
              <div className="text-[#66FCF1] mb-4">{CORE_ICONS.ShieldCheck("w-10 h-10")}</div>
              <h3 className="text-2xl font-bold text-white mb-3">Total Control</h3>
              <p className="text-gray-400">Manage your properties, bookings, and availability with an intuitive and powerful dashboard. No hidden fees, no surprises.</p>
            </div>
            <div className="p-6">
              <div className="text-[#66FCF1] mb-4">{CORE_ICONS.Calendar("w-10 h-10")}</div>
              <h3 className="text-2xl font-bold text-white mb-3">Unified Calendar</h3>
              <p className="text-gray-400">Sync your bookings across platforms with iCal integration. Say goodbye to double-bookings forever.</p>
            </div>
            <div className="p-6">
              <div className="text-[#66FCF1] mb-4">{CORE_ICONS.Building("w-10 h-10")}</div>
              <h3 className="text-2xl font-bold text-white mb-3">Stunning Showcase</h3>
              <p className="text-gray-400">Generate a beautiful, modern landing page for your properties. Give your guests a premium experience from the first click.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24">
        <div className="container mx-auto text-center">
           <h2 className="text-4xl font-bold text-white mb-12">Choose Your Perfect Plan</h2>
           <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">

            {/* Basic Plan */}
            <div className="bg-[#1F2833] p-8 rounded-2xl border border-gray-700 flex flex-col">
              <h3 className="text-2xl font-bold text-white mb-4">{SubscriptionType.BASIC}</h3>
              <p className="text-5xl font-extrabold text-white mb-2">$19<span className="text-xl font-medium text-gray-400">/mo</span></p>
              <p className="text-gray-400 mb-8">For those just starting out.</p>
              <ul className="space-y-4 text-left text-gray-300 mb-10">
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-[#66FCF1] mr-3" />Up to 5 properties</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-[#66FCF1] mr-3" />Basic Booking Engine</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-[#66FCF1] mr-3" />Email Support</li>
              </ul>
              <button className="mt-auto w-full bg-gray-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-500 transition-colors">Get Started</button>
            </div>

            {/* Pro Plan */}
            <div className="bg-[#66FCF1] p-8 rounded-2xl shadow-2xl shadow-[#66fcf1]/20 flex flex-col transform scale-105">
              <h3 className="text-2xl font-bold text-[#0B0C10] mb-4">{SubscriptionType.PRO}</h3>
              <p className="text-5xl font-extrabold text-[#0B0C10] mb-2">$49<span className="text-xl font-medium text-gray-800">/mo</span></p>
              <p className="text-[#1F2833] mb-8">For the growing business.</p>
              <ul className="space-y-4 text-left text-[#1F2833] mb-10">
                <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-3" />Up to 20 properties</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-3" />Advanced Booking Engine</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-3" />Premium Landing Pages</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-3" />Priority Support</li>
              </ul>
              <button className="mt-auto w-full bg-[#0B0C10] text-white font-bold py-3 px-6 rounded-lg hover:bg-black transition-colors">Choose Pro</button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-[#1F2833] p-8 rounded-2xl border border-gray-700 flex flex-col">
              <h3 className="text-2xl font-bold text-white mb-4">{SubscriptionType.ENTERPRISE}</h3>
              <p className="text-5xl font-extrabold text-white mb-2">Custom</p>
              <p className="text-gray-400 mb-8">For large-scale operations.</p>
              <ul className="space-y-4 text-left text-gray-300 mb-10">
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-[#66FCF1] mr-3" />Unlimited Properties</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-[#66FCF1] mr-3" />Custom Solutions</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-[#66FCF1] mr-3" />Dedicated Manager</li>
              </ul>
              <button className="mt-auto w-full bg-gray-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-500 transition-colors">Contact Us</button>
            </div>

           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1F2833] py-8">
        <div className="container mx-auto text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Sanctum. All rights reserved.</p>
          <div className="flex justify-center space-x-6 mt-4">
            <a href="#" className="hover:text-white transition-colors">{CORE_ICONS.Twitter("w-6 h-6")}</a>
            <a href="#" className="hover:text-white transition-colors">{CORE_ICONS.Instagram("w-6 h-6")}</a>
            <a href="#" className="hover:text-white transition-colors">{CORE_ICONS.Facebook("w-6 h-6")}</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default ProductLandingPage;
