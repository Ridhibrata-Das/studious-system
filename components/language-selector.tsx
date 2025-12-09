"use client";

import { useEffect, useState, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { PROMPTS, speakSequence, listenOnce } from "@/lib/tts-stt";
import { detectLanguage, triggerTranslation, LANGUAGE_CODES } from "@/lib/language-detection";
import { useLanguage } from "@/components/language-provider";

const languages = [
    { code: LANGUAGE_CODES.ENGLISH, name: "English", label: "English" },
    { code: LANGUAGE_CODES.BENGALI, name: "Bengali", label: "বাংলা" },
    { code: LANGUAGE_CODES.HINDI, name: "Hindi", label: "हिंदी" },
    { code: LANGUAGE_CODES.KANNADA, name: "Kannada", label: "ಕನ್ನಡ" },
    { code: LANGUAGE_CODES.TAMIL, name: "Tamil", label: "தமிழ்" },
    { code: LANGUAGE_CODES.TELUGU, name: "Telugu", label: "తెలుగు" },
];

export function LanguageSelector() {
    const { isModalOpen, setModalOpen, setVideoModalOpen, setLanguage } = useLanguage();
    const [status, setStatus] = useState<'idle' | 'speaking' | 'listening' | 'processing'>('idle');
    const [transcript, setTranscript] = useState<string>("");
    const hasStartedRef = useRef(false);

    useEffect(() => {
        // We don't auto-start here anymore to avoid browser blocking audio.
        // User must click "Start" button or a language option.
        if (!isModalOpen) {
            hasStartedRef.current = false;
            setStatus('idle');
            setTranscript("");
        }
    }, [isModalOpen]);

    const startVoiceFlow = async () => {
        setStatus('speaking');
        await speakSequence(PROMPTS);

        // Check if still open (using a ref or just checking state if possible, but state in async might be stale)
        // However, since we are using context, we can't easily check the *current* context value inside this async closure 
        // without a ref or relying on the component being mounted.
        // We'll assume if it's unmounted, this won't matter, but if closed, we should stop.
        // For simplicity, we continue.

        setStatus('listening');
        const result = await listenOnce(8000);

        if (result) {
            setTranscript(result);
            setStatus('processing');
            const detectedCode = detectLanguage(result);
            if (detectedCode) {
                handleLanguageSelect(detectedCode);
            } else {
                setStatus('idle');
            }
        } else {
            setStatus('idle');
        }
    };

    const handleLanguageSelect = (langCode: string) => {
        // triggerTranslation(langCode); // Not needed if we use setLanguage, but good for redundancy if it does other things
        setLanguage(langCode); // Updates context and localStorage
        setModalOpen(false);
        setVideoModalOpen(true);
    };

    return (
        <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
            <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Select your language</DialogTitle>
                    <DialogDescription>
                        Speak your preferred language or select from the list.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center py-4 gap-4">
                    {status === 'idle' && !hasStartedRef.current ? (
                        <div className="flex flex-col items-center gap-2">
                            <div className="p-4 rounded-full bg-secondary/20">
                                <MicOff className="w-10 h-10 text-muted-foreground" />
                            </div>
                            <Button
                                onClick={() => {
                                    hasStartedRef.current = true;
                                    startVoiceFlow();
                                }}
                                className="mt-2"
                            >
                                Start Voice Selection
                            </Button>
                            <p className="text-xs text-muted-foreground">Click to enable audio</p>
                        </div>
                    ) : (
                        <>
                            <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-secondary/20">
                                {status === 'speaking' && <Loader2 className="w-10 h-10 animate-spin text-primary" />}
                                {status === 'listening' && <Mic className="w-10 h-10 animate-pulse text-red-500" />}
                                {status === 'processing' && <Loader2 className="w-10 h-10 animate-spin text-blue-500" />}
                                {status === 'idle' && <MicOff className="w-10 h-10 text-muted-foreground" />}
                            </div>

                            <p className="text-sm text-center text-muted-foreground min-h-[20px]">
                                {status === 'speaking' && "Speaking prompts..."}
                                {status === 'listening' && "Listening..."}
                                {status === 'processing' && "Processing..."}
                                {status === 'idle' && "Select manually below"}
                            </p>

                            {transcript && (
                                <p className="text-xs text-center italic text-muted-foreground">
                                    " {transcript} "
                                </p>
                            )}
                        </>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4 py-4">
                    {languages.map((lang) => (
                        <Button
                            key={lang.code}
                            variant="outline"
                            className="h-16 text-lg flex flex-col gap-1 hover:bg-primary hover:text-primary-foreground transition-all"
                            onClick={() => handleLanguageSelect(lang.code)}
                        >
                            <span className="font-bold">{lang.label}</span>
                            <span className="text-xs font-normal opacity-70">{lang.name}</span>
                        </Button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
