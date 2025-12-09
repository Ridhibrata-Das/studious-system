export interface LanguagePrompt {
    code: string;
    text: string;
    lang: string; // BCP 47 tag for synthesis
}

export const PROMPTS: LanguagePrompt[] = [
    {
        code: 'en',
        text: "Please choose by speaking in your preferred language.",
        lang: 'en'
    },
    {
        code: 'bn',
        text: "অনুগ্রহ করে আপনার পছন্দের ভাষায় কথা বলে বেছে নিন।",
        lang: 'bn'
    },
    {
        code: 'hi',
        text: "कृपया अपनी पसंदीदा भाषा में बोलकर चुनें।",
        lang: 'hi'
    },
    {
        code: 'kn',
        text: "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯಲ್ಲಿ ಮಾತನಾಡುವ ಮೂಲಕ ಆಯ್ಕೆಮಾಡಿ.",
        lang: 'kn'
    },
    {
        code: 'ta',
        text: "தயவுசெய்து உங்கள் விருப்பமான மொழியில் பேசித் தேர்ந்தெடுக்கவும்.",
        lang: 'ta'
    },
    {
        code: 'te',
        text: "దయచేసి మీకు ఇష్టమైన భాషలో మాట్లాడి ఎంచుకోండి.",
        lang: 'te'
    },
];

export const speakSequence = async (prompts: LanguagePrompt[]): Promise<void> => {
    if (typeof window === 'undefined') return;

    for (const prompt of prompts) {
        try {
            // Fetch audio content from our API
            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: prompt.text, lang: prompt.lang }),
            });

            if (!response.ok) throw new Error('TTS API failed');

            const { audioContent } = await response.json();

            if (audioContent) {
                await new Promise<void>((resolve, reject) => {
                    const audio = new Audio(audioContent);
                    audio.onended = () => resolve();
                    audio.onerror = (e) => {
                        console.error("Audio playback error", e);
                        resolve(); // Continue sequence even if one fails
                    };
                    audio.play().catch(e => {
                        console.error("Audio play failed (interaction needed?)", e);
                        resolve();
                    });
                });
            }

            // Small pause between languages
            await new Promise(r => setTimeout(r, 300));

        } catch (error) {
            console.error("Error in speakSequence:", error);
            // Continue to next prompt
        }
    }
};

export const listenOnce = (timeoutMs: number = 8000): Promise<string | null> => {
    return new Promise((resolve) => {
        if (typeof window === 'undefined') {
            resolve(null);
            return;
        }

        // @ts-ignore
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("SpeechRecognition not supported");
            resolve(null);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-IN'; // Broad coverage for Indian context
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        let hasResolved = false;

        recognition.onresult = (event: any) => {
            if (hasResolved) return;
            const transcript = event.results[0][0].transcript;
            hasResolved = true;
            resolve(transcript);
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            if (!hasResolved) {
                hasResolved = true;
                resolve(null);
            }
        };

        recognition.onend = () => {
            if (!hasResolved) {
                hasResolved = true;
                resolve(null);
            }
        };

        try {
            recognition.start();
        } catch (e) {
            console.error("Failed to start recognition", e);
            resolve(null);
        }

        // Safety timeout
        setTimeout(() => {
            if (!hasResolved) {
                hasResolved = true;
                try {
                    recognition.stop();
                } catch (e) { }
                resolve(null);
            }
        }, timeoutMs);
    });
};
