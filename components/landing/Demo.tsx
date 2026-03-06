import React, { useState, useEffect } from 'react';

interface Host {
  name: string;
  slug: string;
}

const Demo: React.FC = () => {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [selectedHost, setSelectedHost] = useState<string>('');

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

  const handleHostChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedHost(event.target.value);
  };

  const handleExploreClick = () => {
    
    if (selectedHost) {
      window.open(`https://app.sanctum.fm/${selectedHost}`, '_blank');
    }
  };

  return (
    <div id="demo" className="bg-white py-24 sm:py-32">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-charcoal tracking-tight">See It in Action</h2>
          <p className="mt-6 text-xl text-charcoal/80 max-w-3xl mx-auto">Words are cheap. See how Sanctum looks and feels from a guest's perspective. Select a demo host to explore their live booking site.</p>
        </div>
        <div className="max-w-md mx-auto">
          <div className="flex flex-col items-center">
            <div className="relative w-full mb-4">
              <select 
                onChange={handleHostChange}
                value={selectedHost}
                className="w-full p-4 pl-10 text-lg text-charcoal bg-white border-2 border-stone-200/80 rounded-full appearance-none focus:outline-none focus:ring-2 focus:ring-brand-green/80 focus:border-transparent shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
              >
                <option value="" disabled>Choose an example host</option>
                {hosts.map(host => (
                  <option key={host.slug} value={host.slug}>
                    {host.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-6 h-6 text-charcoal/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                 <svg className="w-5 h-5 text-charcoal/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
            <button
              onClick={handleExploreClick}
              disabled={!selectedHost}
              className={`bg-brand-green text-white font-bold py-4 px-8 rounded-full transition-all text-sm uppercase tracking-wider ${!selectedHost ? 'opacity-50 cursor-not-allowed' : 'hover:bg-brand-green/90 active:scale-95'}`}
            >
              Explore Site
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo;
