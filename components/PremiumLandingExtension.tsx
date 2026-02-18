import React from 'react';
import { PremiumConfig, PremiumSection } from '../types';
import { SKY_ACCENT, TEXT_COLOR } from '../constants';

const PremiumLandingExtension: React.FC<{ config: PremiumConfig, hostName: string }> = ({ config, hostName }) => {
  if (!config.isEnabled) return null;

  return (
    <div className="mt-40 space-y-40 animate-in fade-in duration-1000">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-teal-600">Host Feature</span>
        <h2 className="text-5xl md:text-7xl font-serif font-bold tracking-tight leading-tight" style={{ color: TEXT_COLOR }}>
          Beyond the <span className="italic text-sky-700">Ordinary</span>
        </h2>
        <p className="text-xl text-charcoal/80 font-medium leading-relaxed max-w-2xl mx-auto">
          We don't just provide accommodation; we curate environments where memories take root and flourish. Explore the heart of our hospitality.
        </p>
      </div>

      <div className="space-y-32">
        {config.sections.map((section: PremiumSection, idx: number) => {
          const isEven = idx % 2 === 0;
          const imageUrl = config.images[idx % config.images.length];
          const secondImageUrl = config.images[(idx + 1) % config.images.length];

          return (
            <div key={idx} className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-16 lg:gap-24 items-center`}>
              <div className="w-full lg:w-1/2 relative">
                <div className={`aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-stone-200 shadow-2xl relative z-10 ${isEven ? 'ml-0' : 'ml-auto'}`}>
                  <img src={imageUrl} className="w-full h-full object-cover" alt={section.title} />
                  <div className="absolute inset-0 bg-stone-950/10 hover:bg-transparent transition-colors duration-500" />
                </div>
                <div className={`absolute -bottom-12 ${isEven ? '-right-12' : '-left-12'} hidden lg:block w-48 h-64 rounded-2xl overflow-hidden border-4 border-white shadow-2xl z-20`}>
                   <img src={secondImageUrl} className="w-full h-full object-cover" alt="Detail" />
                </div>
              </div>

              <div className="w-full lg:w-1/2 space-y-8">
                <div className="flex items-center space-x-4">
                  <span className="font-serif text-5xl opacity-30 text-sky-700/70 italic">0{idx + 1}</span>
                  <div className="h-px w-12 bg-stone-200"></div>
                  <h3 className="text-3xl md:text-4xl font-serif font-bold tracking-tight" style={{ color: TEXT_COLOR }}>{section.title}</h3>
                </div>
                <p className="text-xl leading-relaxed text-charcoal/80 font-medium">
                  {section.content}
                </p>

              </div>
            </div>
          );
        })}
      </div>

      {config.images.length > 3 && (
        <div className="pt-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-[400px]">
            {config.images.slice(0, 4).map((img: string, i: number) => (
              <div key={i} className={`rounded-3xl overflow-hidden border border-stone-200 relative group h-full ${i % 2 === 0 ? 'mt-8' : 'mb-8'}`}>
                <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={`Gallery ${i}`} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumLandingExtension;
