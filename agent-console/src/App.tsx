
import React, { useState, useEffect, useCallback } from 'react';
import { Agent, HandoffRequest } from './types'; // Adjusted for relative path if tsconfig paths not fully picked up by LSP initially
import LoginScreen from './components/LoginScreen';
import DashboardScreen from './components/DashboardScreen';
import ActiveChatView from './components/ActiveChatView';
import { LOCALSTORAGE_AGENT_KEY, LOCALSTORAGE_HANDOFF_QUEUE_KEY } from './constants';

const App: React.FC = () => {
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [activeHandoff, setActiveHandoff] = useState<HandoffRequest | null>(null);
  const [handoffQueue, setHandoffQueue] = useState<HandoffRequest[]>([]);

  // Load agent from localStorage on init
  useEffect(() => {
    const storedAgent = localStorage.getItem(LOCALSTORAGE_AGENT_KEY);
    if (storedAgent) {
      try {
        setCurrentAgent(JSON.parse(storedAgent));
      } catch (e) {
        console.error("Error parsing stored agent:", e);
        localStorage.removeItem(LOCALSTORAGE_AGENT_KEY);
      }
    }
  }, []);

  // Poll for handoff queue changes
  useEffect(() => {
    if (!currentAgent) return; // Only poll if an agent is logged in

    const pollQueue = () => {
      const storedQueue = localStorage.getItem(LOCALSTORAGE_HANDOFF_QUEUE_KEY);
      let currentQueue: HandoffRequest[] = [];
      if (storedQueue) {
        try {
          currentQueue = JSON.parse(storedQueue);
          setHandoffQueue(currentQueue);
        } catch (e) {
          console.error("Error parsing handoff queue:", e);
          setHandoffQueue([]); // Reset to empty if parsing fails
        }
      } else {
        setHandoffQueue([]);
      }

      // If an active chat is resolved/escalated by this agent (via onUpdateHandoff) or externally,
      // it should already be handled. This part focuses on external changes.
      if (activeHandoff) {
        const updatedActiveHandoff = currentQueue.find(h => h.id === activeHandoff.id);
        if (!updatedActiveHandoff) { // Chat removed from queue entirely
          setActiveHandoff(null);
        } else if (updatedActiveHandoff.status === 'resolved' || updatedActiveHandoff.status === 'escalated_servicenow') {
          // If the chat this agent was handling is now resolved/escalated (possibly by another agent or system)
          // OR if this agent resolved it and the state is now reflecting that.
          if (updatedActiveHandoff.agentId === currentAgent.id || !updatedActiveHandoff.agentId) {
             setActiveHandoff(null);
          }
        } else if (updatedActiveHandoff.agentId !== currentAgent.id && updatedActiveHandoff.status === 'active') {
          // Chat was taken by another agent
           setActiveHandoff(null);
        } else if (updatedActiveHandoff.agentId === currentAgent.id) {
          // Keep active chat synced if it's still assigned to this agent and active
          setActiveHandoff(updatedActiveHandoff);
        }
      }
    };

    pollQueue(); // Initial poll
    const pollInterval = setInterval(pollQueue, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [currentAgent, activeHandoff?.id]); // Rerun if currentAgent or the ID of the activeHandoff changes


  const handleLogin = (agent: Agent) => {
    setCurrentAgent(agent);
    localStorage.setItem(LOCALSTORAGE_AGENT_KEY, JSON.stringify(agent));
  };

  const handleLogout = () => {
    if (activeHandoff && currentAgent) {
        const queue = JSON.parse(localStorage.getItem(LOCALSTORAGE_HANDOFF_QUEUE_KEY) || '[]') as HandoffRequest[];
        const updatedQueue = queue.map(h =>
            h.id === activeHandoff.id && h.agentId === currentAgent.id
            ? { ...h, status: 'pending' as 'pending', agentId: undefined, agentRole: undefined }
            : h
        );
        localStorage.setItem(LOCALSTORAGE_HANDOFF_QUEUE_KEY, JSON.stringify(updatedQueue));
        setHandoffQueue(updatedQueue);
    }
    setCurrentAgent(null);
    setActiveHandoff(null);
    localStorage.removeItem(LOCALSTORAGE_AGENT_KEY);
  };

  const handleSelectHandoff = (handoff: HandoffRequest) => {
    if (!currentAgent || handoff.status === 'active' && handoff.agentId !== currentAgent.id) {
        // If chat is active with another agent, do not allow selection
        alert(`This chat is already being handled by another agent: ${handoff.agentRole || 'Agent'}.`);
        return;
    }

    const updatedHandoff = {
        ...handoff,
        status: 'active' as 'active',
        agentId: currentAgent.id,
        agentRole: currentAgent.role
    };
    setActiveHandoff(updatedHandoff);

    const queue = JSON.parse(localStorage.getItem(LOCALSTORAGE_HANDOFF_QUEUE_KEY) || '[]') as HandoffRequest[];
    const updatedQueue = queue.map(h => h.id === handoff.id ? updatedHandoff : h);
    localStorage.setItem(LOCALSTORAGE_HANDOFF_QUEUE_KEY, JSON.stringify(updatedQueue));
    setHandoffQueue(updatedQueue);
  };

  const handleUpdateHandoffAndCloseIfNeeded = (updatedHandoff: HandoffRequest) => {
    const queue = JSON.parse(localStorage.getItem(LOCALSTORAGE_HANDOFF_QUEUE_KEY) || '[]') as HandoffRequest[];
    const updatedQueue = queue.map(h => h.id === updatedHandoff.id ? updatedHandoff : h);
    localStorage.setItem(LOCALSTORAGE_HANDOFF_QUEUE_KEY, JSON.stringify(updatedQueue));
    setHandoffQueue(updatedQueue);

    if (updatedHandoff.status === 'resolved' || updatedHandoff.status === 'escalated_servicenow') {
      setActiveHandoff(null); // Close the chat view for this agent
    } else {
      setActiveHandoff(updatedHandoff); // Keep it active and updated
    }
  };


  if (!currentAgent) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col h-screen bg-consoleBg text-consoleText">
      <header className="bg-consoleAccent text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-semibold">CareAI - Agent Console ({currentAgent.role})</h1>
        <div className="flex items-center">
            <span className="mr-4">Welcome, {currentAgent.name}</span>
            <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-150"
            >
            Logout
            </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-1/3 bg-white p-4 border-r border-gray-300 overflow-y-auto">
          <DashboardScreen
            agent={currentAgent}
            handoffQueue={handoffQueue}
            onSelectHandoff={handleSelectHandoff}
            activeHandoffId={activeHandoff?.id}
          />
        </aside>
        <main className="flex-1 p-4 overflow-y-auto">
          {activeHandoff ? (
            <ActiveChatView
              handoffRequest={activeHandoff}
              agent={currentAgent}
              onUpdateHandoff={handleUpdateHandoffAndCloseIfNeeded}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 text-lg">Select a chat from the dashboard to start.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;