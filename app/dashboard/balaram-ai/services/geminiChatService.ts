import { GoogleGenerativeAI } from "@google/generative-ai";
import { getGeminiVariables } from "./sensorDataService";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
const MODEL_NAME = "models/gemini-2.0-flash-exp";

export class GeminiChatService {
  private model;

  constructor() {
    this.model = genAI.getGenerativeModel({ model: MODEL_NAME });
  }

  async generateResponse({
    userInput,
    file,
    systemPrompt
  }: {
    userInput: string;
    file?: File | null;
    systemPrompt: string;
  }): Promise<string> {
    try {
      let userText = userInput;
      if (systemPrompt && systemPrompt.trim().length > 0) {
        const vars = getGeminiVariables();
        userText = `${systemPrompt}\nSENSOR_CONTEXT_JSON: ${JSON.stringify(vars)}\n\n${userInput}`;
      }
      const userParts: any[] = [{ text: userText }];
      if (file) {
        const fileData = await this.fileToBase64(file);
        userParts.push({ inlineData: { mimeType: file.type, data: fileData } });
      }
      const contents = [
        { role: "user", parts: userParts }
      ];
      const result = await this.model.generateContent({
        contents,
        generationConfig: {
          temperature: 1,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
        }
      });
      return result.response.text();
    } catch (error) {
      console.error("Chat generation error:", error);
      throw error;
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
} 