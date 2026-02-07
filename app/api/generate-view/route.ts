import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = "gemini-1.5-flash"; // Or whatever model you want to use for 360 turnarounds

export async function POST(request: NextRequest) {
    try {
        const { prompt, inlineData } = await request.json();

        if (!inlineData || !inlineData.data) {
            return NextResponse.json({ error: "Missing image data" }, { status: 400 });
        }

        const payload = {
            contents: [{
                parts: [
                    { text: prompt },
                    { inlineData: { mimeType: inlineData.mimeType || "image/png", data: inlineData.data } }
                ]
            }],
            generationConfig: { responseModalities: ['TEXT', 'IMAGE'] }
        };

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json({ error: errorData.error?.message || "Gemini API Error" }, { status: response.status });
        }

        const result = await response.json();
        return NextResponse.json(result);

    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
    }
}
