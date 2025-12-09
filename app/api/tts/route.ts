import { NextResponse } from 'next/server';
import * as googleTTS from 'google-tts-api';

export async function POST(request: Request) {
    try {
        const { text, lang } = await request.json();

        if (!text || !lang) {
            return NextResponse.json({ error: 'Text and language are required' }, { status: 400 });
        }

        // Get audio URL
        const url = googleTTS.getAudioUrl(text, {
            lang: lang,
            slow: false,
            host: 'https://translate.google.com',
        });

        // Fetch the actual audio data from Google
        const audioResponse = await fetch(url);
        if (!audioResponse.ok) {
            throw new Error(`Google TTS failed: ${audioResponse.statusText}`);
        }

        const arrayBuffer = await audioResponse.arrayBuffer();
        const base64Audio = Buffer.from(arrayBuffer).toString('base64');

        return NextResponse.json({ audioContent: `data:audio/mpeg;base64,${base64Audio}` });
    } catch (error) {
        console.error('TTS API Error:', error);
        return NextResponse.json({ error: 'Failed to generate speech' }, { status: 500 });
    }
}
