import React from 'react';

export const formatBookingRange = (start: string, end: string) => {
  if (!start || !end) return start || '...';
  const s = new Date(start);
  const e = new Date(end);
  const startStr = s.toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric' });
  const endStr = e.toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric' });
  const diffTime = Math.abs(e.getTime() - s.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return (
    <span>
      {startStr} — {endStr} <span className=" ml-1 opacity-90">({diffDays} night{diffDays !== 1 ? 's' : ''})</span>
    </span>
  );
};