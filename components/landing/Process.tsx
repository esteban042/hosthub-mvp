import React from 'react';
import { Globe, CreditCard, Calendar, MessageCircle, BarChart2, Shield, Rocket } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Feature: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => {
  return (
    <div className="bg-[#333333]/90 p-6 rounded-lg shadow-md text-center">
      <div className="flex justify-center mb-4">
        <div className="bg-cyan-700/80 text-white rounded-lg p-3">
          {icon}
        </div>
      </div>
      <div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-white/80">{children}</p>
      </div>
    </div>
  );
};

const Process: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div 
      id="process" 
      className="py-24 sm:py-32"
      style={{
        backgroundImage: 'url(/images/background.svg)',
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        filter: 'opacity(0.85)'
      }}
    >
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold uppercase tracking-widest">{t('landing_page.process.ultimate_toolkit')}</h2>
          <p className="mt-4 text-4xl sm:text-5xl font-extrabold text-charcoal tracking-tight">{t('landing_page.process.title')}</p>
          <p className="mt-6 text-xl text-charcoal/80 max-w-3xl mx-auto">{t('landing_page.process.subtitle')}</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <Feature icon={<Globe size={24} />} title={t('landing_page.process.features.direct_booking_site.title')}>
            {t('landing_page.process.features.direct_booking_site.description')}
          </Feature>
          <Feature icon={<CreditCard size={24} />} title={t('landing_page.process.features.seamless_payments.title')}>
            {t('landing_page.process.features.seamless_payments.description')}
          </Feature>
          <Feature icon={<Calendar size={24} />} title={t('landing_page.process.features.unified_calendar.title')}>
            {t('landing_page.process.features.unified_calendar.description')}
          </Feature>
          <Feature icon={<MessageCircle size={24} />} title={t('landing_page.process.features.automated_messaging.title')}>
            {t('landing_page.process.features.automated_messaging.description')}
          </Feature>
          <Feature icon={<BarChart2 size={24} />} title={t('landing_page.process.features.dynamic_pricing.title')}>
            {t('landing_page.process.features.dynamic_pricing.description')}
          </Feature>
          {/* <Feature icon={<Shield size={24} />} title="Build Your Brand, Not Theirs">
            Every direct booking is a customer you own. Build a brand that guests trust and a direct booking channel that grows over time.
          </Feature> */}
          <Feature icon={<Rocket size={24} />} title={t('landing_page.process.features.ready_to_go.title')}>
             {t('landing_page.process.features.ready_to_go.description')}
          </Feature>
        </div>
      </div>
    </div>
  );
};

export default Process;
