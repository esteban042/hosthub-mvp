import React from 'react';
import { Logo } from '../Logo';

const Header: React.FC = () => {
  const navLinks = [
    { label: 'Pricing', href: '#pricing' },
    { label: 'ROI', href: '#roi-calculator' },
    { label: 'Demo', href: '#demo' },
  ];

  return (
    <header className="bg-white shadow-md">
      <div className="px-6 py-4 flex justify-between items-center">
        <Logo className="h-8 text-brand-green" />
        <nav className="flex items-center space-x-9">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="text-sm font-semibold text-gray-600 hover:text-brand-green uppercase tracking-wider transition-colors">
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
