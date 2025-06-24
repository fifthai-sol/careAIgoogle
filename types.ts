
import React from 'react';

export enum ChatSender {
  User = 'user',
  AI = 'ai',
  Agent = 'agent', 
}

export interface ChatMessageData {
  id: string;
  text: string;
  sender: ChatSender;
  timestamp: Date;
  avatar?: React.ReactNode;
  imageSrc?: string;
  attachmentFile?: File;
  attachmentName?: string;
  attachmentType?: string;
  feedback?: 'up' | 'down' | null;
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

// Added missing types based on src/types.ts
export type AgentRole = 'Customer Service' | 'Physician' | 'Advice Nurse' | 'Pharmacist' | 'Technical Support';

export type HandoffStatus = 'pending' | 'active' | 'resolved' | 'escalated_servicenow';

export interface HandoffRequest {
  id: string;
  userId: string;
  userName?: string;
  handoffReason?: string;
  timestamp: string; // ISO string compatible with new Date().toISOString()
  status: HandoffStatus;
  initialMessages: ChatMessageData[]; // Uses ChatMessageData with Date timestamp
  currentConversation: ChatMessageData[]; // Uses ChatMessageData with Date timestamp
  agentId?: string;
  agentRole?: AgentRole;
  originalIntent?: string;
}
