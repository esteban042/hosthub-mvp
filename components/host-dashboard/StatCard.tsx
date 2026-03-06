import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value }) => {

  const formattedValue = (() => {
    const num = Number(value);
    if (isNaN(num)) return value;

    const isRevenue = label.toLowerCase().includes('revenue');

    if (isRevenue) {
      if (num >= 1000000) {
        return `$${(num / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
      }
      if (num >= 1000) {
        return `$${Math.round(num / 1000)}k`;
      }
      return `$${num.toLocaleString()}`;
    }

    return num.toLocaleString();
  })();

  return (
    <div className="bg-stone-100 p-8 rounded-2xl flex items-center space-x-5 border border-slate-400">
      <div className="text-sky-600">{icon}</div>
      <div>
        <h4 className="text-2xl font-bold text-charcoal leading-none">{formattedValue}</h4>
        <p className="text-[10px] font-bold uppercase tracking-widest mt-1 text-charcoal/60">
          {label}
        </p>
      </div>
    </div>
  );
};

export default StatCard;
