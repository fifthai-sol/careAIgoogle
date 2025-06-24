
import React, { useState } from 'react';
import { PostChatFeedbackData } from '@/types';
import StarRating from './StarRating';
import { CloseIcon } from './Icons';

interface PostChatFeedbackModalProps {
  onSubmit: (feedback: PostChatFeedbackData) => void;
  onClose: () => void;
}

const PostChatFeedbackModal: React.FC<PostChatFeedbackModalProps> = ({ onSubmit, onClose }) => {
  const [clarity, setClarity] = useState(0);
  const [optionsAvailability, setOptionsAvailability] = useState(0);
  const [accuracy, setAccuracy] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (clarity === 0 || optionsAvailability === 0 || accuracy === 0) {
      alert("Please provide a rating for all categories.");
      return;
    }
    onSubmit({ clarity, optionsAvailability, accuracy });
    // onClose(); // Modal is now closed by App.tsx after onSubmit to allow message display first
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-[1100]">
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-2xl w-11/12 max-w-md transform transition-all">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Rate Your Experience</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400"
            aria-label="Close feedback modal"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="clarity" className="block text-sm font-medium text-gray-700 mb-1">
              1. Clarity of AI Responses
            </label>
            <StarRating value={clarity} onChange={setClarity} size={28} />
          </div>

          <div>
            <label htmlFor="options" className="block text-sm font-medium text-gray-700 mb-1">
              2. Availability of Relevant Options/Intents
            </label>
            <StarRating value={optionsAvailability} onChange={setOptionsAvailability} size={28} />
          </div>

          <div>
            <label htmlFor="accuracy" className="block text-sm font-medium text-gray-700 mb-1">
              3. Accuracy of Information Provided
            </label>
            <StarRating value={accuracy} onChange={setAccuracy} size={28} />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-semibold py-2.5 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition duration-150 ease-in-out"
            >
              Submit Feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostChatFeedbackModal;