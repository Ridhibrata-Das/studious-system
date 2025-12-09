export const LANGUAGE_CODES = {
    ENGLISH: 'en',
    BENGALI: 'bn',
    HINDI: 'hi',
    KANNADA: 'kn',
    TAMIL: 'ta',
    TELUGU: 'te',
};

// Unicode ranges for scripts
const SCRIPTS = [
    { code: LANGUAGE_CODES.HINDI, start: 0x0900, end: 0x097F }, // Devanagari
    { code: LANGUAGE_CODES.BENGALI, start: 0x0980, end: 0x09FF }, // Bengali
    { code: LANGUAGE_CODES.TAMIL, start: 0x0B80, end: 0x0BFF }, // Tamil
    { code: LANGUAGE_CODES.KANNADA, start: 0x0C80, end: 0x0CFF }, // Kannada
    { code: LANGUAGE_CODES.TELUGU, start: 0x0C00, end: 0x0C7F }, // Telugu
];

// Keywords map (Romanized)
const KEYWORDS: Record<string, string> = {
    'english': LANGUAGE_CODES.ENGLISH,
    'hindi': LANGUAGE_CODES.HINDI,
    'bengali': LANGUAGE_CODES.BENGALI,
    'bangla': LANGUAGE_CODES.BENGALI,
    'kannada': LANGUAGE_CODES.KANNADA,
    'tamil': LANGUAGE_CODES.TAMIL,
    'telugu': LANGUAGE_CODES.TELUGU,
    'hind': LANGUAGE_CODES.HINDI,
    'bangal': LANGUAGE_CODES.BENGALI,
    'kanna': LANGUAGE_CODES.KANNADA,
    'tam': LANGUAGE_CODES.TAMIL,
    'tel': LANGUAGE_CODES.TELUGU,
};

export const detectLanguage = (transcript: string): string | null => {
    if (!transcript) return null;
    const cleanText = transcript.trim().toLowerCase();

    // 1. Script-based detection
    for (const char of cleanText) {
        const codePoint = char.codePointAt(0);
        if (codePoint) {
            for (const script of SCRIPTS) {
                if (codePoint >= script.start && codePoint <= script.end) {
                    return script.code;
                }
            }
        }
    }

    // 2. Keyword-based detection
    for (const [keyword, code] of Object.entries(KEYWORDS)) {
        if (cleanText.includes(keyword)) {
            return code;
        }
    }

    // Default fallback
    if (/^[a-z0-9\s.,?!]+$/.test(cleanText)) {
        return LANGUAGE_CODES.ENGLISH;
    }

    return null;
};

export const triggerTranslation = (langCode: string) => {
    if (typeof window === 'undefined') return;

    // Save preference
    localStorage.setItem('preferredLanguage', langCode);

    // No reload needed as we use context and TranslateWrapper
    // window.location.reload();
};
