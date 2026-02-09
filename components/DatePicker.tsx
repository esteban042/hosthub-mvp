
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DatePickerProps {
  onSelect: (date: string) => void;
  selectedDate: string;
}

const DatePicker: React.FC<DatePickerProps> = ({ onSelect, selectedDate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const datePickerRef = useRef<HTMLDivElement>(null);

  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const startOffset = (date: Date) => (new Date(date.getFullYear(), date.getMonth(), 1).getDay() + 6) % 7;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderMonth = (monthDate: Date) => {
    const days = [];
    const numDays = daysInMonth(monthDate);
    const offset = startOffset(monthDate);
    const monthName = monthDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    for (let i = 0; i < offset; i++) days.push(<div key={`e-${i}`} />);

    for (let d = 1; d <= numDays; d++) {
      const dateObj = new Date(monthDate.getFullYear(), monthDate.getMonth(), d);
      const year = dateObj.getFullYear();
      const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      const day = dateObj.getDate().toString().padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const isSelected = dateStr === selectedDate;
      const dayClass = isSelected
        ? 'bg-emerald-500 text-white'
        : 'bg-stone-900 border-stone-700 text-stone-200 hover:text-white';

      days.push(
        <button
          key={dateStr}
          onClick={() => {
            onSelect(dateStr);
            setIsOpen(false);
          }}
          className={`h-10 flex items-center justify-center text-sm font-bold rounded-lg border transition-all ${dayClass}`}
        >
          {d}
        </button>
      );
    }

    return (
      <div className="p-4 bg-[#1c1a19] rounded-2xl border border-stone-800">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
            className="text-stone-500 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h4 className="text-white font-serif text-base font-bold">{monthName}</h4>
          <button
            type="button"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
            className="text-stone-500 hover:text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2 text-xs font-black uppercase tracking-widest text-stone-400 text-center">
          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
            <div key={d} className="capitalize">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">{days}</div>
      </div>
    );
  };

  return (
    <div className="relative" ref={datePickerRef}>
      <input
        type="text"
        readOnly
        value={selectedDate}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-stone-900 border border-stone-800 rounded-xl p-3 text-xs text-white outline-none cursor-pointer"
      />
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-10">
          {renderMonth(currentMonth)}
        </div>
      )}
    </div>
  );
};

export default DatePicker;
