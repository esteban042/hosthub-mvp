import React, { useState, useEffect, useRef } from 'react';
import { Apartment, Host } from '../../types';
import { AMENITY_ICONS } from '../../constants';
import Faq from './Faq';
import CheckInInfo from './CheckInInfo';

interface ApartmentInfoProps {
  apartment: Apartment;
  host: Host;
}

const ApartmentInfo: React.FC<ApartmentInfoProps> = ({ apartment, host }) => {
  const [isMapEnlarged, setIsMapEnlarged] = useState(false);
  const aboutColRef = useRef<HTMLDivElement>(null);
  const [mapContainerHeight, setMapContainerHeight] = useState<number>(400);

  useEffect(() => {
    const updateMapHeight = () => {
      if (aboutColRef.current && window.innerWidth >= 1024) {
        setMapContainerHeight(Math.max(400, aboutColRef.current.clientHeight));
      } else {
        setMapContainerHeight(300);
      }
    };

    updateMapHeight();
    window.addEventListener('resize', updateMapHeight);
    return () => window.removeEventListener('resize', updateMapHeight);
  }, [apartment, aboutColRef]);

  const toSentenceCase = (str: string) => {
    if (!str) return '';
    const lower = str.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mb-20 items-start">
        <div ref={aboutColRef} className="lg:col-span-2 space-y-12">
          <div className="space-y-6">
            <h3 className="text-3xl font-serif font-bold text-charcoal tracking-tight">About this place</h3>
            <p className="text-xl leading-relaxed font-medium text-charcoal">
              {apartment.description}
            </p>
          </div>

          <div className="space-y-8">
            <h3 className="text-2xl font-serif font-bold text-charcoal tracking-tight">Amenities</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {apartment.amenities.map(amenity => (
                <div
                  key={amenity}
                  className="flex items-center space-x-5 p-4 rounded-2xl border border-stone-200 transition-all hover:bg-stone-100/50 active:scale-95 group"
                >
                  <div className="w-7 h-7 flex-shrink-0 group-hover:scale-110 transition-transform text-sky-accent">
                    {AMENITY_ICONS[amenity] ? AMENITY_ICONS[amenity]("w-full h-full") : AMENITY_ICONS['Default']!("w-full h-full")}
                  </div>
                  <span className="text-lg font-medium tracking-tight text-charcoal">
                    {toSentenceCase(amenity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          {apartment.mapEmbedUrl ? (
            <div
              className="relative w-full overflow-hidden rounded-[2.5rem] border border-stone-200 shadow-xl cursor-pointer"
              style={{ height: mapContainerHeight }}
              onClick={() => setIsMapEnlarged(true)}
            >
              <iframe
                src={apartment.mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Apartment Location"
              ></iframe>
              <div className="absolute inset-0 flex items-center justify-center bg-charcoal/30 opacity-0 hover:opacity-100 transition-opacity duration-300 text-white font-bold text-lg">
                <span className="px-6 py-3 bg-alabaster/80 rounded-2xl backdrop-blur-md border border-stone-200 text-xs uppercase tracking-widest text-charcoal">Enlarge Map</span>
              </div>
            </div>
          ) : (
            <div className="bg-stone-100/30 rounded-[2.5rem] border border-stone-200 h-64 flex items-center justify-center text-charcoal/75 italic">
              Location map not available
            </div>
          )}
        </div>
      </div>

      {isMapEnlarged && apartment.mapEmbedUrl && (
        <div
          className="fixed inset-0 z-[200] bg-charcoal/95 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-300"
          onClick={() => setIsMapEnlarged(false)}
        >
          <button
            onClick={() => setIsMapEnlarged(false)}
            className="absolute top-8 right-8 text-stone-300 hover:text-white transition-colors z-[210]"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div
            className="relative w-full h-full max-w-6xl max-h-[80vh] rounded-[3rem] overflow-hidden border border-stone-700 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <iframe
              src={apartment.mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Enlarged Sanctuary Location"
            ></iframe>
          </div>
        </div>
      )}
    </>
  );
};

export default ApartmentInfo;
