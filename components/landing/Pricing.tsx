import React from 'react';
import { Check } from 'lucide-react';

const PricingCard: React.FC<{ plan: string, price: string, priceDescription?: string, features: string[], isPopular?: boolean, commission: string }> = ({ plan, price, priceDescription, features, isPopular, commission }) => {
  return (
    <div className={`border rounded-2xl p-8 flex flex-col ${isPopular ? 'bg-white shadow-2xl' : 'bg-white/50'}`}>
        {isPopular && (
            <div className="text-center mb-4">
                <span className="bg-teal-800 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">Most Popular</span>
            </div>
        )}
        <h3 className="text-2xl font-bold text-charcoal text-center">{plan}</h3>
        <p className="text-5xl font-extrabold text-charcoal text-center my-4">{price}<span className="text-lg font-medium">{priceDescription || '/mo'}</span></p>
        <p className="text-center text-charcoal/70 font-bold mb-6">{commission}</p>
        <ul className="space-y-4 mb-8 flex-grow">
            {features.map(feature => (
                <li key={feature} className="flex items-start text-charcoal/80">
                    <Check className="w-5 h-5 text-brand-green mr-3 flex-shrink-0 mt-1" />
                    <span>{feature}</span>
                </li>
            ))}
        </ul>
        <a href="#" className={`w-full block text-center font-bold py-4 px-6 rounded-full transition-all text-sm uppercase tracking-wider ${isPopular ? 'bg-brand-green text-white hover:bg-brand-green/90' : 'bg-charcoal text-white hover:bg-charcoal/90'} active:scale-95`}>
            Get Started
        </a>
    </div>
  );
};

const Pricing: React.FC = () => {
  const plans = [
    { 
      plan: 'Basic', 
      price: '$29', 
      commission: 'No Commission',
      features: ['Up to 3 Properties', 'Direct Booking Website', 'Google Maps Setup', 'Standard Email Support', 'Automated Guest Messaging', 'Calendar Sync']
    },
    { 
      plan: 'Pro', 
      price: '$9', 
      commission: '4% commission',
      features: ['Up to 8 Properties', 'Stripe Payment Integration', 'Automated Guest Messaging', 'Calendar Sync', 'Priority Support'],
      isPopular: true
    },
    { 
      plan: 'Premium', 
      price: '$25', 
      commission: '4% commission',
      features: ['Unlimited Properties', 'Custom Branding & Landing Page', 'Dedicated Account Manager', 'Advanced Analytics', 'Phone & Video Support']
    }
  ];
  
  return (
    <div id="pricing" className="bg-white py-24 sm:py-32">
      <div className="container mx-auto px-6">
         <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-charcoal tracking-tight">Pricing That Makes Sense</h2>
          <p className="mt-6 text-xl text-charcoal/80 max-w-2xl mx-auto">Start small, grow big. Our success is tied to yours. All plans include our powerful direct booking engine and a 4% booking fee.</p>
        </div>
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto items-stretch">
          {plans.map(p => <PricingCard key={p.plan} {...p} />)}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
