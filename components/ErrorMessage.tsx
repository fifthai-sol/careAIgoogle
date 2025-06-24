
import React from 'react';

interface ErrorMessageProps {
  message: string;
  onClose?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onClose }) => {
  return (
    <div className="bg-red-100 border-t border-b border-red-500 text-red-700 p-3 mx-0 my-2 shadow-sm" role="alert">
      <div className="flex items-center">
        <div className="py-1">
          <svg className="fill-current h-5 w-5 text-red-500 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM9 5v6h2V5H9zm0 8v2h2v-2H9z"/>
          </svg>
        </div>
        <div className="flex-grow">
          <p className="font-semibold text-sm">Error</p>
          <p className="text-xs">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto -mx-1 -my-1 bg-red-100 text-red-500 rounded-lg focus:ring-2 focus:ring-red-400 p-1 hover:bg-red-200 inline-flex h-7 w-7 items-center justify-center"
            aria-label="Close error message"
          >
            <span className="sr-only">Close</span>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;