
import React from 'react';
import { AppointmentContextData } from '../types';

interface AppointmentSchedulerProps {
  context: AppointmentContextData;
  onTimeSelect: (time: string) => void;
  onChooseAnotherDate: () => void;
  isLoading: boolean;
}

const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({
  context,
  onTimeSelect,
  onChooseAnotherDate,
  isLoading,
}) => {
  const { physician, location, currentDate, availableTimes, stage } = context;

  const getFormattedDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  if (stage !== 'showingSlots') {
    return null; 
  }

  return (
    <div className="my-3 p-3 bg-gray-50 rounded-lg shadow border border-gray-200">
      <p className="text-sm font-semibold text-gray-700">
        Appointments with: <span className="text-blue-600">{physician}</span>
      </p>
      <p className="text-xs text-gray-500 mb-1">
        At: {location}
      </p>
      <p className="text-xs text-gray-500 mb-3">
        Showing slots for: <span className="font-medium">{getFormattedDate(currentDate)}</span>
      </p>

      <div className="flex flex-wrap gap-2 mb-3">
        {availableTimes.map((time) => (
          <button
            key={time}
            onClick={() => onTimeSelect(time)}
            disabled={isLoading}
            className="w-auto px-3 py-2 bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-bold rounded-md transition-all duration-150 ease-in-out text-xs shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={`Select time: ${time}`}
          >
            {time}
          </button>
        ))}
      </div>

      <button
        onClick={onChooseAnotherDate}
        disabled={isLoading}
        className="w-full px-3 py-2 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white font-bold rounded-md transition-all duration-150 ease-in-out text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Choose Another Date
      </button>
    </div>
  );
};

export default AppointmentScheduler;