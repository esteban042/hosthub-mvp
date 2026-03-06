import React from 'react';
import { Logo } from '../Logo';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#F9F7F4] text-charcoal">
      <div className="container mx-auto px-6 py-12">
        <hr className="border-stone-200/80 mb-12" />
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end">
          <div className="mb-8 md:mb-0 text-center md:text-left">
            <Logo className="h-9 text-charcoal/90 inline-block" />
            <p className="text-charcoal/60 mt-4">© {new Date().getFullYear()} Geobit LLC. All rights reserved.</p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-lg font-semibold text-charcoal/80">hello@sanctum.fm</p>
            <p className="text-charcoal/60 mt-1">Design & Engineering by <a href="https://bridger.to" target="_blank" rel="noopener noreferrer" className="underline hover:text-charcoal">Bridger</a></p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
