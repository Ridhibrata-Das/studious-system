"use client";
import { useRef, useState } from "react";
import { GeminiChatService } from "../services/geminiChatService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Send } from "lucide-react";

const SYSTEM_PROMPT = `Speak with a helpful, funny and wise tone, that is very sportive, optimistic and can say no to the user if required. YOU WILL ALWAYS BE CONFIDENT TO WHAT YOU SAY. You will ask the user for the query he have. You must sound natural in the language you are speaking, no repeating questions, no uttering the users name everytime, and try not to give a very generic answer absolutely, give as in depth as you can, but bit by bit, not at once. Do not speak more than 40 words at a time. Add more vocalisation of thinking to find a solution, include more 'ahh' and 'uhh' sounds in the speech. Now imagine yourself as an agriculture expert in India, solving their problems. YOU MUST ALWAYS TRY TO CONVERSE IN THE LANGUAGE THE USER IS TALKING IN, OR ASKS TO SPEAK. You have access to real-time sensor data including: Location, Humidity, Soil Moisture, Nitrogen, Phosphorus, Potassium, Avg NPK. Based on these values fetched, and taking into account about these values and the location, and the crop asked by the user, you must give personalized agricultural suggestions and recommendations. YOU WILL SAY THE SENSOR DATA YOU GET INTO WORDS AND NOT IN NUMBERS`;

export default function Chatbot() {
  const [messages, setMessages] = useState<{ type: 'human' | 'gemini', text: string, file?: File }[]>([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatService = useRef(new GeminiChatService()).current;

  const handleSend = async () => {
    if (!input && !file) return;
    setMessages((prev) => [...prev, { type: "human", text: input, file }]);
    setLoading(true);
    try {
      const response = await chatService.generateResponse({
        userInput: input,
        file,
        systemPrompt: SYSTEM_PROMPT,
      });
      setMessages((prev) => [...prev, { type: "gemini", text: response }]);
    } catch (e) {
      setMessages((prev) => [...prev, { type: "gemini", text: "Sorry, something went wrong." }]);
    }
    setInput("");
    setFile(undefined);
    setLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto bg-white rounded-xl shadow-md border p-4">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.type === 'human' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs rounded-lg px-4 py-2 shadow ${msg.type === 'human' ? 'bg-green-100 text-right' : 'bg-blue-50 text-left'}`}>
              <div>{msg.text}</div>
              {msg.file && (
                <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                  <Paperclip className="inline w-4 h-4" />
                  {msg.file.name}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-xs rounded-lg px-4 py-2 shadow bg-blue-50 text-left animate-pulse">
              Balaram AI is typing...
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 mt-auto">
        <Input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1"
          onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
          disabled={loading}
        />
        <input
          type="file"
          accept="image/*,application/pdf"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
        >
          <Paperclip className="w-5 h-5" />
        </Button>
        <Button
          type="button"
          onClick={handleSend}
          disabled={loading || (!input && !file)}
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
      {file && (
        <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
          <Paperclip className="inline w-4 h-4" />
          {file.name}
        </div>
      )}
    </div>
  );
}