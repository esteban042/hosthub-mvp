import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import { Booking } from '../../types';
import { Send } from 'lucide-react';

interface MessageModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onSend: (message: string) => void;
}

const MessageModal: React.FC<MessageModalProps> = ({ booking, isOpen, onClose, onSend }) => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setMessage('');
    }
  }, [isOpen]);

  if (!booking) return null;

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={<span className="text-white">{`Message to ${booking.guestName}`}</span>}>
      <div className="p-6 bg-stone-900">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full bg-stone-950 border border-stone-600 rounded-2xl py-5 px-6 text-sm font-medium text-white focus:ring-1 focus:ring-emerald-500 outline-none placeholder:text-stone-700 h-[140px] resize-y"
          placeholder="Write your message here..."
        />
        <div className="mt-6 flex justify-end">
          <button 
            onClick={handleSend}
            className="bg-transparent border border-emerald-500 text-emerald-500 font-bold py-3 px-4 rounded-lg hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center w-12 h-12"
            aria-label="Send Message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default MessageModal;
