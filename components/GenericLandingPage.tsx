import React, { useEffect } from 'react';

import Header from './landing/Header';
import Hero from './landing/Hero';
import Process from './landing/Process';
import Pricing from './landing/Pricing';
import ROI from './landing/ROI';
import Demo from './landing/Demo';
import Footer from './landing/Footer';

const GenericLandingPage: React.FC = () => {
  useEffect(() => {
    // Set the background color when the component mounts
    document.body.style.backgroundColor = 'white';

    // Return a cleanup function to reset the background color when the component unmounts
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, []); // Empty dependency array ensures this runs only on mount and unmount

  return (
    <div className="min-h-screen font-dm antialiased">
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
