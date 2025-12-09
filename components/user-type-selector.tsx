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
import { Mic, MicOff, Loader2, User, Building2, GraduationCap } from "lucide-react";
import { speakSequence, listenOnce, LanguagePrompt } from "@/lib/tts-stt";
import { useLanguage } from "@/components/language-provider";
import { TranslateWrapper } from "@/components/translate-wrapper";

const USER_TYPE_PROMPTS: Record<string, string> = {
    en: "Please tell me, who are you? Farmer, Business, or Researcher?",
    bn: "দয়া করে বলুন, আপনি কে? কৃষক, ব্যবসায়ী, নাকি গবেষক?",
    hi: "कृपया बताएं, आप कौन हैं? किसान, व्यापारी, या शोधकर्ता?",
    kn: "ದಯವಿಟ್ಟು ಹೇಳಿ, ನೀವು ಯಾರು? ರೈತ, ವ್ಯಾಪಾರಿ, ಅಥವಾ ಸಂಶೋಧಕ?",
    ta: "தயவுசெய்து சொல்லுங்கள், நீங்கள் யார்? விவசாயி, வியாபாரி, அல்லது ஆராய்ச்சியாளர்?",
    te: "దయచేసి చెప్పండి, మీరు ఎవరు? రైతు, వ్యాపారి, లేదా పరిశోధకుడు?",
};

export function UserTypeSelector() {
    const { isUserTypeModalOpen, setUserTypeModalOpen, setUserType, currentLanguage } = useLanguage();
    const [status, setStatus] = useState<'idle' | 'speaking' | 'listening' | 'processing'>('idle');
    const [transcript, setTranscript] = useState<string>("");
    const hasStartedRef = useRef(false);

    useEffect(() => {
        if (!isUserTypeModalOpen) {
            hasStartedRef.current = false;
            setStatus('idle');
            setTranscript("");
        }
    }, [isUserTypeModalOpen]);

    const startVoiceFlow = async () => {
        setStatus('speaking');

        const lang = currentLanguage || 'en';
        const text = USER_TYPE_PROMPTS[lang] || USER_TYPE_PROMPTS['en'];

        const prompt: LanguagePrompt = {
            code: lang,
            text: text,
            lang: lang
        };

        await speakSequence([prompt]);

        setStatus('listening');
        const result = await listenOnce(8000);

        if (result) {
            setTranscript(result);
            setStatus('processing');
            const type = detectUserType(result, lang);
            if (type) {
                handleTypeSelect(type);
            } else {
                setStatus('idle');
            }
        } else {
            setStatus('idle');
        }
    };

    const detectUserType = (text: string, lang: string): 'farmer' | 'business' | 'researcher' | null => {
        const t = text.toLowerCase();

        // Simple keyword matching for now
        if (t.includes('farmer') || t.includes('kisan') || t.includes('krishak') || t.includes('raita') || t.includes('vivsayi') || t.includes('rythu')) return 'farmer';
        if (t.includes('business') || t.includes('vyapari') || t.includes('vyavasayi')) return 'business';
        if (t.includes('research') || t.includes('shodh') || t.includes('gaveshak') || t.includes('araychi')) return 'researcher';

        return null;
    };

    const handleTypeSelect = (type: 'farmer' | 'business' | 'researcher') => {
        setUserType(type);
        setUserTypeModalOpen(false);
    };

    return (
        <Dialog open={isUserTypeModalOpen} onOpenChange={setUserTypeModalOpen}>
            <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle><TranslateWrapper text="Select User Type" /></DialogTitle>
                    <DialogDescription>
                        <TranslateWrapper text="Please select your role to customize the dashboard." />
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
                                <TranslateWrapper text="Start Voice Selection" />
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-secondary/20">
                                {status === 'speaking' && <Loader2 className="w-10 h-10 animate-spin text-primary" />}
                                {status === 'listening' && <Mic className="w-10 h-10 animate-pulse text-red-500" />}
                                {status === 'processing' && <Loader2 className="w-10 h-10 animate-spin text-blue-500" />}
                                {status === 'idle' && <MicOff className="w-10 h-10 text-muted-foreground" />}
                            </div>
                            <p className="text-sm text-center text-muted-foreground">
                                {status === 'speaking' && "Speaking..."}
                                {status === 'listening' && "Listening..."}
                                {status === 'processing' && "Processing..."}
                            </p>
                            {transcript && (
                                <p className="text-xs text-center italic text-muted-foreground">
                                    " {transcript} "
                                </p>
                            )}
                        </>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-4 py-4">
                    <Button variant="outline" className="h-16 justify-start px-6 gap-4" onClick={() => handleTypeSelect('farmer')}>
                        <User className="w-8 h-8 text-green-600" />
                        <div className="flex flex-col items-start">
                            <span className="font-bold"><TranslateWrapper text="Farmer" /></span>
                            <span className="text-xs text-muted-foreground"><TranslateWrapper text="Standard Dashboard & Alerts" /></span>
                        </div>
                    </Button>
                    <Button variant="outline" className="h-16 justify-start px-6 gap-4" onClick={() => handleTypeSelect('business')}>
                        <Building2 className="w-8 h-8 text-blue-600" />
                        <div className="flex flex-col items-start">
                            <span className="font-bold"><TranslateWrapper text="Large Farm Business" /></span>
                            <span className="text-xs text-muted-foreground"><TranslateWrapper text="Sensors, Drone View & Reports" /></span>
                        </div>
                    </Button>
                    <Button variant="outline" className="h-16 justify-start px-6 gap-4" onClick={() => handleTypeSelect('researcher')}>
                        <GraduationCap className="w-8 h-8 text-purple-600" />
                        <div className="flex flex-col items-start">
                            <span className="font-bold"><TranslateWrapper text="Researcher" /></span>
                            <span className="text-xs text-muted-foreground"><TranslateWrapper text="Advanced Analytics & Data" /></span>
                        </div>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
