import React from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PricingCard: React.FC<{ plan: string, price: string, priceDescription?: string, features: string[], isPopular?: boolean, commission: string }> = ({ plan, price, priceDescription, features, isPopular, commission }) => {
  const { t } = useTranslation();

  return (
    <div className={`border rounded-2xl p-8 flex flex-col ${isPopular ? 'bg-cyan-700 text-white shadow-2xl' : 'bg-[#333333]/90 text-white'}`}>
        {isPopular && (
            <div className="text-center mb-4">
                <span className="bg-cyan-700 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">{t('landing_page.pricing.promotion_rate')}</span>
            </div>
        )}
        <h3 className="text-2xl font-bold text-charcoal text-center">{plan}</h3>
        <p className="text-5xl font-extrabold text-charcoal text-center my-4">{price}<span className="text-lg font-medium">{priceDescription || t('landing_page.pricing.per_month')}</span></p>
        <p className="text-center text-charcoal/70 font-bold mb-6">{commission}</p>
        <ul className="space-y-4 mb-8 flex-grow">
            {features.map(feature => (
                <li key={feature} className="flex items-start text-charcoal/80">
                    <Check className="w-5 h-5 text-brand-green mr-3 flex-shrink-0 mt-1" />
                    <span>{feature}</span>
                </li>
            ))}
        </ul>
  
    </div>
  );
};

const Pricing: React.FC = () => {
  const { t } = useTranslation();

  const plans = [
    { 
      plan: t('landing_page.pricing.plans.basic.name'), 
      price: '$19', 
      commission: t('landing_page.pricing.plans.basic.commission'),
      features: t('landing_page.pricing.plans.basic.features', { returnObjects: true }) as string[]
    },
    { 
      plan: t('landing_page.pricing.plans.pro.name'), 
      price: '$9', 
      commission: t('landing_page.pricing.plans.pro.commission'),
      features: t('landing_page.pricing.plans.pro.features', { returnObjects: true }) as string[],
      isPopular: true
    },
    { 
      plan: t('landing_page.pricing.plans.premium.name'), 
      price: '$19', 
      commission: t('landing_page.pricing.plans.premium.commission'),
      features: t('landing_page.pricing.plans.premium.features', { returnObjects: true }) as string[]
    }
  ];
  
  return (
    <div id="pricing" className="bg-white py-24 sm:py-32">
      <div className="container mx-auto px-6">
         <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-charcoal tracking-tight">{t('landing_page.pricing.title')}</h2>
          <p className="mt-6 text-xl text-charcoal/80 max-w-2xl mx-auto">{t('landing_page.pricing.subtitle')}</p>
        </div>
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto items-stretch">
          {plans.map(p => <PricingCard key={p.plan} {...p} />)}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
