"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/language-provider";

interface TranslateWrapperProps {
    text: string;
    children?: React.ReactNode;
    className?: string;
}

export function TranslateWrapper({ text, children, className }: TranslateWrapperProps) {
    const { currentLanguage } = useLanguage();
    const [translatedText, setTranslatedText] = useState<string>(text);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Reset to original if language is English or null
        if (!currentLanguage || currentLanguage === 'en') {
            setTranslatedText(text);
            return;
        }

        const cacheKey = `trans_${currentLanguage}_${text}`;
        const cached = localStorage.getItem(cacheKey);

        if (cached) {
            setTranslatedText(cached);
            return;
        }

        const fetchTranslation = async () => {
            setIsLoading(true);
            try {
                // Add random jitter to prevent thundering herd (0-2000ms)
                await new Promise(resolve => setTimeout(resolve, Math.random() * 2000));

                const res = await fetch('/api/translate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text, targetLang: currentLanguage }),
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.translatedText) {
                        setTranslatedText(data.translatedText);
                        localStorage.setItem(cacheKey, data.translatedText);
                    }
                }
            } catch (error) {
                console.error("Translation failed:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTranslation();
    }, [currentLanguage, text]);

    if (isLoading) {
        return <span className={`opacity-50 animate-pulse ${className}`}>{translatedText}</span>;
    }

    return <span className={className}>{translatedText}</span>;
}
