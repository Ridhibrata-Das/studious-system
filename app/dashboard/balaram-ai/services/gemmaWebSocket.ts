import { Base64 } from 'js-base64';

const WS_URL = "ws://localhost:9073";

export class GemmaWebSocket {
  private ws: WebSocket | null = null;
  private isConnected: boolean = false;
  private audioContext: AudioContext | null = null;
  private audioQueue: Float32Array[] = [];
  private isPlaying: boolean = false;
  private currentSource: AudioBufferSourceNode | null = null;
  
  // Callbacks
  private onMessageCallback: ((text: string) => void) | null = null;
  private onSetupCompleteCallback: (() => void) | null = null;
  private onPlayingStateChange: ((isPlaying: boolean) => void) | null = null;
  private onAudioLevelChange: ((level: number) => void) | null = null;

  constructor(
    onMessage: (text: string) => void,
    onSetupComplete: () => void,
    onPlayingStateChange: (isPlaying: boolean) => void,
    onAudioLevelChange: (level: number) => void
  ) {
    this.onMessageCallback = onMessage;
    this.onSetupCompleteCallback = onSetupComplete;
    this.onPlayingStateChange = onPlayingStateChange;
    this.onAudioLevelChange = onAudioLevelChange;
    
    // Initialize AudioContext
    // Kokoro usually outputs 24kHz, but we'll adapt if needed.
    // Standard AudioContext is usually 44.1kHz or 48kHz, we'll resample if needed or let the browser handle it.
    // Ideally we should create it with the sample rate of the incoming audio if possible, 
    // or just use default and let createBuffer handle it.
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('[GemmaWS] Already connected');
      return;
    }

    console.log('[GemmaWS] Connecting to:', WS_URL);

    this.ws = new WebSocket(WS_URL);

    this.ws.onopen = () => {
      console.log('[GemmaWS] Connection opened');
      this.isConnected = true;
      // Send initial handshake message
      this.ws?.send(JSON.stringify({ type: "init" }));
      this.onSetupCompleteCallback?.();
    };

    this.ws.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.interrupt) {
          console.log('[GemmaWS] Interrupt received');
          this.stopCurrentAudio();
        }

        if (message.audio) {
          console.log('[GemmaWS] Received audio chunk');
          this.playAudioResponse(message.audio);
        }

      } catch (error) {
        console.error("[GemmaWS] Error processing message:", error);
      }
    };

    this.ws.onerror = (error) => {
      console.error("[GemmaWS] Connection error:", error);
    };

    this.ws.onclose = (event) => {
      console.log('[GemmaWS] Connection closed:', event.code, event.reason);
      this.isConnected = false;
    };
  }

  sendMediaChunk(b64Data: string, mimeType: string) {
    if (!this.isConnected || !this.ws) return;

    const message = {
      realtime_input: {
        media_chunks: [{
          mime_type: mimeType,
          data: b64Data
        }]
      }
    };

    try {
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error("[GemmaWS] Error sending media chunk:", error);
    }
  }

  private async playAudioResponse(base64Data: string) {
    if (!this.audioContext) return;

    try {
      // Decode base64
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Convert PCM 16-bit to Float32
      const pcmData = new Int16Array(bytes.buffer);
      const float32Data = new Float32Array(pcmData.length);
      for (let i = 0; i < pcmData.length; i++) {
        float32Data[i] = pcmData[i] / 32768.0;
      }

      this.audioQueue.push(float32Data);
      this.playNextInQueue();
    } catch (error) {
      console.error("[GemmaWS] Error processing audio:", error);
    }
  }

  private async playNextInQueue() {
    if (!this.audioContext || this.isPlaying || this.audioQueue.length === 0) return;

    try {
      this.isPlaying = true;
      this.onPlayingStateChange?.(true);
      const float32Data = this.audioQueue.shift()!;

      // Calculate level for visualizer
      let sum = 0;
      for (let i = 0; i < float32Data.length; i++) {
        sum += Math.abs(float32Data[i]);
      }
      const level = Math.min((sum / float32Data.length) * 100 * 5, 100);
      this.onAudioLevelChange?.(level);

      // Create buffer
      // Assuming 24kHz for Kokoro TTS. If it sounds slow/fast, adjust this value.
      const sampleRate = 24000; 
      const audioBuffer = this.audioContext.createBuffer(1, float32Data.length, sampleRate);
      audioBuffer.getChannelData(0).set(float32Data);

      this.currentSource = this.audioContext.createBufferSource();
      this.currentSource.buffer = audioBuffer;
      this.currentSource.connect(this.audioContext.destination);

      this.currentSource.onended = () => {
        this.isPlaying = false;
        this.currentSource = null;
        if (this.audioQueue.length === 0) {
          this.onPlayingStateChange?.(false);
          this.onAudioLevelChange?.(0);
        }
        this.playNextInQueue();
      };

      this.currentSource.start();
    } catch (error) {
      console.error("[GemmaWS] Error playing audio:", error);
      this.isPlaying = false;
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
    this.onPlayingStateChange?.(false);
    this.audioQueue = [];
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.stopCurrentAudio();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
