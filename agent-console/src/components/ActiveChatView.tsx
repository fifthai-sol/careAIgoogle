
import React, { useState, useEffect, useRef } from 'react';
import { Agent, HandoffRequest, ChatMessageData, ChatSender } from '../types';
// import { LOCALSTORAGE_HANDOFF_QUEUE_KEY } from '../constants'; // Not needed here anymore

interface ActiveChatViewProps {
  handoffRequest: HandoffRequest;
  agent: Agent;
  onUpdateHandoff: (updatedHandoff: HandoffRequest) => void;
}

const ActiveChatView: React.FC<ActiveChatViewProps> = ({ handoffRequest, agent, onUpdateHandoff }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [handoffRequest.currentConversation]);

  const handleSendMessage = () => {
    if (newMessage.trim() === '' || handoffRequest.status === 'resolved' || handoffRequest.status === 'escalated_servicenow') return;

    const agentMessage: ChatMessageData = {
      id: `agent-msg-${Date.now()}`,
      text: newMessage.trim(),
      sender: ChatSender.Agent, // Make sure ChatSender.Agent is used
      timestamp: new Date().toISOString(),
    };

    const updatedConversation = [...handoffRequest.currentConversation, agentMessage];
    const updatedHandoff = { ...handoffRequest, currentConversation: updatedConversation };
    
    onUpdateHandoff(updatedHandoff);
    setNewMessage('');
  };

  const handleEndChat = () => {
    const updatedHandoff = { ...handoffRequest, status: 'resolved' as 'resolved' };
    onUpdateHandoff(updatedHandoff);
    // App.tsx will set activeHandoff to null based on this status update
  };
  
  const handleEscalateToServiceNow = () => {
    const updatedHandoff = { ...handoffRequest, status: 'escalated_servicenow' as 'escalated_servicenow' };
    onUpdateHandoff(updatedHandoff);
     // App.tsx will set activeHandoff to null based on this status update
  };

  const isChatReadOnly = handoffRequest.status === 'resolved' || handoffRequest.status === 'escalated_servicenow';

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      <header className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-consoleAccent">
          Chat with {handoffRequest.userName || handoffRequest.userId}
        </h3>
        <p className="text-xs text-gray-500">Reason: {handoffRequest.handoffReason || "General Escalation"}</p>
        {handoffRequest.originalIntent && <p className="text-xs text-gray-500">Original Intent: {handoffRequest.originalIntent}</p>}
        {handoffRequest.status === 'active' && handoffRequest.agentId === agent.id && (
            <p className="text-xs text-blue-600 font-semibold mt-1">Status: Active (with you)</p>
        )}
      </header>

      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {handoffRequest.currentConversation.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col p-3 max-w-lg md:max-w-xl text-sm
                        ${msg.sender === ChatSender.User || msg.sender === ChatSender.AI
                            ? 'chat-bubble-user mr-auto'
                            : msg.sender === ChatSender.Agent // Explicitly check for Agent
                              ? 'chat-bubble-agent ml-auto'
                              : 'bg-gray-200 text-gray-800 self-center rounded-lg' // Fallback for unknown sender
                        }`}
          >
            <p className="font-semibold mb-0.5">
              {msg.sender === ChatSender.User ? (handoffRequest.userName || 'User') : 
               msg.sender === ChatSender.AI ? 'CareAI' : 
               msg.sender === ChatSender.Agent ? (handoffRequest.agentRole || agent.name) : // Display assigned agent role or current agent name
               'System'
              }
            </p>
            <p className="whitespace-pre-wrap">{msg.text}</p>
            <p className="text-xs mt-1 opacity-75 text-right">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {!isChatReadOnly && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-consoleAccent resize-none"
              rows={2}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <button
              onClick={handleSendMessage}
              className="bg-consoleAccent hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition duration-150"
            >
              Send
            </button>
          </div>
        </div>
      )}

      <footer className="p-3 border-t border-gray-200 bg-gray-100 flex justify-end space-x-2">
        {handoffRequest.originalIntent === "Technical Support" && agent.role === "Technical Support" && !isChatReadOnly && (
             <button
                onClick={handleEscalateToServiceNow}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded transition duration-150"
             >
                Escalate to ServiceNow
            </button>
        )}
        {!isChatReadOnly && (
            <button
                onClick={handleEndChat}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-150"
            >
                End Chat
            </button>
        )}
        {isChatReadOnly && (
            <p className="text-sm text-gray-600 font-semibold">
                Chat is {handoffRequest.status}.
            </p>
        )}
      </footer>
    </div>
  );
};

export default ActiveChatView;