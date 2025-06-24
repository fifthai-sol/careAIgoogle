
import React from 'react';

export enum ChatSender {
  User = 'user',
  AI = 'ai',
  Agent = 'agent', // Added for potential future use if CareAI displays agent messages
}

export interface ChatMessageData {
  id: string;
  text: string;
  sender: ChatSender;
  timestamp: Date; // Main app uses Date objects
  avatar?: React.ReactNode;
  imageSrc?: string;
  attachmentFile?: File;
  attachmentName?: string;
  attachmentType?: string;
  feedback?: 'up' | 'down' | null;
}

// Duplicating Handoff types here for clarity in CareAI app,
// ensuring structure matches agent-console/src/types.ts
// Ideally, these would be in a shared types package in a monorepo.

export type AgentRole = 'Customer Service' | 'Physician' | 'Advice Nurse' | 'Pharmacist' | 'Technical Support';

export type HandoffStatus = 'pending' | 'active' | 'resolved' | 'escalated_servicenow';

// This is the structure CareAI will write to localStorage.
// Note: ChatMessageData here will be main app's version (timestamp: Date)
// but will be serialized to string timestamps by JSON.stringify with replacer.
export interface HandoffRequest {
  id: string;
  userId: string;
  userName?: string;
  handoffReason?: string;
  timestamp: string; // ISO string
  status: HandoffStatus;
  initialMessages: ChatMessageData[]; // Chat history from CareAI (serialized)
  currentConversation: ChatMessageData[]; // Full conversation (serialized)
  agentId?: string;
  agentRole?: AgentRole; // The role the user intended to connect to
  originalIntent?: string;
}


export interface ExtractedEntities {
  intent_type?: 'appointment_booking' | 'medication_query' | 'symptom_description' | string;
  date_preference?: string; // e.g., "today", "tomorrow", "next Monday", "YYYY-MM-DD"
  time_preference?: string; // e.g., "morning", "afternoon", "evening", "HH:MM"
  medication_name?: string;
  symptom_list?: string[];
}

export interface GeminiResponse {
  textResponse: string;
  entities: ExtractedEntities | null;
}

export interface AppointmentContextData {
  physician: string;
  location: string;
  currentDate: Date;
  availableTimes: string[];
  selectedTime: string | null;
  stage: 'showingSlots' | 'confirmingBooking' | 'confirmed' | 'promptingReminder' | 'confirmingContact' | 'reminderSet' | 'choosingNewDate';
  reminderPreference: 'mobile' | 'email' | null;
  contactToConfirm: string | null;
  _parentIntentAtBooking?: string | null;
}

export interface ChatInputProps {
  currentInputText: string;
  onInputTextChange: (text: string) => void;
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onFeatureClick?: (feature: string) => void;
  showEmojiPicker?: boolean;
  onEmojiSelect?: (emoji: string) => void;
  isListening?: boolean;
}

export interface PostChatFeedbackData {
  clarity: number;
  optionsAvailability: number;
  accuracy: number;
}
