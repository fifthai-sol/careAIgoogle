
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { GEMINI_MODEL_NAME, HEALTHCARE_SYSTEM_INSTRUCTION, API_KEY_ERROR_MESSAGE } from '../constants';
import { ExtractedEntities, GeminiResponse } from '../types';

let ai: GoogleGenAI | null = null;
let chat: Chat | null = null;

const getApiKey = (): string => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error(API_KEY_ERROR_MESSAGE);
    throw new Error(API_KEY_ERROR_MESSAGE);
  }
  return apiKey;
};

export const initializeChat = () => {
  try {
    const apiKey = getApiKey();
    if (!ai) {
      ai = new GoogleGenAI({ apiKey });
    }
    if (!chat) {
      chat = ai.chats.create({
        model: GEMINI_MODEL_NAME,
        config: {
          systemInstruction: HEALTHCARE_SYSTEM_INSTRUCTION,
        },
      });
      console.log("Gemini Chat initialized successfully.");
    }
  } catch (error) {
    console.error("Failed to initialize Gemini Chat:", error);
    throw error;
  }
};

const parseEntitiesFromResponse = (responseText: string): GeminiResponse => {
  const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/;
  const match = responseText.match(jsonBlockRegex);

  let cleanTextResponse = responseText;
  let entities: ExtractedEntities | null = null;

  if (match && match[1]) {
    try {
      const parsedJson = JSON.parse(match[1].trim());
      if (parsedJson && parsedJson.entities) {
        entities = parsedJson.entities as ExtractedEntities;
      }
      cleanTextResponse = responseText.replace(jsonBlockRegex, "").trim();
    } catch (e) {
      console.error("Failed to parse JSON entities from response:", e);
    }
  }
  return { textResponse: cleanTextResponse, entities };
};

export const sendMessageToAI = async (message: string): Promise<GeminiResponse> => {
  if (!chat) {
    try {
      initializeChat(); 
    } catch (initError) {
      throw initError;
    }
    if (!chat) { 
         throw new Error("Chat is not initialized. Please ensure the API key is correctly set up.");
    }
  }

  try {
    const response: GenerateContentResponse = await chat.sendMessage({ message });
    const rawTextResponse = response.text; 
    if (typeof rawTextResponse !== 'string') {
        console.error("Unexpected response format from AI:", response);
        throw new Error("Received an unexpected response format from the AI.");
    }
    return parseEntitiesFromResponse(rawTextResponse);
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    if (error instanceof Error && error.message.includes("API_KEY")) {
        throw new Error("API Key is invalid or missing. Please check your environment configuration.");
    }
    throw new Error(`AI service communication error: ${error instanceof Error ? error.message : String(error)}`);
  }
};