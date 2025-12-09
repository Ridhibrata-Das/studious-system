import { GoogleGenerativeAI } from "@google/generative-ai";
import { GeminiChatService } from "@/app/dashboard/balaram-ai/services/geminiChatService";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
const MODEL_NAME = "gemini-2.0-flash";

export class TranscriptionService {
  private model;
  private chatService: GeminiChatService;

  constructor() {
    this.model = genAI.getGenerativeModel({ model: MODEL_NAME });
    this.chatService = new GeminiChatService();
  }

  async transcribeAudio(audioBase64: string, mimeType: string): Promise<string> {
    try {
      const result = await this.model.generateContent([
        {
          inlineData: {
            mimeType: mimeType,
            data: audioBase64
          }
        },
        { text: "Please transcribe the spoken language in this audio accurately. Ignore any background noise or non-speech sounds." }
      ]);

      const transcription = result.response.text();
      const response = await this.chatService.generateResponse({
        userInput: transcription,
        systemPrompt: "You are an agricultural expert. Provide helpful advice based on the user's question."
      });
      return response;
    } catch (error) {
      console.error("Transcription error:", error);
      throw error;
    }
  }
} 