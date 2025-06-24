
import React from 'react';

interface IntentButtonsProps {
  intents: string[];
  onIntentSelect: (intent: string) => void;
  disabled?: boolean;
}

const IntentButtons: React.FC<IntentButtonsProps> = ({ intents, onIntentSelect, disabled }) => {
  return (
    <div className="px-1 pt-1 pb-1 flex flex-wrap gap-2 justify-start">
      {intents.map(intent => (
        <button
          key={intent}
          onClick={() => onIntentSelect(intent)}
          disabled={disabled}
          className="px-3.5 py-1.5 bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-bold rounded-full transition-all duration-150 ease-in-out text-xs sm:text-sm shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={`Select intent: ${intent}`}
        >
          {intent}
        </button>
      ))}
    </div>
  );
};

export default IntentButtons;