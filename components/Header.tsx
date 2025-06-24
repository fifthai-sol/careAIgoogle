
import React from 'react';
import { ModernAiIcon, CloseIcon, MinimizeIcon } from './Icons';

interface HeaderProps {
  title: string;
  onClose?: () => void;
  onMinimize?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onClose, onMinimize }) => {
  return (
    <header className="bg-gradient-to-r from-blue-500 to-emerald-500 text-white p-3 shadow-md flex items-center justify-between shrink-0">
      <div className="flex items-center space-x-2">
        <ModernAiIcon className="w-7 h-7 text-white" />
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      <div className="flex items-center space-x-0.5 sm:space-x-1">
        {onMinimize && (
          <button
            onClick={onMinimize}
            className="text-white hover:bg-white/20 p-1.5 rounded-full focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Minimize chat"
          >
            <MinimizeIcon className="w-5 h-5" />
          </button>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-1.5 rounded-full focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Close chat"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;