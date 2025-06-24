
import React from 'react';
import { ChatMessageData, ChatSender } from '../types';
import ReactMarkdown from 'react-markdown';
import { ThumbsUpIcon, ThumbsDownIcon } from './Icons';

interface ChatMessageProps {
  message: ChatMessageData;
  onFeedback?: (messageId: string, feedbackType: 'up' | 'down') => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onFeedback }) => {
  const isUser = message.sender === ChatSender.User;

  const bubbleClasses = isUser 
    ? 'bg-blue-500 text-black self-end rounded-l-xl rounded-tr-xl' 
    : 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white self-start rounded-r-xl rounded-tl-xl break-words';
  
  const alignmentClasses = isUser ? 'flex-row-reverse' : 'flex-row';

  const avatarContainerClass = isUser 
    ? 'bg-emerald-500 ml-2' 
    : 'bg-blue-500 mr-2'; // Updated AI avatar container background

  const userMarkdownComponents = {
    p: ({node, ...props}: any) => <p className="mb-2 last:mb-0 text-black" {...props} />,
    ul: ({node, ...props}: any) => <ul className="list-disc list-inside space-y-1 text-black" {...props} />,
    ol: ({node, ...props}: any) => <ol className="list-decimal list-inside space-y-1 text-black" {...props} />,
    strong: ({node, ...props}: any) => <strong className="font-semibold text-black" {...props} />,
    a: ({node, ...props}: any) => <a className="text-blue-700 underline hover:text-blue-800" {...props} />,
  };

  const aiMarkdownComponents = {
    p: ({node, ...props}: any) => <p className="mb-2 last:mb-0 text-white" {...props} />,
    ul: ({node, ...props}: any) => <ul className="list-disc list-inside space-y-1 text-white" {...props} />,
    ol: ({node, ...props}: any) => <ol className="list-decimal list-inside space-y-1 text-white" {...props} />,
    strong: ({node, ...props}: any) => <strong className="font-semibold text-white" {...props} />,
    a: ({node, ...props}: any) => <a className="text-blue-200 underline hover:text-blue-100" {...props} />,
  };

  const handleFeedbackClick = (feedbackType: 'up' | 'down') => {
    if (onFeedback && message.feedback === null) { 
      onFeedback(message.id, feedbackType);
    }
  };
  
  const canShowFeedback = onFeedback && message.sender === ChatSender.AI && message.id.includes('-response');

  return (
    <div className={`flex ${alignmentClasses} items-start space-x-3 space-x-reverse`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${avatarContainerClass}`}>
        {message.avatar}
      </div>
      <div className="flex flex-col">
        <div className={`max-w-xs md:max-w-md lg:max-w-lg p-3 shadow-md ${bubbleClasses}`}>
          {message.imageSrc && (
            <img src={message.imageSrc} alt="Attached image" className="max-w-full h-auto rounded-md mb-2 border border-gray-300" style={{maxHeight: '200px'}} />
          )}
          <ReactMarkdown
            className={`max-w-none`} 
            components={isUser ? userMarkdownComponents : aiMarkdownComponents}
          >
            {message.text}
          </ReactMarkdown>
          <p className={`text-xs mt-2 ${isUser ? 'text-gray-100' : 'text-gray-200'} text-right`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        {canShowFeedback && (
          <div className={`flex items-center mt-1.5 space-x-2 ${isUser ? 'justify-end mr-1' : 'justify-start ml-1'}`}>
            <button
              onClick={() => handleFeedbackClick('up')}
              disabled={message.feedback !== null}
              aria-label="Good response"
              className={`p-0.5 rounded-full focus:outline-none focus:ring-1 focus:ring-offset-1 ${
                message.feedback === 'up' 
                  ? 'text-emerald-400 ring-emerald-300' 
                  : message.feedback === null 
                    ? 'text-gray-400 hover:text-emerald-500 ring-gray-300' 
                    : 'text-gray-300 cursor-not-allowed'
              } transition-colors`}
            >
              <ThumbsUpIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleFeedbackClick('down')}
              disabled={message.feedback !== null}
              aria-label="Bad response"
              className={`p-0.5 rounded-full focus:outline-none focus:ring-1 focus:ring-offset-1 ${
                message.feedback === 'down' 
                  ? 'text-red-400 ring-red-300' 
                  : message.feedback === null 
                    ? 'text-gray-400 hover:text-red-500 ring-gray-300'
                    : 'text-gray-300 cursor-not-allowed'
              } transition-colors`}
            >
              <ThumbsDownIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;