// Re-using ChatMessageData from the main app for consistency if possible,
// or define a similar one here if it needs to diverge.
// For simplicity, let's assume ChatMessageData structure from main app is suitable.
export enum ChatSender {
  User = 'user',
  AI = 'ai', // From original chat
  Agent = 'agent', // New sender type for agent messages
}

export interface ChatMessageData {
  id: string;
  text: string;
  sender: ChatSender; // Simplified from: ChatSender | 'user' | 'ai';
  timestamp: string; // Keep as string for easier localStorage serialization
  // Removed avatar, imageSrc etc. for simplicity in agent console display of history
  // but they could be included if needed.
}

export type AgentRole = 'Customer Service' | 'Physician' | 'Advice Nurse' | 'Pharmacist' | 'Technical Support';

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
}

export type HandoffStatus = 'pending' | 'active' | 'resolved' | 'escalated_servicenow';

export interface HandoffRequest {
  id: string; // Unique ID for the handoff session
  userId: string; // ID of the user
  userName?: string; // Name of the user
  handoffReason?: string; // Reason for handoff, e.g., "User requested Clinician Query"
  timestamp: string; // ISO string of when handoff was initiated
  status: HandoffStatus;
  initialMessages: ChatMessageData[]; // Chat history from CareAI up to the point of handoff
  currentConversation: ChatMessageData[]; // Full conversation including agent messages
  agentId?: string; // ID of agent who accepted
  agentRole?: AgentRole; // Role of agent who accepted
  originalIntent?: string; // The intent that led to handoff e.g. "Technical Support"
}