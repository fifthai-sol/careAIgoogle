
import React, { KeyboardEvent, useRef } from 'react';
import { SendIcon, AttachmentIcon, EmojiIcon, MicrophoneIcon, PhoneIcon, RecordingIcon } from './Icons';
import { ChatInputProps } from '@/types';
import EmojiPicker from './EmojiPicker';

const ChatInput: React.FC<ChatInputProps> = ({
  currentInputText,
  onInputTextChange,
  onSendMessage,
  isLoading,
  onFeatureClick,
  showEmojiPicker,
  onEmojiSelect,
  isListening,
}) => {

  const handleSubmit = () => {
    if (currentInputText.trim() && !isLoading) {
      onSendMessage(currentInputText);
    }
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  const featureButtonClass = "p-2 text-gray-500 hover:text-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150";

  return (
    <div className="relative flex flex-col space-y-2 p-2 bg-white rounded-lg shadow">
      <textarea
        value={currentInputText}
        onChange={(e) => onInputTextChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={isListening ? "Listening..." : "Type your message here..."}
        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        rows={1}
        disabled={isLoading}
        style={{ minHeight: '44px', maxHeight: '120px' }}
        onInput={(e) => {
          const target = e.target as HTMLTextAreaElement;
          target.style.height = 'auto';
          target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
        }}
      />
      {showEmojiPicker && onEmojiSelect && (
        <div className="absolute bottom-full left-0 mb-1 z-10">
          <EmojiPicker onEmojiSelect={onEmojiSelect} />
        </div>
      )}
      <div className="flex items-center justify-between space-x-1">
        <div className="flex items-center space-x-1">
          {onFeatureClick && (
            <>
              <button onClick={() => onFeatureClick('Attachment')} className={featureButtonClass} aria-label="Attach file" disabled={isLoading || isListening}>
                <AttachmentIcon className="w-5 h-5" />
              </button>
              <button onClick={() => onFeatureClick('Emoji')} className={featureButtonClass} aria-label="Insert emoji" disabled={isLoading || isListening}>
                <EmojiIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => onFeatureClick('Voice Recorder')}
                className={featureButtonClass}
                aria-label={isListening ? "Stop voice input" : "Start voice input"}
                disabled={isLoading && !isListening}
              >
                {isListening ? <RecordingIcon className="w-5 h-5 text-red-500 animate-pulse" /> : <MicrophoneIcon className="w-5 h-5" />}
              </button>
              <button onClick={() => onFeatureClick('Voice Call')} className={featureButtonClass} aria-label="Start voice call" disabled={isLoading || isListening}>
                <PhoneIcon className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
        <button
          onClick={handleSubmit}
          disabled={isLoading || !currentInputText.trim() || isListening}
          className="p-3 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-md hover:from-blue-600 hover:to-emerald-600 focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 ease-in-out"
          aria-label="Send message"
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;