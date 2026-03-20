import React from 'react';
import { useTranslation } from 'react-i18next';
import { Booking } from '../../types.js';
import { MessageSquare, LogIn, KeySquare, LogOut } from 'lucide-react';

interface MessageMenuProps {
  booking: Booking;
  onSendMessage: (booking: Booking) => void;
  onSendWelcomeMessage: (booking: Booking) => void;
  onSendCheckInMessage: (booking: Booking) => void;
  onSendCheckoutMessage: (booking: Booking) => void;
  onClose: () => void;
}

const MessageMenu: React.FC<MessageMenuProps> = ({ booking, onSendMessage, onSendWelcomeMessage, onSendCheckInMessage, onSendCheckoutMessage, onClose }) => {
  const { t } = useTranslation();

  return (
    <div className="absolute left-0 bottom-full mb-2 w-48 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg z-10 border border-zinc-200">
      <div className="py-1">
        <button
          onClick={() => { onSendMessage(booking); onClose(); }}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          <span>{t('host_dashboard.message_menu.direct_message')}</span>
        </button>
        <button
          onClick={() => { onSendWelcomeMessage(booking); onClose(); }}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <LogIn className="w-4 h-4 mr-2" />
          <span>{t('host_dashboard.message_menu.welcome')}</span>
        </button>
        <button
          onClick={() => { onSendCheckInMessage(booking); onClose(); }}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <KeySquare className="w-4 h-4 mr-2" />
          <span>{t('host_dashboard.message_menu.check_in')}</span>
        </button>
        <button
          onClick={() => { onSendCheckoutMessage(booking); onClose(); }}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <LogOut className="w-4 h-4 mr-2" />
          <span>{t('host_dashboard.message_menu.check_out')}</span>
        </button>
      </div>
    </div>
  );
};

export default MessageMenu;
