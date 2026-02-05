import React, { useState } from 'react';
import { UserRole, Host, User } from '../types';
import { EMERALD_ACCENT } from '../pages/GuestLandingPage'; // Import EMERALD_ACCENT

interface LayoutProps {
  children: React.ReactNode;
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentHost: Host;
  allHosts: Host[];
  onHostChange: (slug: string) => void;
  user: User | null;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  role, 
  setRole, 
  currentHost, 
  allHosts,
  onHostChange,
  user,
  onLogout
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-stone-950 text-stone-200">
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-transparent border border-emerald-400 rounded-xl flex items-center justify-center"> {/* Updated for outline/no fill */}
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            </div>
            <h1 className="text-2xl font-serif font-bold text-emerald-400">Wanderlust</h1> {/* Updated text color */}
          </div>
          
          <nav className="hidden md:flex items-center space-x-1">
             {(['guest', 'host', 'admin'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
                    role === r 
                      ? 'text-white' 
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
          </nav>

          <div className="flex items-center space-x-4">
            <button className="hidden md:block bg-stone-900/40 backdrop-blur-md border border-stone-800 px-6 py-2.5 rounded-xl text-sm font-semibold text-stone-200 hover:bg-stone-800 transition-colors">
              Explore
            </button>
            
            {user ? (
               <div className="flex items-center space-x-3">
                 <img src={user.avatar} className="w-10 h-10 rounded-full border border-stone-800" alt="Avatar" />
                 <button onClick={onLogout} className="text-stone-400 hover:text-white text-xs font-bold uppercase tracking-wider">Logout</button>
               </div>
            ) : (
              <button 
                onClick={() => setRole(UserRole.HOST)}
                className="bg-transparent border border-emerald-400 hover:bg-emerald-400 hover:text-white text-emerald-400 px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center space-x-2 transition-all shadow-lg shadow-emerald-400/20"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-stone-950 border-t border-stone-900 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <h2 className="text-xl font-serif font-bold text-emerald-400">Wanderlust</h2> {/* Updated text color */}
          <p className="text-stone-500 text-sm">© 2025 Wanderlust Luxury Stays. All rights reserved.</p>
          <div className="flex space-x-6 text-sm text-stone-400 font-medium">
             <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
             <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
             <span className="hover:text-white cursor-pointer transition-colors">Sitemap</span>
          </div>
        </div>
      </footer>
    </div>
  );
};