import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../Modal';
import { Booking } from '../../types';
import { Send } from 'lucide-react';
import { SKY_ACCENT } from '../../constants';

interface MessageModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onSend: (message: string) => void;
}

const MessageModal: React.FC<MessageModalProps> = ({ booking, isOpen, onClose, onSend }) => {
  const { t } = useTranslation();
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
    <Modal isOpen={isOpen} onClose={onClose} title={t('host_dashboard.message_modal.title', { guestName: booking.guestName })}>
      <div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full bg-white/50 border border-stone-300 rounded-2xl py-5 px-6 text-sm font-medium text-charcoal focus:ring-1 focus:ring-sky-accent outline-none placeholder:text-charcoal/60 h-[140px] resize-y"
          placeholder={t('host_dashboard.message_modal.placeholder')}
        />
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSend}
            style={{ backgroundColor: SKY_ACCENT }}
            className="text-white font-bold rounded-full transition-all flex items-center justify-center w-12 h-12 active:scale-95"
            aria-label={t('host_dashboard.message_modal.send_message_aria_label')}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default MessageModal;
