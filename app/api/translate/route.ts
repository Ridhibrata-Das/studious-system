import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { text, targetLang } = await request.json();

        if (!text || !targetLang) {
            return NextResponse.json({ error: 'Text and targetLang are required' }, { status: 400 });
        }

        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Translation failed: ${response.statusText}`);
        }

        const data = await response.json();

        // The response structure is usually [[[ "Translated Text", "Original Text", ... ]]]
        // We join all parts if there are multiple sentences
        const translatedText = data[0].map((item: any) => item[0]).join('');

        return NextResponse.json({ translatedText });
    } catch (error) {
        console.error('Translation API Error:', error);
        return NextResponse.json({ error: 'Failed to translate text' }, { status: 500 });
    }
}
