import React, { useState } from 'react';
import { UserRole, Host, User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  role: UserRole;
  setRole: (role: UserRole) => void;
  onSignIn: () => void;
  currentHost: Host;
  allHosts: Host[];
  onHostChange: (slug: string) => void;
  user: User | null;
  onLogout: () => void;
}

const LegalModal: React.FC<{ title: string; isOpen: boolean; onClose: () => void; children: React.ReactNode }> = ({ title, isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-charcoal/90 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-alabaster border border-charcoal/10 w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col">
        <div className="p-8 border-b border-charcoal/10 flex items-center justify-between bg-alabaster/50 backdrop-blur-sm sticky top-0 z-10">
          <h3 className="text-2xl font-serif font-bold text-charcoal tracking-tight">{title}</h3>
          <button onClick={onClose} className="text-charcoal/60 hover:text-charcoal transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-8 md:p-12 overflow-y-auto text-charcoal text-sm leading-relaxed space-y-6">
          {children}
        </div>
        <div className="p-6 border-t border-charcoal/10 bg-alabaster text-center">
          <button onClick={onClose} className="text-[10px] font-bold uppercase tracking-widest text-charcoal/60 hover:text-charcoal transition-colors">Close Document</button>
        </div>
      </div>
    </div>
  );
};

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  role, 
  setRole, 
  user, 
  onLogout,
  onSignIn
}) => {
  const [activeLegal, setActiveLegal] = useState<'privacy' | 'terms' | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-alabaster text-charcoal">
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-transparent border border-sky-accent rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-sky-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            </div>
            <h1 className="text-2xl font-serif font-bold text-sky-accent">Sanctum</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            
            
            {user ? (
               <div className="flex items-center space-x-3">
                 <button onClick={onLogout} 
                className="bg-transparent border border-sky-accent text-sky-accent hover:bg-sky-accent hover:text-white px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center space-x-2 transition-all shadow-lg shadow-sky-accent/20">Logout</button>
               </div>
            ) : (
              <button 
                onClick={onSignIn}
                className="bg-transparent border border-sky-accent text-sky-accent hover:bg-sky-accent hover:text-white px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center space-x-2 transition-all shadow-lg shadow-sky-accent/20"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                <span>Log In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-alabaster border-t border-charcoal/10 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <h2 className="text-xl font-serif font-bold text-sky-accent">Sanctum</h2>
          <p className="text-charcoal/60 text-sm">© 2026 Sanctum Platform. All rights reserved.</p>
          <div className="flex space-x-6 text-sm text-charcoal font-medium">
             <button onClick={() => setActiveLegal('privacy')} className="hover:text-terracotta cursor-pointer transition-colors">Privacy</button>
             <button onClick={() => setActiveLegal('terms')} className="hover:text-terracotta cursor-pointer transition-colors">Terms</button>
             <span className="hover:text-terracotta cursor-pointer transition-colors">Sitemap</span>
          </div>
        </div>
      </footer>

      {/* Legal Modals */}
      <LegalModal title="Privacy Policy" isOpen={activeLegal === 'privacy'} onClose={() => setActiveLegal(null)}>
        <section className="space-y-4">
          <h4 className="text-charcoal font-bold uppercase tracking-widest text-xs">1. Data Collection</h4>
          <p>We collect personal information necessary for processing your luxury stay requests, including name, email, and payment preferences. This data is curated with the highest regard for discretion and security.</p>
        </section>
        <section className="space-y-4">
          <h4 className="text-charcoal font-bold uppercase tracking-widest text-xs">2. Use of Information</h4>
          <p>Your information is used exclusively to facilitate bookings, communicate with hosts, and enhance your personalized travel experience. We never share your details with third-party advertisers.</p>
        </section>
        <section className="space-y-4">
          <h4 className="text-charcoal font-bold uppercase tracking-widest text-xs">3. Digital Security</h4>
          <p>Our platform utilizes enterprise-grade encryption to protect your digital footprint. All interactions within the sanctum Network are logged and monitored for unauthorized access.</p>
        </section>
      </LegalModal>

      <LegalModal title="Terms of Service" isOpen={activeLegal === 'terms'} onClose={() => setActiveLegal(null)}>
        <section className="space-y-4">
          <h4 className="text-charcoal font-bold uppercase tracking-widest text-xs">1. Booking Philosophy</h4>
          <p>By using HostHub, you agree to respect the sanctuaries provided by our hosts. Stays are granted based on mutual trust and adherence to house-specific guidelines provided at the time of confirmation.</p>
        </section>
        <section className="space-y-4">
          <h4 className="text-charcoal font-bold uppercase tracking-widest text-xs">2. Financial Obligations</h4>
          <p>A deposit is required to secure any sanctuary. Cancellations are subject to the host's specific policy, typically requiring 72-hour notice for a partial refund. Final payments must be settled directly with the host.</p>
        </section>
        <section className="space-y-4">
          <h4 className="text-charcoal font-bold uppercase tracking-widest text-xs">3. Platform Conduct</h4>
          <p>Unauthorized access to the Host Studio or manipulation of pricing data will result in immediate termination of access to the HostHub Property Network.</p>
        </section>
      </LegalModal>
    </div>
  );
};