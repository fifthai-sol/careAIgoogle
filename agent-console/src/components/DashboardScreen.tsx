import React from 'react';
import { Agent, HandoffRequest } from '../types';

interface DashboardScreenProps {
  agent: Agent;
  handoffQueue: HandoffRequest[];
  onSelectHandoff: (handoff: HandoffRequest) => void;
  activeHandoffId?: string | null;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ agent, handoffQueue, onSelectHandoff, activeHandoffId }) => {
  // Filter queue for pending chats or chats active with *this* agent
   const relevantChats = handoffQueue.filter(h => 
    h.status === 'pending' || (h.status === 'active' && h.agentId === agent.id)
  );


  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-consoleAccent">Chat Queue</h2>
      {relevantChats.length === 0 ? (
        <p className="text-gray-500">No pending or active chats for you at the moment.</p>
      ) : (
        <ul className="space-y-3">
          {relevantChats.map(handoff => (
            <li key={handoff.id}>
              <button
                onClick={() => onSelectHandoff(handoff)}
                disabled={activeHandoffId === handoff.id && handoff.status === 'active'}
                className={`w-full text-left p-3 rounded-md shadow-sm transition-colors duration-150
                            ${activeHandoffId === handoff.id && handoff.status === 'active' 
                                ? 'bg-primary-light text-primary-dark ring-2 ring-primary' 
                                : 'bg-gray-50 hover:bg-gray-200 focus:bg-gray-200'}
                            ${handoff.status === 'pending' ? 'border-l-4 border-secondary' : 'border-l-4 border-primary'}
                            disabled:opacity-70 disabled:cursor-not-allowed`}
              >
                <div className="flex justify-between items-center mb-1">
                    <strong className="text-sm">User: {handoff.userName || handoff.userId}</strong>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${handoff.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}>
                        {handoff.status}
                    </span>
                </div>
                <p className="text-xs text-gray-600 truncate" title={handoff.handoffReason || "No specific reason"}>
                  Reason: {handoff.handoffReason || "General Escalation"}
                </p>
                 {handoff.originalIntent && (
                    <p className="text-xs text-gray-500">Intent: {handoff.originalIntent}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Received: {new Date(handoff.timestamp).toLocaleTimeString()}
                </p>
                {handoff.status === 'active' && handoff.agentId === agent.id && (
                    <p className="text-xs text-blue-600 font-semibold mt-1">You are handling this chat.</p>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DashboardScreen;