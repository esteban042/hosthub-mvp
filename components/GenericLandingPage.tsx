import React from 'react';

import Header from './landing/Header';
import Hero from './landing/Hero';
import Process from './landing/Process';
import Pricing from './landing/Pricing';
import ROI from './landing/ROI';
import Demo from './landing/Demo';
import Footer from './landing/Footer';

const GenericLandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-dm antialiased">
      <Header />
      <main>
        <Hero />
        <Process />
        <Pricing />
        <ROI />
        <Demo />
      </main>
      <Footer />
    </div>
  );
};

export default GenericLandingPage;
