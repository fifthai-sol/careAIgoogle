
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessageData, ChatSender, AppointmentContextData, PostChatFeedbackData, ExtractedEntities, GeminiResponse, HandoffRequest, AgentRole, HandoffStatus } from './types';
import { sendMessageToAI, initializeChat } from './services/geminiService';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import Header from './components/Header';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import IntentButtons from './components/IntentButtons';
import AppointmentScheduler from './components/AppointmentScheduler';
import { ModernAiIcon, MessageIcon, ChevronUpIcon, UserGroupIcon, ChatBubbleLeftRightIcon } from './components/Icons'; // Added UserGroupIcon, ChatBubbleLeftRightIcon
import UserInitialsAvatar from './components/UserInitialsAvatar';
import PostChatFeedbackModal from './components/PostChatFeedbackModal';
import { INTENT_OPTIONS, SUB_INTENT_OPTIONS, LOCALSTORAGE_HANDOFF_QUEUE_KEY, HANDOFF_INTENT_MAP } from './constants';

// Firebase Imports
import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore, collection, addDoc, Timestamp } from "firebase/firestore";
import firebaseConfig from './firebaseConfig';

// --- START: Web Speech API Type Definitions ---
interface SpeechGrammar {
  src: string;
  weight: number;
}

interface SpeechGrammarList {
  readonly length: number;
  item(index: number): SpeechGrammar;
  [index: number]: SpeechGrammar;
  addFromString(string: string, weight?: number): void;
  addFromURI(src: string, weight?: number): void;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
  readonly interpretation?: any;
  readonly emma?: Document | null;
}

type SpeechRecognitionErrorCode =
  | "no-speech"
  | "aborted"
  | "audio-capture"
  | "network"
  | "not-allowed"
  | "service-not-allowed"
  | "bad-grammar"
  | "language-not-supported";

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: SpeechRecognitionErrorCode;
  readonly message: string;
}

interface SpeechRecognitionEventMap {
  "audiostart": Event;
  "audioend": Event;
  "end": Event;
  "error": SpeechRecognitionErrorEvent;
  "nomatch": SpeechRecognitionEvent;
  "result": SpeechRecognitionEvent;
  "soundstart": Event;
  "soundend": Event;
  "speechstart": Event;
  "speechend": Event;
  "start": Event;
}

interface SpeechRecognition extends EventTarget {
  grammars: SpeechGrammarList;
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;

  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;

  abort(): void;
  start(): void;
  stop(): void;

  addEventListener<K extends keyof SpeechRecognitionEventMap>(type: K, listener: (this: SpeechRecognition, ev: SpeechRecognitionEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof SpeechRecognitionEventMap>(type: K, listener: (this: SpeechRecognition, ev: SpeechRecognitionEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

interface SpeechRecognitionStatic {
  new (): SpeechRecognition;
  prototype: SpeechRecognition;
}
// --- END: Web Speech API Type Definitions ---

type ChatDisplayState = 'closed' | 'open' | 'minimized';
type NavigationIntentType = 'MainMenu' | 'GoBack';

const generalReplacer = (key: string, value: any) => {
  if (key === "currentDate" && value instanceof Date) {
    return value.toISOString();
  }
  if (key === "timestamp" && value instanceof Date) { // Ensure this is used for ChatMessageData.timestamp
    return value.toISOString();
  }
  return value;
};

const messageReplacer = (key: string, value: any) => {
  if (key === "avatar") {
    return undefined;
  }
  if (key === "attachmentFile") {
    return undefined;
  }
  if (key === "feedback" && (value === 'up' || value === 'down' || value === null)) {
      return value;
  }
  // Use generalReplacer for dates within messages too.
  return generalReplacer(key, value);
};

const reviver = (key: string, value: any) => {
  if ((key === "currentDate" || key === "timestamp") && typeof value === "string") {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  return value;
};

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic | undefined;
    webkitSpeechRecognition: SpeechRecognitionStatic | undefined;
  }
}
const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

// Firebase Initialization
let firebaseApp: FirebaseApp | null = null;
let db: Firestore | null = null;

try {
  if (firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY") {
    firebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(firebaseApp);
    console.log("Firebase initialized successfully.");
  } else {
    console.warn("Firebase configuration is missing, incomplete, or uses placeholder values. Firebase features will be disabled.");
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
}


const App: React.FC = () => {
  const [chatDisplayState, setChatDisplayState] = useState<ChatDisplayState>('closed');
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showInitialIntents, setShowInitialIntents] = useState<boolean>(false);
  const [currentSubIntents, setCurrentSubIntents] = useState<string[] | null>(null);
  const [activeParentIntent, setActiveParentIntent] = useState<string | null>(null);
  const [appointmentContext, setAppointmentContext] = useState<AppointmentContextData | null>(null);
  const [isAwaitingHandoff, setIsAwaitingHandoff] = useState<boolean>(false);

  const [chatInputText, setChatInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isListening, setIsListening] = useState(false);
  const [speechApiSupported, setSpeechApiSupported] = useState<boolean>(!!SpeechRecognitionAPI);
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);


  const [showPostChatFeedbackModal, setShowPostChatFeedbackModal] = useState<boolean>(false);
  const [postChatFeedbackData, setPostChatFeedbackData] = useState<PostChatFeedbackData>({
    clarity: 0,
    optionsAvailability: 0,
    accuracy: 0,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const appointmentContextRef = useRef(appointmentContext);
  const activeParentIntentRef = useRef(activeParentIntent);

  const currentUser = {
    id: `user-${Math.random().toString(36).substring(7)}`, // Simple unique ID for demo
    firstName: "Member",
    lastName: "User",
    email: "member.user@example.com",
    phoneNumber: "555-123-4567"
  };
  const placeholderPhysician = "Dr. Emily Carter";
  const placeholderLocation = "Downtown Clinic";
  const helpDeskPhoneNumber = "+14232769938";
  const helpDeskDisplayNumber = "+1 423-276-9938";

  const initialGreetingMessageObject: ChatMessageData = {
    id: 'initial-greeting',
    text: "Hello! I'm CareAI. How can I help you today? You can ask me a question or choose an option below.",
    sender: ChatSender.AI,
    timestamp: new Date(),
    avatar: <ModernAiIcon className="w-8 h-8 text-white" />,
    feedback: null,
  };

  const riskDisclaimerMessageObject: ChatMessageData = {
    id: 'risk-disclaimer',
    text: "Please remember, I am not a substitute for professional medical advice. For any medical concerns, please consult a qualified healthcare provider.",
    sender: ChatSender.AI,
    timestamp: new Date(),
    avatar: <ModernAiIcon className="w-8 h-8 text-white" />,
    feedback: null,
  };

  useEffect(() => {
    if (!SpeechRecognitionAPI) {
      setSpeechApiSupported(false);
      console.warn("Speech Recognition API is not supported in this browser.");
    }
  }, []);

  useEffect(() => {
    try {
      const storedMessagesString = localStorage.getItem('chatMessages');
      if (storedMessagesString) {
        const parsedMessagesFromStorage: ChatMessageData[] = JSON.parse(storedMessagesString, reviver);

        const reconstructedMessages: ChatMessageData[] = parsedMessagesFromStorage.map(msg => {
          let avatarElement: React.ReactNode;
          const isErrorMsg = msg.id.endsWith('-error');

          if (msg.sender === ChatSender.AI) {
              avatarElement = <ModernAiIcon className={`w-8 h-8 ${isErrorMsg ? 'text-red-500' : 'text-white'}`} />;
          } else { // User
              avatarElement = <UserInitialsAvatar firstName={currentUser.firstName} lastName={currentUser.lastName} />;
          }
          return {
            ...msg,
            timestamp: msg.timestamp, // Already a Date object due to reviver
            avatar: avatarElement,
            attachmentFile: undefined, // Not stored
            feedback: msg.feedback === undefined ? null : msg.feedback,
          };
        });
        setMessages(reconstructedMessages);
      }

      const storedShowInitialIntents = localStorage.getItem('chatShowInitialIntents');
      if (storedShowInitialIntents) {
        setShowInitialIntents(JSON.parse(storedShowInitialIntents));
      }

      const storedCurrentSubIntents = localStorage.getItem('chatCurrentSubIntents');
      if (storedCurrentSubIntents) {
        setCurrentSubIntents(JSON.parse(storedCurrentSubIntents));
      }

      const storedActiveParentIntent = localStorage.getItem('chatActiveParentIntent');
      if (storedActiveParentIntent) {
        setActiveParentIntent(JSON.parse(storedActiveParentIntent));
      }

      const storedAppointmentContext = localStorage.getItem('chatAppointmentContext');
      if (storedAppointmentContext) {
        const parsedCtx = JSON.parse(storedAppointmentContext, reviver);
        setAppointmentContext(parsedCtx);
      }

      const storedChatDisplayState = localStorage.getItem('chatDisplayState') as ChatDisplayState | null;
      // Default to 'closed' to show launcher, unless explicitly 'open' or 'minimized'
      if (storedChatDisplayState && (storedChatDisplayState === 'open' || storedChatDisplayState === 'minimized')) {
        setChatDisplayState(storedChatDisplayState);
      } else {
        setChatDisplayState('closed'); // Ensure launcher shows if no specific state
      }

      const storedIsAwaitingHandoff = localStorage.getItem('chatIsAwaitingHandoff');
      if (storedIsAwaitingHandoff) {
        setIsAwaitingHandoff(JSON.parse(storedIsAwaitingHandoff));
      }


    } catch (e) {
      console.error("Error loading state from localStorage:", e);
    }
    initializeChatSafely();
  }, [currentUser.firstName, currentUser.lastName]);

  const initializeChatSafely = () => {
    try {
        initializeChat();
    } catch (e) {
        console.error("Initialization error:", e);
        setError(e instanceof Error ? e.message : "Failed to initialize AI Chat service.");
    }
  };

  useEffect(() => { localStorage.setItem('chatMessages', JSON.stringify(messages, messageReplacer)); }, [messages]);
  useEffect(() => { localStorage.setItem('chatShowInitialIntents', JSON.stringify(showInitialIntents)); }, [showInitialIntents]);
  useEffect(() => { localStorage.setItem('chatCurrentSubIntents', JSON.stringify(currentSubIntents)); }, [currentSubIntents]);
  useEffect(() => { localStorage.setItem('chatActiveParentIntent', JSON.stringify(activeParentIntent)); }, [activeParentIntent]);
  useEffect(() => { localStorage.setItem('chatAppointmentContext', JSON.stringify(appointmentContext, generalReplacer)); }, [appointmentContext]);
  useEffect(() => { localStorage.setItem('chatDisplayState', chatDisplayState);}, [chatDisplayState]);
  useEffect(() => { localStorage.setItem('chatIsAwaitingHandoff', JSON.stringify(isAwaitingHandoff));}, [isAwaitingHandoff]);


  useEffect(() => {
    appointmentContextRef.current = appointmentContext;
  }, [appointmentContext]);
  useEffect(() => {
    activeParentIntentRef.current = activeParentIntent;
  }, [activeParentIntent]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isLoading, currentSubIntents, appointmentContext, chatDisplayState, error, showEmojiPicker, showPostChatFeedbackModal, isAwaitingHandoff]);

  const startNewChatSessionMessages = useCallback((isContinuation: boolean = false) => {
    const initialMsgs: ChatMessageData[] = [
      riskDisclaimerMessageObject,
      initialGreetingMessageObject
    ];

    if (isContinuation) {
      setMessages(prev => [...prev, ...initialMsgs]);
    } else {
      setMessages(initialMsgs);
    }

    setShowInitialIntents(true);
    setCurrentSubIntents(null);
    setActiveParentIntent(null);
    setAppointmentContext(null);
    setError(null);
    setIsLoading(false);
    setShowEmojiPicker(false);
    setIsAwaitingHandoff(false);
  }, [initialGreetingMessageObject, riskDisclaimerMessageObject]);

  const handleSetDisplayState = useCallback((newState: ChatDisplayState) => {
    const previousState = chatDisplayState;
    if (newState === 'open' && messages.length === 0 && !localStorage.getItem('chatMessages')) {
      startNewChatSessionMessages();
    } else if (newState === 'open' && messages.length === 0 && localStorage.getItem('chatMessages')) {
      const storedMessages = JSON.parse(localStorage.getItem('chatMessages')!, reviver);
      if (storedMessages.length === 0) startNewChatSessionMessages();
    }
    if (newState !== 'open') {
      setShowEmojiPicker(false);
      setShowPostChatFeedbackModal(false);
      if (isListening && speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
        setIsListening(false);
      }
    }
    setChatDisplayState(newState);
  }, [chatDisplayState, messages.length, startNewChatSessionMessages, isListening]);

  const addAiMessageToChat = (text: string, isError: boolean = false, idSuffix: string = '', isSystemMessage: boolean = false) => {
    const newAiMessage: ChatMessageData = {
        id: `ai-${Date.now()}${isError ? '-error' : ''}${idSuffix}`,
        text: isError ? "I'm sorry, I encountered an issue processing your request. Please try again later." : text,
        sender: ChatSender.AI,
        timestamp: new Date(),
        avatar: <ModernAiIcon className={`w-8 h-8 ${isError ? 'text-red-500' : 'text-white'}`} />,
        feedback: null,
    };
    setMessages(prevMessages => [...prevMessages, newAiMessage]);
  };

  const getFormattedDate = (date: Date, includeWeekday: boolean = true) => {
    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' };
    if (includeWeekday) options.weekday = 'long';
    return date.toLocaleDateString(undefined, options);
  };

  const initiateAppointmentFlow = (entities?: ExtractedEntities | null) => {
    setIsLoading(true);
    const baseDate = new Date();
    if (entities?.date_preference?.toLowerCase() === "today") {
      addAiMessageToChat(`Appointments for today are often limited. Let me check for tomorrow for ${placeholderPhysician} at ${placeholderLocation}.`, false, '', true);
      baseDate.setDate(baseDate.getDate() + 1);
    } else if (entities?.date_preference?.toLowerCase() === "tomorrow") {
      baseDate.setDate(baseDate.getDate() + 1);
    } else if (entities?.date_preference) {
        const dayMapping: { [key: string]: number } = { "sunday": 0, "monday": 1, "tuesday": 2, "wednesday": 3, "thursday": 4, "friday": 5, "saturday": 6 };
        const parts = entities.date_preference.toLowerCase().split(" ");
        if (parts.length === 2 && parts[0] === "next" && parts[1] in dayMapping) {
            const targetDay = dayMapping[parts[1]];
            let diff = targetDay - baseDate.getDay();
            if (diff <= 0) diff += 7;
            baseDate.setDate(baseDate.getDate() + diff);
        } else {
             baseDate.setDate(baseDate.getDate() + 1);
        }
    }
     else {
      baseDate.setDate(baseDate.getDate() + 1);
    }

    let sampleTimes = ["9:00 AM", "9:30 AM", "10:00 AM", "2:00 PM", "2:30 PM", "3:00 PM"];
    if (entities?.time_preference) {
        const timePref = entities.time_preference.toLowerCase();
        if (timePref.includes("morning")) {
            sampleTimes = ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM"];
        } else if (timePref.includes("afternoon")) {
            sampleTimes = ["1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM"];
        } else if (timePref.includes("evening")) {
            sampleTimes = ["5:00 PM", "5:30 PM", "6:00 PM"];
        }
    }

    setAppointmentContext({
      physician: placeholderPhysician,
      location: placeholderLocation,
      currentDate: baseDate,
      availableTimes: sampleTimes,
      selectedTime: null,
      stage: 'showingSlots',
      reminderPreference: null,
      contactToConfirm: null,
      _parentIntentAtBooking: activeParentIntentRef.current || "Member Support"
    });
    addAiMessageToChat(`Okay, I've found some available appointments for you with ${placeholderPhysician} at the ${placeholderLocation} for ${getFormattedDate(baseDate, true)}:`, false, '', true);
    setIsLoading(false);
  };

  const fetchAndDisplayAiResponse = async (prompt: string, isFreeTextQuery: boolean = false) => {
    setIsLoading(true);
    setError(null);
    try {
        const aiResponse: GeminiResponse = await sendMessageToAI(prompt);
        addAiMessageToChat(aiResponse.textResponse, false, '-response');

        if (isFreeTextQuery && aiResponse.entities?.intent_type === 'appointment_booking') {
            setCurrentSubIntents(null);
            setActiveParentIntent("Member Support");
            setShowInitialIntents(false);
            initiateAppointmentFlow(aiResponse.entities);
            return;
        }

    } catch (err) {
        console.error("Error sending message to AI:", err);
        const errorMessageText = err instanceof Error ? err.message : "An unknown error occurred.";
        setError(`Failed to get response from AI: ${errorMessageText}. Please check your API key and network.`);
        addAiMessageToChat("", true);
    } finally {
        setIsLoading(false);
    }
  };

  const addUserMessageToChat = (text: string, attachment?: { file?: File, name: string, type?: string }, imageSrc?: string) => {
    const newUserMessage: ChatMessageData = {
      id: `user-${Date.now()}`,
      text: text,
      sender: ChatSender.User,
      timestamp: new Date(),
      avatar: <UserInitialsAvatar firstName={currentUser.firstName} lastName={currentUser.lastName} />,
      attachmentFile: attachment?.file,
      attachmentName: attachment?.name,
      attachmentType: attachment?.type,
      imageSrc,
    };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
  };

  const handleSendMessage = async (inputText: string) => {
    const trimmedInput = inputText.trim();
    if (!trimmedInput || isAwaitingHandoff) return;

    addUserMessageToChat(trimmedInput);
    setChatInputText('');
    setShowEmojiPicker(false);
    if (isListening && speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      setIsListening(false);
    }

    if (!activeParentIntent && !currentSubIntents && !appointmentContext) {
        setShowInitialIntents(false);
    } else if (appointmentContext) {
        setAppointmentContext(null);
        setActiveParentIntent(null);
        setCurrentSubIntents(null);
        setShowInitialIntents(false);
    } else {
        setActiveParentIntent(null);
        setCurrentSubIntents(null);
        setShowInitialIntents(false);
    }

    await fetchAndDisplayAiResponse(trimmedInput, true);
  };

  const initiateHandoff = (intentText: string) => {
    const targetRoleDescription = HANDOFF_INTENT_MAP[intentText] || "an agent";
    const agentRoleForHandoff = HANDOFF_INTENT_MAP[intentText] as AgentRole | undefined;


    // Create handoff request (timestamps will be serialized by messageReplacer)
    const handoffRequest: HandoffRequest = {
        id: `handoff-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        userId: currentUser.id,
        userName: `${currentUser.firstName} ${currentUser.lastName}`,
        handoffReason: intentText,
        timestamp: new Date().toISOString(),
        status: 'pending' as HandoffStatus,
        initialMessages: [...messages], // Current chat history (will be stringified with Date objects)
        currentConversation: [...messages], // Initially the same (will be stringified with Date objects)
        agentRole: agentRoleForHandoff,
        originalIntent: intentText,
    };

    try {
        const queueString = localStorage.getItem(LOCALSTORAGE_HANDOFF_QUEUE_KEY);
        const queue: HandoffRequest[] = queueString ? JSON.parse(queueString) : [];

        // Serialize messages within handoffRequest correctly for localStorage
        // The messageReplacer handles Date objects in ChatMessageData.timestamp
        const handoffRequestForStorage = JSON.parse(JSON.stringify(handoffRequest, messageReplacer));

        queue.push(handoffRequestForStorage);
        localStorage.setItem(LOCALSTORAGE_HANDOFF_QUEUE_KEY, JSON.stringify(queue)); // Store the queue (already stringified)
        console.log("Handoff request added to queue:", handoffRequestForStorage);

    } catch (e) {
        console.error("Error updating handoff queue in localStorage:", e);
        setError("Could not initiate handoff. Please try again.");
        return;
    }

    addAiMessageToChat(`Connecting you to ${targetRoleDescription}. Please wait, an agent will be with you shortly. This chat will be paused.`, false, '-handoff-initiated', true);
    setIsAwaitingHandoff(true);
    setShowInitialIntents(false);
    setCurrentSubIntents(null);
    setActiveParentIntent(null);
    setAppointmentContext(null);
    setIsLoading(false); // Stop any AI loading indicators
  };


  const handleIntentSelection = async (intentText: string) => {
    if (isAwaitingHandoff) return;

    // Check if it's a handoff intent
    if (HANDOFF_INTENT_MAP[intentText]) {
      addUserMessageToChat(intentText); // Add user's intent selection to chat
      setChatInputText('');
      setShowEmojiPicker(false);
      initiateHandoff(intentText);
      return;
    }

    console.log("ANALYTICS_EVENT: MAIN_INTENT_CLICKED", { intent: intentText });
    addUserMessageToChat(intentText);
    setChatInputText('');
    setShowEmojiPicker(false);
    if (showInitialIntents) setShowInitialIntents(false);
    setAppointmentContext(null);
    setCurrentSubIntents(null);

    addAiMessageToChat(`Okay, looking into "${intentText}" for you.`, false, '', true);
    setActiveParentIntent(intentText);

    const subIntents = SUB_INTENT_OPTIONS[intentText];
    if (subIntents && subIntents.length > 0) {
      setCurrentSubIntents(subIntents);
    } else {
      setActiveParentIntent(intentText);
      await fetchAndDisplayAiResponse(intentText);
    }
  };

  const handleSubIntentSelection = async (subIntentText: string) => {
    if (isAwaitingHandoff) return;
    console.log("ANALYTICS_EVENT: SUB_INTENT_CLICKED", { parentIntent: activeParentIntentRef.current, subIntent: subIntentText });
    addUserMessageToChat(subIntentText);
    setChatInputText('');
    setShowEmojiPicker(false);
    const currentParentIntent = activeParentIntentRef.current;
    const acknowledgementText = currentParentIntent
      ? `Understood. For "${currentParentIntent}", I will now address "${subIntentText}".`
      : `Got it. Processing "${subIntentText}"...`;
    addAiMessageToChat(acknowledgementText, false, '', true);
    setCurrentSubIntents(null);

    if (subIntentText.toLowerCase() === 'appointment' && currentParentIntent === "Member Support") {
      initiateAppointmentFlow();
    } else {
      const fullPrompt = currentParentIntent ? `${currentParentIntent}: ${subIntentText}` : subIntentText;
      await fetchAndDisplayAiResponse(fullPrompt);
    }
  };

  const handleTimeSlotSelection = (time: string) => {
    if (isAwaitingHandoff) return;
    if (!appointmentContextRef.current || appointmentContextRef.current.stage !== 'showingSlots') {
        console.warn("handleTimeSlotSelection called at invalid stage or null context", appointmentContextRef.current?.stage);
        return;
    }
    addUserMessageToChat(`I'd like to book the ${time} slot.`);
    setChatInputText('');
    setShowEmojiPicker(false);

    const currentParentForBooking = activeParentIntentRef.current || appointmentContextRef.current._parentIntentAtBooking;

    setAppointmentContext(prev => prev && prev.stage === 'showingSlots' ? {...prev, stage: 'confirmingBooking', selectedTime: time, _parentIntentAtBooking: currentParentForBooking } : prev);
    const physicianName = appointmentContextRef.current?.physician || placeholderPhysician;
    addAiMessageToChat(`Okay, attempting to book your appointment for ${time} with ${physicianName}...`, false, '', true);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const currentContext = appointmentContextRef.current;
      if (currentContext && currentContext.selectedTime && currentContext.stage === 'confirmingBooking') {
        const confirmedDate = getFormattedDate(currentContext.currentDate, true);
        const confirmedTime = currentContext.selectedTime;
        const confirmationMessage = `Great! Your upcoming appointment with ${currentContext.physician} at ${currentContext.location} on ${confirmedDate} at ${confirmedTime} is confirmed.`;
        setAppointmentContext(prev => prev && prev.stage === 'confirmingBooking' ? {...prev, stage: 'confirmed'} : prev);
        addAiMessageToChat(confirmationMessage, false, '', true);

        setTimeout(() => {
            const latestContext = appointmentContextRef.current;
            if (latestContext && latestContext.stage === 'confirmed') {
                 setAppointmentContext(prev => prev && prev.stage === 'confirmed' ? {...prev, stage: 'promptingReminder'} : prev);
                 addAiMessageToChat("Would you like a reminder for this appointment via mobile or email?", false, '', true);
            } else {
                 console.log(`handleTimeSlotSelection (inner timeout for reminder): Flow interrupted or context changed. Stage: ${latestContext?.stage}`);
            }
        }, 1200);
      } else {
        if (currentContext) {
            console.error("handleTimeSlotSelection (booking confirmation): Unexpected booking state or flow interruption.", currentContext);
            addAiMessageToChat("There was an issue with your booking request, or the process was interrupted. Please try selecting a time again.", true);
             if (currentContext.stage !== 'confirmingBooking') {
                setAppointmentContext(null);
             } else {
                setAppointmentContext(prev => prev ? {...prev, stage: 'showingSlots', selectedTime: null} : null);
             }
        } else {
            console.log("handleTimeSlotSelection: Booking flow cancelled or context became null.");
        }
      }
    }, 2000);
  };

  const handleChooseAnotherDate = () => {
    if (isAwaitingHandoff) return;
    if (!appointmentContextRef.current || appointmentContextRef.current.stage !== 'showingSlots') {
        console.warn("handleChooseAnotherDate called at invalid stage", appointmentContextRef.current?.stage);
        return;
    }
    addUserMessageToChat("I'd like to choose another date.");
    setChatInputText('');
    setShowEmojiPicker(false);
    setAppointmentContext(prev => prev && prev.stage === 'showingSlots' ? {...prev, stage: 'choosingNewDate'} : prev);
    addAiMessageToChat("Sure, let's look for other dates.", false, '', true);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const currentContext = appointmentContextRef.current;
      if (currentContext && currentContext.stage === 'choosingNewDate') {
        const newDate = new Date(currentContext.currentDate);
        newDate.setDate(newDate.getDate() + 1);
        const newSampleTimes = ["10:30 AM", "11:00 AM", "11:30 AM", "3:30 PM", "4:00 PM"];
        setAppointmentContext(prev => prev && prev.stage === 'choosingNewDate' ? { ...prev, currentDate: newDate, availableTimes: newSampleTimes, selectedTime: null, stage: 'showingSlots' } : prev);
        addAiMessageToChat(`How about these times for ${getFormattedDate(newDate, true)} with ${currentContext.physician || placeholderPhysician}?`, false, '', true);
      } else {
        console.log(`handleChooseAnotherDate: Flow interrupted or context changed. Stage: ${currentContext?.stage}`);
      }
    }, 1500);
  };

  const handleReminderPreference = (preference: 'mobile' | 'email') => {
    if (isAwaitingHandoff) return;
    if (!appointmentContextRef.current || appointmentContextRef.current.stage !== 'promptingReminder') return;
    addUserMessageToChat(`I'd like a reminder via ${preference}.`);
    setChatInputText('');
    setShowEmojiPicker(false);
    const contact = preference === 'email' ? currentUser.email : currentUser.phoneNumber;
    const contactType = preference === 'email' ? "registered email" : "registered phone number";
    setAppointmentContext(prev => prev && prev.stage === 'promptingReminder' ? { ...prev, stage: 'confirmingContact', reminderPreference: preference, contactToConfirm: contact } : prev);
    addAiMessageToChat(`Okay, I can send a reminder to your ${contactType}: ${contact}. Is this correct?`, false, '', true);
  };

  const handleContactConfirmation = (confirmed: boolean) => {
    if (isAwaitingHandoff) return;
    if (!appointmentContextRef.current || appointmentContextRef.current.stage !== 'confirmingContact') return;
    if (confirmed) {
      addUserMessageToChat("Yes, that's correct. Please send the reminder.");
      addAiMessageToChat("Excellent! I've set up a reminder for your appointment. You'll receive it closer to the date.", false, '', true);
    } else {
      addUserMessageToChat("No, that's not right / I'd prefer not to say.");
      addAiMessageToChat("Okay, please ensure your contact information is up to date in your profile settings. For now, I won't set up an automated reminder.", false, '', true);
    }
    setChatInputText('');
    setShowEmojiPicker(false);

    const parentAtBooking = appointmentContextRef.current._parentIntentAtBooking;

    setAppointmentContext(prev => prev && prev.stage === 'confirmingContact' ? {...prev, stage: 'reminderSet'} : prev);

    setTimeout(() => {
        const latestContext = appointmentContextRef.current;
        if (latestContext && latestContext.stage === 'reminderSet') {
            addAiMessageToChat("Your appointment is all set! What would you like to do next?", false, '', true);
            setAppointmentContext(null);
            if (parentAtBooking) {
                setActiveParentIntent(parentAtBooking);
                setCurrentSubIntents(null);
            } else {
                setActiveParentIntent(null);
            }
            setShowInitialIntents(false);
        }
    }, 1500);
  };

  const handleNavigationIntent = (navIntent: NavigationIntentType) => {
    if (isAwaitingHandoff) { // If awaiting handoff, main menu might mean cancel handoff or just go to visual main menu
         addAiMessageToChat("You are currently waiting for an agent. To cancel, please end the chat session.", false, '', true);
         return;
    }
    addUserMessageToChat(navIntent === 'MainMenu' ? "Main Menu" : "Go Back");
    setChatInputText('');
    setShowEmojiPicker(false);

    if (navIntent === 'MainMenu') {
        addAiMessageToChat("Okay, returning to the main menu.", false, '', true);
        setAppointmentContext(null);
        setCurrentSubIntents(null);
        setActiveParentIntent(null);
        setShowInitialIntents(true);
        setError(null);
    } else if (navIntent === 'GoBack') {
        const currentAppContext = appointmentContextRef.current;
        const currentParentIntentState = activeParentIntent;

        if (currentAppContext) {
            const { stage, physician, _parentIntentAtBooking } = currentAppContext;
            if (stage === 'promptingReminder' || stage === 'confirmingContact' || stage === 'reminderSet' || stage === 'confirmed') {
                addAiMessageToChat(`Going back to appointment time selection for ${physician}.`, false, '', true);
                setAppointmentContext(prev => prev ? { ...prev, stage: 'showingSlots', selectedTime: null, reminderPreference: null, contactToConfirm: null } : null);
                return;
            } else if (stage === 'showingSlots' || stage === 'choosingNewDate') {
                const parentToReturnTo = _parentIntentAtBooking || currentParentIntentState;
                 addAiMessageToChat(parentToReturnTo && SUB_INTENT_OPTIONS[parentToReturnTo] ? `Returning to options under "${parentToReturnTo}".` : "Returning to the main menu.", false, '', true);
                setAppointmentContext(null);
                if (parentToReturnTo && SUB_INTENT_OPTIONS[parentToReturnTo]) {
                    setActiveParentIntent(parentToReturnTo);
                    setCurrentSubIntents(SUB_INTENT_OPTIONS[parentToReturnTo]);
                    setShowInitialIntents(false);
                } else {
                    setActiveParentIntent(null);
                    setCurrentSubIntents(null);
                    setShowInitialIntents(true);
                }
                return;
            }
        }

        if (currentSubIntents && currentParentIntentState) {
            addAiMessageToChat("Returning to the main menu.", false, '', true);
            setCurrentSubIntents(null);
            setActiveParentIntent(null);
            setShowInitialIntents(true);
            return;
        }

        if (currentParentIntentState && !currentSubIntents && !currentAppContext) {
            const subIntentsForParent = SUB_INTENT_OPTIONS[currentParentIntentState];
            if (subIntentsForParent && subIntentsForParent.length > 0) {
                addAiMessageToChat(`Okay, here are more options under "${currentParentIntentState}".`, false, '', true);
                setCurrentSubIntents(subIntentsForParent);
                setShowInitialIntents(false);
                return;
            }
        }

        if (showInitialIntents) {
            addAiMessageToChat("You are already at the main menu.", false, '', true);
        } else {
            addAiMessageToChat("Returning to the main menu.", false, '', true);
            setAppointmentContext(null);
            setCurrentSubIntents(null);
            setActiveParentIntent(null);
            setShowInitialIntents(true);
            setError(null);
        }
    }
  };

  const handleFeedback = (messageId: string, feedbackType: 'up' | 'down') => {
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === messageId ? { ...msg, feedback: feedbackType } : msg
      )
    );
    console.log(`Feedback for message ID ${messageId}: ${feedbackType}`);
  };

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isAwaitingHandoff) return;
    const file = event.target.files?.[0];
    if (file) {
      const attachment = { file: file, name: file.name, type: file.type };
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageSrc = e.target?.result as string;
          addUserMessageToChat(`Attached image: ${file.name}`, attachment, imageSrc);
        };
        reader.readAsDataURL(file);
      } else {
        addUserMessageToChat(`Attached file: ${file.name}`, attachment);
      }
      setChatInputText('');
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    if (isAwaitingHandoff) return;
    setChatInputText(prev => prev + emoji);
  };

  const toggleSpeechRecognition = () => {
    if (isAwaitingHandoff) return;
    if (!speechApiSupported || !SpeechRecognitionAPI) {
      setError("Speech recognition is not supported by your browser.");
      addAiMessageToChat("Sorry, your browser doesn't support voice input.", true, '-speech-unsupported', true);
      return;
    }

    if (isListening) {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      speechRecognitionRef.current = new SpeechRecognitionAPI();
      const recognition = speechRecognitionRef.current;

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      let finalTranscript = '';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setChatInputText(finalTranscript + interimTranscript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error, event.message);
        let errorMsg = `Speech recognition error: ${event.error}. ${event.message}`;
        if (event.error === 'no-speech') {
          errorMsg = "No speech detected. Please try again.";
        } else if (event.error === 'audio-capture') {
          errorMsg = "Microphone problem. Please check your microphone.";
        } else if (event.error === 'not-allowed') {
          errorMsg = "Permission to use microphone was denied. Please enable it in your browser settings.";
        }
        setError(errorMsg);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (finalTranscript.trim()) {
            console.log("Final transcript:", finalTranscript.trim());
        }
      };

      try {
        recognition.start();
        setIsListening(true);
        setError(null);
        setShowEmojiPicker(false);
      } catch (e) {
        console.error("Error starting speech recognition:", e);
        setError("Could not start voice input. Please try again.");
        setIsListening(false);
      }
    }
  };

  const handleFeatureClick = (feature: string) => {
    if (isAwaitingHandoff && feature !== 'Voice Call') { // Allow voice call even during handoff wait
        addAiMessageToChat("Chat features are paused while we connect you to an agent.", false, '', true);
        return;
    }
    setShowEmojiPicker(false);
    switch (feature) {
      case 'Attachment':
        fileInputRef.current?.click();
        break;
      case 'Emoji':
        setShowEmojiPicker(prev => !prev);
        break;
      case 'Voice Recorder':
        toggleSpeechRecognition();
        break;
      case 'Voice Call': // This can still be used to call help desk
        addAiMessageToChat(`Attempting to call Help Desk at ${helpDeskDisplayNumber}... Your computer will try to open your default calling app.`, false, '', true);
        window.location.href = `tel:${helpDeskPhoneNumber}`;
        // Don't necessarily change handoff state here, user might still want agent chat.
        // Or, we could cancel handoff if call is initiated. For now, keep it simple.
        if (!isAwaitingHandoff) {
            setAppointmentContext(null);
            setCurrentSubIntents(null);
            setActiveParentIntent(null);
            setShowInitialIntents(false);
        }
        setError(null);
        break;
      default:
        addAiMessageToChat(`${feature} feature is coming soon!`, false, '', true);
    }
  };

  const handleEndChatSession = async () => {
    addAiMessageToChat("CareAI Chat session ended by member.", false, '-member-ended-session', true);
    setIsAwaitingHandoff(false); // If chat ends, no longer awaiting handoff

    // If there was a pending handoff for this user, we might want to mark it as 'resolved' or 'cancelled'
    // For simplicity, this is not implemented here but would be a good enhancement.

    const sessionData = {
        sessionId: `session-${Date.now()}`,
        timestamp: Timestamp.now(),
        userId: currentUser.email, // Or currentUser.id
        messages: messages.map(msg => {
            const { avatar, attachmentFile, ...rest } = msg;
            const feedbackValue = (rest.feedback === 'up' || rest.feedback === 'down') ? rest.feedback : null;
            // Ensure timestamp is serialized correctly if it's a Date object
            const timestampForFirebase = msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp);
            return { ...rest, feedback: feedbackValue, timestamp: timestampForFirebase };
        }),
    };

    if (db) {
        try {
            // Firestore expects Timestamps for date fields if not auto-generated
            const messagesForFirebase = sessionData.messages.map(m => ({...m, timestamp: Timestamp.fromDate(m.timestamp)}));
            const docRef = await addDoc(collection(db, "chatSessions"), { ...sessionData, messages: messagesForFirebase });
            console.log("Chat session saved to Firebase with ID: ", docRef.id);
        } catch (e) {
            console.error("Error adding document to Firebase: ", e);
            console.log("---- CHAT HISTORY (LOCAL FALLBACK DUE TO FIREBASE ERROR) ----");
            console.log(JSON.stringify(sessionData, (key, value) =>
              key === 'timestamp' && value && typeof value.toDate === 'function' ? value.toDate().toISOString() : value, 2));
            console.log("---- END OF LOCAL FALLBACK ----");
            setError("Could not save chat history to the database. Please check console for details.");
        }
    } else {
        console.warn("Firebase is not initialized. Chat history will be logged locally.");
        console.log("---- CHAT HISTORY (LOCAL LOGGING - FIREBASE NOT INIT) ----");
        console.log(JSON.stringify(sessionData, (key, value) =>
          key === 'timestamp' && value && typeof value.toDate === 'function' ? value.toDate().toISOString() : value, 2));
        console.log("---- END OF LOCAL LOGGING ----");
    }

    setAppointmentContext(null);
    setCurrentSubIntents(null);
    setActiveParentIntent(null);
    setShowInitialIntents(false);
    setError(null);
    setIsLoading(false);
    setShowEmojiPicker(false);
    if (isListening && speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
        setIsListening(false);
    }

    setShowPostChatFeedbackModal(true);
  };

  const handlePostChatFeedbackSubmit = (feedback: PostChatFeedbackData) => {
    setPostChatFeedbackData(feedback);
    setShowPostChatFeedbackModal(false);

    console.log("---- POST-CHAT FEEDBACK SUBMITTED (SIMULATED) ----");
    console.log("Session ID (placeholder):", "session-id-placeholder");
    console.log("Timestamp:", new Date().toISOString());
    console.log("Feedback Data:", feedback);
    localStorage.setItem('lastPostChatFeedback', JSON.stringify(feedback));
    console.log("---- END OF SIMULATED FEEDBACK SUBMISSION ----");

    // After feedback, instead of showing new greeting, go back to launcher
    addAiMessageToChat(
      "Thank you for your valuable feedback!",
      false,
      '-feedback-thank-you-custom',
      true
    );
    // Reset to launcher view
    setMessages([]); // Clear messages for a fresh start next time
    localStorage.removeItem('chatMessages'); // Also clear from storage
    localStorage.removeItem('chatShowInitialIntents');
    localStorage.removeItem('chatCurrentSubIntents');
    localStorage.removeItem('chatActiveParentIntent');
    localStorage.removeItem('chatAppointmentContext');
    localStorage.removeItem('chatIsAwaitingHandoff');
    setChatDisplayState('closed'); // This will show the launcher
    setShowInitialIntents(false);
    setCurrentSubIntents(null);
    setActiveParentIntent(null);
    setAppointmentContext(null);
    setError(null);
    setIsLoading(false);
    setIsAwaitingHandoff(false);
  };

  const getNavigationOptions = (): string[] => {
    if (isAwaitingHandoff) return []; // No navigation options while waiting for handoff

    const options: string[] = [];
    const atTrulyMainMenu = showInitialIntents && !currentSubIntents && !appointmentContext && !activeParentIntent;
    if (!atTrulyMainMenu) {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && (
            lastMessage.id.includes('-response') ||
            (lastMessage.id.includes('ai-') && lastMessage.text.toLowerCase().includes("what would you like to do next?")) ||
            currentSubIntents
          ) && !lastMessage.id.includes('-handoff-initiated') // Don't show if handoff message is last
        ) {
            options.push("Main Menu");
            options.push("Go Back");
        }
    }
    return options;
  };

  const showEndChatButton =
    chatDisplayState === 'open' &&
    !showPostChatFeedbackModal &&
    !isLoading &&
    messages.length > 2 &&
    (
      (!showInitialIntents && !currentSubIntents && !appointmentContext && !isAwaitingHandoff) || // Standard condition
      (messages[messages.length -1] && !messages[messages.length -1].id.startsWith('initial-greeting') && !messages[messages.length -1].id.startsWith('risk-disclaimer'))
    ) &&
    !(messages[messages.length-1]?.id.includes('-member-ended-session')) &&
    !(messages[messages.length-1]?.id.includes('-feedback-thank-you-custom'));


  const openAgentConsole = () => {
    window.open('./agent-console/', '_blank');
  };

  const openMemberCareAI = () => {
    console.log("ANALYTICS_EVENT: LAUNCHER_CLICKED", { action: 'open_member_care_ai' });
    handleSetDisplayState('open');
  };


  return (
    <>
      {chatDisplayState === 'closed' && (
        <div className="flex flex-col items-center justify-center h-full bg-gray-100 p-8">
          <ModernAiIcon className="w-24 h-24 text-primary-DEFAULT mb-6" />
          <h1 className="text-4xl font-bold text-gray-700 mb-3">Welcome to CareAI Suite</h1>
          <p className="text-lg text-gray-500 mb-10 text-center max-w-md">
            Your centralized platform for AI-powered member support and agent assistance.
          </p>
          <div className="space-y-5 md:space-y-0 md:space-x-6 flex flex-col md:flex-row">
            <button
              onClick={openMemberCareAI}
              className="w-full md:w-auto flex items-center justify-center text-lg bg-gradient-to-r from-blue-500 to-emerald-500 text-white px-10 py-4 rounded-lg shadow-xl hover:from-blue-600 hover:to-emerald-600 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-offset-2 transition-all duration-150 ease-in-out transform hover:scale-105"
              aria-label="Open Member CareAI Chat"
            >
              <ChatBubbleLeftRightIcon className="w-7 h-7 mr-3" />
              Member CareAI
            </button>
            <button
              onClick={openAgentConsole}
              className="w-full md:w-auto flex items-center justify-center text-lg bg-gradient-to-r from-gray-700 to-gray-800 text-white px-10 py-4 rounded-lg shadow-xl hover:from-gray-800 hover:to-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-150 ease-in-out transform hover:scale-105"
              aria-label="Open AgentAI Console"
            >
              <UserGroupIcon className="w-7 h-7 mr-3" />
              AgentAI
            </button>
          </div>
        </div>
      )}

      {chatDisplayState === 'minimized' && (
        <button
          onClick={() => {
            console.log("ANALYTICS_EVENT: FAB_CLICKED", { previousState: 'minimized', action: 'open_chat' });
            handleSetDisplayState('open');
          }}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-emerald-500 text-white px-5 py-3 rounded-full shadow-2xl hover:from-blue-600 hover:to-emerald-600 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-offset-2 transition-all duration-150 ease-in-out z-[999] hover:scale-110 flex items-center space-x-2 text-sm font-medium"
          aria-label="Restore Member CareAI Chat"
        >
          <ModernAiIcon className="w-6 h-6" />
           <span>CareAI</span>
        </button>
      )}

      {chatDisplayState === 'open' && (
        <div className="fixed inset-0 w-screen h-screen bg-gray-50 flex flex-col shadow-2xl overflow-hidden z-[1000] md:bottom-5 md:right-5 md:w-[380px] md:h-[calc(100%-40px)] md:max-h-[700px] md:rounded-lg">
          <Header
            title="Member CareAI"
            onClose={() => setChatDisplayState('closed')} // Go back to launcher
            onMinimize={() => handleSetDisplayState('minimized')}
          />

          <main className="flex-grow overflow-y-auto p-4 space-y-4 chat-messages-container bg-white">
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                onFeedback={msg.sender === ChatSender.AI && !msg.id.includes('-error') && !msg.id.startsWith('initial-') && !msg.id.startsWith('risk-') && !msg.id.includes('-session-ended') && !msg.id.includes('-feedback-thank') && !msg.id.includes('-member-ended-session') && !msg.id.includes('-handoff-initiated') && msg.id.includes('-response') ? handleFeedback : undefined}
              />
            ))}

            {showInitialIntents && !isLoading && !isAwaitingHandoff && (
              <IntentButtons
                intents={INTENT_OPTIONS}
                onIntentSelect={handleIntentSelection}
                disabled={isLoading}
              />
            )}

            {currentSubIntents && activeParentIntent && !isLoading && !appointmentContext && !isAwaitingHandoff && (
              <div className="px-0 pt-2 pb-1">
                <p className="text-xs sm:text-sm text-gray-600 mb-2 italic px-1">
                  For "{activeParentIntent}", please choose:
                </p>
                <IntentButtons
                  intents={currentSubIntents}
                  onIntentSelect={handleSubIntentSelection}
                  disabled={isLoading}
                />
              </div>
            )}

            {appointmentContext && appointmentContext.stage === 'showingSlots' && !isLoading && !isAwaitingHandoff && (
               <AppointmentScheduler
                context={appointmentContext}
                onTimeSelect={handleTimeSlotSelection}
                onChooseAnotherDate={handleChooseAnotherDate}
                isLoading={isLoading}
              />
            )}

            {appointmentContext && appointmentContext.stage === 'promptingReminder' && !isLoading && !isAwaitingHandoff && (
                <div className="px-0 pt-2 pb-1">
                    <IntentButtons
                        intents={["Mobile Reminder", "Email Reminder"]}
                        onIntentSelect={(intent) => handleReminderPreference(intent.toLowerCase().includes('mobile') ? 'mobile' : 'email')}
                        disabled={isLoading}
                    />
                </div>
            )}

            {appointmentContext && appointmentContext.stage === 'confirmingContact' && !isLoading && !isAwaitingHandoff && (
                 <div className="px-0 pt-2 pb-1">
                    <IntentButtons
                        intents={["Yes, send reminder", "No, that's not right"]}
                        onIntentSelect={(intent) => handleContactConfirmation(intent.toLowerCase().startsWith('yes'))}
                        disabled={isLoading}
                    />
                </div>
            )}

            {!isLoading && !isAwaitingHandoff && getNavigationOptions().length > 0 && (
                <div className="px-0 pt-3 pb-1 border-t border-gray-200 mt-3">
                    <IntentButtons
                        intents={getNavigationOptions()}
                        onIntentSelect={(intent) => handleNavigationIntent(intent === "Main Menu" ? "MainMenu" : "GoBack")}
                        disabled={isLoading}
                    />
                </div>
            )}

            {isAwaitingHandoff && !isLoading && (
                 <div className="text-center py-4 px-2">
                    <p className="text-sm text-gray-700 italic">
                        Connecting you to an agent... Your chat is currently paused.
                    </p>
                 </div>
            )}


            {isLoading && (
              <div className="flex justify-center py-4">
                <LoadingSpinner />
              </div>
            )}
            <div ref={messagesEndRef} />
          </main>

          {showEndChatButton && (
            <div className="px-4 py-3 bg-white border-t border-gray-200">
              <button
                onClick={handleEndChatSession}
                disabled={isLoading}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 transition duration-150 ease-in-out text-sm disabled:opacity-60 disabled:cursor-not-allowed whitespace-normal"
                aria-label="End Chat Session"
              >
                End Chat Session
              </button>
            </div>
          )}

          {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelected}
            className="hidden"
            disabled={isAwaitingHandoff}
            accept="image/png, image/jpeg, image/gif, image/webp, .pdf, .doc, .docx, .txt, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/pdf, text/plain"
          />

          <footer className="bg-gray-200 p-3 border-t border-gray-300">
            <ChatInput
              currentInputText={chatInputText}
              onInputTextChange={setChatInputText}
              onSendMessage={handleSendMessage}
              isLoading={isLoading || (appointmentContext?.stage === 'confirmingBooking' || false) || isAwaitingHandoff}
              onFeatureClick={handleFeatureClick}
              showEmojiPicker={showEmojiPicker}
              onEmojiSelect={handleEmojiSelect}
              isListening={isListening}
            />
          </footer>
          {showPostChatFeedbackModal && (
            <PostChatFeedbackModal
              onSubmit={handlePostChatFeedbackSubmit}
              onClose={() => {
                setShowPostChatFeedbackModal(false);
                // Reset to launcher view
                setMessages([]);
                localStorage.removeItem('chatMessages');
                localStorage.removeItem('chatShowInitialIntents');
                localStorage.removeItem('chatCurrentSubIntents');
                localStorage.removeItem('chatActiveParentIntent');
                localStorage.removeItem('chatAppointmentContext');
                localStorage.removeItem('chatIsAwaitingHandoff');
                setChatDisplayState('closed');
                setShowInitialIntents(false);
                setCurrentSubIntents(null);
                setActiveParentIntent(null);
                setAppointmentContext(null);
                setError(null);
                setIsLoading(false);
                setIsAwaitingHandoff(false);
              }}
            />
          )}
        </div>
      )}
    </>
  );
};

export default App;