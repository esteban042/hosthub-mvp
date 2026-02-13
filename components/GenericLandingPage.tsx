
import React from 'react';
import { Host, SubscriptionType } from '../types';
import { CORE_ICONS } from '../constants';
import { ArrowRight, CheckCircle } from 'lucide-react';

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
    <div className="min-h-screen bg-[#1A1A1A] text-gray-300 font-sans">

      {/* Navigation */}
      <nav className="container mx-auto p-6 flex justify-between items-center">
        <div className="text-2xl font-bold text-white">Sanctum</div>
        <div className="space-x-6 flex items-center">
          <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
          <a href="#pricing" className="hover:text-emerald-400 transition-colors">Pricing</a>
          {/* <button onClick={onSignIn} className="bg-emerald-500 text-white font-bold py-2 px-4 rounded-full hover:bg-emerald-600 transition-all">Sign In</button> */}
        </div>
      </nav>

      {/* Hero Section */}
      <header className="text-center py-24 container mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">Your Brand, Your Rules. True Host Independence.</h1>
        <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto">Finally, a platform that puts you in control. A secure, elegant, and effortless solution for independent hosts.</p>
        <div className="relative max-w-md mx-auto">
          <select
            id="host-select"
            defaultValue=""
            onChange={(e) => handleHostRedirect(e.target.value)}
            className="bg-[#2C2C2C] text-white p-4 rounded-full w-full appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-400 text-center text-lg"
          >
            <option value="" disabled>Explore a Showcase</option>
            {hosts.map(host => (
              <option key={host.id} value={host.slug}>{host.slug}</option>
            ))}
          </select>
          <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-emerald-400 pointer-events-none" />
        </div>
      </header>

      {/* Why Sanctum Section */}
      <section id="features" className="py-20 bg-[#2C2C2C]">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-2">Less Overhead, More Hosting</h2>
          <p className="text-lg text-gray-400 mb-12">A streamlined experience, built for you.</p>
          <div className="grid md:grid-cols-5 gap-8 text-left">
            <div className="p-6">
              <div className="text-emerald-400 mb-4">{CORE_ICONS.ShieldCheck("w-10 h-10")}</div>
              <h3 className="text-2xl font-bold text-white mb-3">Stay Independent</h3>
              <p className="text-gray-400">Build your own brand with a stunning, customizable landing page. No more competing with other listings.</p>
            </div>
            <div className="p-6">
              <div className="text-emerald-400 mb-4">{CORE_ICONS.Calendar("w-10 h-10")}</div>
              <h3 className="text-2xl font-bold text-white mb-3">Effortless Setup</h3>
              <p className="text-gray-400">Get up and running in minutes. Our intuitive dashboard and iCal integration make managing your properties a breeze.</p>
            </div>
            <div className="p-6">
              <div className="text-emerald-400 mb-4">{CORE_ICONS.Star("w-10 h-10")}</div>
              <h3 className="text-2xl font-bold text-white mb-3">Branded Showcase</h3>
              <p className="text-gray-400">Impress your guests with a premium, elegant showcase of your properties. A professional look, without the fuss.</p>
            </div>
            <div className="p-6">
              <div className="text-emerald-400 mb-4">{CORE_ICONS.Dollar("w-10 h-10")}</div>
              <h3 className="text-2xl font-bold text-white mb-3">Lower Fees, More Profit</h3>
              <p className="text-gray-400">Tired of high commissions? Our low-fee structure means you keep more of your hard-earned money.</p>
            </div>
            <div className="p-6">
              <div className="text-emerald-400 mb-4">{CORE_ICONS.MapPin("w-10 h-10")}</div>
              <h3 className="text-2xl font-bold text-white mb-3">Boost Your Visibility</h3>
              <p className="text-gray-400">Integrate with Google Maps to attract more guests and drive direct bookings, boosting your online presence.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Onboarding Section */}
<section id="onboarding" className="py-24 bg-[#1A1A1A]">
  <div className="container mx-auto text-center">
    <h2 className="text-4xl font-bold text-white mb-12">Effortless Onboarding, Seamless Support</h2>
    <div className="grid md:grid-cols-3 gap-12 text-left max-w-6xl mx-auto">
      
      <div className="bg-[#2C2C2C] p-8 rounded-2xl border border-gray-700">
        <div className="text-emerald-400 mb-4">{CORE_ICONS.Search("w-10 h-10")}</div>
        <h3 className="text-2xl font-bold text-white mb-3">Google Presence & SEO</h3>
        <p className="text-gray-400">We set up your Google Maps profile and link, then check and optimize your search results to ensure guests can find you easily.</p>
      </div>

      <div className="bg-[#2C2C2C] p-8 rounded-2xl border border-gray-700">
        <div className="text-emerald-400 mb-4">{CORE_ICONS.Building("w-10 h-10")}</div>
        <h3 className="text-2xl font-bold text-white mb-3">Profile & Unit Setup</h3>
        <p className="text-gray-400">We handle the initial setup of your host information and provide personalized training to help you add and manage your units with confidence.</p>
      </div>

      <div className="bg-[#2C2C2C] p-8 rounded-2xl border border-gray-700">
        <div className="text-emerald-400 mb-4">{CORE_ICONS.Bookings("w-10 h-10")}</div>
        <h3 className="text-2xl font-bold text-white mb-3">Go-Live & Booking Support</h3>
        <p className="text-gray-400">After you go live, we provide early, hands-on support to ensure your booking feature runs smoothly from day one, so you can focus on your guests.</p>
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
            <div className="bg-[#2C2C2C] p-8 rounded-2xl border border-gray-700 flex flex-col">
              <h3 className="text-2xl font-bold text-white mb-4">{SubscriptionType.BASIC}</h3>
              <p className="text-5xl font-extrabold text-white mb-2">$19<span className="text-xl font-medium text-gray-400">/mo</span></p>
              <p className="text-gray-400 mb-8">For those just starting out.</p>
              <ul className="space-y-4 text-left text-gray-300 mb-10">
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-emerald-400 mr-3" />Up to 5 properties</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-emerald-400 mr-3" />Basic Booking Engine</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-emerald-400 mr-3" />Email Support</li>
              </ul>
              <button className="mt-auto w-full bg-gray-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-500 transition-colors">Get Started</button>
            </div>

            {/* Pro Plan */}
            <div className="bg-emerald-500 p-8 rounded-2xl shadow-2xl shadow-emerald-500/20 flex flex-col transform scale-105">
              <h3 className="text-2xl font-bold text-white mb-4">{SubscriptionType.PRO}</h3>
              <p className="text-5xl font-extrabold text-white mb-2">$49<span className="text-xl font-medium text-emerald-100">/mo</span></p>
              <p className="text-emerald-100 mb-8">For the growing business.</p>
              <ul className="space-y-4 text-left text-white mb-10">
                <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-3" />Up to 20 properties</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-3" />Advanced Booking Engine</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-3" />Premium Landing Pages</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-3" />Priority Support</li>
              </ul>
              <button className="mt-auto w-full bg-white text-emerald-900 font-bold py-3 px-6 rounded-lg hover:bg-opacity-90 transition-colors">Choose Pro</button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-[#2C2C2C] p-8 rounded-2xl border border-gray-700 flex flex-col">
              <h3 className="text-2xl font-bold text-white mb-4">{SubscriptionType.ENTERPRISE}</h3>
              <p className="text-5xl font-extrabold text-white mb-2">Custom</p>
              <p className="text-gray-400 mb-8">For large-scale operations.</p>
              <ul className="space-y-4 text-left text-gray-300 mb-10">
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-emerald-400 mr-3" />Unlimited Properties</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-emerald-400 mr-3" />Custom Solutions</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-emerald-400 mr-3" />Dedicated Manager</li>
              </ul>
              <button className="mt-auto w-full bg-gray-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-500 transition-colors">Contact Us</button>
            </div>

           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2C2C2C] py-8">
        <div className="container mx-auto text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Sanctum. All rights reserved.</p>
          <div className="flex justify-center space-x-6 mt-4">
            <a href="#" className="hover:text-white transition-colors">Imprint</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default ProductLandingPage;
