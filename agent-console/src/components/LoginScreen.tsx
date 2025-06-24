import React, { useState } from 'react';
import { Agent, AgentRole } from '../types';
import { AGENT_ROLES } from '../constants';

interface LoginScreenProps {
  onLogin: (agent: Agent) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<AgentRole>(AGENT_ROLES[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && selectedRole) {
      onLogin({
        id: `agent-${Date.now()}`, // Simple unique ID for demo
        name: name.trim(),
        role: selectedRole,
      });
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md"
      >
        <h2 className="text-3xl font-bold mb-8 text-center text-consoleAccent">
          Agent Console Login
        </h2>
        <div className="mb-6">
          <label htmlFor="agentName" className="block text-sm font-medium text-gray-700 mb-1">
            Agent Name
          </label>
          <input
            type="text"
            id="agentName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-consoleAccent focus:border-transparent"
            placeholder="Enter your name"
            required
          />
        </div>
        <div className="mb-8">
          <label htmlFor="agentRole" className="block text-sm font-medium text-gray-700 mb-1">
            Select Role
          </label>
          <select
            id="agentRole"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as AgentRole)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-consoleAccent focus:border-transparent bg-white"
          >
            {AGENT_ROLES.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-consoleAccent hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 transition duration-150 ease-in-out"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginScreen;