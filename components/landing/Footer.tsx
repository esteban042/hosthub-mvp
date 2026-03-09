import React from 'react';
import { Logo } from '../Logo';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#F9F7F4] text-charcoal">
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col items-center space-y-4">
          <Logo className="h-9 text-charcoal/90" />
          <p className="text-charcoal/80">© {new Date().getFullYear()} Geobit LLC. </p>
          <p className="text-charcoal/50">All rights reserved.</p>
          <p className="text-charcoal/50">sanctum@geobit.info</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
