
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-lg flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
      <div className="bg-[#F7F5F0] rounded-3xl p-10 max-w-2xl w-full shadow-2xl border-charcoal/10 border flex flex-col max-h-full">
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h2 className="text-3xl font-bold text-charcoal">{title}</h2>
          <button onClick={onClose} className="text-charcoal/60 hover:text-charcoal text-4xl">&times;</button>
        </div>
        <div className="text-charcoal/80 overflow-y-auto">{children}</div>
        <div className="mt-6 flex-shrink-0">
            <button onClick={onClose} className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold">
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
