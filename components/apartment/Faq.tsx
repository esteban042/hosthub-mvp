import React from 'react';

interface FaqProps {
  faq: string | null;
}

const Faq: React.FC<FaqProps> = ({ faq }) => {
  if (!faq) return null;

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold text-charcoal mb-4">Frequently Asked Questions</h3>
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: faq }} />
    </div>
  );
};

export default Faq;
