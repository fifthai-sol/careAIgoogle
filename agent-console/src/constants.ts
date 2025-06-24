import { AgentRole } from './types';

export const AGENT_ROLES: AgentRole[] = [
  'Customer Service',
  'Physician',
  'Advice Nurse',
  'Pharmacist',
  'Technical Support'
];

export const LOCALSTORAGE_AGENT_KEY = 'careai_agent_console_agent';
export const LOCALSTORAGE_HANDOFF_QUEUE_KEY = 'careai_handoff_queue';