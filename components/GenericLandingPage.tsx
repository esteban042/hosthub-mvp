
import React from 'react';
import { Host } from '../types.js';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface GenericLandingPageProps {
  hosts: Host[];
  onSignIn: () => void;
  onHostChange: (slug: string) => void;
}

const GenericLandingPage: React.FC<GenericLandingPageProps> = ({ hosts, onSignIn, onHostChange }) => {

  const handleHostRedirect = (slug: string) => {
    window.location.href = `/?host=${slug}`;
  };

  return (
    <div className="min-h-screen bg-stone-50 text-charcoal font-sans">
      {/* Navigation */}
      <nav className="container mx-auto p-6 flex justify-between items-center">
        <div className="text-3xl font-bold text-charcoal">Sanctum</div>
        <div className="space-x-8 flex items-center text-sm font-medium">
          <Link to="/hosts" className="hover:text-sky-accent transition-colors">Are you a Host?</Link>
          <button onClick={onSignIn} className="bg-sky-accent text-white px-6 py-3 rounded-full font-bold hover:bg-sky-accent/90 transition-all">Sign In</button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="text-center py-24 md:py-32 container mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-charcoal">The All-in-One Platform for Independent Hosts</h1>
        <p className="text-xl md:text-2xl text-stone-500 mb-12 max-w-3xl mx-auto">Direct bookings, automated communication, and effortless management. All under your brand.</p>
        <div className="flex justify-center items-center space-x-4">
            <Link to="/hosts" className="bg-sky-accent text-white px-8 py-4 rounded-full font-bold hover:bg-sky-accent/90 transition-all text-lg">
                Learn More
            </Link>
            <div className="relative max-w-md mx-auto">
                <select
                    id="host-select"
                    defaultValue=""
                    onChange={(e) => handleHostRedirect(e.target.value)}
                    className="bg-white border-2 border-stone-200 text-charcoal p-4 rounded-full w-full appearance-none focus:outline-none focus:ring-2 focus:ring-sky-accent text-center text-lg cursor-pointer"
                >
                    <option value="" disabled>— Explore a Live Demo —</option>
                    {hosts.map(host => (
                    <option key={host.id} value={host.slug} className="text-charcoal">{host.businessName || host.slug}</option>
                    ))}
                </select>
                <ArrowRight className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-stone-400 pointer-events-none" />
            </div>
        </div>
      </header>

      {/* Footer */}
      <footer className="bg-white py-8">
        <div className="container mx-auto text-center text-stone-500">
          <p>&copy; {new Date().getFullYear()} Sanctum. All rights reserved.</p>
          <div className="flex justify-center space-x-6 mt-4">
            <a href="#" className="hover:text-sky-accent transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-sky-accent transition-colors">Privacy Policy</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default GenericLandingPage;
