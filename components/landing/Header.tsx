import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const NavLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
    <a href={href} className="text-sm font-semibold leading-6 text-charcoal/80 hover:text-charcoal transition-colors duration-200">
      {children}
    </a>
  );

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${isScrolled ? 'bg-white/80 backdrop-blur-lg shadow-md' : 'bg-white'}`}>
      <nav className="container mx-auto px-6 flex items-center justify-between h-20" aria-label="Global">
        <div className="flex lg:flex-1">
          <a href="#" className="-m-1.5 p-1.5">
            <img className="h-8 w-auto" src="/images/logo.svg" alt="Sanctum" />
          </a>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-charcoal"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          <NavLink href="#process">How it Works</NavLink>
          <NavLink href="#pricing">Pricing</NavLink>
          <NavLink href="#roi">ROI Calculator</NavLink>
          <NavLink href="#demo">Live Demo</NavLink>
        </div>

      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 z-50" />
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <a href="#" className="-m-0.5 p-0.5">
                <img className="h-8 w-auto" src="/images/logo.svg" alt="Sanctum" />
              </a>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-charcoal"
                onClick={() => setIsMenuOpen(false)}
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  <a href="#process" onClick={() => setIsMenuOpen(false)} className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-charcoal hover:bg-gray-50">How it Works</a>
                  <a href="#pricing" onClick={() => setIsMenuOpen(false)} className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-charcoal hover:bg-gray-50">Pricing</a>
                  <a href="#roi" onClick={() => setIsMenuOpen(false)} className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-charcoal hover:bg-gray-50">ROI Calculator</a>
                  <a href="#demo" onClick={() => setIsMenuOpen(false)} className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-charcoal hover:bg-gray-50">Live Demo</a>
                </div>
                <div className="py-6">
                  <a href="/login" className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-charcoal hover:bg-gray-50">Host Login</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
