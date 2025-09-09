import { GoogleGenAI, Chat } from "@google/genai";
import { GroundingSource } from "../types";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * A generic function for making single-turn calls to the Gemini API.
 * Used for tasks like translation and reasoning.
 */
export const callGemini = async (prompt: string, systemInstruction?: string): Promise<string> => {
  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      ...(systemInstruction && { config: { systemInstruction } }),
    });
    
    return result.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
      return `Error: ${error.message}`;
    }
    return "An unknown error occurred while contacting the AI.";
  }
};

/**
 * Calls the Gemini API with Google Search grounding enabled.
 * Returns the text response and a list of web sources.
 */
export const callGeminiWithSearch = async (prompt: string): Promise<{ text: string; sources: GroundingSource[] }> => {
  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
      },
    });

    const text = result.text;
    const groundingChunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    
    const sources: GroundingSource[] = groundingChunks
        .map(chunk => chunk.web ? { uri: chunk.web.uri, title: chunk.web.title } : null)
        .filter((source): source is GroundingSource => source !== null);

    return { text, sources };

  } catch (error) {
    console.error("Error calling Gemini API with search:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { text: `Error: ${errorMessage}`, sources: [] };
  }
};


/**
 * Manages a multi-turn chat conversation, maintaining history.
 */
export class ChatSession {
  private chat: Chat;

  constructor(systemInstruction: string) {
    this.chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: { systemInstruction },
    });
  }

  async sendMessage(message: string): Promise<string> {
    try {
      const result = await this.chat.sendMessage({ message });
      return result.text;
    } catch (error) {
        console.error("Error sending message in chat session:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return `Error: ${errorMessage}`;
    }
  }
}