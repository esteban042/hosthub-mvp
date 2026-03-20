import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface Host {
  name: string;
  slug: string;
  businessName: string;

}

const Demo: React.FC = () => {
  const { t } = useTranslation();
  const [hosts, setHosts] = useState<Host[]>([]);

  useEffect(() => {
    const fetchHosts = async () => {
      try {
        const response = await fetch('/api/v1/public-hosts');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const publicHosts = await response.json();
        setHosts(publicHosts);
      } catch (error) {
        console.error("Error fetching hosts:", error);
      }
    };

    fetchHosts();
  }, []);

  const handleHostRedirect = (slug: string) => {
    if (slug) {
      window.open(`?host=${slug}`, '_blank');
    }
  };

  return (
    <div id="demo" className="bg-white py-24 sm:py-32">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-charcoal tracking-tight">{t('landing_page.demo.title')}</h2>
          <p className="mt-6 text-xl text-charcoal/80 max-w-3xl mx-auto">{t('landing_page.demo.description')}</p>
        </div>
        <div className="relative max-w-md mx-auto">
          <select
            id="host-select"
            defaultValue=""
            onChange={(e) => handleHostRedirect(e.target.value)}
            className="w-full p-4 pl-6 text-lg text-center text-charcoal bg-white border-2 border-stone-200/80 rounded-full appearance-none focus:outline-none focus:ring-2 focus:ring-brand-green/80 focus:border-transparent shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
          >
            <option value="" disabled>{t('landing_page.demo.explore_showcase')}</option>
            {hosts.map(host => (
              <option key={host.slug} value={host.slug} className="text-white">{host.slug}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
            <svg className="w-5 h-5 text-charcoal/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo;
