import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = "gemini-3-pro-image-preview";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

export async function GET() {
    return NextResponse.json({ status: "Online", message: "Combo Try-On API is reachable" });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { prompt, images } = body;

        if (!images || !Array.isArray(images) || images.length === 0) {
            return NextResponse.json({ error: "Missing images" }, { status: 400 });
        }

        // Logic aligned with 2v copy.html: Pass prompt directly, pure image modality
        const parts = [
            { text: prompt },
            ...images.map((img: string) => ({
                inlineData: {
                    mimeType: "image/jpeg",
                    data: img
                }
            }))
        ];

        const payload = {
            contents: [{ parts }],
            generationConfig: { responseModalities: ["IMAGE"] }
        };

        const response = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            console.error("Gemini API Error Response:", JSON.stringify(errData, null, 2));
            return NextResponse.json({ error: errData.error?.message || "Gemini API Error" }, { status: response.status });
        }

        const result = await response.json();
        // console.log("Gemini API Success Response:", JSON.stringify(result, null, 2));

        if (!result.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData)) {
            console.error("Gemini Response Missing Image Data. Full Candidate:", JSON.stringify(result.candidates, null, 2));
        }

        return NextResponse.json(result);

    } catch (e: any) {
        console.error("API Route Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
