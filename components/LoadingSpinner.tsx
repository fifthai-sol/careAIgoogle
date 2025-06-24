
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center space-x-2 text-blue-500">
      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-gray-700">Thinking...</span>
    </div>
  );
};

export default LoadingSpinner;