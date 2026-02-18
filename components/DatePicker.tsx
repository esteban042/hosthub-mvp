
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DatePickerProps {
  onSelect: (date: string) => void;
  selectedDate: string;
}

const DatePicker: React.FC<DatePickerProps> = ({ onSelect, selectedDate }) => {
  const [isOpen, setIsOpen] = useState(false);
  // Initialize with selectedDate's month or today's
  const initialDate = selectedDate ? new Date(selectedDate) : new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
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
  
  // When picker opens, set the month to the selected date's month
  useEffect(() => {
    if (isOpen && selectedDate) {
      const selected = new Date(selectedDate);
      if (!isNaN(selected.getTime())) {
        setCurrentMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
      }
    } else if (isOpen) {
        // if no date is selected, show current month
        const today = new Date();
        setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    }
  }, [isOpen, selectedDate]);

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
        ? 'bg-cyan-600 text-white'
        : 'hover:bg-stone-100 text-charcoal';

      days.push(
        <button
          type="button"
          key={dateStr}
          onClick={() => {
            onSelect(dateStr);
            setIsOpen(false);
          }}
          className={`h-9 w-9 flex items-center justify-center text-sm font-medium rounded-full transition-all ${dayClass}`}
        >
          {d}
        </button>
      );
    }

    return (
      <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
            className="text-stone-400 hover:text-charcoal transition-colors p-1 rounded-full hover:bg-stone-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h4 className="text-charcoal font-bold text-sm">{monthName}</h4>
          <button
            type="button"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
            className="text-stone-400 hover:text-charcoal transition-colors p-1 rounded-full hover:bg-stone-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2 text-xs font-bold uppercase tracking-widest text-stone-400 text-center">
          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
            <div key={d} className="py-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 place-items-center">{days}</div>
      </div>
    );
  };

  const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelect('');
  }

  return (
    <div className="relative" ref={datePickerRef}>
        <input
            type="text"
            readOnly
            value={selectedDate}
            onClick={() => setIsOpen(!isOpen)}
            placeholder="YYYY-MM-DD"
            className="w-full bg-white border border-stone-300 rounded-xl p-3 text-xs text-charcoal outline-none cursor-pointer focus:ring-1 focus:ring-sky-accent transition-all"
        />
        {selectedDate && (
            <button type="button" onClick={handleClear} className="absolute top-1/2 right-3 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                <X className="w-4 h-4"/>
            </button>
        )}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-10 w-[320px]">
          {renderMonth(currentMonth)}
        </div>
      )}
    </div>
  );
};

export default DatePicker;
