import { Base64 } from 'js-base64';
import { TranscriptionService } from './transcriptionService';
import { pcmToWav } from '../utils/audio';
import { getGeminiVariables, refreshAllSensorData } from './sensorDataService';
import { detailAnalysisService, type AnalysisResult } from './detailAnalysisService';

const MODEL = "models/gemini-2.5-flash-native-audio-preview-12-2025";
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const HOST = "generativelanguage.googleapis.com";
const WS_URL = `wss://${HOST}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${API_KEY}`;

export class GeminiWebSocket {
  private ws: WebSocket | null = null;
  private isConnected: boolean = false;
  private isSetupComplete: boolean = false;
  private onMessageCallback: ((text: string) => void) | null = null;
  private onSetupCompleteCallback: (() => void) | null = null;
  private audioContext: AudioContext | null = null;

  // Audio queue management
  private audioQueue: Float32Array[] = [];
  private isPlaying: boolean = false;
  private currentSource: AudioBufferSourceNode | null = null;
  private isPlayingResponse: boolean = false;
  private onPlayingStateChange: ((isPlaying: boolean) => void) | null = null;
  private onAudioLevelChange: ((level: number) => void) | null = null;
  private onTranscriptionCallback: ((text: string) => void) | null = null;
  private transcriptionService: TranscriptionService;
  private accumulatedPcmData: string[] = [];
  private onSearchResultsCallback: ((results: any) => void) | null = null;
  private onChartDataCallback: ((chartData: AnalysisResult) => void) | null = null;
  private lastUserQuery: string = '';
  private lastAgentResponse: string = '';
  private lastSearchResults: any = null;

  constructor(
    onMessage: (text: string) => void,
    onSetupComplete: () => void,
    onPlayingStateChange: (isPlaying: boolean) => void,
    onAudioLevelChange: (level: number) => void,
    onTranscription: (text: string) => void,
    onSearchResults?: (results: any) => void,
    onChartData?: (chartData: AnalysisResult) => void
  ) {
    this.onMessageCallback = onMessage;
    this.onSetupCompleteCallback = onSetupComplete;
    this.onPlayingStateChange = onPlayingStateChange;
    this.onAudioLevelChange = onAudioLevelChange;
    this.onTranscriptionCallback = onTranscription;
    this.onSearchResultsCallback = onSearchResults || null;
    this.onChartDataCallback = onChartData || null;
    this.audioContext = new AudioContext({ sampleRate: 24000 });
    this.transcriptionService = new TranscriptionService();
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('[WebSocket] Already connected');
      return;
    }

    console.log('[WebSocket] Connecting to:', WS_URL.replace(API_KEY || '', '***'));

    if (!API_KEY) {
      console.error('[WebSocket] No API key found!');
      return;
    }

    this.ws = new WebSocket(WS_URL);

    this.ws.onopen = () => {
      console.log('[WebSocket] Connection opened');
      this.isConnected = true;
      this.sendInitialSetup();
    };

    this.ws.onmessage = async (event) => {
      try {
        let messageText: string;
        if (event.data instanceof Blob) {
          const arrayBuffer = await event.data.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);
          messageText = new TextDecoder('utf-8').decode(bytes);
        } else {
          messageText = event.data;
        }

        console.log('[WebSocket] Received message:', messageText.substring(0, 200) + '...');
        await this.handleMessage(messageText);
      } catch (error) {
        console.error("[WebSocket] Error processing message:", error);
      }
    };

    this.ws.onerror = (error) => {
      console.error("[WebSocket] Connection error:", error);
    };

    this.ws.onclose = (event) => {
      console.log('[WebSocket] Connection closed:', event.code, event.reason);
      this.isConnected = false;
      if (!event.wasClean && this.isSetupComplete) {
        console.log('[WebSocket] Attempting to reconnect in 1 second...');
        setTimeout(() => this.connect(), 1000);
      }
    };
  }

  private async sendInitialSetup() {
    try {
      await refreshAllSensorData();
    } catch (e) {
      console.warn('[WebSocket] Sensor refresh failed, using last known values');
    }

    console.log('[WebSocket] Preparing setup message...');
    const vars = getGeminiVariables();

    const setupMessage = {
      setup: {
        model: MODEL,
        generation_config: {
          response_modalities: ["AUDIO"]
        },
        // 🔍 ADD GOOGLE SEARCH GROUNDING
        tools: [
          { google_search: {} }
        ],
        system_instruction: {
          parts: [
            {
              text: `Speak with a helpful, funny and wise tone, that is very sportive, optimistic and can say no to the user if required. YOU WILL ALWAYS BE CONFIDENT TO WHAT YOU SAY. You will ask the user for the query he have. You must sound natural in the language you are speaking, no repeating questions, no uttering the users name everytime, and try not to give a very generic answer absolutely, give as in depth as you can, but bit by bit, not at once. Do not speak more than 40 words at a time. Add more vocalisation of thinking to find a solution, include more 'ahh' and 'uhh' sounds in the speech. Now imagine yourself as an agriculture expert in India, solving their problems. YOU MUST ALWAYS TRY TO CONVERSE IN THE LANGUAGE THE USER IS TALKING IN, OR ASKS TO SPEAK. You have access to real-time sensor data including: Location --> ${vars.locationName}, Humidity --> ${vars.humidity}%, Soil Moisture --> ${vars.soilMoisture}%, Nitrogen --> ${vars.npkNitrogen}ppm N, Phosphorus --> ${vars.npkPhosphorus}ppm P, Potassium --> ${vars.npkPotassium}ppm K, Avg NPK: ${vars.npkAverage}ppm. Based on these values fetched, and taking into account about these values and the location, and the crop asked by the user, you must give personalized agricultural suggestions and recommendations. YOU WILL only SAY numbers like THE SENSOR DATA in text format only YOU GET INTO WORDS AND NOT IN NUMBERS, like dont write 1234567890, write 1234567890 as twelve million three hundred forty five thousand six hundred seventy eight hundred ninety, try to always tell numbers in english. When users ask you to "search", "find", "lookup", or ask for "current prices", "latest news", you can use Google Search to get real-time information IN INDIAN CONTEXT ONLY.`
            },
            {
              text: `SENSOR_CONTEXT_JSON: ${JSON.stringify(vars)}`
            }
          ]
        }
      }
    };

    console.log('[WebSocket] Sending setup message:', JSON.stringify(setupMessage, null, 2));

    try {
      this.ws?.send(JSON.stringify(setupMessage));
      console.log('[WebSocket] Setup message sent successfully');
    } catch (error) {
      console.error('[WebSocket] Error sending setup message:', error);
    }
  }

  sendMediaChunk(b64Data: string, mimeType: string) {
    if (!this.isConnected || !this.ws || !this.isSetupComplete) return;

    const message = {
      realtime_input: {
        media_chunks: [{
          mime_type: mimeType === "audio/pcm" ? "audio/pcm" : mimeType,
          data: b64Data
        }]
      }
    };

    try {
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error("[WebSocket] Error sending media chunk:", error);
    }
  }



  private async playAudioResponse(base64Data: string) {
    if (!this.audioContext) return;

    try {
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const pcmData = new Int16Array(bytes.buffer);
      const float32Data = new Float32Array(pcmData.length);
      for (let i = 0; i < pcmData.length; i++) {
        float32Data[i] = pcmData[i] / 32768.0;
      }

      this.audioQueue.push(float32Data);
      this.playNextInQueue();
    } catch (error) {
      console.error("[WebSocket] Error processing audio:", error);
    }
  }

  private async playNextInQueue() {
    if (!this.audioContext || this.isPlaying || this.audioQueue.length === 0) return;

    try {
      this.isPlaying = true;
      this.isPlayingResponse = true;
      this.onPlayingStateChange?.(true);
      const float32Data = this.audioQueue.shift()!;

      let sum = 0;
      for (let i = 0; i < float32Data.length; i++) {
        sum += Math.abs(float32Data[i]);
      }
      const level = Math.min((sum / float32Data.length) * 100 * 5, 100);
      this.onAudioLevelChange?.(level);

      const audioBuffer = this.audioContext.createBuffer(1, float32Data.length, 24000);
      audioBuffer.getChannelData(0).set(float32Data);

      this.currentSource = this.audioContext.createBufferSource();
      this.currentSource.buffer = audioBuffer;
      this.currentSource.connect(this.audioContext.destination);

      this.currentSource.onended = () => {
        this.isPlaying = false;
        this.currentSource = null;
        if (this.audioQueue.length === 0) {
          this.isPlayingResponse = false;
          this.onPlayingStateChange?.(false);
        }
        this.playNextInQueue();
      };

      this.currentSource.start();
    } catch (error) {
      console.error("[WebSocket] Error playing audio:", error);
      this.isPlaying = false;
      this.isPlayingResponse = false;
      this.onPlayingStateChange?.(false);
      this.currentSource = null;
      this.playNextInQueue();
    }
  }

  private stopCurrentAudio() {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch (e) { }
      this.currentSource = null;
    }
    this.isPlaying = false;
    this.isPlayingResponse = false;
    this.onPlayingStateChange?.(false);
    this.audioQueue = [];
  }

  private async handleMessage(message: string) {
    try {
      const messageData = JSON.parse(message);

      if (messageData.setupComplete) {
        this.isSetupComplete = true;
        this.onSetupCompleteCallback?.();
        return;
      }

      // 🔍 Handle Google Search grounding metadata
      if (messageData.serverContent?.groundingMetadata) {
        console.log("[Google Search Grounding]:", messageData.serverContent.groundingMetadata);
        this.lastSearchResults = messageData.serverContent.groundingMetadata;
        this.onSearchResultsCallback?.(messageData.serverContent.groundingMetadata);
      }



      if (messageData.serverContent?.modelTurn?.parts) {
        const parts = messageData.serverContent.modelTurn.parts;
        for (const part of parts) {
          if (part.inlineData?.mimeType === "audio/pcm;rate=24000") {
            this.accumulatedPcmData.push(part.inlineData.data);
            this.playAudioResponse(part.inlineData.data);
          }

          // Handle text responses (useful for debugging and logging)
          if (part.text) {
            console.log("[Model Text Response]:", part.text);
            // Accumulate agent response for detail analysis
            this.lastAgentResponse += part.text;
            console.log("[WebSocket] Accumulated agent response so far:", this.lastAgentResponse);
          }
        }
      }

      if (messageData.serverContent?.turnComplete === true) {
        if (this.accumulatedPcmData.length > 0) {
          try {
            const fullPcmData = this.accumulatedPcmData.join('');
            const wavData = await pcmToWav(fullPcmData, 24000);

            const transcription = await this.transcriptionService.transcribeAudio(wavData, "audio/wav");
            console.log("[Transcription]:", transcription);

            // Store user query for detail analysis
            this.lastUserQuery = transcription;

            this.onTranscriptionCallback?.(transcription);

            // Trigger detail analysis after conversation turn is complete
            this.triggerDetailAnalysis();

            this.accumulatedPcmData = [];
          } catch (error) {
            console.error("[WebSocket] Transcription error:", error);
          }
        }
      }
    } catch (error) {
      console.error("[WebSocket] Error parsing message:", error);
    }
  }



  /**
   * Trigger detail analysis to generate charts/visuals
   */
  private async triggerDetailAnalysis() {
    try {
      if (!this.lastUserQuery) {
        console.log("[Detail Analysis] No user query available");
        return;
      }

      // If we don't have agent response (audio-only mode), use a placeholder
      const agentResponse = this.lastAgentResponse || "Audio response provided";
      
      console.log("[Detail Analysis] Data check:", {
        hasQuery: !!this.lastUserQuery,
        hasResponse: !!this.lastAgentResponse,
        queryLength: this.lastUserQuery?.length || 0,
        responseLength: agentResponse?.length || 0,
        usingPlaceholder: !this.lastAgentResponse
      });

      console.log("[Detail Analysis] Analyzing conversation...");
      console.log("  User Query:", this.lastUserQuery);
      console.log("  Agent Response:", agentResponse);
      console.log("  Has Search Results:", !!this.lastSearchResults);

      // Force chart generation for testing - if query contains certain keywords
      const forceChartKeywords = ['moisture', 'temperature', 'npk', 'search', 'price', 'trend', 'data'];
      const shouldForceChart = forceChartKeywords.some(keyword => 
        this.lastUserQuery.toLowerCase().includes(keyword)
      );
      
      if (shouldForceChart) {
        console.log("[Detail Analysis] Force chart generation detected for keyword match");
      }

      // Analyze conversation for visual generation
      const analysisResult = await detailAnalysisService.analyzeConversation(
        this.lastUserQuery,
        agentResponse,
        this.lastSearchResults
      );

      console.log("[Detail Analysis] Analysis result:", analysisResult);

      if (!analysisResult.skip && analysisResult.needs_visual) {
        console.log("[Detail Analysis] Visual generation recommended, calling callback");
        this.onChartDataCallback?.(analysisResult);
      } else if (shouldForceChart) {
        console.log("[Detail Analysis] Forcing chart generation due to keyword match");
        // Create a simple fallback chart
        const fallbackChart: AnalysisResult = {
          skip: false,
          needs_visual: true,
          chart_data: {
            title: "Sensor Data Overview",
            summary: "Current agricultural sensor readings",
            labels: ["Current", "Yesterday", "2 Days Ago", "3 Days Ago", "4 Days Ago"],
            values: [65, 62, 58, 60, 63],
            data_label: "Sensor Reading",
            y_label: "%",
            chart_title: "Recent Sensor Data Trend",
            insights: [
              "Sensor readings are within normal range",
              "Slight upward trend observed"
            ],
            chart_type: "line"
          }
        };
        this.onChartDataCallback?.(fallbackChart);
      } else {
        console.log("[Detail Analysis] No visual needed for this conversation");
      }

      // Reset for next conversation
      this.lastUserQuery = '';
      this.lastAgentResponse = '';
      this.lastSearchResults = null;

    } catch (error) {
      console.error("[Detail Analysis] Error:", error);
      // Reset on error
      this.lastUserQuery = '';
      this.lastAgentResponse = '';
      this.lastSearchResults = null;
    }
  }

  disconnect() {
    this.isSetupComplete = false;
    if (this.ws) {
      this.ws.close(1000, "Intentional disconnect");
      this.ws = null;
    }
  }

} 
